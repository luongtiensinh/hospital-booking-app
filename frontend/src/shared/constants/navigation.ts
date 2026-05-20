import type { LucideIcon } from "lucide-react";

import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  QrCode,
  ReceiptText,
} from "lucide-react";

import { APP_ROUTES } from "./routes";

export type NavigationItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Tong quan",
    description: "Dashboard benh nhan",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Lich kham",
    description: "Dat lich va theo doi lich hen",
    href: APP_ROUTES.appointments,
    icon: CalendarDays,
  },
  {
    title: "QR Check-in",
    description: "QR gan nhat va trang scan camera",
    href: APP_ROUTES.qr,
    icon: QrCode,
  },
  {
    title: "Ket qua",
    description: "Xem xet nghiem va ho so kham",
    href: APP_ROUTES.results,
    icon: FileText,
  },
  {
    title: "Hoa don",
    description: "Chi phi va PDF hoa don",
    href: APP_ROUTES.invoices,
    icon: ReceiptText,
  },
];
