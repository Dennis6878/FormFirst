"use client";

import { useRef, useEffect, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useSquatAnalysis } from "@/hooks/useSquatAnalysis";
import { drawPoseOverlay } from "@/components/PoseOverlay";
import RepCounter from "@/components/RepCounter";
import AudioToggle from "@/components/AudioToggle";
import { AnalysisStage } from "@/lib/squat/types";

interface CameraViewProps {
  onEnd: () => void;
}

export default function CameraView({ onEnd }: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, isReady, error, start, stop } = useCamera();
  const { result, isLoading } = usePoseDetection(videoRef, isReady);
  const { stage, repCount, feedbackMessages, shouldStop, phase } = useSquatAnalysis(result);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !result?.landmarks?.[0]) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    drawPoseOverlay({
      landmarks: result.landmarks[0],
      width: canvas.width,
      height: canvas.height,
      ctx,
      errors: feedbackMessages,
    });
  }, [result, feedbackMessages, videoRef]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const handleEnd = () => {
    stop();
    onEnd();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-white">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <svg className="w-9 h-9 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <p className="text-foreground font-semibold text-[16px] mb-1">Camera Access Required</p>
        <p className="text-[13px] text-muted mb-6 leading-relaxed">{error}</p>
        <button onClick={handleEnd} className="text-primary text-[14px] font-semibold">
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

      {(isLoading || !isReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85">
          <div className="text-center">
            <div className="w-11 h-11 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/90 text-[14px] font-medium">Loading pose detection...</p>
          </div>
        </div>
      )}

      {stage === AnalysisStage.CALIBRATING && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-xl rounded-[24px] px-8 py-7 text-center mx-8 shadow-2xl">
            <div className="w-11 h-11 border-[2.5px] border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-[16px] mb-1">Calibrating...</p>
            <p className="text-white/50 text-[12px]">Stand still and face the camera</p>
          </div>
        </div>
      )}

      {stage === AnalysisStage.ACTIVE && (
        <RepCounter repCount={repCount} feedbackMessages={feedbackMessages} phase={phase} />
      )}

      {shouldStop && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center px-6">
          <div className="bg-red-500/95 backdrop-blur-md rounded-[20px] px-7 py-5 text-center shadow-2xl shadow-red-500/30 animate-bounce">
            <p className="text-white font-bold text-[16px]">Form Breaking Down</p>
            <p className="text-white/70 text-[12px] mt-1">Consider stopping this set</p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-16 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-4 px-6">
          <AudioToggle feedbackMessages={feedbackMessages} />
          <button
            onClick={handleEnd}
            className="h-[48px] px-8 rounded-full bg-white text-foreground font-semibold text-[14px] shadow-lg transition-all active:scale-95"
          >
            End Workout
          </button>
        </div>
      </div>
    </div>
  );
}
