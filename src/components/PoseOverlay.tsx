import { POSE_CONNECTIONS, LANDMARKS } from "@/lib/squat/constants";

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
  errors: string[];
}

const KEY_LANDMARKS = new Set<number>(Object.values(LANDMARKS));

export function drawPoseOverlay({ landmarks, width, height, ctx, errors }: PoseOverlayProps) {
  ctx.clearRect(0, 0, width, height);

  const hasError = errors.length > 0;
  const connectionColor = hasError ? "rgba(239, 68, 68, 0.6)" : "rgba(99, 102, 241, 0.6)";
  const dotColor = hasError ? "#ef4444" : "#6366f1";
  const keyDotColor = hasError ? "#fbbf24" : "#22d3ee";

  // Draw connections
  ctx.strokeStyle = connectionColor;
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

  // Draw landmarks
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if ((lm.visibility ?? 0) < 0.5) continue;

    const isKey = KEY_LANDMARKS.has(i);
    const x = lm.x * width;
    const y = lm.y * height;

    ctx.beginPath();
    ctx.arc(x, y, isKey ? 6 : 3, 0, 2 * Math.PI);
    ctx.fillStyle = isKey ? keyDotColor : dotColor;
    ctx.fill();

    if (isKey) {
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
