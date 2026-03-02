import { Outlet, NavLink } from "react-router-dom";
import { Calendar, Crown, Settings, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { to: "/mypage/info", label: "내 정보", icon: User },
  { to: "/mypage/settings", label: "계정 설정", icon: Settings },
  { to: "/mypage/subscription", label: "구독 관리", icon: Crown },
  { to: "/mypage/reservations", label: "예약 현황", icon: Calendar },
  { to: "/mypage/store", label: "내 가게 관리", icon: Store },
];

export default function MyPageLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <p className="text-xl">마이페이지</p>
        <p className="mt-2 text-gray-600">계정 정보와 예약 내역을 관리하세요</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <aside className="w-full md:w-60 rounded-xl bg-white shadow-sm overflow-hidden">
          <nav className="flex flex-col">
            {sidebarItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-12 items-center gap-3 px-5 py-7 text-md font-medium transition",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 h-full w-1 bg-blue-500" />
                    )}
                    <Icon size={18} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="w-full flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
