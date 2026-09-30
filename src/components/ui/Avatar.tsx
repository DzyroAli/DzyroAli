import Image from "next/image";
import { avatarTone, cn, initials } from "@/lib/utils";

/**
 * Person avatar: the profile picture when there is one, otherwise initials on a
 * deterministic tint drawn from the blue token set.
 */
export function Avatar({
  name,
  username,
  src,
  size = 40,
  className,
}: {
  name: string;
  username?: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full bg-surface-muted object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        avatarTone(username ?? name),
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
