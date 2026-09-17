/**
 * TaxLens — point-of-purchase tax estimate.
 *
 * Deliberately simplified prototype maths. This is an illustrative estimate,
 * not guaranteed tax advice: real treatment depends on employment status, tax
 * year, total work-related expenses, allowances, depreciation rules,
 * employer reimbursement, VAT status and documentation quality.
 */

export interface TaxLensProduct {
	name: string;
	category: string;
	/** Retail price in EUR, gross. */
	price: number;
	currency: "EUR";
	retailer: string;
	specs: readonly string[];
}

export interface TaxLensProfile {
	name: string;
	country: string;
	taxYear: number;
	employmentType: "employee" | "freelancer";
	estimatedAnnualIncome: number;
	/** Illustrative marginal rate used for the estimate (0–1). */
	estimatedMarginalTaxRate: number;
	/** Pre-filled professional-use share (0–1). */
	defaultProfessionalUse: number;
	/** Whether the employee lump-sum allowance is already exceeded. */
	aboveEmployeeAllowance: boolean;
}

export interface TaxLensEstimate {
	/** Share of the price that may be tax-relevant, in EUR. */
	taxRelevantAmount: number;
	/** Potential tax effect of that amount, in EUR. */
	estimatedTaxBenefit: number;
	/** Price minus the potential tax benefit, in EUR. */
	taxAdjustedCost: number;
	/** Potential benefit as a share of the price (0–1), for the meter. */
	benefitShareOfPrice: number;
}

export const DEMO_PRODUCT: TaxLensProduct = {
	name: "ProBook 14",
	category: "Laptop",
	price: 2000,
	currency: "EUR",
	retailer: "Elektromarkt",
	specs: ["14-inch display", "32 GB RAM", "1 TB SSD", "2-year warranty"],
};

export const DEMO_PROFILE: TaxLensProfile = {
	name: "Anna",
	country: "Germany",
	taxYear: 2026,
	employmentType: "employee",
	estimatedAnnualIncome: 55_000,
	estimatedMarginalTaxRate: 0.3,
	defaultProfessionalUse: 0.8,
	aboveEmployeeAllowance: true,
};

/** Presets offered next to the professional-use slider. */
export const PROFESSIONAL_USE_PRESETS = [0.5, 0.8, 1] as const;

function roundCents(value: number): number {
	return Math.round(value * 100) / 100;
}

/** Clamp a professional-use share into the 0–1 range TaxLens accepts. */
export function clampProfessionalUse(share: number): number {
	if (!Number.isFinite(share)) {
		return 0;
	}
	return Math.min(1, Math.max(0, share));
}

export function estimateTaxLens(
	price: number,
	professionalUse: number,
	marginalTaxRate: number,
): TaxLensEstimate {
	const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
	const share = clampProfessionalUse(professionalUse);
	const rate = clampProfessionalUse(marginalTaxRate);

	const taxRelevantAmount = roundCents(safePrice * share);
	const estimatedTaxBenefit = roundCents(taxRelevantAmount * rate);
	const taxAdjustedCost = roundCents(safePrice - estimatedTaxBenefit);

	return {
		taxRelevantAmount,
		estimatedTaxBenefit,
		taxAdjustedCost,
		benefitShareOfPrice: safePrice === 0 ? 0 : estimatedTaxBenefit / safePrice,
	};
}

export function formatEuro(amount: number): string {
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
	}).format(amount);
}

export function formatPercent(share: number): string {
	return `${Math.round(clampProfessionalUse(share) * 100)}%`;
}
