import Image from "next/image";
import { cn, gradientFor, initials } from "@/lib/utils";

export function ProductLogo({
  name,
  logoUrl,
  size = 56,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn("rounded-xl object-cover bg-white", className)}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shrink-0",
        gradientFor(name),
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
