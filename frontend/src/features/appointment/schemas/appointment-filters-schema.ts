import { z } from "zod";

export const appointmentFiltersSchema = z.object({
  // Lọc theo quầy (counter): nhập tên quầy
  search: z.string().max(80),
  preferredDate: z.string(),
});

export type AppointmentFiltersFormValues = z.infer<
  typeof appointmentFiltersSchema
>;
