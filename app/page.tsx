import Link from 'next/link';

const cards = [
  {
    title: 'Sing',
    subtitle: 'Record vocal takes and run AI voice polish.',
    href: '/studio?mode=sing',
    icon: '🎤'
  },
  {
    title: 'Play',
    subtitle: 'Open instrument mode and sketch ideas quickly.',
    href: '/studio?mode=play',
    icon: '🎹'
  },
  {
    title: 'Generate',
    subtitle: 'Describe your song and build a first draft.',
    href: '/studio?mode=sing',
    icon: '🤖'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#070f20] to-[#030711] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-14 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-wide text-blue-200">Ether<span className="font-normal text-slate-200">Studio</span></div>
          <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">MVP</span>
        </header>

        <section className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">AI music production, streamlined.</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">Record vocals, arrange timeline clips, and apply AI-assisted improvements in a clean studio workflow.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:scale-[1.03] hover:border-blue-500/60"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-lg text-cyan-300">{card.icon}</div>
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{card.subtitle}</p>
            </Link>
          ))}
        </section>

        <div className="mt-10 text-center">
          <Link href="/studio?mode=sing" className="inline-flex rounded-full bg-gradient-to-r from-blue-500 to-blue-300 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
