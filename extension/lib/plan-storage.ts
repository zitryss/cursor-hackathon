import {
	addOpportunity,
	emptyTaxPlan,
	markInvoiceUploaded,
	type Opportunity,
	type OpportunityStatus,
	type SaveOpportunityInput,
	setOpportunityStatus,
	setReminder,
	type TaxPlanState,
} from "@taxfix/taxlens-core";
import { storage } from "#imports";

/**
 * Extension-side persistence for the Tax Plan.
 *
 * A production build writes through a scoped Taxfix API and keeps a local
 * mirror; the prototype keeps only the local mirror, so nothing ever leaves
 * the browser. Either way the extension stores one thing — saved
 * opportunities — and never the tax return itself.
 */

const PLAN = storage.defineItem<TaxPlanState>("local:taxfix.tax-plan.v1", {
	fallback: emptyTaxPlan,
	version: 1,
});

export function watchPlan(onChange: (state: TaxPlanState) => void): () => void {
	return PLAN.watch((next) => onChange(next ?? emptyTaxPlan));
}

export async function readPlan(): Promise<TaxPlanState> {
	return await PLAN.getValue();
}

/** Explicit user action: this is the only path that stores a product. */
export async function savePlanOpportunity(
	input: SaveOpportunityInput,
): Promise<Opportunity> {
	const current = await PLAN.getValue();
	const { state, opportunity } = addOpportunity(current, input);
	await PLAN.setValue(state);
	return opportunity;
}

export async function updatePlanStatus(
	id: string,
	status: OpportunityStatus,
): Promise<TaxPlanState> {
	const next = setOpportunityStatus(await PLAN.getValue(), id, status);
	await PLAN.setValue(next);
	return next;
}

export async function uploadPlanInvoice(id: string): Promise<TaxPlanState> {
	const next = markInvoiceUploaded(await PLAN.getValue(), id);
	await PLAN.setValue(next);
	return next;
}

export async function setPlanReminder(
	id: string,
	reminderEnabled: boolean,
): Promise<TaxPlanState> {
	const next = setReminder(await PLAN.getValue(), id, reminderEnabled);
	await PLAN.setValue(next);
	return next;
}

export async function clearPlan(): Promise<void> {
	await PLAN.setValue(emptyTaxPlan);
}

/**
 * Where the Taxfix app lives. The real extension deep-links into the app
 * (`taxfix://tax-plan/opportunity/<id>`); the prototype opens the web
 * prototype of the same screen.
 *
 * On a local demo the app is whichever port Vite settled on, so follow the
 * page we are already running in rather than assuming 5173.
 */
export function taxPlanAppUrl(): string {
	if (
		typeof location !== "undefined" &&
		/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
	) {
		return `${location.origin}/tax-plan`;
	}
	return "http://localhost:5173/tax-plan";
}

/**
 * The popup runs on the extension's own origin, so it cannot follow the page.
 * Fall back to the shop a saved item came from, which pins the demo to the
 * port the app is actually serving on.
 */
export function taxPlanUrlFor(opportunities: readonly Opportunity[]): string {
	for (const opportunity of opportunities) {
		try {
			const origin = new URL(opportunity.productUrl).origin;
			if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
				return `${origin}/tax-plan`;
			}
		} catch {
			// Ignore an unparseable URL and keep looking.
		}
	}
	return taxPlanAppUrl();
}

/**
 * Hand a captured item to the app. The payload carries only what the user
 * confirmed on the panel — never a profile, never browsing history.
 */
export function taxPlanDeepLink(opportunity: Opportunity): string {
	const payload = {
		id: opportunity.id,
		productName: opportunity.productName,
		retailer: opportunity.retailer,
		productUrl: opportunity.productUrl,
		priceEuro: opportunity.priceEuro,
		professionalUse: opportunity.professionalUse,
		estimatedTaxBenefitEuro: opportunity.estimatedTaxBenefitEuro,
		taxYear: opportunity.taxYear,
		reminderEnabled: opportunity.reminderEnabled,
		savedAt: opportunity.savedAt,
	};
	const encoded = btoa(
		String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload))),
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	return `${taxPlanAppUrl()}?add=${encoded}`;
}
