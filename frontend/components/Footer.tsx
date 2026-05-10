import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.7)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-4">
            <Logo />
          </div>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Ao serviço da comunidade guineense, com música, cultura, informação útil e histórias de quem vive a Guiné-Bissau dentro e fora do país.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <Link href="/noticias" className="hover:text-[var(--foreground)]">
            Notícias
          </Link>
          <Link href="/parceiros" className="hover:text-[var(--foreground)]">
            Publicidade
          </Link>
        </div>
      </div>
      <div className="border-t border-[rgba(255,255,255,0.08)] px-4 py-4 text-center text-xs leading-relaxed text-[var(--muted)] sm:px-6">
        © {new Date().getFullYear()} TV WANDAM. Todos os direitos reservados. Conteúdos, imagens, vídeos, marca e identidade pertencem aos seus respetivos titulares; reprodução ou uso comercial apenas com autorização.
      </div>
    </footer>
  );
}
