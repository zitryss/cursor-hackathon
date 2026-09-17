import {
	assessDeductibility,
	roughTaxImpactEuro,
} from "~/features/year-file/deductibility";
import {
	computeConfidence,
	emptyYearFile,
	type YearFileExpense,
	type YearFileState,
} from "~/features/year-file/year-file-store";

/** SalBot Akte only — never year-file-pulse-v1 (Tax Pulse). */
export const SALBOT_AKTE_KEY = "salbot-akte-v1";

const MAX_DESCRIPTION_LEN = 240;
const MAX_AMOUNT_EURO = 1_000_000;

export function loadSalBotAkte(): YearFileState {
	if (typeof window === "undefined") {
		return emptyYearFile();
	}
	try {
		const raw = window.localStorage.getItem(SALBOT_AKTE_KEY);
		if (!raw) {
			return emptyYearFile();
		}
		const parsed = JSON.parse(raw) as Partial<YearFileState>;
		const expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
		return {
			expenses,
			confidence: computeConfidence(expenses.length),
		};
	} catch {
		return emptyYearFile();
	}
}

export function saveSalBotAkte(state: YearFileState): void {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.setItem(SALBOT_AKTE_KEY, JSON.stringify(state));
}

export function addExpenseToSalBotAkte(
	state: YearFileState,
	input: { description: string; amountEuro: number; id?: string },
): { state: YearFileState; expense: YearFileExpense } | null {
	const description = input.description.trim().slice(0, MAX_DESCRIPTION_LEN);
	const amountEuro = input.amountEuro;
	if (
		!description ||
		!Number.isFinite(amountEuro) ||
		amountEuro <= 0 ||
		amountEuro > MAX_AMOUNT_EURO
	) {
		return null;
	}
	if (input.id && state.expenses.some((expense) => expense.id === input.id)) {
		const existing = state.expenses.find((expense) => expense.id === input.id);
		if (existing) {
			return { state, expense: existing };
		}
	}

	const assessment = assessDeductibility(description);
	const expense: YearFileExpense = {
		id: input.id ?? crypto.randomUUID(),
		description,
		amountEuro,
		createdAt: new Date().toISOString(),
		verdict: assessment.verdict,
		why: assessment.why,
		impactEuro: roughTaxImpactEuro(amountEuro, assessment.share),
	};

	const expenses = [expense, ...state.expenses];
	const next: YearFileState = {
		expenses,
		confidence: computeConfidence(expenses.length),
	};
	saveSalBotAkte(next);
	return { state: next, expense };
}
