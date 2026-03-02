import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormTrigger,
} from "react-hook-form";
import type { MenuFormValues } from "./Menu.schema";
import {
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { Trash2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface MenuItemInputProps {
  index: number;
  onDelete: () => void;
  register: UseFormRegister<MenuFormValues>;
  control: Control<MenuFormValues>;
  errors: FieldErrors<MenuFormValues>;
  setValue: UseFormSetValue<MenuFormValues>;
  trigger: UseFormTrigger<MenuFormValues>;
}

const CATEGORY_LABELS: Record<string, string> = {
  MAIN: "메인 메뉴",
  SIDE: "사이드 메뉴",
  BEVERAGE: "음료",
  ALCOHOL: "주류",
};

export default function MenuItemInput({
  index,
  onDelete,
  register,
  control,
  errors,
  setValue,
  trigger,
}: MenuItemInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchedImage = useWatch({
    control,
    name: `menus.${index}.imageKey`,
  });

  const previewUrl = useMemo(() => {
    if (watchedImage instanceof File) {
      return URL.createObjectURL(watchedImage);
    }
    if (typeof watchedImage === "string") {
      return watchedImage;
    }
    return null;
  }, [watchedImage]);

  useEffect(() => {
    if (watchedImage instanceof File && previewUrl) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [watchedImage, previewUrl]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(`menus.${index}.imageKey`, file, { shouldValidate: true });
    }
  };

  const handleRemoveImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue(`menus.${index}.imageKey`, undefined, { shouldValidate: true });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">메뉴 {index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          aria-label="메뉴 삭제"
          className="text-red-500 hover:text-red-700 cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div>
        <Label
          htmlFor={`menus.${index}.imageKey`}
          className="block text-gray-700 mb-2"
        >
          메뉴 이미지
        </Label>
        <div className="flex items-start gap-4">
          <Label
            className={`relative w-32 h-32 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden group
            ${
              previewUrl
                ? "border-gray-200 border-solid"
                : "border-gray-300 border-dashed hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              id={`menus.${index}.imageKey`}
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              onChange={handleImageChange}
            />

            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="메뉴 이미지 미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-gray-500 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="size-8 text-gray-400" aria-hidden="true" />
                <span className="text-xs text-gray-500 mt-2">
                  이미지 업로드
                </span>
              </>
            )}
          </Label>

          <div className="flex-1 text-gray-500">
            <p>• 최대 용량: 1MB</p>
            <p>• 형식: JPG(JPEG), PNG</p>
            {errors.menus?.[index]?.imageKey && (
              <p className="text-red-500 text-xs mt-1">
                • {(errors.menus[index]?.imageKey as any).message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor={`menus.${index}.name`}
            className="block text-gray-700 mb-2"
          >
            메뉴명
            <span className="text-red-500">*</span>
          </Label>
          <input
            id={`menus.${index}.name`}
            {...register(`menus.${index}.name`)}
            type="text"
            placeholder="예: 스테이크"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.menus?.[index]?.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.menus[index]?.name?.message}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor={`menus.${index}.price`}
            className="block text-gray-700 mb-2"
          >
            가격
            <span className="text-red-500">*</span>
          </Label>
          <input
            id={`menus.${index}.price`}
            {...register(`menus.${index}.price`, {
              onChange: (e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setValue(`menus.${index}.price`, value);
                trigger(`menus.${index}.price`);
              },
            })}
            type="text"
            inputMode="numeric"
            placeholder="30000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.menus?.[index]?.price && (
            <p className="text-red-500 text-xs mt-1">
              {errors.menus[index]?.price?.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <Label
          htmlFor={`menus.${index}.category`}
          className="block text-gray-700 mb-2"
        >
          카테고리 <span className="text-red-500">*</span>
        </Label>
        <Controller
          name={`menus.${index}.category`}
          control={control}
          render={({ field }) => (
            <select
              id={`menus.${index}.category`}
              {...field}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        />
      </div>
      <div>
        <Label
          htmlFor={`menus.${index}.description`}
          className="block text-gray-700 mb-2"
        >
          메뉴 설명
        </Label>
        <textarea
          id={`menus.${index}.description`}
          {...register(`menus.${index}.description`)}
          placeholder="메뉴에 대한 간단한 설명"
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}
