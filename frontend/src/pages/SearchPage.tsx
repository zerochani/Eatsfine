import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import RestaurantList from "@/components/restaurant/RestaurantList";
import type { ReservationDraft } from "@/types/restaurant";
import RestaurantDetailModal from "@/components/restaurant/RestaurantDetailModal";
import ReservationModal from "@/components/reservation/modals/ReservationModal";
import ReservationConfirmMoodal from "@/components/reservation/modals/ReservationConfirmModal";
import PaymentModal from "@/components/reservation/modals/PaymentModal";
import ReservationMenuModal from "@/components/reservation/modals/ReservationMenuModal";
import type { RestaurantSummary } from "@/types/store";
import KakaoMap from "@/components/map/KakaoMap";
import { useRestaurantDetail } from "@/hooks/store/useRestaurantDetail";
import { useSearchStores } from "@/hooks/store/useSearchStores";
import type { CreateBookingResult } from "@/api/endpoints/reservations";
import { toHHmm } from "@/utils/time";
import RestaurantListSkeleton from "@/components/restaurant/RestaurantListSkeleton";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveMenuOpen, setReserveMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [hasSearched, setHasSearched] = useState(false);
  const FALLBACK_COORDS = { lat: 37.5665, lng: 126.978 };
  const [mapCenter, setMapCenter] = useState(FALLBACK_COORDS);

  const detailQuery = useRestaurantDetail(selectedStoreId);

  const [isSearchingUI, setIsSearchingUI] = useState(false);

  const [searchParams, setSearchParams] = useState<{
    keyword: string;
    lat: number;
    lng: number;
  } | null>(null);
  const searchQuery = useSearchStores(
    searchParams
      ? { ...searchParams, radius: 50, sort: "DISTANCE", page: 1, limit: 20 }
      : null,
  );

  const results = searchQuery.data ?? [];

  const searchError = searchQuery.isError
    ? searchQuery.error instanceof Error
      ? searchQuery.error.message
      : "검색에 실패했어요"
    : null;

  const [booking, setBooking] = useState<CreateBookingResult | null>(null);

  const normalizeDraft = (d: ReservationDraft): ReservationDraft => {
    const normalizedTime = toHHmm(d.time);
    const safeTime =
      !normalizedTime || normalizedTime.includes("undefined")
        ? undefined
        : normalizedTime;

    return {
      ...d,
      time: safeTime as any,
    };
  };
  type LatLng = { lat: number; lng: number };
  const [geoMap, setGeoMap] = useState<Map<number, LatLng>>(new Map());

  function isValidLatLng(loc: any): loc is LatLng {
    return (
      loc &&
      typeof loc.lat === "number" &&
      typeof loc.lng === "number" &&
      Number.isFinite(loc.lat) &&
      Number.isFinite(loc.lng)
    );
  }
  async function geocodeAddress(address: string): Promise<LatLng | null> {
    const kakao = window.kakao;
    if (!kakao?.maps?.services) {
      return null;
    }

    const geocoder = new kakao.maps.services.Geocoder();

    return new Promise((resolve) => {
      geocoder.addressSearch(address, (res: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK || !res?.[0]) {
          resolve(null);
          return;
        }
        const lng = parseFloat(res[0].x);
        const lat = parseFloat(res[0].y);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          resolve(null);
          return;
        }

        resolve({ lat, lng });
      });
    });
  }

  const openDetail = async (restaurant: RestaurantSummary) => {
    const storeId = restaurant.id;
    setSelectedStoreId(storeId);
    setDetailOpen(true);
    setDraft(null);
    setConfirmOpen(false);
    setReserveOpen(false);
    setReserveMenuOpen(false);
    setPaymentOpen(false);
    setBooking(null);
  };

  const handleSelectStore = (store: RestaurantSummary) => {
    openDetail(store);
  };

  const goReserve = () => {
    setDraft(null);
    setDetailOpen(false);
    setReserveOpen(true);
  };

  const goReserveMenu = (d: ReservationDraft) => {
    setDraft(normalizeDraft(d));
    setReserveOpen(false);
    setReserveMenuOpen(true);
  };

  const backToReserve = () => {
    setReserveMenuOpen(false);
    setReserveOpen(true);
  };
  const goConfirm = (d: ReservationDraft) => {
    setDraft(normalizeDraft(d));
    setReserveMenuOpen(false);
    setConfirmOpen(true);
  };
  const backToReserveMenu = () => {
    setConfirmOpen(false);
    setReserveMenuOpen(true);
  };

  const goPayment = (bookingResult: CreateBookingResult) => {
    setBooking(bookingResult);
    setConfirmOpen(false);
    setPaymentOpen(true);
  };

  const backToConfirm = () => {
    setPaymentOpen(false);
    setConfirmOpen(true);
  };

  const closeModalsOnly = () => {
    setDetailOpen(false);
    setReserveOpen(false);
    setReserveMenuOpen(false);
    setConfirmOpen(false);
    setPaymentOpen(false);
  };

  function getCoords(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(FALLBACK_COORDS);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(FALLBACK_COORDS),
        { enableHighAccuracy: false, timeout: 5000 },
      );
    });
  }

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!results || results.length === 0) return;

      const kakao = window.kakao;
      if (!kakao?.maps?.services) {
        setTimeout(() => {
          if (!cancelled) run();
        }, 200);
        return;
      }
      const targets = results.filter((r) => !isValidLatLng(r.location));
      if (targets.length === 0) return;
      const next = new Map(geoMap);

      for (const r of targets) {
        if (next.has(r.id)) continue;
        const loc = await geocodeAddress(r.address);
        if (loc) next.set(r.id, loc);
      }
      setGeoMap(next);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [results]);

  const geocodedResults = useMemo(() => {
    return results
      .map((r) => {
        const loc = isValidLatLng(r.location) ? r.location : geoMap.get(r.id);
        return loc ? { ...r, location: loc } : null;
      })
      .filter(Boolean) as RestaurantSummary[];
  }, [results, geoMap]);

  const runSearch = async () => {
    setHasSearched(true);
    setSelectedStoreId(null);
    const keyword = query.trim();

    if (!keyword) {
      setSearchParams(null);
      setIsSearchingUI(false);
      return;
    }
    setIsSearchingUI(true);

    const c = coords ?? (await getCoords());
    setCoords(c);
    setMapCenter({ lat: c.lat, lng: c.lng });
    setSearchParams({ keyword, lat: c.lat, lng: c.lng });
  };

  useEffect(() => {
    if (!hasSearched) return;
    if (!isSearchingUI) return;

    if (searchQuery.isSuccess || searchQuery.isError) {
      setIsSearchingUI(false);
    }
  }, [hasSearched, isSearchingUI, searchQuery.isSuccess, searchQuery.isError]);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="식당 이름, 지역, 음식 종류로 검색해보세요"
            className="w-full px-5 py-4 pr-14 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            aria-label="검색"
            onClick={runSearch}
          >
            <Search className="size-5" />
          </button>
        </div>
      </div>

      <KakaoMap
        center={mapCenter}
        markers={geocodedResults}
        selectedId={selectedStoreId}
        onSelectMarker={handleSelectStore}
        defaultLevel={4}
        selectedLevel={3}
      />

      <div className="mt-6 w-full max-w-2xl mx-auto">
        {hasSearched ? (
          <>
            {searchError ? (
              <p className="mt-2 text-sm text-red-500">{searchError}</p>
            ) : isSearchingUI || searchQuery.isFetching ? (
              <>
                <div className="mb-3 inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs text-gray-600">
                  <span className="h-3 w-3 animate-spin border-2 border-gray-300 border-t-transparent rounded-full" />
                  검색 중...
                </div>
                <RestaurantListSkeleton count={8} />
              </>
            ) : results.length === 0 ? (
              <div className="rounded p-6 text-center text-md text-muted-foreground">
                검색 결과가 없어요.
              </div>
            ) : (
              <RestaurantList
                restaurants={results}
                onSelect={handleSelectStore}
              />
            )}
          </>
        ) : null}
      </div>

      {detailOpen && (
        <RestaurantDetailModal
          open={detailOpen}
          onOpenChange={(o: boolean) => {
            setDetailOpen(o);
            if (!o) {
              closeModalsOnly();
            }
          }}
          status={
            !selectedStoreId
              ? "idle"
              : detailQuery.isLoading
                ? "loading"
                : detailQuery.isError
                  ? "error"
                  : "success"
          }
          restaurant={detailQuery.data ?? null}
          errorMessage={
            detailQuery.isError
              ? detailQuery.error instanceof Error
                ? detailQuery.error.message
                : "상세 조회 실패"
              : undefined
          }
          onRetry={() => detailQuery.refetch()}
          onClickReserve={goReserve}
        />
      )}
      {reserveOpen && selectedStoreId && detailQuery.data && (
        <ReservationModal
          open={reserveOpen}
          restaurant={detailQuery.data ?? null}
          initialDraft={draft ?? undefined}
          onClickConfirm={goReserveMenu}
          onClose={closeModalsOnly}
        />
      )}
      {selectedStoreId && draft && detailQuery.data && (
        <ReservationMenuModal
          open={reserveMenuOpen}
          restaurant={detailQuery.data}
          onConfirm={goConfirm}
          onBack={backToReserve}
          onClose={closeModalsOnly}
          draft={draft}
        />
      )}
      {selectedStoreId && draft && detailQuery.data && (
        <ReservationConfirmMoodal
          open={confirmOpen}
          onClose={closeModalsOnly}
          onBack={backToReserveMenu}
          onConfirm={goPayment}
          restaurant={detailQuery.data}
          draft={draft}
          booking={booking}
        />
      )}

      {selectedStoreId &&
        draft &&
        paymentOpen &&
        booking &&
        detailQuery.data && (
          <PaymentModal
            open={paymentOpen}
            onClose={closeModalsOnly}
            onOpenChange={setPaymentOpen}
            onBack={backToConfirm}
            restaurant={detailQuery.data}
            draft={draft}
            booking={booking}
          />
        )}
    </>
  );
}
