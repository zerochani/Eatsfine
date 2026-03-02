import type { Day, RestaurantDetail } from "@/types/store";
import { Clock, X } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { backdropMotionClass, panelMotionClass } from "@/utils/modalMotion";
import { cn } from "@/lib/utils";
import { useModalPresence } from "@/hooks/common/useModalPresence";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "idle" | "loading" | "success" | "error";
  restaurant?: RestaurantDetail | null;
  errorMessage?: string;
  onRetry?: () => void;
  onClickReserve: () => void;
};

const DAY_LABEL: Record<Day, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

function formatBusinessHours(
  businessHours: RestaurantDetail["businessHours"],
  breakTime?: RestaurantDetail["breakTime"],
) {
  const order: Day[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const hours = Array.isArray(businessHours) ? businessHours : [];

  const byDay = new Map(hours.map((b) => [b.day, b]));
  const lines = order.map((day) => {
    const item = byDay.get(day);
    if (!item) return `${DAY_LABEL[day]}: 정보 없음`;
    if (item.isClosed) return `${DAY_LABEL[day]}: 휴무`;
    const open = item.openTime ?? "-";
    const close = item.closeTime ?? "-";
    return `${DAY_LABEL[day]}: ${open} - ${close}`;
  });

  const breakLine = breakTime
    ? `브레이크타임: ${breakTime.start} - ${breakTime.end}`
    : null;

  return { lines, breakLine };
}

export default function RestaurantDetailModal({
  open,
  onOpenChange,
  status,
  restaurant,
  errorMessage,
  onRetry,
  onClickReserve,
}: Props) {
  const nav = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { rendered, entered } = useModalPresence(open);
  const handleReserveClick = () => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.");
      onOpenChange(false);
      nav("/", { state: { openLogin: true }, replace: true });
      return;
    }
    onClickReserve();
  };

  if (!rendered) return null;

  if (status === "idle" || status === "loading") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="식당 상세 로딩"
      >
        <button
          type="button"
          className={backdropMotionClass(entered)}
          aria-label="모달 닫기"
          onClick={() => onOpenChange(false)}
        />
        <div
          className={cn(
            "relative z-10 w-[92vw] max-w-3xl rounded-2xl bg-white shadow-xl p-6",
            panelMotionClass(entered),
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-lg">상세 정보 불러오는 중..</p>
            <button
              type="button"
              aria-label="모달 닫기"
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X />
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            잠시만 기다려 주세요..
          </div>
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="식당 상세 오류"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          aria-label="모달 닫기"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-10 w-[92vw] max-w-3xl rounded-2xl bg-white shadow-xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg">상세 정보를 불러오지 못했어요</p>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {errorMessage ?? "잠시 후 다시 시도해주세요"}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex-1 bg-gray-100 py-3 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              닫기
            </button>
            {onRetry ? (
              <button
                type="button"
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl"
                onClick={onRetry}
              >
                다시 시도
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
  if (status !== "success") return null;
  if (!restaurant) return null;

  const tableImageUrls = Array.isArray(restaurant.tableImageUrls)
    ? restaurant.tableImageUrls
    : [];
  const { lines: hourLines, breakLine } = formatBusinessHours(
    restaurant.businessHours,
    restaurant.breakTime,
  );
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="식당 상세 모달"
    >
      <button
        type="button"
        className={backdropMotionClass(entered)}
        aria-label="모달 닫기"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-[92vw] max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden max-h-[calc(100vh-96px)] flex flex-col",
          panelMotionClass(entered),
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl truncate">{restaurant.name}</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X />
          </button>
        </div>
        <div className="overflow-y-auto">
          {restaurant.mainImageUrl ? (
            <div className="w-full">
              <img
                src={restaurant.mainImageUrl}
                alt={`${restaurant.name} 대표 이미지`}
                className="w-full h-80 object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-5">
                <Clock className="size-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-gray-600 mb-2">운영시간</p>
                  <div className="text-sm text-gray-800 space-y-1">
                    {hourLines.map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                    {breakLine ? (
                      <p className="text-sm text-gray-500 mt-2">{breakLine}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">주소</p>
              <p>{restaurant.address}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">설명</p>
              <p>{restaurant.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">테이블 사진</p>
              {tableImageUrls.length === 0 ? (
                <p className="text-muted-foreground">등록된 사진이 없어요</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tableImageUrls.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="aspect-square rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`테이블 ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              className="mt-5 text-md h-14 w-full cursor-pointer bg-blue-500 hover:bg-blue-600"
              onClick={handleReserveClick}
            >
              식당 예약
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
