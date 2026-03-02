import { putChangePassword } from "@/api/endpoints/member";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { X } from "lucide-react";

const schema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
    newPasswordConfirm: z
      .string()
      .min(1, "변경하실 비밀번호를 한번더 눌러주세요"),
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    message: "새 비밀번호와 확인이 일치하지 않습니다.",
    path: ["newPasswordConfirm"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: putChangePassword,
    onSuccess: (result) => {
      alert(result.message ?? "비밀번호가 변경되었습니다");
      form.reset();
      onOpenChange(false);
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? "비밀번호 변경에 실패했습니다.";
      if (typeof msg === "string" && /현재|기존|일치|틀렸/.test(msg)) {
        form.setError("currentPassword", { type: "server", message: msg });
        return;
      }
      alert(msg);
    },
  });

  const onSubmit = form.handleSubmit((values) => mutate(values));

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="모달 닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl rounded-2xl shadow-xl border border-gray-100 bg-white p-4"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">비밀번호 변경</h3>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
            aria-label="닫기"
            onClick={handleClose}
          >
            <X />
          </button>
        </div>
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              현재 비밀번호
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              {...form.register("currentPassword")}
              disabled={isPending}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">새 비밀번호</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              {...form.register("newPassword")}
              disabled={isPending}
            />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">새 비밀번호 확인</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              {...form.register("newPasswordConfirm")}
              disabled={isPending}
            />
            {form.formState.errors.newPasswordConfirm && (
              <p className="text-sm text-red-500">
                {form.formState.errors.newPasswordConfirm.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={handleClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "변경중.. " : "변경하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
