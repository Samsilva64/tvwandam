import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center">
      <Image
        src="/brand/tvwandam-logo.png"
        alt="TV Wandam"
        width={761}
        height={617}
        priority
        className="h-14 w-auto object-contain sm:h-16"
        sizes="(max-width: 640px) 120px, 150px"
      />
    </Link>
  );
}
