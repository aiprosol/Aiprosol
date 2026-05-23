import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_LINKS } from '@/lib/site-config';
import { NewsletterSignup } from './NewsletterSignup';

export function Footer() {
  return (
    <footer className="bg-bg-deep border-t border-border mt-20 pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 pb-12 border-b border-border">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Aiprosol"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="font-display font-extrabold text-xl">
              Aip<span className="text-cyan">rosol</span>
            </div>
          </Link>
          <p className="text-muted text-sm leading-relaxed mb-3 max-w-sm">
            Global AI automation consultancy. We design, build, and run the automations that reclaim 35+ hours a week.
          </p>
          <p className="text-xs text-muted/70 mb-5">
            Founder &amp; Chairman: Srijan Paudel
            <br />
            AI CEO: Arora
          </p>
          <NewsletterSignup />
        </div>

        {FOOTER_LINKS.map(col => (
          <div key={col.title}>
            <h4 className="font-display font-bold text-xs text-cyan tracking-[0.12em] uppercase mb-4">
              {col.title}
            </h4>
            <div className="flex flex-col gap-3">
              {col.links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-cyan transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-[1280px] mx-auto pt-8 flex flex-col md:flex-row md:justify-between gap-3 text-xs text-muted">
        <span>© {new Date().getFullYear()} Aiprosol Ltd · Registered in England &amp; Wales · USD everywhere.</span>
        <span>Built by AI. Run by AI. Audited by humans.</span>
      </div>
    </footer>
  );
}
