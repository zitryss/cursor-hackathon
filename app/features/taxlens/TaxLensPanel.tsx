import {
	addOpportunity,
	clampProfessionalUse,
	estimateTaxLens,
	formatEuro,
	formatPercent,
	type Opportunity,
	PROFESSIONAL_USE_PRESETS,
	setReminder,
	type TaxLensProduct,
	type TaxLensProfile,
	type TaxPlanState,
} from "@taxfix/taxlens-core";
import { useMemo, useState } from "react";
import { Link } from "react-router";

/**
 * The TaxLens panel as the browser extension injects it, rendered inside the
 * demo shop so the flow can be shown without installing anything.
 *
 * It mirrors `extension/components/TaxLensPanel.tsx`: same engine, same copy,
 * same rule that nothing is stored until the user presses Save.
 */

export interface TaxLensPanelProps {
	product: TaxLensProduct;
	profile: TaxLensProfile;
	productUrl: string;
	plan: TaxPlanState;
	onPlanChange: (plan: TaxPlanState) => void;
}

const panelButton =
	"min-h-touch rounded-full px-6 py-3 font-sans text-[15px] font-bold transition-colors disabled:opacity-60";

export function TaxLensPanel({
	product,
	profile,
	productUrl,
	plan,
	onPlanChange,
}: TaxLensPanelProps) {
	const [open, setOpen] = useState(false);
	const [professionalUse, setProfessionalUse] = useState(
		profile.defaultProfessionalUse,
	);
	const [saved, setSaved] = useState<Opportunity | null>(null);
	const [reminderOn, setReminderOn] = useState(false);

	const estimate = useMemo(
		() =>
			estimateTaxLens(
				product.price,
				professionalUse,
				profile.estimatedMarginalTaxRate,
			),
		[product.price, professionalUse, profile.estimatedMarginalTaxRate],
	);

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full items-center gap-3 rounded-full border border-taxfix-border bg-taxfix-surface px-5 py-4 text-left font-sans text-taxfix-forest shadow-[0_10px_30px_rgba(12,11,10,0.10)] transition-colors hover:bg-taxfix-lime-soft"
			>
				<TaxfixMark />
				<span className="grid gap-0.5">
					<span className="text-[12px] font-normal text-taxfix-muted-ink">
						Potential work expense
					</span>
					<span className="text-[15px] font-bold">
						See your potential Taxfix price →
					</span>
				</span>
			</button>
		);
	}

	function onSave() {
		const { state, opportunity } = addOpportunity(plan, {
			productName: product.name,
			retailer: product.retailer,
			productUrl,
			priceEuro: product.price,
			professionalUse,
			marginalTaxRate: profile.estimatedMarginalTaxRate,
			taxYear: profile.taxYear,
		});
		onPlanChange(state);
		setSaved(opportunity);
	}

	function onToggleReminder() {
		if (!saved) {
			return;
		}
		const next = !reminderOn;
		setReminderOn(next);
		onPlanChange(setReminder(plan, saved.id, next));
	}

	return (
		<section
			aria-label="TaxLens potential tax-adjusted price"
			className="overflow-hidden rounded-[24px] border border-taxfix-border bg-taxfix-canvas font-sans text-taxfix-ink shadow-[0_18px_48px_rgba(12,11,10,0.16)]"
		>
			<header className="flex items-start justify-between gap-3 border-b border-taxfix-border bg-taxfix-surface px-5 py-4">
				<span className="flex items-center gap-2.5 text-[14px] font-bold text-taxfix-forest">
					<TaxfixMark />
					Taxfix TaxLens
				</span>
				<button
					type="button"
					aria-label="Close TaxLens"
					onClick={() => setOpen(false)}
					className="grid size-8 place-items-center rounded-full text-[18px] leading-none text-taxfix-muted-ink hover:bg-taxfix-border"
				>
					×
				</button>
			</header>

			<div className="grid gap-4 p-5">
				{saved ? (
					<div className="grid gap-1.5 rounded-[16px] bg-taxfix-forest p-4 text-white">
						<span className="text-[15px] font-bold">
							Saved to your {profile.taxYear} Tax Plan ✓
						</span>
						<p className="text-[13px] opacity-90">
							Your next tax return just became easier. We&apos;ll keep this item
							under &ldquo;Considering purchase&rdquo; until you tell us what
							happened.
						</p>
						<Link
							to="/tax-plan"
							className="text-[13px] font-bold text-white underline underline-offset-4"
						>
							Open My Tax Plan →
						</Link>
					</div>
				) : (
					<p className="text-[14px] text-taxfix-muted-ink">
						Because you may use this for work, part of the purchase could be
						relevant to your {profile.taxYear} tax return.
					</p>
				)}

				<p className="text-[14px] font-bold">
					{product.name} · {product.retailer}
				</p>

				<div className="grid gap-2.5">
					<label
						htmlFor="taxlens-use"
						className="flex items-baseline justify-between gap-2 text-[14px] font-bold"
					>
						How much will you use it for work?
						<span className="text-[20px] tabular-nums text-taxfix-forest">
							{formatPercent(professionalUse)}
						</span>
					</label>
					<input
						id="taxlens-use"
						type="range"
						min={0}
						max={100}
						step={5}
						value={Math.round(professionalUse * 100)}
						onChange={(event) =>
							setProfessionalUse(
								clampProfessionalUse(Number(event.target.value) / 100),
							)
						}
						className="h-6 w-full cursor-pointer accent-taxfix-forest"
					/>
					<div className="flex gap-2">
						{PROFESSIONAL_USE_PRESETS.map((preset) => (
							<button
								key={preset}
								type="button"
								aria-pressed={professionalUse === preset}
								onClick={() => setProfessionalUse(preset)}
								className="min-h-9 flex-1 rounded-full border border-taxfix-border bg-taxfix-surface px-3 text-[13px] font-bold text-taxfix-forest transition-colors hover:bg-taxfix-lime-soft aria-pressed:border-taxfix-lime aria-pressed:bg-taxfix-lime"
							>
								{formatPercent(preset)}
							</button>
						))}
					</div>
				</div>

				<dl className="grid gap-2 rounded-[16px] border border-taxfix-border bg-taxfix-surface p-4">
					<EstimateRow
						label="Product price"
						value={formatEuro(product.price)}
					/>
					<EstimateRow
						label="Potential tax-relevant amount"
						value={formatEuro(estimate.taxRelevantAmount)}
					/>
					<EstimateRow
						label="Estimated tax benefit"
						value={formatEuro(estimate.estimatedTaxBenefit)}
					/>
				</dl>

				<div className="grid gap-1 rounded-[16px] border border-taxfix-lime bg-taxfix-lime-soft p-[18px] text-taxfix-forest">
					<span className="text-[13px] font-bold">
						Potential tax-adjusted cost
					</span>
					<span className="flex items-baseline gap-2.5 font-display text-[32px] font-black tabular-nums tracking-[-0.02em]">
						{formatEuro(estimate.taxAdjustedCost)}
						{estimate.estimatedTaxBenefit > 0 ? (
							<span className="text-[16px] font-normal text-taxfix-muted-ink line-through">
								{formatEuro(product.price)}
							</span>
						) : null}
					</span>
				</div>

				{saved ? (
					<button
						type="button"
						onClick={onToggleReminder}
						className={
							reminderOn
								? `${panelButton} border border-taxfix-forest bg-taxfix-surface text-taxfix-forest hover:bg-taxfix-lime-soft`
								: `${panelButton} bg-taxfix-lime text-taxfix-forest hover:bg-taxfix-lime-hover`
						}
					>
						{reminderOn
							? "Invoice reminder activated ✓"
							: "Remind me to save the invoice"}
					</button>
				) : (
					<button
						type="button"
						onClick={onSave}
						className={`${panelButton} bg-taxfix-lime text-taxfix-forest hover:bg-taxfix-lime-hover`}
					>
						Save to Taxfix
					</button>
				)}

				<details className="rounded-[16px] border border-taxfix-border bg-taxfix-surface px-4 py-3">
					<summary className="cursor-pointer text-[13px] font-bold text-taxfix-forest">
						View assumptions
					</summary>
					<dl className="mt-3 grid gap-1.5">
						<EstimateRow label="Tax year" value={String(profile.taxYear)} />
						<EstimateRow
							label="Employment status"
							value={profile.employmentType}
						/>
						<EstimateRow
							label="Illustrative marginal rate"
							value={formatPercent(profile.estimatedMarginalTaxRate)}
						/>
						<EstimateRow
							label="Professional use"
							value={formatPercent(professionalUse)}
						/>
						<EstimateRow
							label="Above employee allowance"
							value={profile.aboveEmployeeAllowance ? "Yes" : "No"}
						/>
					</dl>
					<pre className="mt-3 whitespace-pre-wrap rounded-lg bg-taxfix-canvas px-3 py-2.5 font-mono text-[12px] text-taxfix-muted-ink">
						{
							"tax-relevant = price × work use\nbenefit      = tax-relevant × marginal rate\nadjusted     = price − benefit"
						}
					</pre>
				</details>

				<p className="text-[12px] text-taxfix-muted-ink">
					Private by default. Nothing is saved without your confirmation, and
					your tax profile is never shared with {product.retailer}.
				</p>
				<p className="text-[12px] text-taxfix-muted-ink">
					Prototype estimate — not guaranteed tax advice. Actual treatment
					depends on your individual circumstances and applicable tax rules.
				</p>
			</div>
		</section>
	);
}

function EstimateRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3 text-[14px]">
			<dt className="text-taxfix-muted-ink">{label}</dt>
			<dd className="font-bold tabular-nums">{value}</dd>
		</div>
	);
}

function TaxfixMark() {
	return (
		<span
			aria-hidden="true"
			className="grid size-7 shrink-0 place-items-center rounded-full bg-taxfix-lime text-[13px] font-bold text-taxfix-forest"
		>
			tf
		</span>
	);
}
