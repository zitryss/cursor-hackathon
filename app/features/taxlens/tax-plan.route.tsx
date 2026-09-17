import {
	addOpportunity,
	DEMO_PROFILE,
	demoTaxPlan,
	emptyTaxPlan,
	formatEuro,
	formatPercent,
	markInvoiceUploaded,
	monthlyDigest,
	nextBestAction,
	type Opportunity,
	type OpportunitySource,
	setOpportunityStatus,
	summarizeTaxPlan,
	type TaxPlanState,
} from "@taxfix/taxlens-core";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import {
	decodeDeepLinkOpportunity,
	loadTaxPlan,
	saveTaxPlan,
} from "~/features/taxlens/tax-plan-store";

export function meta() {
	return [
		{ title: `My Tax Plan ${DEMO_PROFILE.taxYear} — Taxfix` },
		{
			name: "description",
			content:
				"Every moment TaxLens captured, in one place: saved opportunities, missing invoices, and how ready your next return is.",
		},
	];
}

const SOURCE_LABEL: Record<OpportunitySource, string> = {
	extension: "Browser extension",
	"share-sheet": "Share to Taxfix",
	"email-inbox": "Email invoice",
};

const STATUS_LABEL = {
	considering: "Considering purchase",
	purchased: "Purchased",
	declined: "Decided against",
} as const;

