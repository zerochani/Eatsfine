import { useInView } from "@/hooks/common/useInView";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";

const items = [
  "원하는 자리를 미리 선택하고 예약",
  "실시간 테이블 예약 현황 확인",
  "신뢰할 수 있는 방문 후기와 평점",
  "간편한 예약 관리 및 알림",
  "특별한 날을 위한 프라이빗 공간 예약",
] as const;

export default function ForUserSection() {
  const { ref: sectionRef, inView } = useInView<HTMLElement>();
  return (
    <section ref={sectionRef} id="foruser" className="py-32 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div
            className={cn(
              "transition-all duration-900 ease-out",
              inView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20",
            )}
          >
            <span className="inline-block bg-[#E3F2FD] px-4 py-2 rounded-full mb-6 text-sm tracking-wide font-normal">
              FOR CUSTOMERS
            </span>

            <h2 className="text-5xl leading-[1.3] tracking-tight mb-6">
              고객을 위한 <br />
              특별한 경험
            </h2>
            <p className="text-xl tracking-tight text-muted-foreground mb-10 leading-relaxed">
              더 이상 순번만 기다리지 마세요.
              <br />
              원하는 자리를 직접 선택하고 예약하세요.
            </p>
            <ul className="space-y-4 list-none">
              {items.map((t, idx) => (
                <li
                  key={t}
                  className={cn(
                    "flex gap-4",
                    "transition-all duration-900 ease-out",
                    inView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-20",
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
          <img
            src="/CustomerImage.png"
            alt="고객 앱 화면"
            className={cn(
              "relative",
              "transition-all duration-900 ease-out w-full h-full object-contain rounded-3xl",
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20",
            )}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
