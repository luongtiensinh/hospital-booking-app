import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, TextInput } from "@mantine/core";
import { CalendarSearch, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  appointmentFiltersSchema,
  type AppointmentFiltersFormValues,
} from "@/features/appointment/schemas/appointment-filters-schema";
import type { AppointmentFilterValues } from "@/features/appointment/types/appointment.types";

type AppointmentFiltersFormProps = {
  defaultValues: AppointmentFilterValues;
  onSubmit: (values: AppointmentFilterValues) => void;
};

export function AppointmentFiltersForm({ defaultValues, onSubmit }: AppointmentFiltersFormProps) {
  const form = useForm<AppointmentFiltersFormValues>({
    resolver: zodResolver(appointmentFiltersSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <Group gap="sm" align="flex-end" wrap="wrap">
        <TextInput
          id="search"
          label="Tên bác sĩ hoặc chuyên khoa"
          placeholder="Tim mạch, nội tổng quát..."
          size="sm"
          radius="md"
          leftSection={<Search size={14} />}
          style={{ flex: "2 1 200px" }}
          {...form.register("search")}
        />

        <TextInput
          id="specialty"
          label="Chuyên khoa ưu tiên"
          placeholder="Nhập tên chuyên khoa"
          size="sm"
          radius="md"
          style={{ flex: "1 1 160px" }}
          {...form.register("specialty")}
        />

        <TextInput
          id="preferredDate"
          label="Ngày mong muốn"
          type="date"
          size="sm"
          radius="md"
          leftSection={<CalendarSearch size={14} />}
          style={{ flex: "1 1 160px" }}
          {...form.register("preferredDate")}
        />

        <Button size="sm" radius="md" type="submit" style={{ flexShrink: 0 }}>
          Lọc
        </Button>
      </Group>
    </form>
  );
}
