import type { ReservationDraft } from "@/types/restaurant";
import type { RestaurantDetail } from "@/types/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatKrw } from "@/utils/money";
import { Button } from "../../ui/button";
import { X } from "lucide-react";
import { useMenus } from "@/hooks/reservation/useMenus";
import { useDepositRate } from "@/hooks/reservation/useDepositRate";
import { calcMenuTotal } from "@/utils/menu";
import { useConfirmClose } from "@/hooks/common/useConfirmClose";
import type { CreateBookingResult } from "@/api/endpoints/reservations";
import { requestPayment } from "@/api/endpoints/payments";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useNavigate } from "react-router-dom";
import { useUserId } from "@/stores/useAuthStore";
import { useModalPresence } from "@/hooks/common/useModalPresence";
import { cn } from "@/lib/utils";
import { backdropMotionClass, panelMotionClass } from "@/utils/modalMotion";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  restaurant: RestaurantDetail;
  draft: ReservationDraft;
  booking: CreateBookingResult | null;
};

export default function PaymentModal({
  open,
  onClose,
  onOpenChange,
  onBack,
  restaurant,
  draft,
  booking,
}: Props) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const { menus } = useMenus(restaurant.id);
  const { rate } = useDepositRate(restaurant.id);

  const menuTotal = useMemo(() => {
    return calcMenuTotal(menus, draft.selectedMenus);
  }, [menus, draft.selectedMenus]);

  const amount = booking?.totalDeposit ?? 0;

  const paymentMethodWidgetRef = useRef<any>(null);
  const agreementWidgetRef = useRef<any>(null);

  const widgetsRef = useRef<any>(null);
  const initedRef = useRef(false);

  const payOrderRef = useRef<{
    paymentId: number;
    bookingId: number;
    orderId: string;
    amount: number;
  } | null>(null);

  const paymentMethodContainerRef = useRef<HTMLDivElement | null>(null);
  const agreementContainerRef = useRef<HTMLDivElement | null>(null);

  const handleRequestClose = useConfirmClose(onClose);
  const userId = useUserId();
  const [_payAmount, setPayAmount] = useState<number>(
    booking?.totalDeposit ?? 0,
  );
  useEffect(() => {
    setPayAmount(booking?.totalDeposit ?? 0);
  }, [booking?.totalDeposit]);

  useEffect(() => {
    if (!open) return;
    if (!booking) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        if (paymentMethodContainerRef.current) {
          paymentMethodContainerRef.current.innerHTML = "";
        }
        if (agreementContainerRef.current) {
          agreementContainerRef.current.innerHTML = "";
        }
        const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as
          | string
          | undefined;
        if (!clientKey) throw new Error("VITE_TOSS_CLIENT_KEY가 없습니다.");
        if (!userId) {
          throw new Error("로그인 정보가 없어 결제를 진행할 수 없습니다.");
        }

        const payOrder = await requestPayment({ bookingId: booking.bookingId });
        if (cancelled) return;
        payOrderRef.current = {
          paymentId: payOrder.paymentId,
          bookingId: payOrder.bookingId,
          orderId: payOrder.orderId,
          amount: payOrder.amount,
        };
        setPayAmount(payOrder.amount);

        const tossPayments = await loadTossPayments(clientKey);

        if (cancelled) return;
        const customerKey = `user_${userId}`;
        const widgets = tossPayments.widgets({ customerKey });
        widgetsRef.current = widgets;
        initedRef.current = false;

        await widgets.setAmount({ value: payOrder.amount, currency: "KRW" });

        if (!initedRef.current) {
          initedRef.current = true;
          paymentMethodWidgetRef.current = await widgets.renderPaymentMethods({
            selector: "#toss-payment-method-widget",
            variantKey: "DEFAULT",
          });

          agreementWidgetRef.current = await widgets.renderAgreement({
            selector: "#toss-agreement-widget",
            variantKey: "AGREEMENT",
          });
        }
      } catch (e) {
        console.error(e);
        nav("/payment/fail", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      try {
        paymentMethodWidgetRef.current?.destroy?.();
        agreementWidgetRef.current?.destroy?.();
      } catch {}

      paymentMethodWidgetRef.current = null;
      agreementWidgetRef.current = null;

      widgetsRef.current = null;
      initedRef.current = false;
      payOrderRef.current = null;

      if (paymentMethodContainerRef.current) {
        paymentMethodContainerRef.current.innerHTML = "";
      }
      if (agreementContainerRef.current) {
        agreementContainerRef.current.innerHTML = "";
      }
    };
  }, [open, booking, nav, userId]);

  const onClickPay = async () => {
    if (loading) return;
    const payOrder = payOrderRef.current;
    const widgets = widgetsRef.current;
    if (!payOrder || !widgets) return;
    setLoading(true);
    try {
      await widgets.requestPayment({
        orderId: payOrder.orderId,
        orderName: `${restaurant.name} 예약금`,
        successUrl: `${window.location.origin}/payment/success?bookingId=${payOrder.bookingId}`,
        failUrl: `${window.location.origin}/payment/fail?bookingId=${payOrder.bookingId}`,
      });
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "결제 요청에 실패하였습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
    onOpenChange(false);
  };

  const { rendered, entered } = useModalPresence(open, 220);
  if (!rendered) return null;
  if (!restaurant || !draft) return null;
  if (!booking) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="예약 내용 확인모달"
    >
      <button
        type="button"
        className={cn(backdropMotionClass(entered), "z-0")}
        aria-label="모달 닫기"
        onClick={handleRequestClose}
      />
      <div
        className={cn(
          panelMotionClass(entered),
          "relative z-10 w-[92vw] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg">예약금 결제</h3>
          <button
            type="button"
            onClick={handleRequestClose}
            aria-label="닫기"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {" "}
            <X />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="border rounded-xl p-4">
            <div className="text-sm text-muted-foreground">매장</div>
            <div className="mt-1 text-base truncate">{restaurant.name}</div>
          </div>
          <div className="border rounded-xl p-4 space-y-1">
            <div className="text-sm text-muted-foreground">결제 금액</div>
            <div className="mt-1 text-xl font-semibold">
              {formatKrw(amount)}원
            </div>
            <p className="text-xs text-muted-foreground">
              메뉴 총액 {formatKrw(menuTotal)}원 * {Math.round(rate * 100)}%
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm">결제수단</div>
            <div
              id="toss-payment-method-widget"
              ref={paymentMethodContainerRef}
              className="mt-3 pointer-events-auto"
            />
            <div
              id="toss-agreement-widget"
              ref={agreementContainerRef}
              className="mt-3 pointer-events-auto"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="flex-1 h-12 rounded-xl cursor-pointer"
              onClick={handleBack}
            >
              이전
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 rounded-xl bg-blue-500 hover:bg-blue-600 cursor-pointer "
              disabled={loading}
              onClick={onClickPay}
            >
              {loading ? "결제 진행중.." : "결제하기"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            현재는 임시 결제(테스트)입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
