/**
 * Lightweight deductibility heuristic for the Year File pulse demo.
 * Plain-language answers only — not tax advice.
 */

export type DeductibilityVerdict = "likely" | "maybe" | "unlikely";

export interface DeductibilityRule {
  verdict: DeductibilityVerdict;
  keywords: readonly string[];
  why: string;
  /** Assumed deductible share of the amount for rough € impact (0–1). */
  share: number;
}

/** Demo marginal rate for rough YTD tax impact (€). */
export const DEMO_MARGINAL_RATE = 0.3;

export const DEDUCTIBILITY_RULES: readonly DeductibilityRule[] = [
  {
    verdict: "likely",
    keywords: [
      "home office",
      "büro",
      "laptop",
      "notebook",
      "monitor",
      "software",
      "saas",
      "coworking",
      "fachliteratur",
      "fortbildung",
      "kurs",
      "seminar",
      "berufsverband",
      "kammer",
      "arbeitsmittel",
      "steuersoftware",
      "steuerberater",
      "tax advisor",
      "berater",
      "headset",
      "tastatur",
      "maus",
    ],
    why: "Reads like a work tool or training cost — the kind of line you want on file before April.",
    share: 1,
  },
  {
    verdict: "maybe",
    keywords: [
      "handy",
      "phone",
      "internet",
      "mobilfunk",
      "bahn",
      "train",
      "flug",
      "flight",
      "hotel",
      "reise",
      "travel",
      "taxi",
      "uber",
      "kilometer",
      "fahrt",
    ],
    why: "Often partly business — keep the receipt and decide the split with a clear head later.",
    share: 0.5,
  },
  {
    verdict: "unlikely",
    keywords: [
      "netflix",
      "spotify",
      "restaurant",
      "lieferung",
      "delivery",
      "groceries",
      "einkauf",
      "supermarkt",
      "urlaub",
      "vacation",
      "ferien",
      "kaffee",
      "coffee",
      "bar",
      "kino",
      "cinema",
      "gym",
      "fitness",
    ],
    why: "Looks personal. Logging it still sharpens your eye — knowing what is not deductible is power.",
    share: 0,
  },
];

export interface DeductibilityResult {
  verdict: DeductibilityVerdict;
  why: string;
  share: number;
  matchedKeyword: string | null;
}

export function assessDeductibility(description: string): DeductibilityResult {
  const haystack = description.trim().toLowerCase();
  if (!haystack) {
    return {
      verdict: "maybe",
      why: "Add a short label so we can read the spend like a financially savvy human would.",
      share: 0.25,
      matchedKeyword: null,
    };
  }

  for (const rule of DEDUCTIBILITY_RULES) {
    for (const keyword of rule.keywords) {
      if (haystack.includes(keyword)) {
        return {
          verdict: rule.verdict,
          why: rule.why,
          share: rule.share,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return {
    verdict: "maybe",
    why: "No strong signal either way — filed for later judgment. Clarity beats guessing under deadline pressure.",
    share: 0.25,
    matchedKeyword: null,
  };
}

export function roughTaxImpactEuro(amountEuro: number, share: number): number {
  if (!Number.isFinite(amountEuro) || amountEuro <= 0) {
    return 0;
  }
  return Math.round(amountEuro * share * DEMO_MARGINAL_RATE * 100) / 100;
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function verdictLabel(verdict: DeductibilityVerdict): string {
  switch (verdict) {
    case "likely":
      return "Likely deductible";
    case "maybe":
      return "Maybe — keep the receipt";
    case "unlikely":
      return "Probably not deductible";
  }
}
