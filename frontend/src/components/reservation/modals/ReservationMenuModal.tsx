import type { ReservationDraft } from "@/types/restaurant";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "../../ui/button";
import type { SelectedMenu, MenuCategory, MenuItem } from "@/types/menus";
import { useMenus } from "@/hooks/reservation/useMenus";
import { useEffect, useMemo, useState } from "react";
import { calcMenuTotal } from "@/utils/menu";
import { cn } from "@/lib/utils";
import { formatKrw } from "@/utils/money";
import { useDepositRate } from "@/hooks/reservation/useDepositRate";
import { calcDeposit } from "@/utils/payment";
import { useConfirmClose } from "@/hooks/common/useConfirmClose";
import { toDepositRate } from "@/utils/depositRate";
import type { RestaurantDetail } from "@/types/store";
import { useModalPresence } from "@/hooks/common/useModalPresence";
import { backdropMotionClass, panelMotionClass } from "@/utils/modalMotion";

type Props = {
  open: boolean;
  restaurant: RestaurantDetail;
  onConfirm: (draft: ReservationDraft) => void;
  onBack: () => void;
  onClose: () => void;
  draft: ReservationDraft;
};

const CategoryLabel: Record<UiCategory, string> = {
  MAIN: "메인 메뉴",
  SIDE: "사이드 메뉴",
  DRINK: "음료",
  OTHER: "기타",
};

type UiCategory = MenuCategory | "OTHER";

