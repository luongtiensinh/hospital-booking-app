export function LogoMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
      <span className="relative block h-5 w-5">
        <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-white" />
        <span className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white" />
      </span>
    </div>
  );
}
