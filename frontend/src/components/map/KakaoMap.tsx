import { loadKakaoMapSdk } from "@/lib/kakao";
import type { RestaurantSummary } from "@/types/store";
import { useEffect, useMemo, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };
type MarkerWithLocation = RestaurantSummary & { location: LatLng };

type Props = {
  center: LatLng;
  markers: RestaurantSummary[];
  selectedId?: number | null;
  onSelectMarker?: (store: RestaurantSummary) => void;
  className?: string;
  defaultLevel?: number;
  selectedLevel?: number;
};
declare global {
  interface Window {
    kakao: any;
  }
}

const toNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeLatLng = (loc: any): LatLng | null => {
  if (!loc) return null;

  let lat = toNum(loc.lat);
  let lng = toNum(loc.lng);

  if (lat == null || lng == null) return null;

  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    const tmp = lat;
    lat = lng;
    lng = tmp;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

export default function KakaoMap({
  center,
  markers,
  selectedId,
  onSelectMarker,
  className,
  defaultLevel,
  selectedLevel,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const infoRef = useRef<any>(null);
  const prevSelectedIdRef = useRef<number | null>(null);

  const safeMarkers = useMemo<MarkerWithLocation[]>(() => {
    return markers
      .map((m) => {
        const norm = normalizeLatLng((m as any).location);
        if (!norm) return null;
        return { ...m, location: norm } as MarkerWithLocation;
      })
      .filter(Boolean) as MarkerWithLocation[];
  }, [markers]);

  const [sdkReady, setSdkReady] = useState(!!window.kakao?.maps);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const centerRef = useRef(center);
  centerRef.current = center;

  const relayout = () => {
    const kakao = window.kakao;
    if (!kakao?.maps || !mapRef.current) return;

    try {
      mapRef.current.relayout();
    } catch {}
  };

  //1. 지도 최초 1회 생성
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadKakaoMapSdk();
        if (cancelled) return;
        setSdkReady(true);

        const kakao = window.kakao;
        if (!containerRef.current) return;
        if (mapRef.current) return;

        const options = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: defaultLevel ?? 4,
        };
        mapRef.current = new kakao.maps.Map(containerRef.current, options);
        infoRef.current = new kakao.maps.InfoWindow({ zIndex: 2 });
        relayout();
        requestAnimationFrame(relayout);
        setTimeout(relayout, 300);
      } catch (e) {
        console.error(e);
        setSdkError("카카오맵 로딩에 실패했습니다.");
      }
    };
    init();

    return () => {
      cancelled = true;
    };
  }, [defaultLevel]);

  // 2. 컨테이너 사이즈 변하면 relayout
  useEffect(() => {
    if (!sdkReady) return;
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      relayout();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [sdkReady]);

  //3. 센터바뀌면 지도 중심 이동 (선택 없을때만)
  useEffect(() => {
    const kakao = window.kakao;
    if (!sdkReady || !kakao?.maps || !mapRef.current) return;

    if (selectedId != null) return;

    const next = new kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.panTo(next);
  }, [sdkReady, center.lat, center.lng, selectedId]);

  // 4. 선택 마커 있으면 글로 이동
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || !mapRef.current) return;

    if (selectedId == null) return;
    const target = safeMarkers.find((m) => m.id === selectedId);
    if (!target) return;

    const next = new kakao.maps.LatLng(
      target.location.lat,
      target.location.lng,
    );

    mapRef.current.panTo(next);
    if (selectedLevel != null) {
      mapRef.current.setLevel(selectedLevel);
    }
  }, [selectedId, selectedLevel, safeMarkers]);

  //5. 마커 바뀌면 마커 재생성
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || !mapRef.current) return;

    markersRef.current.forEach((mk) => mk.setMap(null));
    markersRef.current.clear();

    safeMarkers.forEach((store) => {
      const pos = new kakao.maps.LatLng(store.location.lat, store.location.lng);
      const marker = new kakao.maps.Marker({
        map: mapRef.current,
        position: pos,
        clickable: true,
        zIndex: 1,
      });

      kakao.maps.event.addListener(marker, "click", () => {
        mapRef.current?.panTo(pos);
        if (selectedLevel != null) {
          mapRef.current?.setLevel(selectedLevel);
        }
        if (infoRef.current) {
          const el = document.createElement("div");
          el.style.cssText =
            "padding: 6px 8px; font-size:12px;line-height:1.2;";
          el.textContent = store.name;
          infoRef.current.setContent(el);
          infoRef.current.open(mapRef.current, marker);
        }
        onSelectMarker?.(store);
      });
      markersRef.current.set(store.id, marker);
    });
    relayout();
  }, [safeMarkers, onSelectMarker]);

  //6. 선택변경시 zIndex 처리
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || !mapRef.current) return;

    const prevId = prevSelectedIdRef.current;
    if (prevId != null) {
      markersRef.current.get(prevId)?.setZIndex(1);
    }
    if (selectedId != null) {
      markersRef.current.get(selectedId)?.setZIndex(10);
    }
    prevSelectedIdRef.current = selectedId ?? null;
  }, [selectedId]);

  //7. 선택 없으면 bounds 맞추기
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || !mapRef.current) return;
    if (selectedId != null) return;
    if (safeMarkers.length === 0) return;
    const bounds = new kakao.maps.LatLngBounds();

    safeMarkers.forEach((store) => {
      bounds.extend(
        new kakao.maps.LatLng(store.location.lat, store.location.lng),
      );
    });

    requestAnimationFrame(() => {
      try {
        mapRef.current.relayout();
        mapRef.current.setBounds(bounds);
      } catch {}
    });

    if (safeMarkers.length === 1 && defaultLevel != null) {
      mapRef.current.setLevel(defaultLevel);
    }
  }, [safeMarkers, selectedId, defaultLevel]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="레스토랑 위치 지도"
      className={
        className ??
        "relative w-full h-125 bg-gray-100 rounded-xl overflow-hidden"
      }
    >
      {sdkError ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-red-500 text-sm"
          role="alert"
        >
          {sdkError}
        </div>
      ) : !sdkReady ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm"
          role="status"
          aria-live="polite"
        >
          카카오맵 로딩 중..
        </div>
      ) : null}
    </div>
  );
}
