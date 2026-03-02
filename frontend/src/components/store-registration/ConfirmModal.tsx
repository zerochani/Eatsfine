import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "가게 등록을 그만두시겠습니까?",
  description = (
    <>
      작성 중인 내용은 저장되지 않습니다.
      <br />
      정말 새 가게 등록을 그만두시겠습니까?
    </>
  ),
  confirmLabel = "예",
  cancelLabel = "아니오",
  variant = "danger",
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[440px]">
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row items-center justify-center w-full gap-6 mt-4">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 text-white rounded-lg transition-colors cursor-pointer ${
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
