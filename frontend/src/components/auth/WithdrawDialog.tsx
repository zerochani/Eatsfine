import { deleteWithDraw } from "@/api/endpoints/member";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { logout as performLogout } from "@/api/auth";

function isWithdrawBlockByBookings(e: any) {
  const msg = e?.response?.data?.message;
  const result = e?.response?.data?.result;
  const code = e?.response?.data?.code;

  const raw = `${msg ?? ""} ${result ?? ""}`;

  return (
    code === "WITHDRAW_BLOCKED" ||
    /foreign key constraint/i.test(raw) ||
    /booking/i.test(raw) ||
    /예약/i.test(raw)
  );
}
export function WithdrawDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const nav = useNavigate();
  const logout = useAuthStore((s) => s.actions.logout);

  const [blocked, setBlocked] = useState(false);

  const handleClose = () => {
    setBlocked(false);
    onOpenChange(false);
  };
  const goReservations = () => {
    setBlocked(false);
    onOpenChange(false);
    nav("/mypage/reservations", { replace: true });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWithDraw,
    onSuccess: async () => {
      try {
        await performLogout();
      } finally {
        logout();
      }

      alert("회원 탈퇴가 완료되었습니다.");
      onOpenChange(false);
      nav("/", { replace: true });
    },
    onError: (e: any) => {
      if (isWithdrawBlockByBookings(e)) {
        setBlocked(true);
        return;
      }
      alert(e?.response?.data?.message ?? "회원 탈퇴에 실패했습니다.");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="모달 닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl rounded-2xl shadow-xl border border-gray-100 bg-white p-4"
      >
        <div className=" flex items-center justify-between px-3 py-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold">
            {blocked ? "탈퇴가 불가능합니다." : "정말 탈퇴하시겠어요?"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          key={blocked ? "blocked" : "confirm"}
          className="px-6 py-5 space-y-2 font-medium text-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
        >
          {blocked ? (
            <>
              <p className="text-red-500">
                예약 내역이 있어 탈퇴가 불가능합니다.
              </p>
              <p className="text-muted-foreground">
                예약 현황에서 예약을 취소한 후에 다시 시도해주세요.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                탈퇴하면 계정이 비활성화되며 서비스 이용이 불가합니다.
              </p>
              <p className="text-red-500">
                탈퇴후에는 동일 계정으로 다시 로그인할 수 없습니다.
              </p>
            </>
          )}
        </div>
        <div
          key={blocked ? "blocked-button" : "confirm-button"}
          className="flex justify-end gap-3 my-4 mr-5 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
        >
          {blocked ? (
            <>
              <Button
                type="button"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                onClick={goReservations}
              >
                예약 목록으로 이동
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200"
                onClick={handleClose}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="button"
                className="cursor-pointer bg-red-500 hover:bg-red-700 disabled:opacity-50"
                onClick={() => mutate()}
                disabled={isPending}
              >
                {isPending ? "처리중.." : "탈퇴하기"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
