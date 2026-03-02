import { logout } from "@/api/auth";
import { getMemberInfo } from "@/api/endpoints/member";
import { Button } from "@/components/ui/button";
import {
  useAuthStore,
  useAuthToken,
  useIsAuthenticated,
  useUserId,
} from "@/stores/useAuthStore";
import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function PublicLayout() {
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const accessToken = useAuthToken();
  const userId = useUserId();
  const { setUserId, logout: clearAuth } = useAuthStore((s) => s.actions);
  useEffect(() => {
    if (!accessToken) return;
    if (userId != null) return;
    let cancelled = false;
    (async () => {
      try {
        const member = await getMemberInfo();
        if (cancelled) return;
        const rawId = member?.id;

        let parsedId: number | null = null;
        if (typeof rawId === "number") parsedId = rawId;
        if (typeof rawId === "string" && /^\d+$/.test(rawId))
          parsedId = Number(rawId);
        if (parsedId != null && Number.isFinite(parsedId)) {
          setUserId(parsedId);
        } else {
          console.warn("[member/info] invalid id:", rawId, member);
          nav("/", { replace: true });
        }
      } catch (e: any) {
        if (cancelled) return;

        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
          nav("/", { replace: true });
        } else {
          console.error("[member/info] failed", status, e);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, userId, setUserId, clearAuth, nav]);

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;

    await logout();
    clearAuth();
    alert("로그아웃 되었습니다.");
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full border-b bg-white sticky top-0 z-40 py-2">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 ">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Logo(blue no bg).svg"
              alt="잇츠파인 로고"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-blue-600 text-xl font-semibold">잇츠파인</h1>
              <p className="text-xs">원하는 자리를 선택하는 스마트 식당 예약</p>
            </div>
          </Link>
          {isAuthenticated && (
            <Button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white hover:text-gray-500 cursor-pointer"
            >
              로그아웃
            </Button>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
