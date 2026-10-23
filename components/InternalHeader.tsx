import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { requireSession } from "@/lib/session";

export default async function InternalHeader() {
  const session = await requireSession();
  const name = session.user.name ?? "Usuário";

  return (
    <header className="border-b border-(--app-line) bg-(--app-card)">
      <div className="mx-auto flex min-h-[66px] w-full max-w-[1400px] flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 pr-3 pl-5 sm:pr-6 sm:pl-8">
        <a
          href="https://hogrefe.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hogrefe — abrir o site"
          className="inline-flex min-h-11 items-center"
        >
          <Image
            src="/logo.webp"
            alt="Hogrefe"
            width={282}
            height={68}
            priority
            className="hidden h-9 w-auto sm:block"
          />
          <Image
            src="/icon.webp"
            alt="Hogrefe"
            width={118}
            height={123}
            priority
            className="h-9 w-auto sm:hidden"
          />
        </a>
        <UserMenu name={name} />
      </div>
    </header>
  );
}
