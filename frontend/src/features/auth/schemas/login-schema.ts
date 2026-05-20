import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Vui lòng nhập email hợp lệ."),
  password: z
    .string()
    .min(8, "Mật khẩu cần tối thiểu 8 ký tự.")
    .max(64, "Mật khẩu quá dài."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
