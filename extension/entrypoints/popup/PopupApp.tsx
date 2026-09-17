import {
	demoTaxPlan,
	emptyTaxPlan,
	formatEuro,
	formatPercent,
	monthlyDigest,
	nextBestAction,
	summarizeTaxPlan,
	type TaxPlanState,
} from "@taxfix/taxlens-core";
import { useEffect, useMemo, useState } from "react";
import {
	clearPlan,
	readPlan,
	taxPlanUrlFor,
	updatePlanStatus,
	uploadPlanInvoice,
	watchPlan,
} from "../../lib/plan-storage";
import { connectedProfile } from "../../lib/profile";

const STATUS_LABEL = {
	considering: "Considering purchase",
	purchased: "Purchased",
	declined: "Decided against",
} as const;

/**
 * The extension's window into My Tax Plan.
 *
 * Deliberately a summary, not a second app: it shows what was captured, asks
 * the one question that moves an item forward, and hands off to Taxfix for
 * anything real.
 */
export function PopupApp() {
	const profile = connectedProfile();
	const [plan, setPlan] = useState<TaxPlanState>(emptyTaxPlan);

	useEffect(() => {
		readPlan().then(setPlan);
		return watchPlan(setPlan);
	}, []);

	const summary = useMemo(
		() => summarizeTaxPlan(plan.opportunities),
		[plan.opportunities],
	);

	return (
		<main className="popup">
			<header className="popup__header">
				<span className="popup__brand">
					<span className="popup__mark" aria-hidden="true">
						tf
					</span>
					My Tax Plan
				</span>
				<span className="popup__year">{profile.taxYear}</span>
			</header>

			<section className="popup__summary" aria-label="Plan summary">
				<div className="popup__metric">
					<span className="popup__metric-value">{summary.savedCount}</span>
					<span className="popup__metric-label">expenses saved</span>
				</div>
				<div className="popup__metric">
					<span className="popup__metric-value">
						{formatEuro(summary.taxRelevantEuro)}
					</span>
					<span className="popup__metric-label">potentially tax-relevant</span>
				</div>
				<div className="popup__metric">
					<span className="popup__metric-value">
						{formatEuro(summary.estimatedTaxEffectEuro)}
					</span>
					<span className="popup__metric-label">estimated tax effect</span>
				</div>
			</section>

			<section className="popup__readiness" aria-label="Return readiness">
				<div className="popup__readiness-head">
					<span>Tax return readiness</span>
					<strong>{summary.readinessPercent}%</strong>
				</div>
				<div
					className="popup__bar"
					role="progressbar"
					aria-valuenow={summary.readinessPercent}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<span style={{ inlineSize: `${summary.readinessPercent}%` }} />
				</div>
				<p className="popup__hint">{nextBestAction(summary)}</p>
			</section>

			{plan.opportunities.length === 0 ? (
				<section className="popup__empty">
					<p>
						Nothing captured yet. TaxLens adds items while you shop — nothing is
						ever saved without your confirmation.
					</p>
					<button
						type="button"
						className="popup__button popup__button--secondary"
						onClick={async () => {
							const seeded = demoTaxPlan(
								profile.taxYear,
								profile.estimatedMarginalTaxRate,
							);
							await clearPlan();
							setPlan(seeded);
						}}
					>
						Load demo plan
					</button>
				</section>
			) : (
				<ul className="popup__list">
					{plan.opportunities.map((opportunity) => (
						<li key={opportunity.id} className="popup__item">
							<div className="popup__item-head">
								<span className="popup__item-name">
									{opportunity.productName}
								</span>
								<span className="popup__item-price">
									{formatEuro(opportunity.priceEuro)}
								</span>
							</div>
							<p className="popup__item-meta">
								{formatPercent(opportunity.professionalUse)} professional use ·
								potential effect{" "}
								{formatEuro(opportunity.estimatedTaxBenefitEuro)}
							</p>
							<p className="popup__item-status">
								{STATUS_LABEL[opportunity.status]}
								{opportunity.status === "purchased" &&
								!opportunity.invoiceUploaded
									? " · invoice missing"
									: ""}
							</p>

							{opportunity.status === "considering" ? (
								<div className="popup__item-actions">
									<span className="popup__ask">
										Did you buy the {opportunity.productName}?
									</span>
									<div className="popup__item-buttons">
										<button
											type="button"
											className="popup__button popup__button--primary"
											onClick={() =>
												uploadPlanInvoice(opportunity.id).then(setPlan)
											}
										>
											Yes, upload invoice
										</button>
										<button
											type="button"
											className="popup__button popup__button--secondary"
											onClick={() =>
												updatePlanStatus(opportunity.id, "declined").then(
													setPlan,
												)
											}
										>
											Decided against it
										</button>
									</div>
								</div>
							) : null}

							{opportunity.status === "purchased" &&
							!opportunity.invoiceUploaded ? (
								<div className="popup__item-buttons">
									<button
										type="button"
										className="popup__button popup__button--primary"
										onClick={() =>
											uploadPlanInvoice(opportunity.id).then(setPlan)
										}
									>
										Upload invoice
									</button>
								</div>
							) : null}
						</li>
					))}
				</ul>
			)}

			<section className="popup__digest" aria-label="Monthly update">
				<h2>Your monthly Taxfix update</h2>
				<ul>
					{monthlyDigest(summary, "September").map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			</section>

			<footer className="popup__footer">
				<a
					className="popup__button popup__button--primary popup__button--link"
					href={taxPlanUrlFor(plan.opportunities)}
					target="_blank"
					rel="noreferrer"
				>
					Review my tax plan
				</a>
				<p className="popup__note">
					Prototype estimate — not guaranteed tax advice. TaxLens stores only
					the items you saved, never your tax return.
				</p>
			</footer>
		</main>
	);
}
