"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";

const CameraView = dynamic(() => import("@/components/CameraView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/80 text-sm">Initializing camera...</p>
      </div>
    </div>
  ),
});

export default function AnalysisPage() {
  const router = useRouter();
  const { endSession } = useWorkout();

  const handleEnd = () => {
    endSession();
    router.push("/summary");
  };

  return (
    <div className="h-full">
      <CameraView onEnd={handleEnd} />
    </div>
  );
}
