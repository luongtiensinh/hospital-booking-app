import type { PropsWithChildren } from "react";

import { Activity, HeartPulse, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "@/shared/constants/routes";
import { LogoMark } from "@/app/layouts/logo-mark";

type AuthShellProps = PropsWithChildren<{
  heading: string;
  description: string;
  footerText: string;
  footerActionLabel: string;
  footerActionHref: string;
}>;

export function AuthShell({
  heading,
  description,
  footerText,
  footerActionLabel,
  footerActionHref,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-[linear-gradient(160deg,#0f6fec,#0a4fb7)] p-10 text-white lg:flex">
        <div className="mx-auto flex w-full max-w-xl flex-col justify-between">
          <div className="space-y-6">
            <LogoMark />
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                Digital Healthcare Platform
              </span>
              <h1 className="max-w-lg text-4xl font-semibold leading-tight">
                Nền tảng đặt lịch khám và quản trị hồ sơ y tế cho trải nghiệm
                bệnh nhân hiện đại.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/80">
                Thiết kế theo medical dashboard style, tối ưu mobile-first và đủ
                không gian để mở rộng sang QR check-in, kết quả xét nghiệm, hóa
                đơn và phân quyền nhiều vai trò.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: HeartPulse,
                title: "Patient-centered UX",
                description: "Luồng đặt lịch, theo dõi lịch và xem kết quả được tối ưu cho di động.",
              },
              {
                icon: ShieldCheck,
                title: "Role-based access ready",
                description: "Sẵn sàng mở rộng cho bệnh nhân, bác sĩ và quản trị viên.",
              },
              {
                icon: Activity,
                title: "Production-ready architecture",
                description: "Feature-based, service layer rõ ràng và dễ bảo trì dài hạn.",
              },
            ].map(({ icon: Icon, title, description: itemDescription }) => (
              <div
                key={title}
                className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {itemDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              className="inline-flex items-center gap-3 text-sm font-semibold text-foreground"
              to={APP_ROUTES.login}
            >
              <LogoMark />
              <span>
                MedCare
                <span className="block text-xs font-normal text-muted-foreground">
                  Healthcare Dashboard
                </span>
              </span>
            </Link>
          </div>

          <div className="surface-panel space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">{heading}</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link
              className="font-semibold text-primary transition-colors hover:text-primary/80"
              to={footerActionHref}
            >
              {footerActionLabel}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
