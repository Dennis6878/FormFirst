interface RepCounterProps {
  repCount: number;
  feedbackMessages: string[];
  phase: string;
}

export default function RepCounter({ repCount, feedbackMessages, phase }: RepCounterProps) {
  return (
    <div className="absolute top-4 left-0 right-0 flex flex-col items-center pointer-events-none">
      <div className="bg-black/50 backdrop-blur-xl rounded-[20px] px-7 py-3.5 flex items-center gap-5 shadow-lg">
        <div className="text-center">
          <div className="text-[42px] font-bold text-white tabular-nums leading-none">{repCount}</div>
          <div className="text-[9px] text-white/50 uppercase tracking-[0.15em] mt-1 font-medium">Reps</div>
        </div>
        <div className="w-px h-11 bg-white/15" />
        <div className="text-center min-w-[60px]">
          <div className="text-[11px] text-white/50 uppercase tracking-[0.1em] font-medium">{phase}</div>
        </div>
      </div>

      {feedbackMessages.length > 0 && (
        <div className="mt-3 flex flex-col items-center gap-1.5">
          {feedbackMessages.map((msg) => (
            <div
              key={msg}
              className="bg-red-500/90 backdrop-blur-md text-white text-[13px] font-semibold px-5 py-2 rounded-full shadow-lg shadow-red-500/25 animate-pulse"
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
