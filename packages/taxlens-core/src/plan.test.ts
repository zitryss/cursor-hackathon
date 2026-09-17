import { describe, expect, it } from "vitest";

import {
	addOpportunity,
	demoTaxPlan,
	emptyTaxPlan,
	markInvoiceUploaded,
	nextBestAction,
	type SaveOpportunityInput,
	setOpportunityStatus,
	summarizeTaxPlan,
} from "./plan";

const laptop: SaveOpportunityInput = {
	productName: "ProBook 14",
	retailer: "Elektromarkt",
	productUrl: "https://example.shop/probook-14",
	priceEuro: 2000,
	professionalUse: 0.8,
	marginalTaxRate: 0.3,
	taxYear: 2026,
};

describe("addOpportunity", () => {
	it("captures the estimate and connects the account", () => {
		const { state, opportunity } = addOpportunity(emptyTaxPlan, laptop);

		expect(state.connected).toBe(true);
		expect(state.opportunities).toHaveLength(1);
		expect(opportunity.estimatedTaxBenefitEuro).toBe(480);
		expect(opportunity.status).toBe("considering");
		expect(opportunity.invoiceUploaded).toBe(false);
	});

	it("puts the newest capture first", () => {
		const first = addOpportunity(emptyTaxPlan, laptop).state;
		const second = addOpportunity(first, {
			...laptop,
			productName: "Monitor 27",
		}).state;

		expect(second.opportunities[0]?.productName).toBe("Monitor 27");
	});
});

describe("summarizeTaxPlan", () => {
	it("reports nothing for an empty plan", () => {
		const summary = summarizeTaxPlan([]);

		expect(summary.savedCount).toBe(0);
		expect(summary.readinessPercent).toBe(0);
		expect(nextBestAction(summary)).toContain("Nothing saved yet");
	});

	it("counts a freshly saved item as one of three steps", () => {
		const { state } = addOpportunity(emptyTaxPlan, laptop);
		const summary = summarizeTaxPlan(state.opportunities);

		expect(summary.taxRelevantEuro).toBe(1600);
		expect(summary.estimatedTaxEffectEuro).toBe(480);
		expect(summary.awaitingDecision).toBe(1);
		expect(summary.readinessPercent).toBe(33);
	});

	it("flags a purchase whose invoice is still missing", () => {
		const { state, opportunity } = addOpportunity(emptyTaxPlan, laptop);
		const purchased = setOpportunityStatus(state, opportunity.id, "purchased");
		const summary = summarizeTaxPlan(purchased.opportunities);

		expect(summary.missingInvoices).toBe(1);
		expect(summary.readinessPercent).toBe(67);
		expect(nextBestAction(summary)).toContain("invoice");
	});

	it("reaches full readiness once the invoice is uploaded", () => {
		const { state, opportunity } = addOpportunity(emptyTaxPlan, laptop);
		const documented = markInvoiceUploaded(state, opportunity.id);
		const summary = summarizeTaxPlan(documented.opportunities);

		expect(summary.missingInvoices).toBe(0);
		expect(summary.readinessPercent).toBe(100);
	});

	it("drops a declined item from the money totals but keeps it decided", () => {
		const { state, opportunity } = addOpportunity(emptyTaxPlan, laptop);
		const declined = setOpportunityStatus(state, opportunity.id, "declined");
		const summary = summarizeTaxPlan(declined.opportunities);

		expect(summary.taxRelevantEuro).toBe(0);
		expect(summary.estimatedTaxEffectEuro).toBe(0);
		expect(summary.readinessPercent).toBe(100);
	});

	it("releases the invoice when a purchase is walked back", () => {
		const { state, opportunity } = addOpportunity(emptyTaxPlan, laptop);
		const documented = markInvoiceUploaded(state, opportunity.id);
		const reverted = setOpportunityStatus(
			documented,
			opportunity.id,
			"considering",
		);

		expect(reverted.opportunities[0]?.invoiceUploaded).toBe(false);
	});
});

describe("demoTaxPlan", () => {
	it("seeds an accumulated plan with one invoice outstanding", () => {
		const plan = demoTaxPlan(2026, 0.3);
		const summary = summarizeTaxPlan(plan.opportunities);

		expect(plan.connected).toBe(true);
		expect(summary.savedCount).toBe(3);
		expect(summary.missingInvoices).toBe(1);
		expect(summary.awaitingDecision).toBe(1);
		expect(summary.estimatedTaxEffectEuro).toBeGreaterThan(0);
	});
});
