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
 */
export const TAX_PLAN_APP_URL = "http://localhost:5173/tax-plan";

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
	return `${TAX_PLAN_APP_URL}?add=${encoded}`;
}
