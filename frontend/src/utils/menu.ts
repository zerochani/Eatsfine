import type { MenuItem, SelectedMenu } from "@/types/menus";

export function calcMenuTotal(
  menus?: MenuItem[] | null,
  selected?: SelectedMenu[] | null,
) {
  const safeMenus = Array.isArray(menus) ? menus : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  const priceMap = new Map(safeMenus.map((m) => [m.id, m.price]));
  return safeSelected.reduce(
    (sum, s) => sum + (priceMap.get(s.menuId) ?? 0) * s.quantity,
    0,
  );
}
