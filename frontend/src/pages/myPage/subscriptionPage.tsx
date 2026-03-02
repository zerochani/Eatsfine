import { Check, Crown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [selectedPlan, setSelectedPlan] = useState("무료");

  const getNextBillingDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const plans = [
    {
      name: "무료",
      price: 0,
      features: [
        "기본 예약 기능",
        "월 3회 예약 가능",
        "일반 리뷰 작성",
        "기본 알림",
      ],
    },
    {
      name: "베이직",
      price: billingCycle === "monthly" ? 9900 : 99000,
      features: [
        "무제한 예약",
        "우선 예약 혜택",
        "리뷰 작성 포인트 적립",
        "실시간 알림",
        "예약 변경 수수료 면제",
      ],
    },
    {
      name: "프리미엄",
      price: billingCycle === "monthly" ? 19900 : 199000,
      features: [
        "베이직 플랜 모든 혜택",
        "AI맞춤 식당 추천",
        "VIP 예약 우선권",
        "특별 할인 쿠폰",
        "프리미엄 고객 지원",
        "동반 1인 무료 혜택",
      ],
      isRecommended: true,
    },
    {
      name: "비즈니스 (사장님)",
      price: billingCycle === "monthly" ? 49900 : 499000,
      features: [
        "식당 등록 및 관리",
        "통합 대시보드",
        "예약 관리 시스템",
        "결제 및 정산 기능",
        "AI 데이터 인사이트",
        "프리미엄 매장 노출",
        "24/7 전담 지원",
      ],
    },
  ];

  const handlePlanChange = (planName: string) => {
    if (confirm(`플랜을 ${planName} 플랜으로 바꾸시겠습니까?`)) {
      setSelectedPlan(planName);
      alert(`${planName} 플랜으로 변경되었습니다.`);
    }
  };

  const handlePause = () => {
    if (confirm("구독을 일시정지하시겠습니까? 혜택이 즉시 중단됩니다.")) {
      alert("구독이 일시정지되었습니다.");
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "정말로 구독을 취소하시겠습니까? 다음 결제일부터는 혜택을 이용하실 수 없습니다.",
      )
    ) {
      setSelectedPlan("무료");
      alert("구독 취소가 완료되었습니다.");
    }
  };

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-xl font-medium">구독 관리</h2>
        <p className="mt-0.5 text-sm text-gray-600">
          나에게 맞는 플랜을 선택하세요
        </p>
      </div>

      <div className="mb-10 rounded-xl bg-blue-50 p-6 border border-blue-100 grid">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown size={20} color="blue" />
            <span className="text-sm font-bold text-blue-600">현재 플랜</span>
          </div>
          <h3 className="text-2xl text-gray-900">{selectedPlan}</h3>
        </div>

        {selectedPlan !== "무료" && (
          <div className="mt-4 flex items-center">
            <p className="text-sm text-gray-900">다음 결제일 : </p>
            <p className="text-sm text-gray-900"> {getNextBillingDate()}</p>
          </div>
        )}
        {selectedPlan === "무료" && (
          <p className="text-sm text-gray-600 italic mt-2">
            무료로 잇츠파인을 이용 중입니다
          </p>
        )}
      </div>

      <div className="mb-8 flex justify-center">
        <div className="relative flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "cursor-pointer relative z-10 px-6 py-2 text-sm font-medium transition-colors",
              billingCycle === "monthly" ? "text-white" : "text-gray-500",
            )}
          >
            월간 결제
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "cursor-pointer relative z-10 px-6 py-2 text-sm font-medium transition-colors",
              billingCycle === "yearly" ? "text-white" : "text-gray-500",
            )}
          >
            연간 결제
            <span className="absolute -top-3 -right-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
              17% 할인
            </span>
          </button>
          <div
            className={cn(
              "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-blue-500 transition-transform duration-200 ease-in-out",
              billingCycle === "yearly" ? "translate-x-full" : "translate-x-0",
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrent = selectedPlan === plan.name;
          const isRecommended = plan.name === "프리미엄";

          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 p-5 transition-all",
                isCurrent
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : isRecommended
                    ? "border-blue-400 bg-white shadow-sm"
                    : "border-gray-100",
              )}
            >
              {isCurrent && (
                <div className="absolute right-4 top-4 rounded bg-blue-500 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                  <Check size={14} /> 현재 플랜
                </div>
              )}

              {!isCurrent && isRecommended && (
                <div className="absolute right-4 top-4 rounded bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                  추천
                </div>
              )}

              <div className="mb-6">
                <p className="text-md font-medium text-gray-900">{plan.name}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl text-gray-900">
                    ₩{plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500">
                    / {billingCycle === "monthly" ? "월" : "년"}
                  </span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Check size={18} className="text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                onClick={() => handlePlanChange(plan.name)}
                className={cn(
                  "cursor-pointer w-full rounded-lg py-3 text-md transition-all",
                  isCurrent
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : isRecommended
                      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
                )}
              >
                {isCurrent ? "현재 이용 중" : "플랜 선택"}
              </button>
            </div>
          );
        })}
      </div>

      {selectedPlan !== "무료" && (
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">구독 관리</h4>
            <p className="mt-1 text-sm text-gray-500">
              구독을 일시정지하거나 취소할 수 있습니다
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePause}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              일시정지
            </button>
            <button
              onClick={handleCancel}
              className="cursor-pointer rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              구독 취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
