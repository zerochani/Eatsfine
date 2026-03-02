import z from "zod";

export const BusinessAuthSchema = z.object({
  name: z
    .string()
    .min(1, "대표자명을 입력해주세요.")
    .min(2, "2자 이상이어야 합니다.")
    .max(20, "20자 이하이어야 합니다."),
  businessNumber: z
    .string()
    .regex(/^[0-9]+$/, "숫자만 입력해주세요.")
    .length(10, "1234567890 형식의 10자리 숫자를 입력해주세요."),
  startDate: z
    .string()
    .regex(/^[0-9]+$/, "숫자만 입력해주세요.")
    .length(8, "YYYYMMDD 형식의 8자리 숫자를 입력해주세요.")
    .refine(
      (val) => {
        const year = parseInt(val.substring(0, 4));
        const month = parseInt(val.substring(4, 6));
        const day = parseInt(val.substring(6, 8));

        if (month < 1 || month > 12) return false;

        const date = new Date(year, month - 1, day);

        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return false;
        }

        if (date > new Date()) return false;

        return true;
      },
      { message: "유효하지 않은 날짜입니다. (예: 20240101)" },
    ),
});

export type BusinessAuthFormValues = z.infer<typeof BusinessAuthSchema>;
