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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "./Signup.schema";
import { useEffect } from "react";
import { phoneNumber } from "@/utils/phoneNumber";
import { useEmailSignup } from "@/hooks/queries/useAuth";
import { getErrorMessage } from "@/utils/error";

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const defaultValues: SignupFormValues = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  passwordConfirm: "",
  tosConsent: false,
  privacyConsent: false,
  marketingConsent: false,
};

export function SignupDialog({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupDialogProps) {
  const signupMutation = useEmailSignup();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues,
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  const handleSocialLogin = (provider: "google" | "kakao") => {
    const backendUrl = import.meta.env.VITE_API_URL;
    if (!backendUrl) {
      return alert("서버 URL이 설정되어 있지 않습니다. 관리자에게 문의하세요.");
    }
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  };

  const onSubmit = (formData: SignupFormValues) => {
    signupMutation.mutate(formData, {
      onSuccess: () => {
        alert("가입 완료되었습니다.");
        onSwitchToLogin();
      },
      onError: (error) => {
        alert(getErrorMessage(error));
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            회원가입
          </DialogTitle>
          <DialogDescription className="sr-only">
            이메일과 소셜 계정으로 회원가입을 할 수 있는 폼
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-4 py-4">
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
              구글로 가입하기
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
              카카오톡으로 가입하기
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              또는
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">이름</Label>
              <Input
                id="signup-name"
                placeholder="이름을 입력하세요"
                className="h-12"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">이메일</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="example@email.com"
                className="h-12"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-phone">휴대폰 번호</Label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="signup-phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    className="h-12"
                    onChange={(e) => {
                      const formatted = phoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                )}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">비밀번호</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="8자 이상 입력하세요"
                className="h-12"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                className="h-12"
                {...register("passwordConfirm")}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-red-500">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="tosConsent"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="terms"
                      className="cursor-pointer"
                    />
                  )}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  <span className="text-red-500">*</span> 이용약관에 동의합니다
                </Label>
              </div>
              {errors.tosConsent && (
                <p className="text-sm text-red-500 pl-9">
                  {errors.tosConsent.message}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="privacyConsent"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="privacy"
                      className="cursor-pointer"
                    />
                  )}
                />
                <Label htmlFor="privacy" className="text-sm cursor-pointer">
                  <span className="text-red-500">*</span> 개인정보 처리방침에
                  동의합니다
                </Label>
              </div>
              {errors.privacyConsent && (
                <p className="text-sm text-red-500 pl-9">
                  {errors.privacyConsent.message}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="marketingConsent"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="marketing"
                      className="cursor-pointer"
                    />
                  )}
                />
                <Label htmlFor="marketing" className="text-sm cursor-pointer">
                  마케팅 정보 수신에 동의합니다 (선택)
                </Label>
              </div>
            </div>
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {signupMutation.isPending ? "가입 중..." : "가입하기"}
            </Button>
          </form>

          <Separator />
          <div className="text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:bg-gray-200 rounded-sm transition-colors cursor-pointer font-bold"
            >
              로그인
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
