import { Controller, useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { StoreInfoSchema, type StoreInfoFormValues } from "./StoreInfo.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { phoneNumber } from "@/utils/phoneNumber";
import DaumPostcodeEmbed from "react-daum-postcode";
import { loadKakaoMapSdk } from "@/lib/kakao";
import { Upload, X } from "lucide-react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface StepStoreInfoProps {
  defaultValues: Partial<StoreInfoFormValues>;
  onChange: (isValid: boolean, data: StoreInfoFormValues) => void;
}
const DAYS = [
  { label: "월", value: "MONDAY" },
  { label: "화", value: "TUESDAY" },
  { label: "수", value: "WEDNESDAY" },
  { label: "목", value: "THURSDAY" },
  { label: "금", value: "FRIDAY" },
  { label: "토", value: "SATURDAY" },
  { label: "일", value: "SUNDAY" },
];

export default function StepStoreInfo({
  defaultValues,
  onChange,
}: StepStoreInfoProps) {
  const [isOpenPostcode, setIsOpenPostcode] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    resolver: zodResolver(StoreInfoSchema),
    mode: "onChange",
    defaultValues: {
      storeName: "",
      category: "KOREAN",
      address: "",
      detailAddress: "",
      phoneNumber: "",
      openTime: "",
      closeTime: "",
      holidays: [],
      depositRate: "TEN",
      bookingIntervalMinutes: 30,
      sido: "",
      sigungu: "",
      bname: "",
      latitude: 0,
      longitude: 0,
      ...defaultValues,
    },
  });

  const watchedMainImage = watch("mainImage");

  useEffect(() => {
    if (watchedMainImage && watchedMainImage instanceof File) {
      const url = URL.createObjectURL(watchedMainImage);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof watchedMainImage === "string") {
      setPreviewUrl(watchedMainImage);
    } else {
      setPreviewUrl(null);
    }
  }, [watchedMainImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("mainImage", file, { shouldValidate: true });
    }
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("mainImage", null, { shouldValidate: true });
  };

  useEffect(() => {
    if (isOpenPostcode) {
      document.body.style.overflow = "hidden";

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpenPostcode(false);
      };
      document.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpenPostcode]);

  useEffect(() => {
    loadKakaoMapSdk().catch((err) => console.error("카카오맵 로드 실패:", err));
  }, []);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const subscription = watch((value) => {
      onChangeRef.current(isValid, value as StoreInfoFormValues);
    });

    onChangeRef.current(isValid, getValues() as StoreInfoFormValues);

    return () => subscription.unsubscribe();
  }, [watch, isValid, getValues]);

  const handleAddressComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setValue("address", fullAddress);

    setValue("sido", data.sido);
    setValue("sigungu", data.sigungu);
    setValue("bname", data.bname);

    if (window.kakao?.maps?.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(fullAddress, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);

          setValue("latitude", lat, { shouldValidate: true });
          setValue("longitude", lng, { shouldValidate: true });

          trigger("address");
        } else {
          setValue("latitude", 0, { shouldValidate: true });
          setValue("longitude", 0, { shouldValidate: true });
          trigger("address");
        }
      });
    } else {
      alert("지도 서비스 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setValue("latitude", 0, { shouldValidate: true });
      setValue("longitude", 0, { shouldValidate: true });
      trigger("address");
    }

    setIsOpenPostcode(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-gray-900 mb-2 font-bold">가게 정보 입력</h3>
        <p className="text-gray-600 text-sm">
          고객에게 보여질 가게 정보를 입력해주세요.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="storeName" className="block text-gray-700 mb-2">
              가게 이름
              <span className="text-red-500">*</span>
            </Label>
            <input
              id="storeName"
              {...register("storeName")}
              type="text"
              placeholder="예: 더 플레이스 강남점"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.storeName && touchedFields.storeName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.storeName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="category" className="block text-gray-700 mb-2">
              음식 종류
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="category"
              {...register("category")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="KOREAN">한식</option>
              <option value="CHINESE">중식</option>
              <option value="JAPANESE">일식</option>
              <option value="WESTERN">양식</option>
              <option value="CAFE">카페</option>
            </select>
            {errors.category && touchedFields.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label
            htmlFor="address"
            className="flex flex-wrap items-baseline text-gray-700 mb-2"
          >
            주소
            <span className="text-red-500 mr-2">*</span>
            <span className="text-xs text-blue-600 break-keep">
              (현재 서울 지역만 등록 가능합니다)
            </span>
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                id="address"
                {...register("address")}
                readOnly
                type="text"
                placeholder="주소 검색"
                className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setIsOpenPostcode(true)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap cursor-pointer"
              >
                주소 검색
              </button>
            </div>
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address.message}
              </p>
            )}
            <input
              id="detailAddress"
              aria-label="상세주소"
              {...register("detailAddress")}
              type="text"
              placeholder="상세주소 (선택)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="block text-gray-700 mb-2">
            전화번호
            <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                id="phone"
                type="tel"
                placeholder="02-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value || ""}
                onChange={(e) => {
                  const formatted = phoneNumber(e.target.value);
                  onChange(formatted);
                }}
                maxLength={13}
              />
            )}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="openTime" className="block text-gray-700 mb-2">
              영업 시작 시간
              <span className="text-red-500">*</span>
            </Label>
            <input
              id="openTime"
              {...register("openTime")}
              type="time"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="closeTime" className="block text-gray-700 mb-2">
              영업 종료 시간 <span className="text-red-500">*</span>
            </Label>
            <input
              id="closeTime"
              {...register("closeTime")}
              type="time"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <Label id="holidays-label" className="block text-gray-700 mb-2">
            정기 휴무일(선택)
          </Label>
          <Controller
            name="holidays"
            control={control}
            render={({ field: { value = [], onChange } }) => (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby="holidays-label"
              >
                {DAYS.map((day) => {
                  const isSelected = value.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        const newHolidays = isSelected
                          ? value.filter((d: string) => d !== day.value)
                          : [...value, day.value];
                        onChange(newHolidays);
                      }}
                      className={`px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                          : "bg-white text-black border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="depositRate" className="block text-gray-700 mb-2">
              예약금 비율 <span className="text-red-500">*</span>
            </Label>
            <select
              id="depositRate"
              {...register("depositRate")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TEN">10%</option>
              <option value="TWENTY">20%</option>
              <option value="THIRTY">30%</option>
              <option value="FORTY">40%</option>
              <option value="FIFTY">50%</option>
            </select>
          </div>
          <div>
            <Label
              htmlFor="bookingIntervalMinutes"
              className="block text-gray-700 mb-2"
            >
              예약 시간 간격 (분)
            </Label>
            <input
              id="bookingIntervalMinutes"
              type="number"
              {...register("bookingIntervalMinutes", {
                valueAsNumber: true,
                onChange: (e) => {
                  const value = e.target.value;
                  if (value.length > 1 && value.startsWith("0")) {
                    e.target.value = Number(value).toString();
                  }
                },
              })}
              min={30}
              placeholder="30"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.bookingIntervalMinutes && (
              <p className="text-red-500 text-xs mt-1">
                {errors.bookingIntervalMinutes.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="mainImage" className="block text-gray-700 mb-2">
            식당 대표 이미지 <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-start gap-4">
            <input
              ref={fileInputRef}
              id="mainImage"
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              onChange={handleImageChange}
            />
            {!previewUrl ? (
              <Label
                htmlFor="mainImage"
                className="relative w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Upload className="size-8 text-gray-400" aria-hidden="true" />
                <span className="text-xs text-gray-500 mt-2">
                  이미지 업로드
                </span>
              </Label>
            ) : (
              <div className="relative w-32 h-32 border-2 border-gray-200 border-solid rounded-lg overflow-hidden group">
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  aria-label="이미지 삭제"
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-gray-500 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="flex-1 text-gray-500">
              <p>• 최대 용량: 1MB</p>
              <p>• 형식: JPG(JPEG), PNG</p>
              {errors.mainImage && (
                <p className="text-red-500 text-xs mt-1">
                  • {(errors.mainImage as any).message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="block text-gray-700 mb-2">
            가게 소개 <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="가게에 대한 간단한 소개를 작성해주세요."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </form>
      {isOpenPostcode && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpenPostcode(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full h-full md:h-[500px] md:max-w-lg rounded-none md:rounded-lg shadow-xl overflow-hidden relative cursor-default flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpenPostcode(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10 cursor-pointer"
              aria-label="닫기"
            >
              <X className="size-6" />
            </button>
            <div className="flex-1 p-4 pt-11">
              <DaumPostcodeEmbed
                onComplete={handleAddressComplete}
                style={{ height: "100%" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
