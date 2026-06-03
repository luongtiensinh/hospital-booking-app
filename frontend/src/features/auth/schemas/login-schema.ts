import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại hoặc số CCCD.")
    .refine(
      (val) => /^[0-9]{9,11}$/.test(val.trim()) || /^[0-9]{12}$/.test(val.trim()),
      "SĐT phải từ 9–11 số, hoặc CCCD phải đúng 12 số.",
    ),
  password: z
    .string()
    .min(8, "Mật khẩu cần tối thiểu 8 ký tự.")
    .max(64, "Mật khẩu quá dài."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
