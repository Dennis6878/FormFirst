"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { initPoseLandmarker, type PoseLandmarkerResult } from "@/lib/mediapipe";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";

export function usePoseDetection(videoRef: React.RefObject<HTMLVideoElement | null>, isVideoReady: boolean) {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<PoseLandmarkerResult | null>(null);
  const lastTimeRef = useRef<number>(-1);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now !== lastTimeRef.current) {
      lastTimeRef.current = now;
      try {
        const r = landmarker.detectForVideo(video, now);
        setResult(r);
      } catch {
        // skip frame
      }
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  useEffect(() => {
    if (!isVideoReady) {
      setIsLoading(true);
      setResult(null);
      lastTimeRef.current = -1;
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const lm = await initPoseLandmarker();
        if (cancelled) return;
        landmarkerRef.current = lm;
        setIsLoading(false);
        rafRef.current = requestAnimationFrame(detect);
      } catch (err) {
        console.error("Failed to init pose landmarker:", err);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isVideoReady, detect]);

  return { result, isLoading };
}
