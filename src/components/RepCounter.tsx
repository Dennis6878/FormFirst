interface RepCounterProps {
  repCount: number;
  feedbackMessages: string[];
  phase: string;
  hasError: boolean;
}

export default function RepCounter({ repCount, feedbackMessages, hasError }: RepCounterProps) {
  return (
    <div className="absolute top-5 left-0 right-0 flex flex-col items-center pointer-events-none">
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-8 py-4 text-center">
        <div className="text-[48px] font-bold text-white tabular-nums leading-none">{repCount}</div>
        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] mt-1.5 font-medium">Reps</div>
      </div>

      {feedbackMessages.length > 0 && (
        <div className="mt-3 flex flex-col items-center gap-1.5">
          {feedbackMessages.map((msg) => (
            <div
              key={msg}
              className={`backdrop-blur-md text-white text-[13px] font-semibold px-4 py-1.5 rounded-full shadow-lg ${
                msg === "Good rep!"
                  ? "bg-emerald-500 shadow-emerald-500/30"
                  : "bg-red-500 shadow-red-500/30 animate-pulse"
              }`}
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
