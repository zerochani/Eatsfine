import { Store, Calendar, Star, Plus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyStores, type MyStore } from "@/api/owner/stores";

export default function StorePage() {
  const [shops, setShops] = useState<MyStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getMyStores();
        setShops(data);
      } catch (error) {
        console.error("내 가게 조회 실패", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  const totalReservations = shops.reduce(
    (sum, store) => sum + store.totalBookingCount,
    0,
  );

  const averageRating =
    shops.length === 0
      ? "-"
      : (
          shops.reduce((sum, store) => sum + store.rating, 0) / shops.length
        ).toFixed(1);

  const stats = [
    {
      label: "총 가게 수",
      value: `${shops.length}개`,
      icon: <Store size={20} />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "총 예약 수",
      value: totalReservations.toLocaleString(),
      icon: <Calendar size={20} />,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      label: "평균 평점",
      value: averageRating,
      icon: <Star size={20} />,
      bgColor: "bg-green-50",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium">내 가게 관리</h2>
          <p className="mt-0.5 text-sm text-gray-600">
            등록한 식당을 관리하고 대시보드로 이동하세요
          </p>
        </div>
        <Link
          to="/mypage/store/register"
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-700 transition"
        >
          <Plus size={18} /> 새 가게 등록
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-5 rounded-xl border border-gray-50",
              stat.bgColor,
            )}
          >
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl text-gray-900">{stat.value}</p>
            </div>
            <div className={stat.iconColor}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-8">
        {isLoading && (
          <div className="py-14 text-center text-gray-400">
            가게 정보를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && isError && (
          <div className="py-14 text-center text-red-400">
            가게 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {!isLoading && !isError && shops.length === 0 && (
          <div className="py-14 text-center text-gray-500">
            등록된 가게가 없습니다. 우측 상단에서 새 가게를 등록해주세요.
          </div>
        )}

        {!isLoading &&
          shops.map((store) => (
            <div
              key={store.storeId}
              className="flex items-center justify-between rounded-xl border p-5 hover:bg-gray-50 transition"
            >
              <div className="flex gap-4">
                {store.mainImageUrl ? (
                  <img
                    src={store.mainImageUrl}
                    alt={store.storeName}
                    className="h-20 w-20 rounded-lg object-cover border"
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement;
                      e.currentTarget.remove();
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "h-20 w-20 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400";
                        fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><rect width="20" height="5" x="2" y="7"/></svg>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400">
                    <Store size={28} />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{store.storeName}</h3>
                  <p className="text-sm text-gray-500">{store.address}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    평점 {store.rating} · 리뷰 {store.reviewCount}
                  </p>
                </div>
              </div>

              <Link
                to={`/mypage/store/${store.storeId}`}
                className="text-sm font-medium text-blue-500 hover:underline"
              >
                대시보드 이동
              </Link>
            </div>
          ))}
      </div>

      <div className="rounded-2xl bg-blue-50/50 p-6 border border-blue-100/50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white text-blue-500 shadow-sm border">
            <BarChart3 size={24} />
          </div>
          <div>
            <h4>더 많은 데이터가 필요하신가요?</h4>
            <p className="text-sm text-gray-500 mt-1">
              프리미엄 플랜으로 업그레이드하고 AI 데이터 인사이트와 상세 분석
              리포트를 받아보세요.
            </p>
          </div>
        </div>
        <button
          onClick={() => nav("/mypage/subscription")}
          className="mt-6 cursor-pointer w-full sm:w-auto px-8 py-4 rounded-lg bg-blue-500 font-bold text-white hover:bg-blue-600 transition"
        >
          프리미엄 플랜 알아보기
        </button>
      </div>
    </section>
  );
}
