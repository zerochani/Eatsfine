import { useInView } from "@/hooks/common/useInView";
import { MapPin, Search, Star, Store } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeatureSection() {
  const cards = [
    {
      title: "자리 선택 예약",
      desc: "식당 내 원하는 테이블을 직접 선택해서 예약하세요. 창가, 루프탑, 프라이빗룸 등 취향에 맞는 자리를 골라보세요.",
      icon: <MapPin className="w-8 h-8 text-[#191919]" />,
      iconBg: "bg-[#E3F2FD]",
    },
    {
      title: "식당 등록",
      desc: "식당 사장님이라면 쉽고 빠르게 매장을 등록하고 테이블 레이아웃을 설정할 수 있습니다.",
      icon: <Store className="w-8 h-8 text-[#191919]" />,
      iconBg: "bg-[#E8F5E9]",
    },
    {
      title: "신뢰도 높은 리뷰",
      desc: "실제 방문 고객만 리뷰를 남길 수 있어 진짜 후기를 확인하고 믿을 수 있는 정보를 얻으세요.",
      icon: <Star className="w-8 h-8 text-[#191919]" />,
      iconBg: "bg-[#E3F2FD]",
    },
    {
      title: "식당 검색",
      desc: "위치, 음식 종류, 지역별로 원하는 식당을 빠르게 찾고 실시간 예약 가능 여부를 확인하세요.",
      icon: <Search className="w-8 h-8 text-[#191919]" />,
      iconBg: "bg-[#FCE4EC]",
    },
  ];

  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.3,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  const animBase = "transition-all duration-900 ease-out";
  const animState = inView
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-20";

  return (
    <section ref={sectionRef} id="feature" className="py-32 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl leading-[1.3] tracking-tight mb-6">
            모든 것이 한 곳에
          </h2>
          <p className="text-xl text-muted-foreground">
            잇츠파인의 4가지 핵심 기능을 경험해보세요
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((c, idx) => (
            <FeatureCard
              key={c.title}
              title={c.title}
              desc={c.desc}
              icon={c.icon}
              iconBg={c.iconBg}
              className={`${animBase} ${animState}`}
              style={{ transitionDelay: inView ? `${idx * 120}ms` : "0ms" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