export default function ReservationMenuModal({
  open,
  restaurant,
  onConfirm,
  onBack,
  onClose,
  draft,
}: Props) {
  const { activeMenus } = useMenus(restaurant.id);

  const [selectedMenus, setSelectedMenus] = useState<SelectedMenu[]>(
    draft.selectedMenus ?? [],
  );

  useEffect(() => {
    setSelectedMenus(draft.selectedMenus ?? []);
  }, [open, draft.selectedMenus]);

  const qtyMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const s of selectedMenus) map.set(Number(s.menuId), s.quantity);
    return map;
  }, [selectedMenus]);

  const mapMenuCategory = (raw: unknown): UiCategory => {
    const cat = String(raw);
    switch (cat) {
      case "MAIN":
      case "MAIN_MENU":
        return "MAIN";

      case "SIDE":
        return "SIDE";
      case "DRINK":
      case "BEVERAGE":
        return "DRINK";
      default:
        return "OTHER";
    }
  };

  const grouped = useMemo(() => {
    const by: Record<UiCategory, MenuItem[]> = {
      MAIN: [],
      SIDE: [],
      DRINK: [],
      OTHER: [],
    };
    for (const m of activeMenus ?? []) {
      const key = mapMenuCategory(m.category);
      by[key].push(m);
    }
    return by;
  }, [activeMenus]);
  const totalPrice = useMemo(() => {
    return calcMenuTotal(activeMenus, selectedMenus);
  }, [activeMenus, selectedMenus]);

  const setQuantity = (menu: MenuItem, nextQty: number) => {
    if (menu.isSoldOut) return;

    // 메뉴 최대 수량 20개로 제한
    const q = Math.max(0, Math.min(20, nextQty));
    setSelectedMenus((prev) => {
      const exists = prev.find((p) => p.menuId === menu.id);

      if (q === 0) return prev.filter((p) => p.menuId !== menu.id);

      if (exists) {
        return prev.map((p) =>
          p.menuId === menu.id ? { ...p, quantity: q } : p,
        );
      }

      return [...prev, { menuId: menu.id, quantity: q }];
    });
  };

  const inc = (menu: MenuItem) => {
    const cur = qtyMap.get(Number(menu.id)) ?? 0;
    setQuantity(menu, cur + 1);
  };
  const dec = (menu: MenuItem) => {
    const cur = qtyMap.get(Number(menu.id)) ?? 0;
    setQuantity(menu, cur - 1);
  };

  const { rate } = useDepositRate(restaurant.id);

  const depositAmount = useMemo(
    () => calcDeposit(totalPrice, toDepositRate(rate)),
    [totalPrice, rate],
  );

  const handleRequestClose = useConfirmClose(onClose);
  const { rendered, entered } = useModalPresence(open, 220);
  if (!rendered) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="메뉴 선택 모달"
    >
      <button
        type="button"
        className={cn(backdropMotionClass(entered))}
        aria-label="모달 닫기"
        onClick={handleRequestClose}
      />
      <div
        className={cn(
          panelMotionClass(entered),
          "flex flex-col relative z-10 w-[92vw] max-w-4xl max-h-[calc(100vh-96px)] overflow-y-auto rounded-2xl bg-white shadow-xl overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="min-w-0">
            <h2 className="text-xl truncate">{restaurant.name} 메뉴선택</h2>
            <p className="text-sm text-muted-foreground truncate">
              원하시는 메뉴를 미리 선택할 수 있어요. 메뉴당 최대수량은
              20개입니다.
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={handleRequestClose}
            aria-label="모달 닫기"
          >
            <X />
          </button>
        </div>
        {/* 메뉴선택UI */}
        <div className="overflow-y-auto px-6 py-6 space-y-7">
          {activeMenus.length === 0 ? (
            <div className="border rounded-xl p-6 text-center text-sm text-muted-foreground">
              아직 등록된 메뉴가 없어요
            </div>
          ) : (
            (["MAIN", "SIDE", "DRINK"] as MenuCategory[]).map((cat) => {
              const list = grouped[cat];
              if (list.length === 0) return null;
              const safeLabel = CategoryLabel[cat] ?? "기타";

              return (
                <section key={cat} className="space-y-3">
                  <div className="font-semibold">{safeLabel}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {list.map((menu) => {
                      const qty = qtyMap.get(Number(menu.id)) ?? 0;
                      const img =
                        menu.imageUrl && menu.imageUrl.trim().length > 0
                          ? menu.imageUrl
                          : "/modernKoreaRestaurant.jpg";
                      return (
                        <div
                          key={menu.id}
                          className={cn(
                            "rounded-2xl border overflow-hidden bg-white transition",
                            menu.isSoldOut
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-sm",
                          )}
                          aria-disabled={menu.isSoldOut}
                        >
                          <div className="flex gap-4 p-4">
                            {/* 음식사진 */}
                            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                              <img
                                src={img}
                                alt={menu.name}
                                className={cn(
                                  "h-full w-full object-cover",
                                  menu.isSoldOut && "grayscale",
                                )}
                              />
                              {menu.isSoldOut && (
                                <div className="absolute inset-0 grid place-items-center bg-black/40">
                                  <span className="rounded-sm bg-black/70 px-3 py-1 font-semibold text-white">
                                    품절
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* 내용 */}
                            <div className="flex-1 p-4 min-w-0 flex flex-col justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">
                                      {menu.name}
                                    </p>
                                    {menu.description ? (
                                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {menu.description}
                                      </p>
                                    ) : null}
                                  </div>
                                  {qty > 0 ? (
                                    <span className="shrink-0 rounded-md bg-blue-50 text-blue-600 px-2 py-1 text-md">
                                      {qty}개
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-sm font-semibold">
                                  {formatKrw(menu.price)}원
                                </p>
                              </div>
                              {/* 수량 조절 */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className={cn(
                                      "h-9 w-9 border rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100",
                                      (qty === 0 || menu.isSoldOut) &&
                                        "opacity-40 cursor-not-allowed",
                                    )}
                                    onClick={() => dec(menu)}
                                    disabled={qty === 0 || menu.isSoldOut}
                                    aria-label={`${menu.name} 수량 감소`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span>{qty}</span>
                                  <button
                                    type="button"
                                    className={cn(
                                      "h-9 w-9 border rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100",
                                      (menu.isSoldOut || qty >= 20) &&
                                        "opacity-40 cursor-not-allowed",
                                    )}
                                    onClick={() => inc(menu)}
                                    disabled={menu.isSoldOut || qty >= 20}
                                    aria-label={`${menu.name} 수량증가`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <div className="border-t px-6 py-3 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground">
                메뉴 총액: {""}
                <span className="text-lg font-semibold">
                  {formatKrw(totalPrice)}
                </span>
              </div>

              <div className="mt-1 text-xl text-blue-600 font-semibold">
                예약금 ({Math.round(rate * 100)}%): {""}
                <span>{formatKrw(depositAmount)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="h-12 px-6 rounded-lg cursor-pointer"
                variant="outline"
                onClick={onBack}
              >
                이전
              </Button>
              <Button
                type="button"
                className="h-12 px-6 rounded-lg cursor-pointer bg-blue-500  hover:bg-blue-600"
                onClick={() => {
                  onConfirm({ ...draft, selectedMenus });
                }}
              >
                다음
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            실제 결제는 다음 단계에서 진행됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
