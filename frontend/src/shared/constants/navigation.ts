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
  description: string;
  href: string;
  icon: LucideIcon;
  /** Các role được phép thấy item này. Nếu không khai báo → tất cả role đều thấy. */
  roles?: readonly UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Tổng quan",
    shortTitle: "Tổng quan",
    description: "Dashboard theo vai trò",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
    // Tất cả role đều thấy Dashboard
  },
  {
    title: "Lịch khám",
    shortTitle: "Lịch khám",
    description: "Đặt lịch và theo dõi lịch hẹn",
    href: APP_ROUTES.appointments,
    icon: CalendarDays,
    roles: ["patient"],
  },
  {
    title: "Lịch sử khám",
    shortTitle: "Lịch sử",
    description: "Tra cứu lịch sử đặt lịch",
    href: APP_ROUTES.appointmentHistory,
    icon: CalendarDays,
    roles: ["patient"],
  },
  {
    title: "Quản lý lịch hẹn",
    shortTitle: "Quản lý",
    description: "Xem & quản lý lịch hẹn hệ thống",
    href: APP_ROUTES.appointmentHistory,
    icon: Users,
    roles: ["admin"],
  },
  {
    // Patient: xem mã QR của bản thân
    title: "Mã QR của tôi",
    shortTitle: "Mã QR",
    description: "QR check-in lịch khám gần nhất",
    href: APP_ROUTES.qr,
    icon: QrCode,
    roles: ["patient"],
  },
  {
    // Staff: quét QR bệnh nhân check-in
    title: "Quét QR bệnh nhân",
    shortTitle: "Quét QR",
    description: "Scan QR check-in, xác nhận lịch hẹn",
    href: APP_ROUTES.qr,
    icon: QrCode,
    roles: ["doctor", "admin"],
  },
  {
    title: "Kết quả xét nghiệm",
    shortTitle: "Kết quả",
    description: "Xem hoặc nhập kết quả khám bệnh",
    href: APP_ROUTES.results,
    icon: FileText,
    // Tất cả role (nội dung thay đổi theo role)
  },
];
