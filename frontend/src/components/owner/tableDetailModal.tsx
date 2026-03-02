import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Calendar,
  Clock,
  Pencil,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { BreakTime } from "./BreakTimeModal";
import {
  getTableSlots,
  updateTableSlotStatus,
  getBookingDetail,
} from "@/api/owner/reservation";
import type {
  Slot,
  SlotStatus,
  UpdateSlotRequest,
} from "@/api/owner/reservation";
import {
  deleteTableImage,
  patchTableInfo,
  uploadTableImage,
} from "@/api/owner/table";
import { cancelBookingByOwner } from "@/api/owner/reservation";
import type { SeatsType } from "@/types/table";

interface TableInfo {
  minCapacity: number;
  maxCapacity: number;
  seatsType: SeatsType;
  tableImageUrl?: string | null;
}

interface Props {
  storeId: number;
  tableNumber: number;
  tableInfo: TableInfo;
  tableId: number;
  slotId: number;
  onDelete: (tableId: number, slotId: number) => void;
  onUpdateCapacity: (min: number, max: number) => void;
  onClose: () => void;
  breakTimes: BreakTime[];
  closedDays?: string[];
  onManageReservation?: () => void;
  onImageUpload?: (tableId: number, imageUrl: string) => void;
}

type Step = "DETAIL" | "CALENDAR" | "SLOTS";

type BookingDetail = {
  bookerName: string;
  partySize: number;
  amount: number;
};

