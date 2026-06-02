import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, TextInput } from "@mantine/core";
import { CalendarSearch, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  appointmentFiltersSchema,
  type AppointmentFiltersFormValues,
} from "@/features/appointment/schemas/appointment-filters-schema";


type AppointmentFiltersFormProps = {
  defaultValues: AppointmentFiltersFormValues;
  onSubmit: (values: AppointmentFiltersFormValues) => void;
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
          label="Tên quầy tiếp nhận"
          placeholder="Ví dụ: Quầy tổng quát..."
          size="sm"
          radius="md"
          leftSection={<Search size={14} />}
          style={{ flex: "2 1 200px" }}
          {...form.register("search")}
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
