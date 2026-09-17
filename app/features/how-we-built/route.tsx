export function meta() {
	return [
		{ title: "How we built — Cursor multi-agent" },
		{
			name: "description",
			content:
				"Observable multi-agent seats: Sal → Hackermans → Cursor Agent on Sapne; Titans + coder support.",
		},
	];
}

export default function HowWeBuiltRoute() {
	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 bg-background px-4 py-8 text-foreground"
		>
			<style>{`@keyframes salbotIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
			<p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
				Multi-agent orchestration · Definition of Done
			</p>
			<h1 className="animate-[salbotIn_320ms_ease-out] font-display text-display leading-none">
				Built with Cursor Agent
			</h1>
			<p className="font-body text-body leading-snug">
				Winning Cursor demos show <strong>one clear loop</strong> and{" "}
				<strong>visible seats</strong> — not feature sprawl.
			</p>
			<p className="border-2 border-frame-ink bg-[var(--tint-sky)] px-3 py-2 font-body text-body-sm font-bold text-foreground shadow-sm">
				Soft pitch (fovea / bar-loop): a confident wrong euro is a failure; a
				refusal is success. Hard gates + human sign-off beat sprawl.
			</p>

			<section className="animate-[salbotIn_360ms_ease-out] space-y-3 border-2 border-frame-ink bg-card p-4 shadow-sm">
				<h2 className="font-display text-heading-2">Parallel seats</h2>
				<ul className="space-y-2 font-body text-body-sm">
					<li className="border border-frame-ink/40 bg-background px-2 py-1.5">
						<strong>Sal</strong> — phone capture, veto, pitch video (tether
						story)
					</li>
					<li className="border border-frame-ink/40 bg-background px-2 py-1.5">
						<strong>Hackermans</strong> — ruthless scope + clock
					</li>
					<li className="border border-frame-ink/40 bg-accent px-2 py-1.5 text-accent-foreground">
						<strong>Cursor Agent (cursor)</strong> — Sapne co-drive, $50
						organizer credits, shipped <code>/salbot</code>
					</li>
					<li className="border border-frame-ink/40 bg-background px-2 py-1.5">
						<strong>Titans</strong> — TEAM-PLAN / SCORE / docs in parallel
					</li>
					<li className="border border-frame-ink/40 bg-background px-2 py-1.5">
						<strong>coder</strong> — PE: Akte isolation, StBerG, hardening
					</li>
				</ul>
			</section>

			<section className="animate-[salbotIn_400ms_ease-out] space-y-2 border-2 border-frame-ink bg-card p-4 shadow-sm">
				<h2 className="font-display text-heading-2">Handoffs</h2>
				<ol className="list-decimal space-y-1 pl-5 font-body text-body-sm">
					<li>
						Sal pastes challenge → Hackermans cuts Year File / SalBot lanes
					</li>
					<li>cursor Agent implements on Sapne (SalBot branch only)</li>
					<li>Titans write shared truth; coder PE-passes storage/safety</li>
					<li>Sal films Demo Mode one-tap loop (silent video · live VO)</li>
				</ol>
			</section>

			<section className="animate-[salbotIn_440ms_ease-out] space-y-2 border-2 border-frame-ink bg-card p-4 shadow-sm">
				<h2 className="font-display text-heading-2">Definition of Done</h2>
				<ul className="list-disc space-y-1 pl-5 font-body text-body-sm">
					<li>
						<code>/salbot</code> Demo Mode: coworking → Bahn → Netflix → Akte
					</li>
					<li>Phone film frame + live orchestration strip observable</li>
					<li>
						Tax Pulse <code>/</code> film path untouched
					</li>
					<li>
						Pattern lifts in <code>REPO-LIFTS.md</code> (inspiration only)
					</li>
				</ul>
			</section>

			<p className="font-body text-caption text-muted-foreground">
				<a className="font-bold underline" href="/salbot">
					← SalBot (Demo Mode · phone frame)
				</a>
				{" · "}
				<a className="underline" href="/">
					Tax Pulse /
				</a>
			</p>
		</main>
	);
}
