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
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <p className="text-foreground font-semibold mb-1">Camera Access Required</p>
        <p className="text-sm text-muted mb-4">{error}</p>
        <button onClick={handleEnd} className="text-primary text-sm font-medium">
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/80 text-sm">Loading pose detection...</p>
          </div>
        </div>
      )}

      {stage === AnalysisStage.CALIBRATING && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-8 py-6 text-center mx-8">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Stand still to calibrate...</p>
            <p className="text-white/60 text-xs">Face the camera and stand upright</p>
          </div>
        </div>
      )}

      {stage === AnalysisStage.ACTIVE && (
        <RepCounter repCount={repCount} feedbackMessages={feedbackMessages} phase={phase} />
      )}

      {shouldStop && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center px-6">
          <div className="bg-danger/95 backdrop-blur-sm rounded-2xl px-6 py-4 text-center animate-bounce">
            <p className="text-white font-bold text-base">Form Breaking Down</p>
            <p className="text-white/80 text-xs mt-1">Consider stopping this set</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-6">
        <AudioToggle feedbackMessages={feedbackMessages} />
        <button
          onClick={handleEnd}
          className="h-12 px-8 rounded-full bg-danger text-white font-semibold text-sm hover:bg-danger/90 transition-colors active:scale-95"
        >
          End Workout
        </button>
      </div>
    </div>
  );
}
