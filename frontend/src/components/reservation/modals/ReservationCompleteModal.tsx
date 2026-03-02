import { useModalPresence } from "@/hooks/common/useModalPresence";
import { cn } from "@/lib/utils";
import type { ReservationDraft } from "@/types/restaurant";
import type { RestaurantDetail } from "@/types/store";
import { toYmd } from "@/utils/date";
import { backdropMotionClass, panelMotionClass } from "@/utils/modalMotion";
import { toHHmm } from "@/utils/time";
import { CircleCheck } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  restaurant: RestaurantDetail;
  draft: ReservationDraft;
  onClose: () => void;
  autoCloseMs?: number;
};

export default function ReservationCompleteModal({
  open,
  restaurant,
  draft,
  onClose,
  autoCloseMs = 5000, //5초뒤 닫기
}: Props) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(t);
  }, [open, autoCloseMs, onClose]);
  const { rendered, entered } = useModalPresence(open, 220);
  if (!rendered) return null;

  const { people, date, time } = draft;
  console.log("[complete] draft=", draft);
  console.log("[complete] time=", draft.time);
  const timeText = toHHmm(time);
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="예약 확정 모달"
    >
      <button
        type="button"
        className={cn(backdropMotionClass(entered), "z-0")}
        aria-label="모달 닫기"
        onClick={onClose}
      />
      <div
        className={cn(
          panelMotionClass(entered),
          "relative z-10 w-[92vw] max-w-md rounded-2xl bg-white shadow-xl overflow-hidden",
        )}
      >
        <div className="flex flex-col items-center justify-between p-8 space-y-4">
          <CircleCheck className="h-25 w-25 text-green-400" />
          <p className="text-2xl mt-2">예약이 완료되었습니다!</p>
          <div className="text-center text-gray-500">
            <p>{restaurant.name}</p>
            <p>{toYmd(date)}</p>
            <div className="flex justify-center gap-4">
              <p>{timeText ?? "시간 미확정"}</p>
              <p>{people}명</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
