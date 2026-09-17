export const PITCH_DURATION_MS = 120_000;

export const MONEY = {
	laptopSpend: 1299,
	laptopRefund: 273,
	chairSpend: 349,
	chairRefund: 73,
	coffeeSpend: 4.8,
	roundUpMonth: 12.4,
	totalRefund: 346,
} as const;

export const PUNCHLINE = "Pay every day. Do less in April.";

/** Chrome only — do not put this on a beat; film narration is the headlines. */
export const PITCH_HONESTY =
	"Vision pitch — year-round filing while you spend. Not a live card tonight.";

export const PITCH_CREDIT = "Built with Cursor Agent + multi-agent team";

export type BeatId =
	| "problem"
	| "card"
	| "laptop"
	| "chair"
	| "coffee"
	| "vault"
	| "year"
	| "end";

export type SuggestionItem = "laptop" | "chair" | "coffee";

export type PhoneKind =
	| "home"
	| "suggestion"
	| "documents"
	| "calendar"
	| "ready";

export interface Beat {
	id: BeatId;
	durationMs: number;
	headline: string;
	body: string;
}

export const BEATS: readonly Beat[] = [
	{
		id: "problem",
		durationMs: 15_000,
		headline: "You spend all year. Why file once?",
		body: "Maya opens Taxfix in April — then silence until the next deadline.",
	},
	{
		id: "card",
		durationMs: 17_000,
		headline: "Pay with Taxfix every day.",
		body: "A debit card that files while she spends.",
	},
	{
		id: "laptop",
		durationMs: 18_000,
		headline: "Laptop · €1,299",
		body: "Work equipment, not a gadget.",
	},
	{
		id: "chair",
		durationMs: 15_000,
		headline: "Home-office chair · €349",
		body: "Same job, same desk, same return.",
	},
	{
		id: "coffee",
		durationMs: 11_000,
		headline: "Not everything is a deduction.",
		body: "The app stays quiet when it should.",
	},
	{
		id: "vault",
		durationMs: 16_000,
		headline: "April is already done.",
		body: "Receipts live in Documents. Spare cents round up into the vault.",
	},
	{
		id: "year",
		durationMs: 16_000,
		headline: "A year of keeps. One return.",
		body: "Year-round use is the filing.",
	},
	{
		id: "end",
		durationMs: 12_000,
		headline: "€0 → €346",
		body: PUNCHLINE,
	},
];

export interface FingerState {
	visible: boolean;
	pressing: boolean;
	x: number;
	y: number;
}

export interface PitchFrame {
	elapsedMs: number;
	beatIndex: number;
	beat: Beat;
	beatProgress: number;
	complete: boolean;
	refundEuro: number;
	phoneKind: PhoneKind;
	showCard: boolean;
	suggestion: SuggestionItem | null;
	highlight: "keep" | "skip" | null;
	decision: "keep" | "skip" | null;
	receipts: SuggestionItem[];
	finger: FingerState;
}

const KEEP = { x: 28, y: 78 };
const SKIP = { x: 72, y: 78 };

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, t: number): number {
	return from + (to - from) * clamp(t, 0, 1);
}

function beatWindows(): { id: BeatId; start: number; end: number }[] {
	let start = 0;
	return BEATS.map((beat) => {
		const end = start + beat.durationMs;
		const window = { id: beat.id, start, end };
		start = end;
		return window;
	});
}

export function formatEuro(value: number): string {
	const fractionDigits = Number.isInteger(value) ? 0 : 2;
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: 2,
	}).format(value);
}

export function getPitchFrame(elapsedMs: number): PitchFrame {
	const complete = elapsedMs >= PITCH_DURATION_MS;
	const clamped = complete ? PITCH_DURATION_MS : Math.max(0, elapsedMs);
	const windows = beatWindows();
	let beatIndex = BEATS.length - 1;

	for (const [index, window] of windows.entries()) {
		if (clamped < window.end || index === windows.length - 1) {
			beatIndex = index;
			break;
		}
	}

	if (complete) {
		beatIndex = BEATS.length - 1;
	}

	const beat = BEATS[beatIndex];
	const window = windows[beatIndex];
	const beatProgress = clamp((clamped - window.start) / beat.durationMs, 0, 1);

	return {
		elapsedMs: clamped,
		beatIndex,
		beat,
		beatProgress,
		complete,
		...deriveScene(beat.id, beatProgress),
	};
}

