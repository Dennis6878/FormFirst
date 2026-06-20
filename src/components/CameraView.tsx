"use client";

import { useRef, useEffect, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useSquatAnalysis } from "@/hooks/useSquatAnalysis";
import { drawPoseOverlay } from "@/components/PoseOverlay";
import RepCounter from "@/components/RepCounter";
import AudioToggle from "@/components/AudioToggle";
import { AnalysisStage } from "@/lib/squat/types";
import { Camera, Square } from "lucide-react";

interface CameraViewProps {
  onEnd: (recordedVideoUrl: string | null) => void;
}

export default function CameraView({ onEnd }: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { videoRef, isReady, error, start, stop } = useCamera();
  const { result, isLoading } = usePoseDetection(videoRef, isReady);
  const { stage, repCount, feedbackMessages, shouldStop, phase, hasLiveError } = useSquatAnalysis(result);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  // Start recording once calibration is done and analysis is active
  useEffect(() => {
    if (stage !== AnalysisStage.ACTIVE) return;
    const composite = compositeCanvasRef.current;
    if (!composite || mediaRecorderRef.current) return;

    try {
      const stream = composite.captureStream(24);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(500);
      mediaRecorderRef.current = recorder;
    } catch {
      // Recording not supported — continue without it
    }
  }, [stage]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const composite = compositeCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !composite || !video) return;

    const ctx = canvas.getContext("2d");
    const compCtx = composite.getContext("2d");
    if (!ctx || !compCtx) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    canvas.width = vw;
    canvas.height = vh;
    composite.width = vw;
    composite.height = vh;

    if (result?.landmarks?.[0]) {
      drawPoseOverlay({
        landmarks: result.landmarks[0],
        width: vw,
        height: vh,
        ctx,
        hasError: hasLiveError,
      });
    } else {
      ctx.clearRect(0, 0, vw, vh);
    }

    // Draw composite: mirrored video + overlay (for recording)
    compCtx.save();
    compCtx.translate(vw, 0);
    compCtx.scale(-1, 1);
    compCtx.drawImage(video, 0, 0, vw, vh);
    compCtx.restore();
    compCtx.save();
    compCtx.translate(vw, 0);
    compCtx.scale(-1, 1);
    compCtx.drawImage(canvas, 0, 0, vw, vh);
    compCtx.restore();

    // Draw feedback text onto composite
    if (feedbackMessages.length > 0) {
      compCtx.font = "bold 20px sans-serif";
      compCtx.textAlign = "center";
      feedbackMessages.forEach((msg, i) => {
        const y = 50 + i * 32;
        compCtx.fillStyle = "rgba(0,0,0,0.6)";
        const tw = compCtx.measureText(msg).width;
        compCtx.fillRect(vw / 2 - tw / 2 - 12, y - 18, tw + 24, 28);
        compCtx.fillStyle = hasLiveError ? "#ef4444" : "#22c55e";
        compCtx.fillText(msg, vw / 2, y);
      });
    }

    // Draw rep count onto composite
    if (stage === AnalysisStage.ACTIVE) {
      compCtx.font = "bold 28px sans-serif";
      compCtx.textAlign = "left";
      compCtx.fillStyle = "rgba(0,0,0,0.6)";
      compCtx.fillRect(10, vh - 50, 100, 40);
      compCtx.fillStyle = "#ffffff";
      compCtx.fillText(`Rep ${repCount}`, 20, vh - 20);
    }
  }, [result, feedbackMessages, hasLiveError, videoRef, stage, repCount]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const handleEnd = () => {
    stop();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        onEnd(url);
      };
      recorder.stop();
    } else {
      onEnd(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-white">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <Camera className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-foreground font-semibold text-[16px] mb-1">Camera Access Required</p>
        <p className="text-[13px] text-muted mb-6 leading-relaxed max-w-[260px]">{error}</p>
        <button onClick={() => onEnd(null)} className="h-10 px-6 rounded-lg bg-foreground text-white text-[13px] font-medium">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />
      {/* Hidden composite canvas for recording */}
      <canvas ref={compositeCanvasRef} className="hidden" />

      {(isLoading || !isReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="text-center">
            <div className="w-10 h-10 border-[2.5px] border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/80 text-[14px] font-medium">Loading pose detection</p>
            <p className="text-white/40 text-[12px] mt-1">This may take a moment</p>
          </div>
        </div>
      )}

      {stage === AnalysisStage.CALIBRATING && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl px-8 py-7 text-center mx-8">
            <div className="w-10 h-10 border-[2.5px] border-zinc-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-[16px] mb-1">Calibrating</p>
            <p className="text-zinc-400 text-[12px]">Stand still and face the camera</p>
          </div>
        </div>
      )}

      {stage === AnalysisStage.ACTIVE && (
        <RepCounter repCount={repCount} feedbackMessages={feedbackMessages} phase={phase} hasError={hasLiveError} />
      )}

      {shouldStop && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center px-6">
          <div className="bg-red-500 rounded-2xl px-6 py-4 text-center shadow-2xl shadow-red-500/40 animate-bounce">
            <p className="text-white font-bold text-[15px]">Form Breaking Down</p>
            <p className="text-white/70 text-[12px] mt-0.5">Consider stopping this set</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-center gap-4 px-6">
          <AudioToggle feedbackMessages={feedbackMessages} />
          <button
            onClick={handleEnd}
            className="h-11 px-7 rounded-full bg-white text-zinc-900 font-semibold text-[13px] flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Square className="w-3.5 h-3.5" fill="currentColor" />
            End Workout
          </button>
        </div>
      </div>
    </div>
  );
}
