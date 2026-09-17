/**
 * Taxfix app persistence for My Tax Plan.
 *
 * The prototype keeps the plan in `localStorage`, so nothing leaves the
 * browser session and no real Taxfix account is involved. All calculations
 * and state transitions come from `@taxfix/taxlens-core`, the same engine the
 * browser extension runs.
 */

import {
	DEMO_PROFILE,
	emptyTaxPlan,
	type SaveOpportunityInput,
	type TaxPlanState,
} from "@taxfix/taxlens-core";

const STORAGE_KEY = "taxfix.tax-plan.v1";

export function loadTaxPlan(): TaxPlanState {
	if (typeof window === "undefined") {
		return emptyTaxPlan;
	}
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return emptyTaxPlan;
		}
		const parsed = JSON.parse(raw) as Partial<TaxPlanState>;
		if (!Array.isArray(parsed.opportunities)) {
			return emptyTaxPlan;
		}
		return {
			connected: Boolean(parsed.connected),
			opportunities: parsed.opportunities,
		};
	} catch {
		return emptyTaxPlan;
	}
}

export function saveTaxPlan(state: TaxPlanState): void {
	if (typeof window === "undefined") {
		return;
	}
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Private-mode browsers can refuse storage; the demo still runs in memory.
	}
}

/**
 * Decode an opportunity handed over by the extension deep link.
 *
 * The payload carries only what the user confirmed on the panel. Anything
 * malformed is ignored rather than trusted.
 */
export function decodeDeepLinkOpportunity(
	encoded: string,
): SaveOpportunityInput | null {
	try {
		const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(
			base64.length + ((4 - (base64.length % 4)) % 4),
			"=",
		);
		const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
		const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Record<
			string,
			unknown
		>;

		if (
			typeof parsed.productName !== "string" ||
			typeof parsed.priceEuro !== "number" ||
			typeof parsed.professionalUse !== "number"
		) {
			return null;
		}

		return {
			id: typeof parsed.id === "string" ? parsed.id : undefined,
			productName: parsed.productName,
			retailer:
				typeof parsed.retailer === "string" ? parsed.retailer : "Unknown shop",
			productUrl:
				typeof parsed.productUrl === "string" ? parsed.productUrl : "",
			priceEuro: parsed.priceEuro,
			professionalUse: parsed.professionalUse,
			marginalTaxRate: DEMO_PROFILE.estimatedMarginalTaxRate,
			taxYear:
				typeof parsed.taxYear === "number"
					? parsed.taxYear
					: DEMO_PROFILE.taxYear,
			reminderEnabled: parsed.reminderEnabled === true,
			savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : undefined,
			source: "extension",
		};
	} catch {
		return null;
	}
}
