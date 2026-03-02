import { useInView } from "@/hooks/common/useInView";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function ProblemSection() {
  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.3,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  return (
    <section ref={sectionRef} id="problem" className="py-32 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl leading-[1.3] tracking-tight mb-20 text-center">
          기존 방식의 불편함, <br /> 이제 해결하세요
        </h2>

        <div className="grid lg:grid-cols-2 gap-12">
          <div
            className={cn(
              "bg-[#F8F9FA] rounded-3xl p-12",
              "transition-all duration-900 ease-out",
              inView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20",
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl tracking-tight">기존 방식</h3>
            </div>
            <div className="space-y-4">
              {[
                "순번만 받고 언제 앉을지 모름",
                "원하는 자리가 있어도 선택 불가",
                "허위 리뷰로 신뢰도 낮음",
                "예약 관리가 번거로움",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-lg text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className={cn(
              "bg-linear-to-br from-[#2196F3] to-[#1976D2] rounded-3xl p-12",
              "transition-all duration-900 ease-out",
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20",
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-[#2196F3]" />
              </div>
              <h3 className="text-2xl tracking-tight text-white">잇츠파인</h3>
            </div>
            <div className="space-y-4">
              {[
                "원하는 시간과 자리를 미리 예약",
                "테이블 레이아웃을 보고 직접 선택",
                "실제 방문자만 작성하는 진짜 후기",
                "한눈에 보는 간편한 예약 관리",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="text-white text-lg">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
