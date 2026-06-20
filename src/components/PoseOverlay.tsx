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
  hasError: boolean;
}

const KEY_LANDMARKS = new Set<number>(Object.values(LANDMARKS));

export function drawPoseOverlay({ landmarks, width, height, ctx, hasError }: PoseOverlayProps) {
  ctx.clearRect(0, 0, width, height);

  // Green when form is good, red when there's an error
  const connectionColor = hasError ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)";
  const dotColor = hasError ? "rgba(252, 165, 165, 0.9)" : "rgba(134, 239, 172, 0.9)";
  const keyDotColor = hasError ? "#fca5a5" : "#86efac";
  const keyDotStroke = hasError ? "rgba(239, 68, 68, 0.5)" : "rgba(34, 197, 94, 0.5)";

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
      ctx.strokeStyle = keyDotStroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
