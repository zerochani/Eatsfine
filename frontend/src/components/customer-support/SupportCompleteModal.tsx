import { Send, X } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SupportCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseMs: number;
}

export default function SupportCompleteModal({
  isOpen,
  onClose,
  autoCloseMs,
}: SupportCompleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(t);
  }, [isOpen, autoCloseMs, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] sm:w-full sm:max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden gap-0"
      >
        <DialogHeader className="shrink-0 bg-white px-6 py-4 border-b mt-0">
          <div className="flex items-center justify-between">
            <DialogTitle>문의 접수 완료</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="size-6" />
            </button>
          </div>
          {/* 스크린 리더용 설명(경고 방지) */}
          <DialogDescription className="sr-only">
            1:1 문의 내용 완료 모달
          </DialogDescription>
        </DialogHeader>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="size-8 text-green-600" aria-hidden="true" />
          </div>
          <h4 className="text-gray-900 mb-2">문의가 접수되었습니다</h4>
          <p className="text-gray-600 text-center break-keep leading-relaxed">
            빠른 시일 내에 답변드리겠습니다.
            <br />
            등록하신 이메일로 답변이 발송됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
