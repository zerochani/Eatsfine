import { confirmPayment } from "@/api/endpoints/payments";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
  const [sp] = useSearchParams();
  const nav = useNavigate();

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const paymentKey = sp.get("paymentKey");
    const orderId = sp.get("orderId");
    const amountStr = sp.get("amount");
    const bookingId = sp.get("bookingId");

    if (!paymentKey || !orderId || !amountStr) {
      nav("/payment/fail", { replace: true });
      return;
    }
    const amount = Number(amountStr);
    if (!Number.isFinite(amount)) {
      nav("/payment/fail", { replace: true });
      return;
    }

    (async () => {
      try {
        await confirmPayment({ paymentKey, orderId, amount });
        if (bookingId) {
          nav(`/reservation/complete?bookingId=${bookingId}`, {
            replace: true,
          });
        } else {
          nav("/mypage/reservations", { replace: true });
        }
      } catch (e) {
        console.error(e);
        nav("/payment/fail", { replace: true });
      }
    })();
  }, [sp.toString(), nav]);
  return <div className="p-6">결제 승인 처리중..</div>;
}
