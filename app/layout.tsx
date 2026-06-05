import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Attribution — Home Services Reporting",
  description:
    "Client-facing attribution portal aggregating leads across Google, Facebook, GoHighLevel and Website into one report.",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b border-edge/70 bg-ink/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/20 text-brand ring-1 ring-brand/40">
                <span className="text-base font-bold">◑</span>
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Attribution Portal</div>
                <div className="text-[11px] text-muted">Summit Home Services · Client view</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/leads">Leads</NavLink>
              <a
                href="/api/leads"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                API
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4 text-xs text-muted">
          Demo data is seeded HVAC/plumbing sample leads. Source connectors are mocked
          through a typed adapter layer — a live Google Ads, Facebook, or GoHighLevel API
          drops in without UI changes.
        </footer>
      </body>
    </html>
  );
}
