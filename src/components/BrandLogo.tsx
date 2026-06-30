import Image from "next/image";
import { site } from "@/lib/site";

type BrandLogoProps = {
  priority?: boolean;
  variant?: "default" | "footer";
};

export default function BrandLogo({ priority = false, variant = "default" }: BrandLogoProps) {
  const image = (
    <Image
      src="/logo-surftmove.png"
      alt={`${site.name} logo`}
      width={1263}
      height={848}
      priority={priority}
      className={variant === "footer" ? "h-auto w-[170px] sm:w-[210px]" : "h-auto w-[155px] sm:w-[185px]"}
    />
  );

  if (variant === "footer") {
    return <span className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm">{image}</span>;
  }

  return image;
}
