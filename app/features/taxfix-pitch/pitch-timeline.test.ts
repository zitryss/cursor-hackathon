import { describe, expect, it } from "vitest";

import {
	BEATS,
	getPitchFrame,
	MONEY,
	PITCH_DURATION_MS,
	PUNCHLINE,
} from "~/features/taxfix-pitch/pitch-timeline";

describe("taxfix pitch timeline", () => {
	it("sums to exactly two minutes", () => {
		const total = BEATS.reduce((sum, beat) => sum + beat.durationMs, 0);
		expect(total).toBe(PITCH_DURATION_MS);
		expect(PITCH_DURATION_MS).toBe(120_000);
	});

	it("keeps refund math internally consistent", () => {
		expect(MONEY.laptopRefund + MONEY.chairRefund).toBe(MONEY.totalRefund);
	});

	it("maps elapsed time onto the locked beat sheet", () => {
		expect(getPitchFrame(0).beat.id).toBe("problem");
		expect(getPitchFrame(14_999).beat.id).toBe("problem");
		expect(getPitchFrame(15_000).beat.id).toBe("card");
		expect(getPitchFrame(32_000).beat.id).toBe("laptop");
		expect(getPitchFrame(50_000).beat.id).toBe("chair");
		expect(getPitchFrame(65_000).beat.id).toBe("coffee");
		expect(getPitchFrame(76_000).beat.id).toBe("vault");
		expect(getPitchFrame(92_000).beat.id).toBe("year");
		expect(getPitchFrame(108_000).beat.id).toBe("end");
	});

	it("freezes the end card at and after 120s", () => {
		const atEnd = getPitchFrame(120_000);
		const after = getPitchFrame(180_000);
		expect(atEnd.beat.id).toBe("end");
		expect(atEnd.complete).toBe(true);
		expect(atEnd.refundEuro).toBe(346);
		expect(atEnd.beat.body).toBe(PUNCHLINE);
		expect(after.beat.id).toBe("end");
		expect(after.elapsedMs).toBe(120_000);
	});

	it("scripts Keep on the laptop, Keep on the chair, Skip on coffee", () => {
		const laptop = getPitchFrame(32_000 + 15_000);
		expect(laptop.suggestion).toBe("laptop");
		expect(laptop.decision).toBe("keep");
		expect(laptop.refundEuro).toBe(MONEY.laptopRefund);

		const chair = getPitchFrame(50_000 + 13_000);
		expect(chair.suggestion).toBe("chair");
		expect(chair.decision).toBe("keep");
		expect(chair.refundEuro).toBe(MONEY.totalRefund);

		const coffee = getPitchFrame(65_000 + 8_000);
		expect(coffee.suggestion).toBe("coffee");
		expect(coffee.decision).toBe("skip");
		expect(coffee.refundEuro).toBe(MONEY.totalRefund);
	});
});
