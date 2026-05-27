import { cn } from "@/lib/cn";

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
};

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary font-semibold text-secondary-foreground",
        className,
      )}
    >
      {src ? (
        <img
          alt={alt}
          className="h-full w-full rounded-2xl object-cover"
          src={src}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