export default function TaxPlanRoute() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [plan, setPlan] = useState<TaxPlanState>(emptyTaxPlan);
	const [ready, setReady] = useState(false);
	const [justAdded, setJustAdded] = useState<string | null>(null);

	// Hydrate from storage, then accept anything the extension deep-linked in.
	useEffect(() => {
		const stored = loadTaxPlan();
		const encoded = searchParams.get("add");
		const incoming = encoded ? decodeDeepLinkOpportunity(encoded) : null;

		if (incoming) {
			const alreadyPresent = stored.opportunities.some(
				(opportunity) => opportunity.id === incoming.id,
			);
			if (alreadyPresent) {
				setPlan(stored);
			} else {
				const { state, opportunity } = addOpportunity(stored, incoming);
				saveTaxPlan(state);
				setPlan(state);
				setJustAdded(opportunity.productName);
			}
			// Drop the payload from the URL so a refresh cannot replay it.
			const next = new URLSearchParams(searchParams);
			next.delete("add");
			setSearchParams(next, { replace: true });
		} else {
			setPlan(stored);
		}

		setReady(true);
	}, [searchParams, setSearchParams]);

	const summary = useMemo(
		() => summarizeTaxPlan(plan.opportunities),
		[plan.opportunities],
	);

	function update(next: TaxPlanState) {
		setPlan(next);
		saveTaxPlan(next);
	}

	return (
		<div className="min-h-dvh bg-taxfix-canvas font-sans text-taxfix-ink">
			<header className="border-b border-taxfix-border bg-taxfix-surface">
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
					<span className="flex items-center gap-2.5 text-[15px] font-bold text-taxfix-forest">
						<span
							aria-hidden="true"
							className="grid size-7 place-items-center rounded-full bg-taxfix-lime text-[13px]"
						>
							tf
						</span>
						Taxfix
					</span>
					<Link
						to="/shop"
						className="rounded-full border border-taxfix-forest px-4 py-2 text-[13px] font-bold text-taxfix-forest hover:bg-taxfix-lime-soft"
					>
						Open demo shop →
					</Link>
				</div>
			</header>

			<main
				id="main-content"
				className="mx-auto grid max-w-3xl gap-5 px-4 py-8"
			>
				<div className="grid gap-2">
					<h1 className="font-display text-[36px] font-black leading-none tracking-[-0.02em]">
						Your {DEMO_PROFILE.taxYear} Tax Plan
					</h1>
					<p className="text-[15px] text-taxfix-muted-ink">
						TaxLens finds the opportunity. Taxfix helps you capture it, prepare
						it, and claim it.
					</p>
				</div>

				{justAdded ? (
					<p className="rounded-[16px] border border-taxfix-lime bg-taxfix-lime-soft px-4 py-3 text-[14px] font-bold text-taxfix-forest">
						{justAdded} arrived from the TaxLens extension ✓
					</p>
				) : null}

				<section aria-label="Plan totals" className="grid gap-3 sm:grid-cols-3">
					<Metric
						value={ready ? String(summary.savedCount) : "—"}
						label="expenses saved"
					/>
					<Metric
						value={ready ? formatEuro(summary.taxRelevantEuro) : "—"}
						label="potentially tax-relevant"
					/>
					<Metric
						value={ready ? formatEuro(summary.estimatedTaxEffectEuro) : "—"}
						label="estimated tax effect"
					/>
				</section>

				<section
					aria-label="Return readiness"
					className="grid gap-2.5 rounded-[24px] border border-taxfix-lime bg-taxfix-lime-soft p-5 text-taxfix-forest"
				>
					<div className="flex items-baseline justify-between text-[14px] font-bold">
						<span>Tax return readiness</span>
						<strong className="font-display text-[28px] tabular-nums">
							{summary.readinessPercent}%
						</strong>
					</div>
					<div
						className="h-2 overflow-hidden rounded-full bg-taxfix-forest/15"
						role="progressbar"
						aria-valuenow={summary.readinessPercent}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<span
							className="block h-full bg-taxfix-forest transition-[width] duration-300"
							style={{ inlineSize: `${summary.readinessPercent}%` }}
						/>
					</div>
					<p className="text-[13px]">{nextBestAction(summary)}</p>
				</section>

				<section aria-label="Saved opportunities" className="grid gap-3">
					<h2 className="text-[16px] font-bold">Potential opportunities</h2>

					{plan.opportunities.length === 0 ? (
						<div className="grid gap-3 rounded-[24px] border border-taxfix-border bg-taxfix-surface p-6">
							<p className="text-[14px] text-taxfix-muted-ink">
								Nothing captured yet. TaxLens adds items while you shop — or
								load a plan that already has a few months behind it.
							</p>
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() =>
										update(
											demoTaxPlan(
												DEMO_PROFILE.taxYear,
												DEMO_PROFILE.estimatedMarginalTaxRate,
											),
										)
									}
									className="min-h-touch rounded-full bg-taxfix-lime px-6 font-bold text-taxfix-forest hover:bg-taxfix-lime-hover"
								>
									Load demo plan
								</button>
								<Link
									to="/shop"
									className="grid min-h-touch place-items-center rounded-full border border-taxfix-forest px-6 font-bold text-taxfix-forest hover:bg-taxfix-lime-soft"
								>
									Go shopping
								</Link>
							</div>
						</div>
					) : (
						<ul className="grid gap-3">
							{plan.opportunities.map((opportunity) => (
								<OpportunityCard
									key={opportunity.id}
									opportunity={opportunity}
									onPurchased={() =>
										update(markInvoiceUploaded(plan, opportunity.id))
									}
									onNotYet={() =>
										update(
											setOpportunityStatus(plan, opportunity.id, "considering"),
										)
									}
									onDeclined={() =>
										update(
											setOpportunityStatus(plan, opportunity.id, "declined"),
										)
									}
								/>
							))}
						</ul>
					)}
				</section>

				<section
					aria-label="Monthly update"
					className="grid gap-2 rounded-[24px] border border-taxfix-border bg-taxfix-surface p-5"
				>
					<h2 className="text-[16px] font-bold text-taxfix-forest">
						Your September Taxfix update
					</h2>
					<ul className="grid gap-1 text-[14px] text-taxfix-muted-ink">
						{monthlyDigest(summary, "September").map((line) => (
							<li key={line}>• {line}</li>
						))}
					</ul>
					<p className="text-[12px] text-taxfix-muted-ink">
						One summary a month — not a daily notification.
					</p>
				</section>

				<section
					aria-label="Entry points"
					className="grid gap-2 rounded-[24px] border border-taxfix-border bg-taxfix-surface p-5"
				>
					<h2 className="text-[16px] font-bold text-taxfix-forest">
						Taxfix Everywhere
					</h2>
					<p className="text-[14px] text-taxfix-muted-ink">
						TaxLens is the first touchpoint, not the whole product. Every entry
						point feeds the same plan:
					</p>
					<ul className="grid gap-1 text-[14px]">
						<li>Desktop shopping → browser extension</li>
						<li>Mobile shopping → “Share to Taxfix”</li>
						<li>Email invoice → forward to your Taxfix inbox</li>
						<li>Physical purchase → photograph the receipt</li>
					</ul>
				</section>

				<footer className="grid gap-3 pb-4">
					<p className="text-[12px] text-taxfix-muted-ink">
						Prototype estimate — not guaranteed tax advice. Actual treatment
						depends on your individual circumstances and applicable tax rules.
						Everything on this page stays in your browser.
					</p>
					{plan.opportunities.length > 0 ? (
						<button
							type="button"
							onClick={() => update(emptyTaxPlan)}
							className="justify-self-start text-[12px] text-taxfix-muted-ink underline underline-offset-2"
						>
							Reset demo plan
						</button>
					) : null}
				</footer>
			</main>
		</div>
	);
}

