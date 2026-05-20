import { z } from "zod";

export const appointmentBookingSchema = z.object({
  doctorId: z.string().min(1, "Vui long chon bac si."),
  appointmentDate: z.string().min(1, "Vui long chon ngay kham."),
  slotId: z.string().min(1, "Vui long chon gio kham."),
});

export type AppointmentBookingSchemaValues = z.infer<
  typeof appointmentBookingSchema
>;
