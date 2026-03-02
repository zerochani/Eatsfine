import { Lock, Bell, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDiaLog";
import { WithdrawDialog } from "@/components/auth/WithdrawDialog";

const STORAGE_KEY = "settings.notifications.v1";

const defaultNotifications = {
  reservation: true,
  promotion: true,
  review: false,
  email: true,
  sms: false,
};

function ToggleButton({
  label,
  description,
  enabled,
  onClick,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="cursor-pointer flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch enabled={enabled} onClick={onClick} />
    </div>
  );
}

function Switch({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onClick}
      className={cn(
        "cursor-pointer relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        enabled ? "bg-blue-600" : "bg-gray-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [pwOpen, setPwOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [savedNotifications, setSavedNotifications] = useState(notifications);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const merged = { ...defaultNotifications, ...parsed };
      setNotifications(merged);
      setSavedNotifications(merged);
    } catch (e) {
      console.warn("알림 설정 로드 실패, 기본값 사용", e);
    }
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(notifications) !== JSON.stringify(savedNotifications);
  }, [notifications, savedNotifications]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!isDirty) {
      alert("변경사항이 없습니다.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    setSavedNotifications(notifications);
    alert("변경사항이 저장되었습니다.");
  };

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-medium mb-6">계정 설정</h2>

      <div className="flex gap-4 pb-8 border-b border-gray-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Lock size={20} />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900">비밀번호 변경</h3>
            <p className=" text-gray-500 mt-2">
              정기적인 비밀번호 변경으로 계정을 안전하게 보호하세요
            </p>
          </div>
          <button
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setPwOpen(true)}
          >
            비밀번호 변경하기
          </button>
        </div>
      </div>

      <div className="flex gap-4 py-8 border-b border-gray-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Bell size={20} />
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900">알림 설정</h3>
            <p className="text-gray-500 mt-2 pb-3">
              받고 싶은 알림을 선택하세요
            </p>
          </div>

          <div className="space-y-9">
            <ToggleButton
              label="예약 관련 알림"
              description="예약 확인, 변경, 취소 알림"
              enabled={notifications.reservation}
              onClick={() => toggleNotification("reservation")}
            />
            <ToggleButton
              label="프로모션 알림"
              description="할인, 이벤트 정보"
              enabled={notifications.promotion}
              onClick={() => toggleNotification("promotion")}
            />
            <ToggleButton
              label="리뷰 알림"
              description="내 리뷰에 대한 반응 알림"
              enabled={notifications.review}
              onClick={() => toggleNotification("review")}
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">알림 수신 방법</h4>
            <div className="grid grid-cols-[1fr_auto] items-center gap-y-5">
              <span className="text-gray-700">이메일</span>
              <Switch
                enabled={notifications.email}
                onClick={() => toggleNotification("email")}
              />
              <span className="text-gray-700">SMS</span>
              <Switch
                enabled={notifications.sms}
                onClick={() => toggleNotification("sms")}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:cursor-pointer enabled:bg-blue-500 enabled:hover:bg-blue-700"
          >
            저장하기
          </button>
        </div>
      </div>

      <div className="flex gap-4 pt-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Trash2 size={20} />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900">계정 탈퇴</h3>
            <p className=" text-gray-500 mt-2">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
            </p>
          </div>
          <button
            className="cursor-pointer rounded-lg border border-red-500 px-4 py-2 font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => setWithdrawOpen(true)}
          >
            계정 탈퇴하기
          </button>
          <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
          <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
        </div>
      </div>
    </section>
  );
}
