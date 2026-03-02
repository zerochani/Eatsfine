import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  createMenus,
  updateMenu,
  uploadMenuImage,
  type MenuUpdateItem,
} from "@/api/owner/menus";
import { deleteMenuImage } from "@/api/owner/menus";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (menuData: any) => void;
  categories: { id: string; label: string }[];
  editingMenu?: any;
  storeId: string;
  onImageDelete?: () => void;
}

const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingMenu,
  storeId,
  onImageDelete,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "MAIN",
    price: "",
    description: "",
  });

  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    editingMenu?.imageUrl || null,
  );
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingMenu) {
      setFormData({
        name: editingMenu.name,
        category: editingMenu.category,
        price: editingMenu.price.toString(),
        description: editingMenu.description || "",
      });

      setImageUrl(editingMenu.imageUrl || null);
      setImageKey(editingMenu.imageKey || null);
    } else {
      setFormData({ name: "", category: "MAIN", price: "", description: "" });
      setImageUrl(null);
      setImageKey(null);
    }
    setImageFile(null);
    setUploading(false);
  }, [editingMenu, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(formData.price) < 0) {
      alert("가격은 0원 이상이어야 합니다.");
      return;
    }

    if (!storeId) {
      alert("storeId가 필요합니다.");
      return;
    }

    try {
      const isEditing = Boolean(editingMenu?.id);

      const payload: MenuUpdateItem = {
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        price: Number(formData.price),
        category: formData.category,
      };
      if (imageKey !== null) {
        payload.imageKey = imageKey;
      } else if (isEditing && editingMenu?.imageKey) {
        payload.imageKey = editingMenu.imageKey;
      }

      if (isEditing) {
        const res = await updateMenu(storeId, editingMenu.id, payload);
        if (res.isSuccess) {
          alert("메뉴가 성공적으로 수정되었습니다.");
          onSubmit({
            ...formData,
            id: String(editingMenu.id),
            imageUrl: res.result.imageUrl ?? null,
            imageKey: imageKey ?? null,
            isActive: editingMenu?.isActive ?? true,
            isSoldOut: editingMenu?.isSoldOut ?? false,
            price: Number(formData.price),
          });
          onClose();
        } else {
          alert("메뉴 수정 실패: " + res.message);
        }
      } else {
        const res = await createMenus(storeId, [payload]);
        if (res.isSuccess) {
          alert("메뉴 등록 성공!");
          onSubmit({
            ...formData,
            id: String(res.result.menus[0].menuId),
            imageUrl: res.result.menus[0].imageUrl,
            imageKey: res.result.menus[0].imageKey || null,
            isActive: true,
            isSoldOut: false,
          });
          onClose();
        } else {
          alert("메뉴 등록 실패: " + res.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        editingMenu
          ? "메뉴 수정 중 오류가 발생했습니다."
          : "메뉴 등록 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-50 shrink-0">
          <h3 className="text-xl text-gray-900">
            {editingMenu ? "메뉴 수정" : "새 메뉴 등록"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center gap-3 w-full">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="메뉴 미리보기"
                className="w-32 h-32 object-cover rounded-xl border"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-xl border flex items-center justify-center text-gray-400 text-sm">
                이미지 없음
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                className={`cursor-pointer px-6 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {uploading ? "업로드 중..." : "이미지 선택"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (!e.target.files?.length) return;
                    const file = e.target.files[0];
                    setImageFile(file);
                    setUploading(true);

                    try {
                      const res = await uploadMenuImage(storeId, file);
                      if (res.isSuccess) {
                        setImageKey(res.result.imageKey);
                        setImageUrl(res.result.imageUrl);
                      } else {
                        alert("이미지 업로드 실패: " + res.message);
                        setImageFile(null);
                      }
                    } catch (err) {
                      console.error(err);
                      alert("이미지 업로드 중 오류가 발생했습니다.");
                      setImageFile(null);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>

              {imageUrl && (
                <button
                  type="button"
                  className="cursor-pointer ml-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl"
                  onClick={async () => {
                    if (!editingMenu?.id) {
                      setImageFile(null);
                      setImageUrl(null);
                      setImageKey(null);
                      return;
                    }

                    const menuId = editingMenu.id;
                    if (!menuId) {
                      alert("메뉴 ID가 존재하지 않아 삭제할 수 없습니다.");
                      return;
                    }

                    try {
                      const res = await deleteMenuImage(storeId, menuId);
                      if (res.isSuccess) {
                        setImageUrl(null);
                        setImageKey(null);
                        alert("이미지가 삭제되었습니다.");
                        if (onImageDelete) onImageDelete(); // 부모에게 알림
                      } else {
                        alert("이미지 삭제 실패: " + res.message);
                      }
                    } catch (err) {
                      console.error(err);
                      alert("이미지 삭제 중 오류가 발생했습니다.");
                    }
                  }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-500 ml-1">메뉴 이름</label>
            <input
              required
              type="text"
              placeholder="메뉴명을 입력하세요"
              className="cursor-pointer w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-500 ml-1">카테고리</label>
              <select
                className="cursor-pointer w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 bg-white"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {categories
                  .filter((c) => c.id !== "ALL")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500 ml-1">가격 (원)</label>
              <input
                required
                type="number"
                min={0}
                className="cursor-pointer w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setFormData({ ...formData, price: "" });
                    return;
                  }

                  const num = Number(value);
                  if (num < 0) return;

                  setFormData({ ...formData, price: value });
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 ml-1">메뉴 설명</label>
            <textarea
              rows={3}
              placeholder="메뉴에 대한 설명을 입력하세요"
              className="cursor-pointer w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 py-3.5 rounded-xl text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all text-sm font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 py-3.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all text-sm font-medium"
            >
              {editingMenu ? "수정 완료" : "메뉴 등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuFormModal;
