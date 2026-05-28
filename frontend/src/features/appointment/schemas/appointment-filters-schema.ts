import { z } from "zod";

export const appointmentFiltersSchema = z.object({
  search: z.string().max(80),
  specialty: z.string().max(80),
  preferredDate: z.string(),
});

export type AppointmentFiltersFormValues = z.infer<
  typeof appointmentFiltersSchema
>;
