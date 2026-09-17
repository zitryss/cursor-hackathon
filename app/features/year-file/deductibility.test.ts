import { describe, expect, it } from "vitest";

import {
	assessDeductibility,
	roughTaxImpactEuro,
} from "~/features/year-file/deductibility";
import { computeConfidence } from "~/features/year-file/year-file-store";

describe("assessDeductibility", () => {
	it("flags work tools as likely", () => {
		const result = assessDeductibility("new laptop for client work");
		expect(result.verdict).toBe("likely");
		expect(result.share).toBe(1);
	});

	it("flags personal leisure as unlikely", () => {
		const result = assessDeductibility("Netflix monthly");
		expect(result.verdict).toBe("unlikely");
		expect(result.share).toBe(0);
	});

	it("keeps mixed travel in maybe", () => {
		const result = assessDeductibility("Bahn ticket to workshop");
		expect(result.verdict).toBe("maybe");
	});
});

describe("roughTaxImpactEuro", () => {
	it("applies share and demo marginal rate", () => {
		expect(roughTaxImpactEuro(100, 1)).toBe(30);
		expect(roughTaxImpactEuro(100, 0.5)).toBe(15);
	});
});

describe("computeConfidence", () => {
	it("grows with logged expenses but stays under 100", () => {
		expect(computeConfidence(0)).toBe(8);
		expect(computeConfidence(1)).toBeGreaterThan(8);
		expect(computeConfidence(50)).toBeLessThanOrEqual(92);
	});
});
