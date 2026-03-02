import { useInView } from "@/hooks/common/useInView";
import { cn } from "@/lib/utils";

export default function StateSection() {
  const stats = [
    { label: "등록 식당", value: "15,000+" },
    { label: "월간 예약", value: "500,000+" },
    { label: "고객 만족도", value: "98%" },
    { label: "평균 평점", value: "4.8" },
  ];

  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.3,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });
  return (
    <section ref={sectionRef} id="state" className="py-32 px-4 bg-black/95">
      <div className="max-w-7xl mx-auto">
        <div
          className={cn(
            "flex flex-col items-center space-y-10 tracking-tight mb-20",
            "transition-all duration-900 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20",
          )}
        >
          <h2 className="text-white text-4xl text-center sm:text-5xl">
            숫자로 보는 잇츠파인
          </h2>
          <p className="text-white/90 text-xl">
            많은 사람들이 이미 잇츠파인과 함께하고 있습니다.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className={cn(
                "text-center",
                "transition-all duration-900 ease-out",
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20",
              )}
              style={{ transitionDelay: inView ? `${idx * 120}ms` : "0ms" }}
            >
              <div className="text-[#2196F3] text-5xl mb-4">{s.value}</div>
              <div className="text-white/90 text-xl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
