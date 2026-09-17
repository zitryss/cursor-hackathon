import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	type DeductibilityVerdict,
	formatEuro,
	verdictLabel,
} from "~/features/year-file/deductibility";
import {
	addExpenseToYearFile,
	emptyYearFile,
	loadDemoWeek,
	loadYearFile,
	weeklySaveEuro,
	type YearFileExpense,
	type YearFileState,
	ytdImpactEuro,
} from "~/features/year-file/year-file-store";

export function meta() {
	return [
		{ title: "Tax Pulse - Is this deductible?" },
		{
			name: "description",
			content:
				"Log one expense, get a plain answer, grow filing confidence year-round.",
		},
	];
}

export default function YearFilePulseRoute() {
	const [ready, setReady] = useState(false);
	const [yearFile, setYearFile] = useState<YearFileState>(emptyYearFile);
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [last, setLast] = useState<YearFileExpense | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		setYearFile(loadYearFile());
		setReady(true);
	}, []);

	const ytdImpact = useMemo(
		() => ytdImpactEuro(yearFile.expenses),
		[yearFile.expenses],
	);
	const weeklySave = useMemo(
		() => weeklySaveEuro(yearFile.expenses),
		[yearFile.expenses],
	);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);

		const trimmed = description.trim();
		const amountEuro = Number(amount.replace(",", "."));

		if (!trimmed) {
			setFormError('Give it a name — "coworking day" beats "stuff".');
			return;
		}
		if (!Number.isFinite(amountEuro) || amountEuro <= 0) {
			setFormError("Enter an amount in EUR so we can sketch the YTD impact.");
			return;
		}

		const { state, expense } = addExpenseToYearFile(yearFile, {
			description: trimmed,
			amountEuro,
		});
		setYearFile(state);
		setLast(expense);
		setDescription("");
		setAmount("");
	}

	function onLoadDemoWeek() {
		const state = loadDemoWeek();
		setYearFile(state);
		setLast(state.expenses[0] ?? null);
		setFormError(null);
	}

	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 bg-background px-4 py-8 text-foreground"
		>
			<header className="space-y-3 border-b border-frame-ink pb-4">
				<p className="font-ui text-caption uppercase tracking-[0.12em] text-muted-foreground">
					Tax Pulse / weekly tax-save pulse
				</p>
				<h1 className="font-display text-display">Is this deductible?</h1>
				<p className="font-body text-body text-muted-foreground">
					This week&apos;s spend. A plain answer. Pocket the tax save now —
					don&apos;t wait for July.
				</p>
				<ol className="grid gap-1 font-ui text-caption uppercase tracking-wide text-muted-foreground">
					<li>1. Add one expense</li>
					<li>2. Instant verdict + EUR sketch</li>
					<li>3. Tax Pulse grows your confidence</li>
				</ol>
				<p className="font-body text-caption text-muted-foreground">
					Rough sketch, not tax advice.
				</p>
			</header>

			<section
				aria-label="Weekly save"
				className="sticky top-0 z-10 border border-frame-ink bg-annotation p-3 text-annotation-foreground shadow-hard"
			>
				<div className="flex items-end justify-between gap-3">
					<div>
						<p className="font-ui text-caption uppercase tracking-wide">
							Weekly save
						</p>
						<p className="font-display text-heading-2 tabular-nums">
							{ready ? formatEuro(weeklySave) : "—"}
						</p>
					</div>
					<p className="max-w-[14rem] text-right font-body text-caption">
						Come back next week to see the score — clever, not nagging.
					</p>
				</div>
			</section>

			<section
				aria-label="Filing confidence"
				className="border border-frame-ink bg-card p-4 shadow-hard"
			>
				<div className="flex items-end justify-between gap-3">
					<div>
						<p className="font-ui text-caption uppercase tracking-wide text-muted-foreground">
							Filing confidence
						</p>
						<p className="font-display text-heading-1 tabular-nums">
							{ready ? `${yearFile.confidence}` : "—"}
							<span className="font-ui text-body-sm text-muted-foreground">
								{" "}
								/ 100
							</span>
						</p>
					</div>
					<div className="text-right">
						<p className="font-ui text-caption uppercase tracking-wide text-muted-foreground">
							EUR this week / YTD
						</p>
						<p className="font-display text-heading-2 tabular-nums text-stripe">
							{ready
								? `${formatEuro(weeklySave)} / ${formatEuro(ytdImpact)}`
								: "—"}
						</p>
					</div>
				</div>
				<div
					className="mt-3 h-2 w-full border border-frame-ink bg-background"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={ready ? yearFile.confidence : 0}
					aria-label="Filing confidence"
				>
					<div
						className="h-full bg-annotation"
						style={{ width: `${ready ? yearFile.confidence : 0}%` }}
					/>
				</div>
			</section>

			<section
				aria-label="Add expense"
				className="border border-frame-ink bg-card p-4 shadow-hard"
			>
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div>
						<h2 className="font-ui text-heading-2">Add an expense</h2>
						<p className="mt-1 font-body text-body-sm text-muted-foreground">
							Text first. Speed is the flex.
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onLoadDemoWeek}
					>
						Load demo week
					</Button>
				</div>

				<form className="mt-4 space-y-3" onSubmit={onSubmit}>
					<label className="block space-y-1">
						<span className="font-ui text-caption uppercase tracking-wide">
							What did you spend on?
						</span>
						<input
							className="h-11 w-full border border-frame-ink bg-background px-3 font-body text-body outline-none focus-visible:border-ring"
							name="description"
							placeholder="e.g. coworking day, Fachliteratur, Bahn to client"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							autoComplete="off"
						/>
					</label>

					<label className="block space-y-1">
						<span className="font-ui text-caption uppercase tracking-wide">
							Amount (EUR)
						</span>
						<input
							className="h-11 w-full border border-frame-ink bg-background px-3 font-body text-body outline-none focus-visible:border-ring"
							name="amount"
							inputMode="decimal"
							placeholder="42.00"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							autoComplete="off"
						/>
					</label>

					{formError ? (
						<p className="font-body text-body-sm text-callout" role="alert">
							{formError}
						</p>
					) : null}

					<Button type="submit" className="w-full" size="lg">
						Check deductibility
					</Button>
				</form>
			</section>

			{last ? <PulseAnswer expense={last} ytdImpact={ytdImpact} /> : null}

			<section aria-label="Tax Pulse" className="space-y-3">
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="font-ui text-heading-2">Tax Pulse</h2>
					<p className="font-body text-caption text-muted-foreground">
						{ready ? `${yearFile.expenses.length} logged` : "loading…"}
					</p>
				</div>

				{ready && yearFile.expenses.length === 0 ? (
					<p className="border border-dashed border-frame-ink bg-card p-4 font-body text-body-sm text-muted-foreground">
						Empty on purpose. Hit Load demo week for the video path, or add your
						first pulse.
					</p>
				) : (
					<ul className="space-y-2">
						{yearFile.expenses.slice(0, 8).map((expense) => (
							<li
								key={expense.id}
								className="border border-frame-ink bg-card p-3 shadow-hard"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-body text-body font-bold">
											{expense.description}
										</p>
										<p className="font-ui text-caption text-muted-foreground">
											{verdictLabel(expense.verdict)}
										</p>
									</div>
									<p className="shrink-0 font-ui text-ui tabular-nums">
										{formatEuro(expense.amountEuro)}
									</p>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			<footer className="mt-auto border-t border-frame-ink pt-4">
				<p className="font-ui text-caption uppercase tracking-[0.08em] text-muted-foreground">
					Built with Cursor + agents
				</p>
				<p className="mt-1 font-body text-body-sm text-muted-foreground">
					Sal to Hackermans scope to cursor on Sapne; Titans TEAM-PLAN;
					Shirley/Sam ship. Built with Cursor + agents. One weekly pulse, not a
					committee.
				</p>
			</footer>
		</main>
	);
}

function PulseAnswer({
	expense,
	ytdImpact,
}: {
	expense: YearFileExpense;
	ytdImpact: number;
}) {
	return (
		<section
			aria-live="polite"
			className="border border-frame-ink bg-annotation p-4 text-annotation-foreground shadow-hard"
		>
			<p className="font-ui text-caption uppercase tracking-wide">
				Instant read
			</p>
			<h2 className="mt-1 font-display text-heading-1">
				{verdictLabel(expense.verdict)}
			</h2>
			<p className="mt-2 font-body text-body">{expense.why}</p>
			<dl className="mt-3 grid grid-cols-2 gap-3 font-body text-body-sm">
				<div>
					<dt className="font-ui text-caption uppercase">This pulse</dt>
					<dd className="font-display text-heading-3 tabular-nums">
						{formatImpact(expense.verdict, expense.impactEuro)}
					</dd>
				</div>
				<div>
					<dt className="font-ui text-caption uppercase">YTD rough impact</dt>
					<dd className="font-display text-heading-3 tabular-nums">
						{formatEuro(ytdImpact)}
					</dd>
				</div>
			</dl>
			<p className="mt-3 border-t border-frame-ink/40 pt-2 font-body text-caption">
				Rough sketch, not tax advice. Saved to Tax Pulse — return next week for
				the weekly save total.
			</p>
		</section>
	);
}

function formatImpact(verdict: DeductibilityVerdict, impact: number): string {
	if (verdict === "unlikely" || impact <= 0) {
		return "EUR 0 sketched";
	}
	return `~${formatEuro(impact)}`;
}
