export function meta() {
	return [
		{ title: "How we built — Cursor lane" },
		{
			name: "description",
			content:
				"Jury pointer: Sal → Hackermans → cursor Agent on Sapne; Titans/coder support.",
		},
	];
}

export default function HowWeBuiltRoute() {
	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 bg-background px-4 py-8 text-foreground"
		>
			<p className="font-ui text-caption uppercase tracking-[0.12em] text-muted-foreground">
				Multi-agent orchestration
			</p>
			<h1 className="font-display text-heading-1">Built with Cursor Agent</h1>
			<p className="font-body text-body">
				Sal (phone) captured the challenge. Hackermans cut scope.{" "}
				<strong>cursor</strong> co-drove Sal&apos;s Cursor on Sapne (
				salahuddinuqaili@outlook.com, $50 organizer credits) to ship{" "}
				<code className="font-ui">/salbot</code> and Tax Pulse polish.
			</p>
			<p className="font-body text-body-sm text-muted-foreground">
				Support seats: ivan → Titans (plan/docs), coder (PE), feedback (UX
				bible). Humans Shirley/Sam/Eugene as assigned on Tax Pulse.
			</p>
			<ul className="list-disc space-y-1 pl-5 font-body text-body-sm">
				<li>
					<code className="font-ui">002e4e0</code> — SalBot chat experiment
				</li>
				<li>
					<code className="font-ui">aae4a07</code> — messaging UX + Akte save
				</li>
				<li>
					<code className="font-ui">76a4054</code> — UX bible soft beats
				</li>
			</ul>
			<p className="font-body text-body-sm">
				Full trail: <code className="font-ui">HOW-WE-BUILT.md</code> ·{" "}
				<code className="font-ui">TEAM-PLAN/HOW-WE-BUILT.md</code> ·{" "}
				<code className="font-ui">DEMO-SALBOT.md</code>
			</p>
			<p className="font-body text-caption text-muted-foreground">
				<a className="underline" href="/salbot">
					← SalBot chat
				</a>
				{" · "}
				<a className="underline" href="/">
					Tax Pulse /
				</a>
			</p>
		</main>
	);
}
