import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Vui lòng nhập họ tên.")
      .max(80, "Họ tên quá dài."),
    email: z.email("Vui lòng nhập email hợp lệ."),
    phoneNumber: z
      .string()
      .min(10, "Số điện thoại cần tối thiểu 10 số.")
      .max(15, "Số điện thoại không hợp lệ."),
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
