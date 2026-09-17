import {
	clampProfessionalUse,
	estimateTaxLens,
	formatEuro,
	formatPercent,
	type Opportunity,
	PROFESSIONAL_USE_PRESETS,
	type TaxLensProduct,
	type TaxLensProfile,
} from "@taxfix/taxlens-core";
import { useMemo, useState } from "react";

import {
	savePlanOpportunity,
	setPlanReminder,
	taxPlanDeepLink,
} from "../lib/plan-storage";

export interface TaxLensPanelProps {
	product: TaxLensProduct;
	profile: TaxLensProfile;
	productUrl: string;
	/** Start expanded — used by the demo page and by tests. */
	defaultOpen?: boolean;
	onDismiss?: () => void;
}

/**
 * The panel TaxLens injects next to a price.
 *
 * It computes locally and stores nothing until the user presses
 * "Save to Taxfix". Everything it shows is labelled as an estimate.
 */
export function TaxLensPanel({
	product,
	profile,
	productUrl,
	defaultOpen = false,
	onDismiss,
}: TaxLensPanelProps) {
	const [open, setOpen] = useState(defaultOpen);
	const [professionalUse, setProfessionalUse] = useState(
		profile.defaultProfessionalUse,
	);
	const [saved, setSaved] = useState<Opportunity | null>(null);
	const [reminderOn, setReminderOn] = useState(false);
	const [busy, setBusy] = useState(false);

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
			<div className="taxlens">
				<button
					type="button"
					className="taxlens__trigger"
					onClick={() => setOpen(true)}
				>
					<span className="taxlens__mark" aria-hidden="true">
						tf
					</span>
					<span className="taxlens__trigger-copy">
						<span className="taxlens__trigger-lead">
							Potential work expense
						</span>
						<span>See your potential Taxfix price →</span>
					</span>
				</button>
			</div>
		);
	}

	async function onSave() {
		setBusy(true);
		try {
			const opportunity = await savePlanOpportunity({
				productName: product.name,
				retailer: product.retailer,
				productUrl,
				priceEuro: product.price,
				professionalUse,
				marginalTaxRate: profile.estimatedMarginalTaxRate,
				taxYear: profile.taxYear,
			});
			setSaved(opportunity);
		} finally {
			setBusy(false);
		}
	}

	async function onToggleReminder() {
		if (!saved) {
			return;
		}
		const next = !reminderOn;
		setReminderOn(next);
		await setPlanReminder(saved.id, next);
	}

	return (
		<div className="taxlens">
			<section
				className="taxlens__panel"
				aria-label="TaxLens potential tax-adjusted price"
			>
				<header className="taxlens__header">
					<span className="taxlens__brand">
						<span className="taxlens__mark" aria-hidden="true">
							tf
						</span>
						Taxfix TaxLens
					</span>
					<button
						type="button"
						className="taxlens__close"
						aria-label="Close TaxLens"
						onClick={() => {
							setOpen(false);
							onDismiss?.();
						}}
					>
						×
					</button>
				</header>

				<div className="taxlens__body">
					{saved ? (
						<div className="taxlens__status">
							<span className="taxlens__status-title">
								Saved to your {profile.taxYear} Tax Plan ✓
							</span>
							<p className="taxlens__status-body">
								Your next tax return just became easier. We&apos;ll keep this
								item under “Considering purchase” until you tell us what
								happened.
							</p>
							<a
								className="taxlens__link"
								href={taxPlanDeepLink(saved)}
								target="_blank"
								rel="noreferrer"
							>
								Open My Tax Plan →
							</a>
						</div>
					) : (
						<p className="taxlens__lede">
							Because you may use this for work, part of the purchase could be
							relevant to your {profile.taxYear} tax return.
						</p>
					)}

					<p className="taxlens__product">
						{product.name} · {product.retailer}
					</p>

					<div className="taxlens__field">
						<label className="taxlens__label" htmlFor="taxlens-use">
							How much will you use it for work?
							<span className="taxlens__value">
								{formatPercent(professionalUse)}
							</span>
						</label>
						<input
							id="taxlens-use"
							className="taxlens__slider"
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
						/>
						<div className="taxlens__chips">
							{PROFESSIONAL_USE_PRESETS.map((preset) => (
								<button
									key={preset}
									type="button"
									className="taxlens__chip"
									aria-pressed={professionalUse === preset}
									onClick={() => setProfessionalUse(preset)}
								>
									{formatPercent(preset)}
								</button>
							))}
						</div>
					</div>

					<dl className="taxlens__rows">
						<div className="taxlens__row">
							<dt>Product price</dt>
							<dd>{formatEuro(product.price)}</dd>
						</div>
						<div className="taxlens__row">
							<dt>Potential tax-relevant amount</dt>
							<dd>{formatEuro(estimate.taxRelevantAmount)}</dd>
						</div>
						<div className="taxlens__row">
							<dt>Estimated tax benefit</dt>
							<dd>{formatEuro(estimate.estimatedTaxBenefit)}</dd>
						</div>
					</dl>

					<div className="taxlens__sticky">
						<div className="taxlens__headline">
							<span className="taxlens__headline-label">
								Potential tax-adjusted cost
							</span>
							<span className="taxlens__headline-amount">
								{formatEuro(estimate.taxAdjustedCost)}
								{estimate.estimatedTaxBenefit > 0 ? (
									<span className="taxlens__strike">
										{formatEuro(product.price)}
									</span>
								) : null}
							</span>
						</div>

						<div className="taxlens__actions">
							{saved ? (
								<button
									type="button"
									className={`taxlens__button ${
										reminderOn
											? "taxlens__button--secondary"
											: "taxlens__button--primary"
									}`}
									onClick={onToggleReminder}
								>
									{reminderOn
										? "Invoice reminder activated ✓"
										: "Remind me to save the invoice"}
								</button>
							) : (
								<button
									type="button"
									className="taxlens__button taxlens__button--primary"
									onClick={onSave}
									disabled={busy}
								>
									{busy ? "Saving…" : "Save to Taxfix"}
								</button>
							)}
						</div>
					</div>

					<details className="taxlens__assumptions">
						<summary>View assumptions</summary>
						<dl>
							<div className="taxlens__row">
								<dt>Tax year</dt>
								<dd>{profile.taxYear}</dd>
							</div>
							<div className="taxlens__row">
								<dt>Employment status</dt>
								<dd>{profile.employmentType}</dd>
							</div>
							<div className="taxlens__row">
								<dt>Illustrative marginal rate</dt>
								<dd>{formatPercent(profile.estimatedMarginalTaxRate)}</dd>
							</div>
							<div className="taxlens__row">
								<dt>Professional use</dt>
								<dd>{formatPercent(professionalUse)}</dd>
							</div>
							<div className="taxlens__row">
								<dt>Above employee allowance</dt>
								<dd>{profile.aboveEmployeeAllowance ? "Yes" : "No"}</dd>
							</div>
						</dl>
						<p className="taxlens__formula">
							{"tax-relevant = price × work use\n"}
							{"benefit      = tax-relevant × marginal rate\n"}
							{"adjusted     = price − benefit"}
						</p>
					</details>

					<p className="taxlens__note">
						Private by default. Nothing is saved without your confirmation, and
						your tax profile is never shared with {product.retailer}.
					</p>
					<p className="taxlens__note">
						Prototype estimate — not guaranteed tax advice. Actual treatment
						depends on your individual circumstances and applicable tax rules.
					</p>
				</div>
			</section>
		</div>
	);
}
