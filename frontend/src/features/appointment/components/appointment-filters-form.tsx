import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarSearch, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  appointmentFiltersSchema,
  type AppointmentFiltersFormValues,
} from "@/features/appointment/schemas/appointment-filters-schema";
import type { AppointmentFilterValues } from "@/features/appointment/types/appointment.types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type AppointmentFiltersFormProps = {
  defaultValues: AppointmentFilterValues;
  onSubmit: (values: AppointmentFilterValues) => void;
};

export function AppointmentFiltersForm({
  defaultValues,
  onSubmit,
}: AppointmentFiltersFormProps) {
  const form = useForm<AppointmentFiltersFormValues>({
    resolver: zodResolver(appointmentFiltersSchema),
    defaultValues,
  });

  return (
    <form
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_auto]"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="space-y-2">
        <Label htmlFor="search">Ten bac si hoac chuyen khoa</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            className="pl-11"
            placeholder="Tim mach, noi tong quat..."
            {...form.register("search")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDate">Ngay mong muon</Label>
        <div className="relative">
          <CalendarSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="preferredDate"
            className="pl-11"
            type="date"
            {...form.register("preferredDate")}
          />
        </div>
      </div>

      <div className="space-y-2 md:col-span-2 xl:col-span-1">
        <Label htmlFor="specialty">Chuyen khoa uu tien</Label>
        <Input
          id="specialty"
          placeholder="Nhap ten chuyen khoa"
          {...form.register("specialty")}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-3">
        <Button size="lg" type="submit">
          Loc du lieu dat lich
        </Button>
      </div>
    </form>
  );
}
