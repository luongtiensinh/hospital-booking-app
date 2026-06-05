import type { LucideIcon } from "lucide-react";

import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  QrCode,
  Users,
} from "lucide-react";

import type { UserRole } from "@/features/auth/types/auth.types";
import { APP_ROUTES } from "./routes";

export type NavigationItem = {
  title: string;
  /** Tiêu đề ngắn dùng cho bottom nav mobile (compact mode) */
  shortTitle: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  /** Các role được phép thấy item này. Nếu không khai báo → tất cả role đều thấy. */
  roles?: readonly UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Tổng quan",
    shortTitle: "Tổng quan",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
    // Tất cả role đều thấy Dashboard
  },
  {
    title: "Lịch khám",
    shortTitle: "Lịch khám",
    href: APP_ROUTES.appointments,
    icon: CalendarDays,
    roles: ["patient"],
  },
  {
    title: "Lịch sử khám",
    shortTitle: "Lịch sử",
    href: APP_ROUTES.appointmentHistory,
    icon: CalendarDays,
    roles: ["patient"],
  },
  {
    title: "Quản lý lịch hẹn",
    shortTitle: "Quản lý",
    href: APP_ROUTES.appointmentHistory,
    icon: Users,
    roles: ["admin"],
  },
  {
    // Patient: xem mã QR của bản thân
    title: "Mã QR của tôi",
    shortTitle: "Mã QR",
    href: APP_ROUTES.qr,
    icon: QrCode,
    roles: ["patient"],
  },
  {
    // Staff: quét QR bệnh nhân check-in
    title: "Quét QR bệnh nhân",
    shortTitle: "Quét QR",
    href: APP_ROUTES.qr,
    icon: QrCode,
    roles: ["doctor", "admin"],
  },
  {
    title: "Kết quả khám bệnh",
    shortTitle: "Kết quả",
    href: APP_ROUTES.results,
    icon: FileText,
    // Tất cả role (nội dung thay đổi theo role)
  },
];
