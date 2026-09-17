import { describe, expect, it } from "vitest";

import {
	clampProfessionalUse,
	DEMO_PRODUCT,
	DEMO_PROFILE,
	estimateTaxLens,
	formatPercent,
} from "./estimate";

describe("estimateTaxLens", () => {
	it("matches the demo scenario: €2,000 laptop at 80% work use", () => {
		const estimate = estimateTaxLens(
			DEMO_PRODUCT.price,
			DEMO_PROFILE.defaultProfessionalUse,
			DEMO_PROFILE.estimatedMarginalTaxRate,
		);

		expect(estimate.taxRelevantAmount).toBe(1600);
		expect(estimate.estimatedTaxBenefit).toBe(480);
		expect(estimate.taxAdjustedCost).toBe(1520);
	});

	it("recalculates when professional use drops to 50%", () => {
		const estimate = estimateTaxLens(2000, 0.5, 0.3);

		expect(estimate.taxRelevantAmount).toBe(1000);
		expect(estimate.estimatedTaxBenefit).toBe(300);
		expect(estimate.taxAdjustedCost).toBe(1700);
	});

	it("leaves the full price standing at 0% professional use", () => {
		const estimate = estimateTaxLens(2000, 0, 0.3);

		expect(estimate.estimatedTaxBenefit).toBe(0);
		expect(estimate.taxAdjustedCost).toBe(2000);
		expect(estimate.benefitShareOfPrice).toBe(0);
	});

	it("rounds to whole cents", () => {
		const estimate = estimateTaxLens(999.99, 0.333, 0.3);

		expect(estimate.taxRelevantAmount).toBe(333);
		expect(estimate.estimatedTaxBenefit).toBe(99.9);
		expect(estimate.taxAdjustedCost).toBe(900.09);
	});

	it("treats an invalid price as zero rather than producing NaN", () => {
		const estimate = estimateTaxLens(Number.NaN, 0.8, 0.3);

		expect(estimate.taxRelevantAmount).toBe(0);
		expect(estimate.taxAdjustedCost).toBe(0);
		expect(estimate.benefitShareOfPrice).toBe(0);
	});
});

describe("clampProfessionalUse", () => {
	it("keeps the share inside 0–1", () => {
		expect(clampProfessionalUse(1.4)).toBe(1);
		expect(clampProfessionalUse(-0.2)).toBe(0);
		expect(clampProfessionalUse(Number.NaN)).toBe(0);
		expect(clampProfessionalUse(0.8)).toBe(0.8);
	});
});

describe("formatPercent", () => {
	it("renders a whole-number percentage", () => {
		expect(formatPercent(0.8)).toBe("80%");
		expect(formatPercent(1)).toBe("100%");
	});
});
