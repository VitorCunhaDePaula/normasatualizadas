const links = [
  { label: "Suporte técnico", href: "https://hogrefe.com.br/suporte-tecnico" },
  {
    label: "Políticas de privacidade",
    href: "https://hogrefe.com.br/politica-privacidade",
  },
  {
    label: "Termos e condições de uso",
    href: "https://hogrefe.com.br/termos-uso",
  },
];

export default function InternalFooter() {
  return (
    <footer className="bg-(--app-foot)">
      <ul className="flex flex-wrap justify-around gap-x-3 gap-y-1 px-4 py-4 pl-6 font-akkurat-regular text-sm text-white sm:py-6">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex font-akkurat-regular min-h-11 items-center hover:underline"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
