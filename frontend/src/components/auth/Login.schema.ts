import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요." })
    .email({ message: "올바른 이메일 형식이 아닙니다." }),

  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
