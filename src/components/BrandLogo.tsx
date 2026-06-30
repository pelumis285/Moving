import Image from "next/image";
import { site } from "@/lib/site";

type BrandLogoProps = {
  priority?: boolean;
  variant?: "default" | "footer";
};

export default function BrandLogo({ priority = false, variant = "default" }: BrandLogoProps) {
  const image = (
    <Image
      src="/logo-surftmove-red.png"
      alt={`${site.name} logo`}
      width={906}
      height={276}
      priority={priority}
      className={variant === "footer" ? "h-auto w-[180px] sm:w-[220px]" : "h-auto w-[145px] sm:w-[175px]"}
    />
  );

  return image;
}
