import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { type LoginFormValues, loginSchema } from "./Login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmailLogin } from "@/hooks/queries/useAuth";
import { getErrorMessage } from "@/utils/error";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export function LoginDialog({
  isOpen,
  onClose,
  onSwitchToSignup,
}: LoginDialogProps) {
  const emailLoginMutation = useEmailLogin();

  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSocialLogin = (provider: "google" | "kakao") => {
    const backendUrl = import.meta.env.VITE_API_URL;
    if (!backendUrl) {
      return alert("서버 URL이 설정되어 있지 않습니다. 관리자에게 문의하세요.");
    }
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  };

  const handleEmailLogin = (data: LoginFormValues) => {
    emailLoginMutation.mutate(data, {
      onSuccess: () => onClose(),
      onError: (error) => {
        alert(getErrorMessage(error));
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            잇츠파인에 오신 것을 환영합니다
          </DialogTitle>
          {/* 스크린 리더용 설명(경고 방지) */}
          <DialogDescription className="sr-only">
            이메일과 소셜 계정으로 로그인을 할 수 있는 폼
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showEmailLogin ? (
            <>
              {/* 소셜 로그인 버튼 */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base cursor-pointer"
                  onClick={() => handleSocialLogin("google")}
                >
                  <img
                    src="/icons/google.svg"
                    alt="Google Logo"
                    className="w-5 h-5 mr-3"
                  />
                  구글로 계속하기
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base bg-[#FEE500] hover:bg-[#E6CF00] border-0 cursor-pointer text-black"
                  onClick={() => handleSocialLogin("kakao")}
                >
                  <img
                    src="/icons/kakao.svg"
                    alt="Kakao Logo"
                    className="w-5 h-5 mr-3"
                  />
                  카카오톡으로 계속하기
                </Button>
              </div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                  또는
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base cursor-pointer"
                onClick={() => setShowEmailLogin(true)}
              >
                이메일로 계속하기
              </Button>
            </>
          ) : (
            <>
              <form
                onSubmit={handleSubmit(handleEmailLogin)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="h-12"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    className="h-12"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={emailLoginMutation.isPending}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {emailLoginMutation.isPending ? "로그인 중..." : "로그인"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 cursor-pointer"
                  onClick={() => setShowEmailLogin(false)}
                >
                  다른 방법으로 로그인
                </Button>
              </form>
            </>
          )}

          <Separator />

          <div className="text-center text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <button
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:bg-gray-200 rounded-sm transition-colors cursor-pointer font-bold"
            >
              회원가입
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
