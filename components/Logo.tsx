import Image from "next/image";

// O logo.webp é preto; no card escuro do login ele é invertido para branco.
export default function Logo() {
  return (
    <Image
      src="/logo.webp"
      alt="Hogrefe"
      width={282}
      height={68}
      priority
      className="mx-auto h-9 w-auto brightness-0 invert sm:h-10"
    />
  );
}
