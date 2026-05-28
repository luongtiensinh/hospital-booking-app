import { Avatar, Badge, Button, Card, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { CalendarDays, Clock3, Hospital, Stethoscope } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { DoctorAvailability } from "@/features/doctor/types/doctor.types";

type DoctorAvailabilityCardProps = {
  doctor: DoctorAvailability;
  isSelected: boolean;
  onSelect: (doctor: DoctorAvailability) => void;
};

export function DoctorAvailabilityCard({ doctor, isSelected, onSelect }: DoctorAvailabilityCardProps) {
  const safeName = (doctor.fullName || "Bác sĩ").trim();
  const initials = safeName.slice(0, 2).toUpperCase() || "BS";

  return (
    <Card
      radius="lg"
      withBorder
      style={{
        borderColor: isSelected ? "var(--mantine-color-blue-5)" : "var(--mantine-color-gray-2)",
        boxShadow: isSelected ? "0 0 0 3px var(--mantine-color-blue-1)" : undefined,
        transition: "all 0.15s ease",
      }}
    >
      <Stack gap="sm">
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Avatar
            src={doctor.avatarUrl ?? undefined}
            alt={safeName}
            size="md"
            radius="md"
            color="blue"
          >
            {initials}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Text fw={700} size="sm" c="dark.8" truncate>{safeName}</Text>
            <Text size="xs" c="dimmed">{doctor.specialty}</Text>
            <Group gap={4} mt={4}>
              <Badge size="xs" color="blue" variant="light">
                {doctor.yearsOfExperience ?? 0}+ năm KN
              </Badge>
              <Badge size="xs" color="green" variant="light">Khả dụng</Badge>
            </Group>
          </div>
        </Group>

        {doctor.bio && (
          <Paper p="xs" radius="md" style={{ background: "var(--mantine-color-gray-0)" }}>
            <Group gap={6} mb={4}>
              <ThemeIcon size="xs" color="blue" variant="light" radius="sm">
                <Stethoscope size={10} />
              </ThemeIcon>
              <Text size="xs" fw={600} c="dimmed">Giới thiệu</Text>
            </Group>
            <Text size="xs" c="dimmed" lh={1.5} lineClamp={2}>{doctor.bio}</Text>
          </Paper>
        )}

        <Group gap="xs" grow>
          <Paper p="xs" radius="md" style={{ background: "var(--mantine-color-gray-0)" }}>
            <Group gap={5} mb={2}>
              <Hospital size={11} color="var(--mantine-color-gray-6)" />
              <Text size="xs" fw={600} c="dimmed">Cơ sở</Text>
            </Group>
            <Text size="xs" c="dark.6" truncate>{doctor.clinicName}</Text>
          </Paper>

          <Paper p="xs" radius="md" style={{ background: "var(--mantine-color-gray-0)" }}>
            <Group gap={5} mb={2}>
              <Clock3 size={11} color="var(--mantine-color-gray-6)" />
              <Text size="xs" fw={600} c="dimmed">Slot gần nhất</Text>
            </Group>
            <Text size="xs" c="dark.6">
              {doctor.nextAvailableAt ? formatDateTime(doctor.nextAvailableAt) : "Đang cập nhật"}
            </Text>
          </Paper>
        </Group>

        <Button
          fullWidth
          size="sm"
          radius="md"
          variant={isSelected ? "filled" : "light"}
          color="blue"
          leftSection={<CalendarDays size={14} />}
          onClick={() => onSelect(doctor)}
          type="button"
        >
          {isSelected ? "Đang được chọn" : "Chọn bác sĩ này"}
        </Button>
      </Stack>
    </Card>
  );
}
