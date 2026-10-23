import Image from "next/image";

// O logo.webp é preto; o card do login é branco, então ele é usado sem filtro.
export default function Logo() {
  return (
    <Image
      src="/logo.webp"
      alt="Hogrefe"
      width={282}
      height={68}
      priority
      className="mx-auto h-9 w-auto sm:h-10"
    />
  );
}
