import { Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { supportSchema, type SupportFormValues } from "./support.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { postInquiry } from "@/api/inquiry";
import { getErrorMessage } from "@/utils/error";


interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const inputStyle =
  "text-base bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";

const SUPPORT_TYPE_LABEL: Record<SupportFormValues["type"], string> = {
  RESERVATION: "예약 문의",
  PAYMENT_REFUND: "결제/환불 문의",
  RESTAURANT_REGISTRATION: "식당 등록 문의",
  REVIEW: "리뷰 관련",
  TECH_SUPPORT: "기술 지원",
  ETC: "기타",
};

const defaultValues: SupportFormValues = {
  name: "",
  email: "",
  type: "RESERVATION",
  title: "",
  content: "",
};

export default function SupportModal({
  isOpen,
  onClose,
  onComplete,
}: SupportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: postInquiry,
    onSuccess: (data) => {
      console.log("문의 접수 ID:", data.id);
      onComplete();
    },
    onError: (error) => {
      console.error(error);
      alert(getErrorMessage(error));
    },
  });

  // 폼 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: SupportFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] sm:w-full sm:max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden gap-0"
      >
        <DialogHeader className="shrink-0 bg-white px-6 py-4 border-b mt-0">
          <div className="flex items-center justify-between">
            <DialogTitle>1:1 문의하기</DialogTitle>
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
            1:1 문의 내용을 작성하는 폼
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 이름 */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">
                  이름 <span className="text-red-500">*</span>
                </Label>
                <input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  maxLength={20}
                  className={inputStyle}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* 이메일 */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  maxLength={50}
                  className={inputStyle}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* 문의 유형 */}
            <div className="space-y-3">
              <Label htmlFor="type" className="text-base font-medium">
                문의 유형 <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                className={inputStyle + " cursor-pointer"}
                {...register("type")}
              >
                {Object.entries(SUPPORT_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1 font-medium">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* 제목 */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-medium">
                제목 <span className="text-red-500">*</span>
              </Label>
              <input
                id="title"
                type="text"
                placeholder="문의 제목을 입력하세요"
                maxLength={100}
                className={inputStyle}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* 문의 내용 */}
            <div className="space-y-3">
              <Label htmlFor="content" className="text-base font-medium">
                문의 내용 <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="content"
                rows={6}
                placeholder="문의하실 내용을 자세히 입력하세요"
                maxLength={2000}
                className={inputStyle + " resize-none"}
                {...register("content")}
              ></textarea>
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm break-keep">
                📧 문의하신 내용은 영업일 기준 24시간 이내에 이메일로
                답변드립니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="size-4" />
                {isPending ? "문의 중..." : "문의하기"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
