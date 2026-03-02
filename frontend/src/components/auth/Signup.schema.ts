import z from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, "이름을 입력하세요."),

    email: z
      .string()
      .min(1, { message: "이메일을 입력해주세요." })
      .email({ message: "올바른 이메일 형식이 아닙니다." }),

    phoneNumber: z
      .string()
      .min(1, { message: "휴대폰 번호를 입력해주세요." })
      .refine(
        (value) => {
          const digits = value.replace(/\D/g, "");
          return /^010\d{8}$/.test(digits);
        },
        {
          message: "휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.",
        },
      ),

    password: z
      .string()
      .min(1, { message: "비밀번호를 입력해주세요." })
      .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
      .max(20, { message: "비밀번호는 20자 이하여야 합니다." })
      .regex(/^[a-zA-Z0-9!@#$%^&*]+$/, {
        message:
          "비밀번호는 영문, 숫자, 특수문자(! @ # $ % ^ & *)만 사용 가능합니다.",
      })
      .refine(
        (value) => {
          const hasLetter = /[a-zA-Z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecial = /[!@#$%^&*]/.test(value);

          const validCount = [hasLetter, hasNumber, hasSpecial].filter(
            (v) => v,
          ).length;

          return validCount >= 2;
        },
        {
          message:
            "비밀번호는 영문, 숫자, 특수문자(! @ # $ % ^ & *) 중 최소 2가지 이상을 조합해야 합니다.",
        },
      ),

    passwordConfirm: z.string().min(1, "비밀번호를 다시 입력하세요."),

    tosConsent: z.boolean().refine((v) => v === true, {
      message: "필수 약관에 동의해주세요.",
    }),

    privacyConsent: z
      .boolean()
      .refine((v) => v === true, { message: "필수 약관에 동의해주세요." }),

    marketingConsent: z.boolean().default(false),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type SignupFormValues = z.input<typeof signupSchema>;
