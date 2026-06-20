"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useSquatAnalysis } from "@/hooks/useSquatAnalysis";
import { drawPoseOverlay } from "@/components/PoseOverlay";
import RepCounter from "@/components/RepCounter";
import AudioToggle from "@/components/AudioToggle";
import { AnalysisStage } from "@/lib/squat/types";
import { Camera, Square, AlertOctagon } from "lucide-react";

interface CameraViewProps {
  onEnd: (recordedVideoUrl: string | null) => void;
  targetReps: number;
}

export default function CameraView({ onEnd, targetReps }: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stopDismissed, setStopDismissed] = useState(false);
  const { videoRef, isReady, error, start, stop } = useCamera();
  const { result, isLoading } = usePoseDetection(videoRef, isReady);
  const { stage, repCount, feedbackMessages, shouldStop, skeletonColor, countdown } = useSquatAnalysis(result, targetReps);

  useEffect(() => { start(); return () => stop(); }, [start, stop]);
  useEffect(() => { if (shouldStop) setStopDismissed(false); }, [shouldStop]);

  // Auto-end when done
  useEffect(() => {
    if (stage === AnalysisStage.DONE) {
      const t = setTimeout(() => handleEnd(), 1500);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== AnalysisStage.ACTIVE) return;
    const c = compositeCanvasRef.current;
    if (!c || mediaRecorderRef.current) return;
    try {
      const s = c.captureStream(24);
      const r = new MediaRecorder(s, { mimeType: "video/webm; codecs=vp9" });
      r.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      r.start(500);
      mediaRecorderRef.current = r;
    } catch { /* not supported */ }
  }, [stage]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const composite = compositeCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !composite || !video) return;

    const ctx = canvas.getContext("2d");
    const cctx = composite.getContext("2d");
    if (!ctx || !cctx) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    canvas.width = vw; canvas.height = vh;
    composite.width = vw; composite.height = vh;

    if (result?.landmarks?.[0]) {
      drawPoseOverlay({ landmarks: result.landmarks[0], width: vw, height: vh, ctx, color: skeletonColor });
    } else {
      ctx.clearRect(0, 0, vw, vh);
    }

    cctx.save(); cctx.translate(vw, 0); cctx.scale(-1, 1);
    cctx.drawImage(video, 0, 0, vw, vh); cctx.restore();
    cctx.save(); cctx.translate(vw, 0); cctx.scale(-1, 1);
    cctx.drawImage(canvas, 0, 0, vw, vh); cctx.restore();

    if (feedbackMessages.length > 0) {
      cctx.font = "bold 20px sans-serif";
      cctx.textAlign = "center";
      feedbackMessages.forEach((msg, i) => {
        const y = 50 + i * 32;
        const tw = cctx.measureText(msg).width;
        cctx.fillStyle = "rgba(0,0,0,0.6)";
        cctx.fillRect(vw / 2 - tw / 2 - 12, y - 18, tw + 24, 28);
        cctx.fillStyle = msg === "Good rep!" ? "#22c55e" : "#ef4444";
        cctx.fillText(msg, vw / 2, y);
      });
    }

    if (stage === AnalysisStage.ACTIVE) {
      cctx.font = "bold 28px sans-serif"; cctx.textAlign = "left";
      cctx.fillStyle = "rgba(0,0,0,0.6)"; cctx.fillRect(10, vh - 50, 120, 40);
      cctx.fillStyle = "#ffffff"; cctx.fillText(`${repCount}/${targetReps}`, 20, vh - 20);
    }
  }, [result, feedbackMessages, skeletonColor, videoRef, stage, repCount, targetReps]);

  useEffect(() => { drawOverlay(); }, [drawOverlay]);

  const handleEnd = () => {
    stop();
    const r = mediaRecorderRef.current;
    if (r && r.state !== "inactive") {
      r.onstop = () => onEnd(URL.createObjectURL(new Blob(chunksRef.current, { type: "video/webm" })));
      r.stop();
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
        <button onClick={() => onEnd(null)} className="h-10 px-6 rounded-lg bg-foreground text-white text-[13px] font-medium">Go Back</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
      <canvas ref={compositeCanvasRef} className="hidden" />

      {/* Loading */}
      {(isLoading || !isReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="text-center">
            <div className="w-10 h-10 border-[2.5px] border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/80 text-[14px] font-medium">Loading pose detection</p>
            <p className="text-white/40 text-[12px] mt-1">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Calibrating */}
      {stage === AnalysisStage.CALIBRATING && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl px-8 py-7 text-center mx-8">
            <div className="w-10 h-10 border-[2.5px] border-zinc-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-[16px] mb-1">Calibrating</p>
            <p className="text-zinc-400 text-[12px]">Stand still and face the camera</p>
          </div>
        </div>
      )}

      {/* Countdown */}
      {stage === AnalysisStage.COUNTDOWN && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[96px] font-bold text-white tabular-nums leading-none drop-shadow-2xl">
              {countdown}
            </div>
            <p className="text-white/60 text-[14px] mt-3 font-medium">Get ready</p>
          </div>
        </div>
      )}

      {/* Active */}
      {stage === AnalysisStage.ACTIVE && (
        <RepCounter repCount={repCount} feedbackMessages={feedbackMessages} targetReps={targetReps} />
      )}

      {/* Done */}
      {stage === AnalysisStage.DONE && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-[64px] leading-none mb-2">🎉</div>
            <p className="text-white font-bold text-[22px]">Set Complete!</p>
            <p className="text-white/60 text-[13px] mt-1">{repCount} reps done</p>
          </div>
        </div>
      )}

      {/* Stop warning */}
      {shouldStop && !stopDismissed && stage === AnalysisStage.ACTIVE && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="bg-zinc-900 rounded-3xl mx-6 p-6 text-center shadow-2xl border border-red-500/30 max-w-[320px]">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-white font-bold text-[18px] mb-1.5">Knee Position Issue</h3>
            <p className="text-zinc-400 text-[13px] leading-relaxed mb-5">
              Your knees have been tracking too far outward for multiple reps. This can stress your joints.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={handleEnd} className="w-full h-11 rounded-xl bg-red-500 text-white font-semibold text-[14px] active:scale-[0.98]">
                End Workout
              </button>
              <button onClick={() => setStopDismissed(true)} className="w-full h-11 rounded-xl bg-white/10 text-white/70 font-medium text-[13px] active:scale-[0.98]">
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      {stage === AnalysisStage.ACTIVE && (
        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 bg-gradient-to-t from-black/70 to-transparent z-10">
          <div className="flex items-center justify-center gap-4 px-6">
            <AudioToggle feedbackMessages={feedbackMessages} repCount={repCount} />
            <button onClick={handleEnd} className="h-11 px-7 rounded-full bg-white text-zinc-900 font-semibold text-[13px] flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
              <Square className="w-3.5 h-3.5" fill="currentColor" />
              End Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
