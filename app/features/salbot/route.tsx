import { type FormEvent, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import {
	assessDeductibility,
	type DeductibilityVerdict,
	formatEuro,
	roughTaxImpactEuro,
	verdictLabel,
} from "~/features/year-file/deductibility";

type ChatRole = "user" | "bot";

interface ChatMessage {
	id: string;
	role: ChatRole;
	text: string;
	verdict?: DeductibilityVerdict;
	impactEuro?: number;
	imageNote?: string;
}

function parseSpend(raw: string): {
	description: string;
	amountEuro: number | null;
} {
	const trimmed = raw.trim();
	// Match trailing or embedded amounts: 45, 28.50, 12,99, EUR 45, €45
	const amountMatch = trimmed.match(
		/(?:eur|€)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:eur|€)?/i,
	);
	let amountEuro: number | null = null;
	let description = trimmed;
	if (amountMatch && amountMatch[1]) {
		amountEuro = Number(amountMatch[1].replace(",", "."));
		if (!Number.isFinite(amountEuro) || amountEuro <= 0) {
			amountEuro = null;
		} else {
			description = trimmed
				.replace(amountMatch[0], " ")
				.replace(/\s+/g, " ")
				.trim();
		}
	}
	if (!description) {
		description = trimmed;
	}
	return { description, amountEuro };
}

function botReply(raw: string, hasImage: boolean): ChatMessage {
	const { description, amountEuro } = parseSpend(raw);
	const assessment = assessDeductibility(description || raw);
	const amount = amountEuro ?? 40;
	const impact = roughTaxImpactEuro(amount, assessment.share);
	const amountLabel =
		amountEuro == null
			? `No amount parsed — sketched as ${formatEuro(amount)} for the rough EUR impact.`
			: `Amount read: ${formatEuro(amountEuro)}.`;
	const imageLine = hasImage
		? " Image noted (caption-only for this demo — no OCR)."
		: "";

	const text = [
		verdictLabel(assessment.verdict),
		assessment.why,
		amountLabel,
		`Rough tax sketch: ~${formatEuro(impact)} (not tax advice).`,
		"Telegram-shaped flow: paste spend text here; WhatsApp needs a Business API later — see README-SALBOT.md.",
	].join(" ");

	return {
		id: crypto.randomUUID(),
		role: "bot",
		text: text + imageLine,
		verdict: assessment.verdict,
		impactEuro: impact,
		imageNote: hasImage ? "caption-only" : undefined,
	};
}

export function meta() {
	return [
		{ title: "SalBot — chat deductibility (experiment)" },
		{
			name: "description",
			content:
				"Sal experiment: chat a spend, get deductible? + why + rough EUR. Does not replace Tax Pulse film path.",
		},
	];
}

export default function SalBotRoute() {
	const [input, setInput] = useState("");
	const [imageName, setImageName] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>(() => [
		{
			id: "welcome",
			role: "bot",
			text: "SalBot experiment. Describe a spend (optional amount). I reuse the Tax Pulse deductibility heuristic. This does not replace the / Tax Pulse film path.",
		},
	]);

	const pendingImage = useMemo(() => imageName, [imageName]);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = input.trim();
		if (!trimmed && !pendingImage) {
			return;
		}

		const userText = trimmed || "(image only — add a caption next time)";
		const userMsg: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			text: userText,
			imageNote: pendingImage ?? undefined,
		};
		const reply = botReply(trimmed || "receipt photo", Boolean(pendingImage));
		setMessages((prev) => [...prev, userMsg, reply]);
		setInput("");
		setImageName(null);
	}

	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background px-4 py-6 text-foreground"
		>
			<header className="space-y-2 border-b border-frame-ink pb-4">
				<p className="font-ui text-caption uppercase tracking-[0.12em] text-muted-foreground">
					SalBot · experiment branch
				</p>
				<h1 className="font-display text-heading-1">Chat a spend</h1>
				<p className="font-body text-body-sm text-muted-foreground">
					Text in → deductible? + why + rough EUR. Optional image stub
					(caption-only). Does not replace Tax Pulse on `/`.
				</p>
				<p className="font-body text-caption text-muted-foreground">
					<a className="underline" href="/">
						← Tax Pulse film path
					</a>
				</p>
			</header>

			<section
				aria-label="Chat"
				className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto"
			>
				{messages.map((message) => (
					<div
						key={message.id}
						className={
							message.role === "user"
								? "ml-8 border border-frame-ink bg-card p-3 shadow-hard"
								: "mr-8 border border-frame-ink bg-annotation p-3 text-annotation-foreground shadow-hard"
						}
					>
						<p className="font-ui text-caption uppercase tracking-wide opacity-80">
							{message.role === "user" ? "You" : "SalBot"}
						</p>
						<p className="mt-1 font-body text-body-sm whitespace-pre-wrap">
							{message.text}
						</p>
						{message.imageNote ? (
							<p className="mt-1 font-body text-caption opacity-80">
								attachment: {message.imageNote}
							</p>
						) : null}
					</div>
				))}
			</section>

			<form
				className="mt-4 space-y-2 border-t border-frame-ink pt-4"
				onSubmit={onSubmit}
			>
				<label className="block space-y-1">
					<span className="font-ui text-caption uppercase tracking-wide">
						Message (Telegram-style)
					</span>
					<textarea
						className="min-h-24 w-full border border-frame-ink bg-background px-3 py-2 font-body text-body outline-none focus-visible:border-ring"
						value={input}
						onChange={(event) => setInput(event.target.value)}
						placeholder="coworking day pass 45"
					/>
				</label>

				<label className="block space-y-1">
					<span className="font-ui text-caption uppercase tracking-wide">
						Image stub (optional)
					</span>
					<input
						type="file"
						accept="image/*"
						className="block w-full font-body text-body-sm"
						onChange={(event) => {
							const file = event.target.files?.[0];
							setImageName(file ? file.name : null);
						}}
					/>
					<p className="font-body text-caption text-muted-foreground">
						Upload accepted as stub only — no OCR. Caption the spend in text.
					</p>
				</label>

				<Button type="submit" className="w-full" size="lg">
					Send
				</Button>
			</form>
		</main>
	);
}