function deriveScene(
	id: BeatId,
	t: number,
): Omit<
	PitchFrame,
	"elapsedMs" | "beatIndex" | "beat" | "beatProgress" | "complete"
> {
	const idleFinger: FingerState = {
		visible: false,
		pressing: false,
		x: 50,
		y: 50,
	};

	if (id === "problem") {
		return {
			refundEuro: 0,
			phoneKind: "home",
			showCard: false,
			suggestion: null,
			highlight: null,
			decision: null,
			receipts: [],
			finger: idleFinger,
		};
	}

	if (id === "card") {
		return {
			refundEuro: 0,
			phoneKind: "home",
			showCard: true,
			suggestion: null,
			highlight: null,
			decision: null,
			receipts: [],
			finger: idleFinger,
		};
	}

	if (id === "laptop") {
		return suggestionScene({
			item: "laptop",
			t,
			refundFrom: 0,
			refundTo: MONEY.laptopRefund,
			action: "keep",
			priorReceipts: [],
		});
	}

	if (id === "chair") {
		return suggestionScene({
			item: "chair",
			t,
			refundFrom: MONEY.laptopRefund,
			refundTo: MONEY.totalRefund,
			action: "keep",
			priorReceipts: ["laptop"],
		});
	}

	if (id === "coffee") {
		return suggestionScene({
			item: "coffee",
			t,
			refundFrom: MONEY.totalRefund,
			refundTo: MONEY.totalRefund,
			action: "skip",
			priorReceipts: ["laptop", "chair"],
		});
	}

	if (id === "vault") {
		return {
			refundEuro: MONEY.totalRefund,
			phoneKind: "documents",
			showCard: true,
			suggestion: null,
			highlight: null,
			decision: null,
			receipts: ["laptop", "chair"],
			finger: idleFinger,
		};
	}

	if (id === "year") {
		return {
			refundEuro: MONEY.totalRefund,
			phoneKind: "calendar",
			showCard: true,
			suggestion: null,
			highlight: null,
			decision: null,
			receipts: ["laptop", "chair"],
			finger: idleFinger,
		};
	}

	return {
		refundEuro: MONEY.totalRefund,
		phoneKind: "ready",
		showCard: true,
		suggestion: null,
		highlight: null,
		decision: null,
		receipts: ["laptop", "chair"],
		finger: idleFinger,
	};
}

function suggestionScene({
	item,
	t,
	refundFrom,
	refundTo,
	action,
	priorReceipts,
}: {
	item: SuggestionItem;
	t: number;
	refundFrom: number;
	refundTo: number;
	action: "keep" | "skip";
	priorReceipts: SuggestionItem[];
}): Omit<
	PitchFrame,
	"elapsedMs" | "beatIndex" | "beat" | "beatProgress" | "complete"
> {
	const showSuggestion = t >= 0.18;
	const target = action === "keep" ? KEEP : SKIP;
	const moving = t >= 0.28 && t < 0.72;
	const pressing = t >= 0.48 && t < 0.62;
	const decided = t >= 0.55;
	const refundT = t >= 0.82 ? 1 : clamp((t - 0.55) / 0.27, 0, 1);

	const receipts =
		decided && action === "keep" ? [...priorReceipts, item] : priorReceipts;

	return {
		refundEuro: Math.round(lerp(refundFrom, refundTo, refundT)),
		phoneKind: showSuggestion ? "suggestion" : "home",
		showCard: true,
		suggestion: showSuggestion ? item : null,
		highlight: showSuggestion ? action : null,
		decision: decided ? action : null,
		receipts,
		finger: {
			visible: moving || pressing,
			pressing,
			x: moving ? lerp(50, target.x, clamp((t - 0.28) / 0.2, 0, 1)) : target.x,
			y: moving ? lerp(62, target.y, clamp((t - 0.28) / 0.2, 0, 1)) : target.y,
		},
	};
}
