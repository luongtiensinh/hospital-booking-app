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
    title: "Tổng quan",
    description: "Dashboard bệnh nhân",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Lịch khám",
    description: "Đặt lịch và theo dõi lịch hẹn",
    href: APP_ROUTES.appointments,
    icon: CalendarDays,
  },
  {
    title: "Lịch sử khám",
    description: "Tra cứu lịch sử đặt lịch",
    href: APP_ROUTES.appointmentHistory,
    icon: CalendarDays,
  },
  {
    title: "QR Check-in",
    description: "QR gần nhất và trang scan camera",
    href: APP_ROUTES.qr,
    icon: QrCode,
  },
  {
    title: "Kết quả",
    description: "Xem xét nghiệm và hồ sơ khám",
    href: APP_ROUTES.results,
    icon: FileText,
  },
  {
    title: "Hóa đơn",
    description: "Chi phí và PDF hóa đơn",
    href: APP_ROUTES.invoices,
    icon: ReceiptText,
  },
];
