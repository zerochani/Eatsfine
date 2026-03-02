import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import MenuFormModal from "./menuFormModal";
import { deleteMenus } from "@/api/owner/menus";
import { getMenus, updateMenuSoldOut } from "@/api/owner/menus";

interface MenuManagementProps {
  storeId?: string;
}

interface Category {
  id: string;
  label: string;
}

interface LocalMenu {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string | null;
  isSoldOut?: boolean;
  isActive?: boolean;
}

type CategoryType = string;

const MenuManagement: React.FC<MenuManagementProps> = ({ storeId }) => {
  const restaurantId = storeId;

  const DEFAULT_CATEGORIES: Category[] = [
    { id: "ALL", label: "전체" },
    { id: "MAIN", label: "메인 메뉴" },
    { id: "SIDE", label: "사이드 메뉴" },
    { id: "BEVERAGE", label: "음료" },
    { id: "ALCOHOL", label: "주류" },
  ];

  const [menus, setMenus] = useState<any[]>([]);

  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);

  const mapServerToLocal = (s: any): LocalMenu => ({
    id: String(s.menuId ?? `MENU_${Date.now()}`),
    name: s.name ?? "",
    description: s.description ?? "",
    price: s.price ?? 0,
    category: s.category ?? undefined,
    imageUrl: s.imageUrl ?? null,
    isSoldOut: !!s.isSoldOut,
    isActive: true,
  });

  useEffect(() => {
    const STORAGE_KEY_MENU = restaurantId
      ? `menu-items-${restaurantId}`
      : "menu-items-temp";

    const savedMenus = localStorage.getItem(STORAGE_KEY_MENU);
    if (savedMenus) {
      try {
        setMenus(JSON.parse(savedMenus));
      } catch {
        setMenus([]);
      }
    }

    if (!restaurantId) {
      return;
    }

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getMenus(restaurantId);
        if (res.isSuccess && res.result && Array.isArray(res.result.menus)) {
          const serverMenus = res.result.menus.map(mapServerToLocal);

          const localTempMenus = menus.filter((m) => m.id.startsWith("MENU_"));

          const mergedMenus = [...serverMenus, ...localTempMenus];

          setMenus(mergedMenus);
          localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(mergedMenus));
        } else {
          setError(res.message || "메뉴를 가져오는 중 문제가 발생했습니다.");
        }
      } catch (err: any) {
        console.error("getMenus error", err);
        setError("메뉴를 불러오는 데 실패했습니다. 네트워크를 확인해주세요.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      const STORAGE_KEY_MENU = `menu-items-${restaurantId}`;
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menus));
    }
  }, [menus, restaurantId]);

  const handleFormSubmit = (menuData: any) => {
    setMenus((prev) => {
      const incomingId = menuData.id ? String(menuData.id) : null;

      const existingIndex = prev.findIndex((m) => String(m.id) === incomingId);
      if (existingIndex !== -1) {
        const updatedMenus = [...prev];
        updatedMenus[existingIndex] = {
          ...prev[existingIndex],
          ...menuData,
          price: Number(menuData.price),
        };
        return updatedMenus;
      } else {
        return [{ ...menuData, price: Number(menuData.price) }, ...prev];
      }
    });

    setIsModalOpen(false);
    setEditingMenu(null);
  };

  const handleEditClick = (menu: any) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    if (!storeId) {
      alert("가게 정보가 없습니다.");
      return;
    }
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const deleteMenu = async (id: string) => {
    if (!storeId) return alert("storeId가 없습니다.");

    if (id.startsWith("MENU_")) {
      if (window.confirm("정말로 이 메뉴를 삭제하시겠습니까?")) {
        setMenus((prev) => prev.filter((m) => m.id !== id));
      }
      return;
    }

    if (window.confirm("정말로 이 메뉴를 삭제하시겠습니까?")) {
      try {
        const menuIdNum = Number(id);
        const res = await deleteMenus(storeId, [menuIdNum]);

        if (res.isSuccess) {
          setMenus((prev) => prev.filter((m) => Number(m.id) !== menuIdNum));
          alert(res.message || "메뉴가 삭제되었습니다.");
        } else {
          alert("메뉴 삭제 실패: " + res.message);
        }
      } catch (err) {
        console.error(err);
        alert("메뉴 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const toggleSoldOutOnServer = async (id: string, targetSoldOut: boolean) => {
    if (!storeId) return alert("storeId가 없습니다.");

    const menuIdNum = Number(id);
    if (Number.isNaN(menuIdNum)) return alert("메뉴 ID가 유효하지 않습니다.");

    try {
      const res = await updateMenuSoldOut(storeId, menuIdNum, targetSoldOut);

      if (res.isSuccess) {
        const newSoldOut = res.result?.isSoldOut ?? targetSoldOut;

        setMenus((prev) =>
          prev.map((m) =>
            String(m.id) === String(id) ? { ...m, isSoldOut: newSoldOut } : m,
          ),
        );
        alert(
          res.message ||
            (newSoldOut ? "품절 처리되었습니다." : "품절 해제되었습니다."),
        );
      } else {
        alert("품절 상태 변경 실패: " + res.message);
      }
    } catch (err: any) {
      console.error("updateMenuSoldOut error", err);
      alert("품절 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const filteredMenus =
    activeCategory === "ALL"
      ? menus
      : menus.filter((menu) => menu.category === activeCategory);

  if (isLoading)
    return (
      <div className="px-8 py-10 text-gray-500 font-medium">
        데이터를 불러오는 중...
      </div>
    );
  if (error) return <div className="px-8 py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">메뉴 관리</h2>
          <p className="text-gray-500 text-sm font-medium">
            총 {menus.length}개의 메뉴가 등록되어 있습니다
          </p>
        </div>
        <button
          className="cursor-pointer bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          onClick={handleAddClick}
        >
          <Plus size={18} /> 메뉴 추가
        </button>
      </div>

      <div className="overflow-x-auto flex gap-3 mb-8 p-4 rounded-lg bg-white">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`cursor-pointer px-5 py-2.5 rounded-lg text-md transition-all ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 border border-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredMenus.map((menu) => (
          <div
            key={menu.id}
            className={`
              flex flex-col rounded-lg p-6 transition-all relative group border
              ${
                menu.isActive
                  ? "bg-white border-gray-100"
                  : "bg-gray-100 border-gray-200 opacity-60"
              }
            `}
          >
            {menu.imageUrl && (
              <img
                src={menu.imageUrl}
                alt={menu.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg text-gray-900">{menu.name}</h4>
                  {menu.isSoldOut && (
                    <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-md font-black border border-red-100">
                      품절
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-500 mb-3">
                  {categories.find(
                    (c) => String(c.id) === String(menu.category),
                  )?.label || menu.category}
                </p>
                <p className="flex-1 text-md text-gray-500 leading-relaxed mb-6 line-clamp-2">
                  {menu.description}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="cursor-pointer p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => handleEditClick(menu)}
                  aria-label={`${menu.name} 수정`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="cursor-pointer p-2 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => deleteMenu(menu.id)}
                  aria-label={`${menu.name} 삭제`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <span className="text-lg text-gray-900">
                {menu.price.toLocaleString()}원
              </span>

              <button
                onClick={() => toggleSoldOutOnServer(menu.id, !menu.isSoldOut)}
                role="switch"
                aria-checked={!menu.isSoldOut}
                aria-label={`${menu.name} 판매 가능 여부`}
                className={`cursor-pointer w-12 h-6 rounded-full transition-colors relative ${!menu.isSoldOut ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!menu.isSoldOut ? "left-7" : "left-1"}`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        editingMenu={editingMenu}
        storeId={storeId!}
        onImageDelete={() => {
          if (!editingMenu) return;
          setMenus((prev) =>
            prev.map((m) =>
              m.id === editingMenu.id
                ? { ...m, imageUrl: null, imageKey: null }
                : m,
            ),
          );
        }}
      />
    </div>
  );
};

export default MenuManagement;