const TableDetailModal: React.FC<Props> = ({
  storeId,
  tableNumber,
  tableInfo,
  tableId,
  slotId,
  onDelete,
  onUpdateCapacity,
  onClose,
  breakTimes,
  closedDays: closedDaysProp = [],
  onImageUpload,
}) => {
  const [step, setStep] = useState<Step>("DETAIL");
  const [isEditing, setIsEditing] = useState(false);
  const [tempMin, setTempMin] = useState(tableInfo.minCapacity);
  const [tempMax, setTempMax] = useState(tableInfo.maxCapacity);
  const [closedDays, setClosedDays] = useState<string[]>(closedDaysProp);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedFullDate, setSelectedFullDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [bookingDetailBookingId, setBookingDetailBookingId] = useState<
    number | null
  >(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [tableImageUrl, setTableImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (closedDaysProp) setClosedDays(closedDaysProp);
    setTempMin(tableInfo.minCapacity);
    setTempMax(tableInfo.maxCapacity);
    setTableImageUrl(
      tableInfo.tableImageUrl && tableInfo.tableImageUrl.trim() !== ""
        ? tableInfo.tableImageUrl
        : null,
    );
  }, [tableInfo, closedDaysProp]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (offset: number) =>
    setViewDate(new Date(year, month + offset, 1));
  const handleBack = () =>
    step === "SLOTS" ? setStep("CALENDAR") : setStep("DETAIL");

  const toMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const isBreakTime = (time: string, breakTimes: BreakTime[]) => {
    const target = toMinutes(time);
    return breakTimes.some(
      (bt) => target >= toMinutes(bt.start) && target < toMinutes(bt.end),
    );
  };

  const isCapacityValid =
    Number.isFinite(tempMin) &&
    Number.isFinite(tempMax) &&
    tempMin > 0 &&
    tempMax >= tempMin;
  const confirmCapacity = async () => {
    if (!isCapacityValid) return;

    try {
      await patchTableInfo(storeId, tableId, {
        minSeatCount: Number(tempMin),
        maxSeatCount: Number(tempMax),
      });

      onUpdateCapacity(Number(tempMin), Number(tempMax));
      setIsEditing(false);
    } catch (e: any) {
      console.error("테이블 정보 수정 실패", e?.response?.data ?? e);
      alert(e?.response?.data?.message ?? "테이블 정보 수정에 실패했습니다.");
    }
  };

  type TableType = "소형" | "중형" | "단체석";
  const getTableType = (maxCapacity: number): TableType => {
    if (maxCapacity <= 4) return "소형";
    if (maxCapacity <= 8) return "중형";
    return "단체석";
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchSlots = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTableSlots(storeId, tableId, formatDate(date));
      setSlots(res.data.result.slots);
    } catch (e: any) {
      console.error("슬롯 조회 실패", e?.response?.data ?? e);
      setError(
        e?.response?.data?.message ?? "예약 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetail = async (bookingId: number | null) => {
    if (!bookingId) {
      alert("예약 ID가 없습니다.");
      return;
    }

    setBookingDetailBookingId(bookingId);

    try {
      setDetailLoading(true);
      setDetailError(null);
      setShowBookingDetail(true);
      const res = await getBookingDetail(storeId, tableId, bookingId);
      const result = res.data.result;
      setBookingDetail({
        bookerName: result.bookerName,
        partySize: result.partySize,
        amount: result.amount,
      });
    } catch (e: any) {
      console.error("예약 상세 조회 실패", e?.response?.data ?? e);
      const status = e?.response?.status;
      if (status === 403) setDetailError("접근 권한이 없습니다.");
      else if (status === 404) setDetailError("해당 예약을 찾을 수 없습니다.");
      else
        setDetailError(
          e?.response?.data?.message ?? "예약 상세를 불러오지 못했습니다.",
        );
      setBookingDetail(null);
      setBookingDetailBookingId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleSlot = async (slot: Slot) => {
    if (!selectedFullDate) return;

    if (slot.status === "BOOKED") {
      if (slot.bookingId == null) {
        alert("예약 ID가 없습니다.");
        return;
      }
      await fetchBookingDetail(slot.bookingId);
      return;
    }

    const nextStatus: SlotStatus =
      slot.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";

    try {
      setLoading(true);

      const payload: UpdateSlotRequest = {
        targetDate: formatDate(selectedFullDate),
        startTime: slot.time,
        status: nextStatus,
      };

      await updateTableSlotStatus(storeId, tableId, payload);

      await fetchSlots(selectedFullDate);
    } catch (e: any) {
      const statusCode = e?.response?.status;
      if (statusCode === 404 && nextStatus === "AVAILABLE") {
        await fetchSlots(selectedFullDate);
        return;
      }

      console.error("슬롯 상태 변경 실패", e?.response?.data ?? e);
      alert(e?.response?.data?.message ?? "슬롯 상태 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    const maxSize = 5 * 1024 * 1024;
    if (!f.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (f.size > maxSize) {
      alert("파일 크기는 5MB 이하로 업로드해주세요.");
      return;
    }

    setSelectedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("업로드할 파일을 선택하세요.");
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(0);
      const res = await uploadTableImage(
        storeId,
        tableId,
        selectedFile,
        (ev) => {
          if (ev.total)
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      );
      const newUrl = res.data.result.tableImageUrl;
      setTableImageUrl(newUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploadProgress(null);

      if (onImageUpload) onImageUpload(tableId, newUrl);
      alert("이미지 업로드에 성공했습니다.");
    } catch (err: any) {
      console.error("이미지 업로드 실패", err?.response?.data ?? err);
      alert(err?.response?.data?.message ?? "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (storeId == null || tableId == null) return;
    if (!tableImageUrl) {
      alert("삭제할 이미지가 없습니다.");
      return;
    }
    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const res = await deleteTableImage(storeId, tableId);
      if (res.data.isSuccess) {
        setTableImageUrl(null);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        if (onImageUpload) onImageUpload(tableId, "");
        alert(res.data.message ?? "이미지가 삭제되었습니다.");
      } else {
        alert("이미지 삭제 실패: " + (res.data.message ?? "알 수 없는 오류"));
      }
    } catch (err: any) {
      console.error("이미지 삭제 실패", err?.response?.data ?? err);
      alert(
        err?.response?.data?.message ?? "이미지 삭제 중 오류가 발생했습니다.",
      );
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("이 예약을 취소하고 환불하시겠습니까?")) return;

    try {
      setDetailLoading(true);
      const res = await cancelBookingByOwner(storeId, tableId, bookingId);
      const result = res.data.result;
      if (result?.refundAmount != null) {
        alert(
          `예약이 취소되었습니다.\n환불 금액: ${result.refundAmount.toLocaleString()}원\n취소 시각: ${new Date(result.canceledAt).toLocaleString()}`,
        );
      } else {
        alert("예약이 취소되었습니다.");
      }

      setShowBookingDetail(false);
      setBookingDetail(null);
      if (selectedFullDate) fetchSlots(selectedFullDate);
    } catch (err: any) {
      console.error("예약 취소 실패", err?.response?.data ?? err);
      const status = err?.response?.status;
      if (status === 403) alert("접근 권한이 없습니다.");
      else if (status === 404) alert("예약 정보를 찾을 수 없습니다.");
      else alert(err?.response?.data?.message ?? "예약 취소에 실패했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const SEATS_TYPE_LABEL: Record<SeatsType, string> = {
    GENERAL: "일반석",
    WINDOW: "창가석",
    ROOM: "룸",
    BAR: "바 좌석",
    OUTDOOR: "야외석",
  };

  const capacityText = `${tableInfo.minCapacity}~${tableInfo.maxCapacity}인`;
  const tableType = getTableType(tableInfo.maxCapacity);

  const tableTypeStyle = {
    소형: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-700",
      label: "소형 테이블",
    },
    중형: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      label: "중형 테이블",
    },
    단체석: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-700",
      label: "단체석",
    },
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={() => {
        if (!uploading && !detailLoading) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step !== "DETAIL" && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="뒤로 가기"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <h3 className="text-lg text-gray-900">
              {step === "DETAIL"
                ? `${tableNumber}번 테이블`
                : step === "CALENDAR"
                  ? `${tableNumber}번 테이블 예약 시간대`
                  : "시간대 설정"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="모달 닫기"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {step === "DETAIL" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="w-full h-70 rounded-lg border border-gray-100 overflow-hidden">
                {tableImageUrl ? (
                  <img
                    src={tableImageUrl}
                    alt={`${tableNumber}번 테이블 이미지`}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setTableImageUrl(null);
                      if (onImageUpload) onImageUpload(tableId, "");
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center border-dashed">
                    <span className="text-5xl">🪑</span>
                    <p className="text-gray-400 text-md mt-2">
                      등록된 이미지가 없습니다
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <input
                  id="table-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="table-image-input"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer font-semibold text-gray-700 transition-colors"
                >
                  이미지 선택
                </label>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  {uploading ? `업로드 중 (${uploadProgress ?? 0}%)` : "업로드"}
                </button>

                {previewUrl && (
                  <div className="w-24 h-24 border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="프리뷰"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  onClick={handleDeleteImage}
                  disabled={!tableImageUrl || uploading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  이미지 삭제
                </button>
              </div>

              <div className="grid grid-cols-1">
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg min-h-[95px] flex flex-col justify-center transition-all">
                  <div className="flex items-center gap-1.5 text-gray-600 mb-1.5 text-md">
                    <User size={14} color="purple" /> 인원
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-purple-300 rounded px-2">
                        <input
                          type="number"
                          min={1}
                          value={tempMin}
                          onChange={(e) => {
                            const newMin = Number(e.target.value);
                            setTempMin(Math.min(newMin, tempMax));
                          }}
                          className="w-10 outline-none text-sm font-bold text-center"
                        />
                        <span className="mx-1">~</span>
                        <input
                          type="number"
                          min={tempMin}
                          value={tempMax}
                          onChange={(e) => {
                            const newMax = Number(e.target.value);
                            setTempMax(Math.max(newMax, tempMin));
                          }}
                          className="w-10 outline-none text-sm font-bold text-center"
                        />
                        <span className="ml-1 text-xs">인</span>
                      </div>
                      <button
                        onClick={confirmCapacity}
                        disabled={!isCapacityValid}
                        aria-disabled={!isCapacityValid}
                        className="text-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-red-400"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-gray-800">
                      <span className="text-sm font-bold">{capacityText}</span>
                      <button
                        onClick={() => {
                          setTempMin(tableInfo.minCapacity);
                          setTempMax(tableInfo.maxCapacity);
                          setIsEditing(true);
                        }}
                        className="text-gray-300 hover:text-purple-600"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">테이블 유형</p>
                  <p className="font-semibold">
                    {SEATS_TYPE_LABEL[tableInfo.seatsType]}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep("CALENDAR")}
                className="cursor-pointer w-full bg-blue-600 text-white py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                <Calendar size={18} /> 예약 정보 및 시간대 관리
              </button>

              <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg flex items-center gap-4">
                <Clock size={20} className="text-green-500" />
                <div>
                  <p className="text-lg text-green-900 mb-0.5">
                    예약 가능한 시간대
                  </p>
                  <p className="text-lg text-green-900 leading-tight">
                    {slots.filter((s) => s.isAvailable).length}개 예약 가능
                  </p>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-lg gap-4">
                <div>
                  <p className="text-lg text-gray-900 mb-1">
                    테이블 타입 및 좌석 정보
                  </p>
                </div>
                <div className="w-40">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border ${tableTypeStyle[tableType].bg} ${tableTypeStyle[tableType].border}`}
                  >
                    <span className="text-lg">🎉</span>
                    <span
                      className={`text-sm ${tableTypeStyle[tableType].text}`}
                    >
                      {tableTypeStyle[tableType].label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => onDelete(tableId, slotId)}
                  className="px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-600"
                >
                  테이블 삭제
                </button>
              </div>
            </div>
          )}

          {step === "CALENDAR" && (
            <div className="animate-in slide-in-from-right-5 duration-300 space-y-5">
              <div className="px-1 space-y-1">
                <p className="text-md text-gray-900">날짜를 먼저 선택하세요</p>
              </div>
              <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-900">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-white rounded-full transition-colors cursor-pointer"
                  aria-label="이전 달"
                >
                  <ChevronLeft />
                </button>
                <span className="text-lg">
                  {year}년 {month + 1}월
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-white rounded-full transition-colors cursor-pointer"
                  aria-label="다음 달"
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                  <span
                    key={d}
                    className="text-center text-sm text-gray-400 mb-1"
                  >
                    {d}
                  </span>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(year, month, day);
                  const isPast = dateObj < today;
                  const isTodayFlag = dateObj.getTime() === today.getTime();

                  const weekDay = dateObj.getDay();
                  const weekDayKorean = [
                    "일",
                    "월",
                    "화",
                    "수",
                    "목",
                    "금",
                    "토",
                  ][weekDay];

                  const isClosedDay = closedDays.includes(weekDayKorean);

                  return (
                    <button
                      key={day}
                      disabled={isPast || isClosedDay}
                      onClick={() => {
                        if (isPast || isClosedDay) return;
                        setSelectedFullDate(dateObj);
                        setStep("SLOTS");
                        fetchSlots(dateObj);
                      }}
                      className={`cursor-pointer h-14 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all ${
                        isPast || isClosedDay
                          ? "bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed"
                          : isTodayFlag
                            ? "bg-blue-50 border-gray-200 text-black shadow-lg hover:border-blue-300"
                            : "bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {isTodayFlag && (
                        <span className="text-[9px] mt-0.5 opacity-90">
                          오늘
                        </span>
                      )}
                      {isClosedDay && (
                        <span className="text-[10px] text-red-500 mt-0.5">
                          휴무
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-lg gap-4">
                <div>
                  <p className="flex text-md text-gray-900 mb-1">
                    {" "}
                    <Calendar className="mr-2" />
                    날짜를 선택하여 예약 시간대를 관리하세요
                  </p>
                  <p className="text-sm text-gray-900 mb-1 ml-8">
                    과거 날짜는 선택할 수 없습니다
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "SLOTS" && (
            <div className="animate-in slide-in-from-right-5 duration-300 space-y-4">
              {loading && (
                <div className="py-6 text-center text-gray-400">
                  예약 정보를 불러오는 중입니다...
                </div>
              )}

              {error && (
                <div className="py-6 text-center text-red-500">{error}</div>
              )}

              {showBookingDetail && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">예약 상세</p>
                      {detailLoading ? (
                        <p className="text-gray-500 mt-2">불러오는 중...</p>
                      ) : detailError ? (
                        <p className="text-red-500 mt-2">{detailError}</p>
                      ) : bookingDetail ? (
                        <div className="mt-2">
                          <p className="text-sm text-gray-800">
                            예약자:{" "}
                            <span className="font-semibold">
                              {bookingDetail.bookerName}
                            </span>
                          </p>
                          <p className="text-sm text-gray-800 mt-1">
                            인원:{" "}
                            <span className="font-semibold">
                              {bookingDetail.partySize}명
                            </span>
                          </p>
                          <p className="text-sm text-gray-800 mt-1">
                            결제된 예약금:{" "}
                            <span className="font-semibold">
                              {(bookingDetail.amount ?? 0).toLocaleString()}원
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 mt-2">
                          상세 정보가 없습니다.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => {
                          setShowBookingDetail(false);
                          setBookingDetail(null);
                          setDetailError(null);
                        }}
                        className="text-sm text-gray-500 underline"
                      >
                        닫기
                      </button>
                      {bookingDetail && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => {
                              if (bookingDetailBookingId !== null) {
                                handleCancelBooking(bookingDetailBookingId);
                              }
                            }}
                            disabled={detailLoading}
                            className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            예약 취소 & 환불
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center text-blue-900">
                <div className="flex items-center gap-2">
                  <Calendar size={18} />{" "}
                  <span>
                    {selectedFullDate?.toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </span>
                </div>
                <button
                  onClick={() => setStep("CALENDAR")}
                  className="text-sm underline text-blue-500 cursor-pointer"
                >
                  날짜 변경
                </button>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {slots.map((slot) => {
                  const isBreak = isBreakTime(slot.time, breakTimes);
                  const isAvailable = !isBreak && slot.status === "AVAILABLE";
                  const isBooked = slot.status === "BOOKED";
                  return (
                    <button
                      type="button"
                      key={`${slot.time}-${slot.bookingId ?? "none"}`}
                      disabled={isBreak || loading}
                      aria-pressed={isAvailable}
                      onClick={() => {
                        if (isBreak || loading) return;
                        handleToggleSlot(slot);
                      }}
                      className={`w-full flex justify-between items-center p-4 rounded-lg border-2 transition-all ${isBreak ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed" : isBooked ? "border-yellow-300 bg-yellow-50 cursor-pointer" : isAvailable ? "border-green-300 bg-green-50 cursor-pointer" : "border-red-300 bg-red-50 cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3 text-gray-700">
                        {isBreak ? (
                          <AlertCircle size={25} className="text-gray-400" />
                        ) : isBooked ? (
                          <User size={25} className="text-yellow-600" />
                        ) : isAvailable ? (
                          <CheckCircle2 size={25} className="text-green-500" />
                        ) : (
                          <XCircle size={25} className="text-red-400" />
                        )}
                        <span className="text-sm">{slot.time}</span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                          isBreak
                            ? "bg-gray-200 text-gray-700"
                            : isBooked
                              ? "bg-yellow-100 text-yellow-800"
                              : isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isBreak
                          ? "브레이크 타임"
                          : isBooked
                            ? "예약됨"
                            : isAvailable
                              ? "예약 가능"
                              : "미운영"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetailModal;
