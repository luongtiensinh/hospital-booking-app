import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự).")
      .max(80, "Họ tên quá dài."),
    phoneNumber: z
      .string()
      .min(1, "Số điện thoại không được để trống.")
      .regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ (9–11 chữ số)."),
    cccd: z
      .string()
      .min(1, "Số CCCD không được để trống.")
      .regex(/^[0-9]{12}$/, "Số CCCD phải đúng 12 chữ số."),
    password: z
      .string()
      .min(8, "Mật khẩu cần tối thiểu 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu cần chứa ít nhất 1 chữ in hoa.")
      .regex(/[0-9]/, "Mật khẩu cần chứa ít nhất 1 chữ số."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận chưa khớp.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
