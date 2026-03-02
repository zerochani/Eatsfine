import z from "zod";

export const supportSchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력하세요.")
    .max(20, "20자 이내여야 합니다."),

  email: z
    .string()
    .min(1, { message: "이메일을 입력하세요." })
    .email({ message: "올바른 이메일 형식이 아닙니다." })
    .max(50, "50자 이내여야 합니다."),

  type: z.enum([
    "RESERVATION",
    "PAYMENT_REFUND",
    "RESTAURANT_REGISTRATION",
    "REVIEW",
    "TECH_SUPPORT",
    "ETC",
  ]),
  title: z
    .string()
    .min(1, { message: "제목을 입력하세요." })
    .max(100, "100자 이내여야 합니다."),
  content: z
    .string()
    .min(1, { message: "문의하실 내용을 자세히 입력하세요." })
    .max(2000, "2000자 이내여야 합니다."),
});

export type SupportFormValues = z.infer<typeof supportSchema>;

export interface ResponseInquiryDTO {
  id: number;
  createdAt: string;
}