function Metric({ value, label }: { value: string; label: string }) {
	return (
		<div className="grid gap-1 rounded-[24px] border border-taxfix-border bg-taxfix-surface p-5">
			<span className="font-display text-[24px] font-black tabular-nums tracking-[-0.02em] text-taxfix-forest">
				{value}
			</span>
			<span className="text-[13px] text-taxfix-muted-ink">{label}</span>
		</div>
	);
}

interface OpportunityCardProps {
	opportunity: Opportunity;
	onPurchased: () => void;
	onNotYet: () => void;
	onDeclined: () => void;
}

function OpportunityCard({
	opportunity,
	onPurchased,
	onNotYet,
	onDeclined,
}: OpportunityCardProps) {
	const invoiceMissing =
		opportunity.status === "purchased" && !opportunity.invoiceUploaded;

	return (
		<li className="grid gap-2 rounded-[24px] border border-taxfix-border bg-taxfix-surface p-5">
			<div className="flex items-baseline justify-between gap-3">
				<span className="text-[16px] font-bold">{opportunity.productName}</span>
				<span className="text-[16px] font-bold tabular-nums">
					{formatEuro(opportunity.priceEuro)}
				</span>
			</div>

			<p className="text-[13px] text-taxfix-muted-ink">
				{opportunity.retailer} · {formatPercent(opportunity.professionalUse)}{" "}
				professional use · potential tax effect{" "}
				{formatEuro(opportunity.estimatedTaxBenefitEuro)}
			</p>

			<div className="flex flex-wrap items-center gap-2">
				<span className="rounded-full bg-taxfix-lime-soft px-3 py-1 text-[12px] font-bold text-taxfix-forest">
					{STATUS_LABEL[opportunity.status]}
				</span>
				<span className="rounded-full border border-taxfix-border px-3 py-1 text-[12px] text-taxfix-muted-ink">
					{SOURCE_LABEL[opportunity.source]}
				</span>
				{opportunity.invoiceUploaded ? (
					<span className="rounded-full bg-taxfix-forest px-3 py-1 text-[12px] font-bold text-white">
						Invoice on file ✓
					</span>
				) : null}
				{invoiceMissing ? (
					<span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-bold text-amber-900">
						Invoice missing
					</span>
				) : null}
			</div>

			{opportunity.status === "considering" ? (
				<div className="mt-1 grid gap-2 border-t border-taxfix-border pt-3">
					<span className="text-[14px] font-bold">
						Did you buy the {opportunity.productName}?
					</span>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={onPurchased}
							className="min-h-touch rounded-full bg-taxfix-lime px-5 text-[14px] font-bold text-taxfix-forest hover:bg-taxfix-lime-hover"
						>
							Yes, upload invoice
						</button>
						<button
							type="button"
							onClick={onNotYet}
							className="min-h-touch rounded-full border border-taxfix-forest px-5 text-[14px] font-bold text-taxfix-forest hover:bg-taxfix-lime-soft"
						>
							Not yet
						</button>
						<button
							type="button"
							onClick={onDeclined}
							className="min-h-touch rounded-full border border-taxfix-border px-5 text-[14px] font-bold text-taxfix-muted-ink hover:bg-taxfix-canvas"
						>
							I decided against it
						</button>
					</div>
				</div>
			) : null}

			{invoiceMissing ? (
				<button
					type="button"
					onClick={onPurchased}
					className="mt-1 min-h-touch justify-self-start rounded-full bg-taxfix-lime px-5 text-[14px] font-bold text-taxfix-forest hover:bg-taxfix-lime-hover"
				>
					Upload invoice
				</button>
			) : null}
		</li>
	);
}
