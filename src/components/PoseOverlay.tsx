import { POSE_CONNECTIONS, LANDMARKS } from "@/lib/squat/constants";
import type { SkeletonColor } from "@/hooks/useSquatAnalysis";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseOverlayProps {
  landmarks: Landmark[];
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  color: SkeletonColor;
}

const KEY_LANDMARKS = new Set<number>(Object.values(LANDMARKS));

const COLORS = {
  blue: {
    connection: "rgba(59, 130, 246, 0.7)",
    dot: "rgba(147, 197, 253, 0.9)",
    keyDot: "#93c5fd",
    keyStroke: "rgba(59, 130, 246, 0.5)",
  },
  green: {
    connection: "rgba(34, 197, 94, 0.8)",
    dot: "rgba(134, 239, 172, 0.9)",
    keyDot: "#86efac",
    keyStroke: "rgba(34, 197, 94, 0.5)",
  },
  red: {
    connection: "rgba(239, 68, 68, 0.8)",
    dot: "rgba(252, 165, 165, 0.9)",
    keyDot: "#fca5a5",
    keyStroke: "rgba(239, 68, 68, 0.5)",
  },
};

export function drawPoseOverlay({ landmarks, width, height, ctx, color }: PoseOverlayProps) {
  ctx.clearRect(0, 0, width, height);

  const c = COLORS[color];

  ctx.strokeStyle = c.connection;
  ctx.lineWidth = 3;
  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;
    if ((start.visibility ?? 0) < 0.5 || (end.visibility ?? 0) < 0.5) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if ((lm.visibility ?? 0) < 0.5) continue;

    const isKey = KEY_LANDMARKS.has(i);
    const x = lm.x * width;
    const y = lm.y * height;

    ctx.beginPath();
    ctx.arc(x, y, isKey ? 6 : 3, 0, 2 * Math.PI);
    ctx.fillStyle = isKey ? c.keyDot : c.dot;
    ctx.fill();

    if (isKey) {
      ctx.strokeStyle = c.keyStroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
