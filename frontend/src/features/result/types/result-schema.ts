import { z } from "zod";

export const resultSchema = z.object({
    diagnosis: z.string().min(5, "Chẩn đoán phải ít nhất 5 ký tự"),
    conclusion: z.string().min(5, "Kết luận bác sĩ là bắt buộc"),
    indicators: z.array(
        z.object({
            label: z.string().min(1, "Tên chỉ số không được để trống"),
            value: z.string().min(1, "Giá trị không được để trống"),
            unit: z.string().optional(),
        })
    ).min(1, "Cần ít nhất một chỉ số y tế"),
});

export type ResultFormValues = z.infer<typeof resultSchema>;