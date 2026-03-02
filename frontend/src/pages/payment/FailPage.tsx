import { Button } from "@/components/ui/button";
import { HelpCircle, XCircle } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function humanizeFail(code?: string | null, message?: string | null) {
  if (message && message.trim().length > 0) return message;

  switch (code) {
    case "PAYMENT_FAILED":
      return "결제에 실패했습니다. 결제수단을 확인하고 다시 시도해주세요.";
    case "INVALID_AMOUNT":
      return "유효하지 않은 금액입니다. 결제 금액을 확인해주세요.";
    case "PAYMENT_NOT_FOUND":
      return "결제 정보를 찾을 수 없습니다. 잠시후에 다시 시도해주세요.";
    case "REFUND_FAILED":
      return "환불 처리에 실패했습니다. 고객센터로 문의해주세요.";
    default:
      return `결제에 실패했습니다. 다시 시도해주세요.`;
  }
}

export default function FailPage() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const code = sp.get("code") ?? sp.get("errorCode");
  const message = sp.get("message") ?? sp.get("errorMessage");

  const bookingId = sp.get("bookingId");
  const displayMessage = useMemo(
    () => humanizeFail(code, message),
    [code, message],
  );

  const goReservations = () => {
    if (bookingId) {
      nav(`/mypage/reservations?highlight=${bookingId}`, {
        replace: true,
      });
    } else {
      nav("/mypage/reservations", { replace: true });
    }
  };

  const onRetry = () => {
    if (bookingId) {
      nav(`/mypage/reservations?highlight=${bookingId}`, { replace: true });
      return;
    }
    nav("/search", { replace: true });
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-xl border rounded-2xl bg-white shadow-sm overflow-hidden p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <XCircle className="h-9 w-9 text-red-500 mt-2" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">결제 실패</h1>
            <p className="mt-1">아래 내용을 확인한 뒤 다시 시도해주세요.</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl bg-gray-50 p-4 space-y-2">
            <div className="text-sm font-semibold">실패 사유</div>
            <div className="text-gray-700 leading-relaxed">
              {displayMessage}
            </div>
            {code || message ? (
              <details className="mt-3">
                <summary className="text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer">
                  상세 정보 보기
                </summary>
                <div className="mt-2 text-xs text-gray-500 break-all space-y-1">
                  {code ? `code: ${code}` : null};
                  {message ? `message: ${message}` : null};
                </div>
              </details>
            ) : null}
          </div>

          <div className="text-xs text-gray-500 leading-relaxed text-center">
            결제창에서 취소했거나, 네트워크 상태에 따라 결제가 완료되지 않을 수
            있습니다.
            <br />
            문제가 반복되면 고객센터로 문의해주세요.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              className="h-12 bg-blue-500 hover:bg-blue-600 cursor-pointer"
              onClick={onRetry}
            >
              {bookingId ? "예약으로 돌아가서 다시 시도" : "다시 시도"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 cursor-pointer"
              onClick={goReservations}
            >
              예약 목록으로
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full justify-center cursor-pointer text-gray-700"
            onClick={() => nav("/customer-support", { replace: true })}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            고객센터로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
