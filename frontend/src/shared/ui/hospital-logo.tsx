import type { CSSProperties } from "react";

import { HOSPITAL_LOGO_URL } from "@/shared/constants/branding";

type HospitalLogoProps = {
  height: number;
  alt?: string;
  className?: string;
  imageClassName?: string;
  containerStyle?: CSSProperties;
  imageStyle?: CSSProperties;
};

export function HospitalLogo({
  height,
  alt = "Logo Bệnh viện Ung bướu Đà Nẵng",
  className,
  imageClassName,
  containerStyle,
  imageStyle,
}: HospitalLogoProps) {
  const padding = Math.max(4, Math.round(height * 0.18));
  const radius = Math.max(10, Math.round(height * 0.3));

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding,
        borderRadius: radius,
        background: "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
        border: "1px solid rgba(215, 228, 240, 0.95)",
        boxShadow: "0 10px 24px -18px rgba(15, 111, 236, 0.45)",
        ...containerStyle,
      }}
    >
      <img
        src={HOSPITAL_LOGO_URL}
        alt={alt}
        className={imageClassName}
        style={{
          display: "block",
          height,
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
          ...imageStyle,
        }}
      />
    </span>
  );
}
