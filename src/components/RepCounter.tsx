interface RepCounterProps {
  repCount: number;
  feedbackMessages: string[];
  phase: string;
}

export default function RepCounter({ repCount, feedbackMessages, phase }: RepCounterProps) {
  return (
    <div className="absolute top-4 left-0 right-0 flex flex-col items-center pointer-events-none">
      <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-white tabular-nums">{repCount}</div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider">Reps</div>
        </div>
        <div className="w-px h-10 bg-white/20" />
        <div className="text-center">
          <div className="text-xs text-white/60 uppercase tracking-wider">{phase}</div>
        </div>
      </div>

      {feedbackMessages.length > 0 && (
        <div className="mt-3 flex flex-col items-center gap-1.5">
          {feedbackMessages.map((msg) => (
            <div
              key={msg}
              className="bg-danger/90 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full animate-pulse"
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
