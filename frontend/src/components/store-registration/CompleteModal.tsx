import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import type { StoreInfoFormValues } from "./StoreInfo.schema";
import { Check } from "lucide-react";
import { categoryLabel } from "@/types/store";

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseMs: number;
  data: Partial<StoreInfoFormValues>;
}

export default function CompleteModal({
  isOpen,
  onClose,
  autoCloseMs,
  data,
}: CompleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(t);
  }, [isOpen, autoCloseMs, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <Check className="size-8 p-1 text-white bg-green-500 rounded-full mb-2" />
          <DialogTitle>가게 등록 완료!</DialogTitle>
          <DialogDescription>
            잠시 후 '내 가게 관리' 페이지로 이동합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-5 px-7 bg-gray-50 border border-gray-300 rounded-lg space-y-2">
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-500 shrink-0">가게 이름 </span>
            <span className="text-gray-900 break-keep text-right">
              {data.storeName || "-"}
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-500 shrink-0">음식 종류</span>
            <span className="text-gray-900 text-right">
              {data.category ? categoryLabel[data.category] : "-"}
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-500 shrink-0">주소</span>
            <span className="text-gray-900 break-keep text-right">
              {data.address || "-"}
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-500 shrink-0">전화번호</span>
            <span className="text-gray-900 text-right">
              {data.phoneNumber || "-"}
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-500 shrink-0">운영 시간</span>
            <span className="text-gray-900 text-right">
              {data.openTime || "-"}
              <span className="mx-1">~</span>
              {data.closeTime || "-"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
