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
			<p className="font-ui text-caption uppercase tracking-[0.12em] text-muted-foreground">
				Multi-agent orchestration · Definition of Done
			</p>
			<h1 className="font-display text-heading-1">Built with Cursor Agent</h1>
			<p className="font-body text-body">
				Winning Cursor demos show <strong>one clear loop</strong> and{" "}
				<strong>visible seats</strong> — not feature sprawl.
			</p>
			<p className="font-body text-body-sm text-muted-foreground">
				Soft pitch (fovea / bar-loop): a confident wrong euro is a failure; a
				refusal is success. Hard gates + human sign-off beat sprawl.
			</p>

			<section className="space-y-2 border border-frame-ink bg-card p-4">
				<h2 className="font-ui text-heading-2">Parallel seats</h2>
				<ul className="space-y-2 font-body text-body-sm">
					<li>
						<strong>Sal</strong> — phone capture, veto, pitch video (tether
						story)
					</li>
					<li>
						<strong>Hackermans</strong> — ruthless scope + clock
					</li>
					<li>
						<strong>Cursor Agent (cursor)</strong> — Sapne co-drive, $50
						organizer credits, shipped <code>/salbot</code>
					</li>
					<li>
						<strong>Titans</strong> — TEAM-PLAN / SCORE / docs in parallel
					</li>
					<li>
						<strong>coder</strong> — PE: Akte isolation, StBerG, hardening
					</li>
				</ul>
			</section>

			<section className="space-y-2 border border-frame-ink bg-card p-4">
				<h2 className="font-ui text-heading-2">Handoffs</h2>
				<ol className="list-decimal space-y-1 pl-5 font-body text-body-sm">
					<li>
						Sal pastes challenge → Hackermans cuts Year File / SalBot lanes
					</li>
					<li>cursor Agent implements on Sapne (SalBot branch only)</li>
					<li>Titans write shared truth; coder PE-passes storage/safety</li>
					<li>Sal films Demo Mode one-tap loop</li>
				</ol>
			</section>

			<section className="space-y-2 border border-frame-ink bg-card p-4">
				<h2 className="font-ui text-heading-2">Definition of Done</h2>
				<ul className="list-disc space-y-1 pl-5 font-body text-body-sm">
					<li>
						<code>/salbot</code> Demo Mode: coworking → Bahn → Netflix → Akte
					</li>
					<li>Live orchestration strip + this page observable in Q&amp;A</li>
					<li>
						Tax Pulse <code>/</code> film path untouched
					</li>
					<li>
						Pattern lifts documented in <code>REPO-LIFTS.md</code> (inspiration
						only)
					</li>
				</ul>
			</section>

			<p className="font-body text-caption text-muted-foreground">
				<a className="underline" href="/salbot">
					← SalBot (Demo Mode)
				</a>
				{" · "}
				<a className="underline" href="/">
					Tax Pulse /
				</a>
			</p>
		</main>
	);
}
