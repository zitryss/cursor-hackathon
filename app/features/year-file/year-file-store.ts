import {
  assessDeductibility,
  type DeductibilityVerdict,
  roughTaxImpactEuro,
} from "~/features/year-file/deductibility";

const STORAGE_KEY = "year-file-pulse-v1";

export interface YearFileExpense {
  id: string;
  description: string;
  amountEuro: number;
  createdAt: string;
  verdict: DeductibilityVerdict;
  why: string;
  impactEuro: number;
}

export interface YearFileState {
  expenses: YearFileExpense[];
  /** 0–100 filing confidence score that grows with logged pulses. */
  confidence: number;
}

export function emptyYearFile(): YearFileState {
  return { expenses: [], confidence: 8 };
}

export function computeConfidence(expenseCount: number): number {
  // Clever, not nagging: early wins feel real; asymptote leaves headroom.
  const grown = 8 + Math.round(Math.log2(expenseCount + 1) * 28);
  return Math.min(92, grown);
}

export function isInCurrentIsoWeek(isoDate: string, now = new Date()): boolean {
  const created = new Date(isoDate);
  if (Number.isNaN(created.getTime())) {
    return false;
  }
  const start = startOfIsoWeek(now);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return created >= start && created < end;
}

export function startOfIsoWeek(now: Date): Date {
  const day = now.getUTCDay(); // 0 Sun .. 6 Sat
  const isoDay = day === 0 ? 7 : day; // 1 Mon .. 7 Sun
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - (isoDay - 1));
  return start;
}

export function weeklySaveEuro(
  expenses: readonly YearFileExpense[],
  now = new Date(),
): number {
  const week = expenses.filter((expense) =>
    isInCurrentIsoWeek(expense.createdAt, now),
  );
  return ytdImpactEuro(week);
}

export function ytdImpactEuro(expenses: readonly YearFileExpense[]): number {
  return (
    Math.round(
      expenses.reduce((sum, expense) => sum + expense.impactEuro, 0) * 100,
    ) / 100
  );
}

export function loadYearFile(): YearFileState {
  if (typeof window === "undefined") {
    return emptyYearFile();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

export function saveYearFile(state: YearFileState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addExpenseToYearFile(
  state: YearFileState,
  input: { description: string; amountEuro: number },
): { state: YearFileState; expense: YearFileExpense } {
  const assessment = assessDeductibility(input.description);
  const expense: YearFileExpense = {
    id: crypto.randomUUID(),
    description: input.description.trim(),
    amountEuro: input.amountEuro,
    createdAt: new Date().toISOString(),
    verdict: assessment.verdict,
    why: assessment.why,
    impactEuro: roughTaxImpactEuro(input.amountEuro, assessment.share),
  };

  const expenses = [expense, ...state.expenses];
  const next: YearFileState = {
    expenses,
    confidence: computeConfidence(expenses.length),
  };
  saveYearFile(next);
  return { state: next, expense };
}
