import { z } from "zod";

export const MenuCategoryEnum = z.enum(["MAIN", "SIDE", "BEVERAGE", "ALCOHOL"]);

const MAX_FILE_SIZE = 1 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export const MenuSchema = z.object({
  menus: z.array(
    z.object({
      name: z.string().min(1, "메뉴명을 입력하세요."),
      description: z.string().max(500, "500자 이내로 입력하세요.").optional(),
      price: z
        .string()
        .min(1, "가격을 입력하세요.")
        .regex(/^(0|[1-9]\d*)$/, "0 이상의 올바른 숫자를 입력하세요."),
      category: MenuCategoryEnum,
      imageKey: z
        .any()
        .optional()
        .refine(
          (file) => {
            if (!file || typeof file === "string") return true;
            return file instanceof File ? file.size <= MAX_FILE_SIZE : true;
          },
          {
            message: "이미지 크기는 1MB 이하여야 합니다.",
          },
        )
        .refine(
          (file) => {
            if (!file || typeof file === "string") return true;
            return file instanceof File
              ? ACCEPTED_IMAGE_TYPES.includes(file.type)
              : true;
          },
          {
            message: ".jpg, .png 형식의 이미지만 업로드 가능합니다.",
          },
        ),
    }),
  ),
});

export type MenuFormValues = z.infer<typeof MenuSchema>;
