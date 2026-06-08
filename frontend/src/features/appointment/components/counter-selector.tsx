import { Check, Stethoscope, Activity } from "lucide-react";
import { useBookingFlow } from "@/features/appointment/hooks/use-booking-flow";
import { useCounters } from "@/features/appointment/hooks/use-counters";

export function CounterSelector({ onSelect }: { onSelect?: () => void }) {
  const { data: counters, isLoading } = useCounters();
  const { selectedCounter, selectCounter } = useBookingFlow();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!counters || counters.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500">
        Không có quầy tiếp nhận nào hoạt động.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Chọn Quầy Khám</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Vui lòng chọn quầy tiếp nhận phù hợp với nhu cầu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {counters.map((counter) => {
          const isSelected = selectedCounter?.id === counter.id;
          const Icon = counter.name.toLowerCase().includes("ổng quát")
            ? Activity
            : Stethoscope;

          return (
            <button
              key={counter.id}
              onClick={() => {
                selectCounter(counter);
                onSelect?.();
              }}
              className={`relative p-4 rounded-xl text-left transition-all duration-300 border-2 outline-none group ${
                isSelected
                  ? "border-sky-500 bg-sky-50 shadow-md ring-4 ring-sky-500/20 -translate-y-0.5"
                  : "border-slate-200 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 bg-white"
              }`}
              style={{
                boxShadow: isSelected
                  ? "0 8px 16px rgba(14, 165, 233, 0.08)"
                  : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-lg ${isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600"} transition-colors`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-base font-bold ${isSelected ? "text-sky-900" : "text-slate-900"}`}
                  >
                    {counter.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {counter.room}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hoạt động
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {counter.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4 bg-sky-500 text-white p-1 rounded-full animate-scale-in">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
