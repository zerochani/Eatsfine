import { useInView } from "@/hooks/common/useInView";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";

export default function ForOwnerSection() {
  const items = [
    "매장과 테이블 레이아웃을 쉽게 등록",
    "실시간 예약 현황 관리",
    "고객 데이터 분석 및 인사이트",
    "노쇼 방지 및 예약 확정 시스템",
    "효율적인 테이블 회전율 관리",
  ];
  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.3,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });
  return (
    <section ref={sectionRef} id="forowner" className="py-32 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <img
            src="/OwnerImage.png"
            alt="사장님 대시보드 화면"
            className={cn(
              "relative",
              "transition-all duration-900 ease-out w-full h-full object-contain rounded-3xl",
              inView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20",
            )}
            loading="lazy"
          />
          <div
            className={cn(
              "transition-all duration-900 ease-out",
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20",
            )}
          >
            <span className="inline-block bg-[#E3F2FD] px-4 py-2 rounded-full mb-6 text-sm tracking-wide font-normal">
              FOR OWNERS
            </span>
            <h2 className="text-5xl leading-[1.3] tracking-tight mb-6">
              사장님을 위한
              <br />
              스마트한 관리
            </h2>
            <p className="text-muted-foreground text-xl tracking-tight mb-10 leading-relaxed">
              예약 관리부터 매출 분석까지,
              <br />
              매장 운영의 모든 것을 한눈에.
            </p>
            <ul className="space-y-4">
              {items.map((t, idx) => (
                <li
                  key={t}
                  className={cn(
                    "flex gap-4",
                    "transition-all duration-900 ease-out",
                    inView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-20",
                  )}
                  style={{
                    transitionDelay: inView ? `${200 + idx * 120}ms` : "0ms",
                  }}
                >
                  <CircleCheck className="w-6 h-6 text-[#191919]" />
                  <span className="text-lg">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
