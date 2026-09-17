import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import {
	clearChat,
	loadChat,
	type SalBotMessage,
	saveChat,
} from "~/features/salbot/salbot-store";
import {
	assessDeductibility,
	formatEuro,
	roughTaxImpactEuro,
	verdictLabel,
} from "~/features/year-file/deductibility";
import {
	addExpenseToYearFile,
	emptyYearFile,
	loadYearFile,
	weeklySaveEuro,
	type YearFileState,
	ytdImpactEuro,
} from "~/features/year-file/year-file-store";

const DEMO_CHIPS = [
	{ label: "coworking 45", text: "coworking day pass 45" },
	{ label: "Bahn 28.50", text: "Bahn to client meeting 28.50" },
	{ label: "Netflix 12.99", text: "Netflix 12.99" },
] as const;

const WELCOME: SalBotMessage = {
	id: "welcome",
	role: "bot",
	createdAt: new Date(0).toISOString(),
	text: "Taxfix in chat. Voice or text a spend — like you already text friends. ~20s: deductible? + why + rough EUR. Honest maybe/no. No nag.",
};

function parseSpend(raw: string): {
	description: string;
	amountEuro: number | null;
} {
	const trimmed = raw.trim();
	const amountMatch = trimmed.match(
		/(?:eur|€)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:eur|€)?/i,
	);
	let amountEuro: number | null = null;
	let description = trimmed;
	if (amountMatch?.[1]) {
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

function buildVerdict(raw: string, hasImage: boolean): SalBotMessage {
	const { description, amountEuro } = parseSpend(raw);
	const assessment = assessDeductibility(description || raw);
	const amount = amountEuro ?? 40;
	const impact = roughTaxImpactEuro(amount, assessment.share);
	const amountLine =
		amountEuro == null
			? `No amount parsed — sketched on ${formatEuro(amount)}.`
			: `Amount: ${formatEuro(amountEuro)}.`;
	const imageLine = hasImage
		? " Image attached (stub — caption-only, no OCR)."
		: "";

	return {
		id: crypto.randomUUID(),
		role: "bot",
		createdAt: new Date().toISOString(),
		text:
			[
				verdictLabel(assessment.verdict) + ".",
				assessment.why,
				amountLine,
				`Rough tax sketch this pulse: ~${formatEuro(impact)}.`,
				"Rough sketch, not tax advice.",
			].join(" ") + imageLine,
		verdict: assessment.verdict,
		why: assessment.why,
		amountEuro: amount,
		impactEuro: impact,
		description: description || raw,
		imageNote: hasImage ? "caption-only" : undefined,
	};
}

export function meta() {
	return [
		{ title: "SalBot / Taxfix Chat Check" },
		{
			name: "description",
			content:
				"Chat a spend — deductible? + why + rough EUR. Experiment. Does not replace Tax Pulse on /.",
		},
	];
}

export default function SalBotRoute() {
	const [ready, setReady] = useState(false);
	const [messages, setMessages] = useState<SalBotMessage[]>([WELCOME]);
	const [input, setInput] = useState("");
	const [imageName, setImageName] = useState<string | null>(null);
	const [listening, setListening] = useState(false);
	const [yearFile, setYearFile] = useState<YearFileState>(emptyYearFile);
	const [voiceHint, setVoiceHint] = useState<string | null>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<{ stop: () => void } | null>(null);

	useEffect(() => {
		const stored = loadChat();
		setMessages(stored.length > 0 ? stored : [WELCOME]);
		setYearFile(loadYearFile());
		setReady(true);
	}, []);

	useEffect(() => {
		if (!ready) {
			return;
		}
		saveChat(messages);
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, ready]);

	const weekly = weeklySaveEuro(yearFile.expenses);
	const ytd = ytdImpactEuro(yearFile.expenses);

	function sendText(raw: string, hasImage: boolean) {
		const trimmed = raw.trim();
		if (!trimmed && !hasImage) {
			return;
		}
		const userText = trimmed || "(image — add a caption next time)";
		const userMsg: SalBotMessage = {
			id: crypto.randomUUID(),
			role: "user",
			createdAt: new Date().toISOString(),
			text: userText,
			imageNote: hasImage ? (imageName ?? "image") : undefined,
		};
		const botMsg = buildVerdict(trimmed || "receipt photo", hasImage);
		setMessages((prev) => [...prev, userMsg, botMsg]);
		setInput("");
		setImageName(null);
	}

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		sendText(input, Boolean(imageName));
	}

	function onSaveToFile(messageId: string) {
		const target = messages.find((message) => message.id === messageId);
		if (!target || target.role !== "bot" || !target.description) {
			return;
		}
		if (target.savedToFile) {
			return;
		}
		const { state } = addExpenseToYearFile(yearFile, {
			description: target.description,
			amountEuro: target.amountEuro ?? 40,
		});
		setYearFile(state);
		setMessages((prev) =>
			prev.map((message) =>
				message.id === messageId
					? {
							...message,
							savedToFile: true,
							text:
								message.text +
								` Saved to dossier. Weekly ${formatEuro(weeklySaveEuro(state.expenses))} / YTD ${formatEuro(ytdImpactEuro(state.expenses))}. Open next week to see the score.`,
						}
					: message,
			),
		);
	}

	function onVoice() {
		const SpeechRecognition =
			typeof window !== "undefined"
				? (
						window as unknown as {
							SpeechRecognition?: new () => SpeechRecognitionLike;
							webkitSpeechRecognition?: new () => SpeechRecognitionLike;
						}
					).SpeechRecognition ||
					(
						window as unknown as {
							webkitSpeechRecognition?: new () => SpeechRecognitionLike;
						}
					).webkitSpeechRecognition
				: undefined;

		if (!SpeechRecognition) {
			const mock = "coworking day pass 45";
			setVoiceHint("No mic API — mock transcript loaded. Edit or send.");
			setInput(mock);
			setListening(false);
			return;
		}

		if (listening && recognitionRef.current) {
			recognitionRef.current.stop();
			setListening(false);
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		recognition.onresult = (event: {
			results: { [index: number]: { [index: number]: { transcript: string } } };
		}) => {
			const transcript = event.results[0]?.[0]?.transcript ?? "";
			setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
			setVoiceHint("Voice captured — tap Send.");
		};
		recognition.onerror = () => {
			setVoiceHint("Voice failed — type it, or tap voice for a mock line.");
			setListening(false);
		};
		recognition.onend = () => {
			setListening(false);
			recognitionRef.current = null;
		};
		recognitionRef.current = recognition;
		setListening(true);
		setVoiceHint("Listening…");
		recognition.start();
	}

	function onResetDemo() {
		clearChat();
		setMessages([WELCOME]);
		setInput("");
		setImageName(null);
		setVoiceHint(null);
	}

	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground"
		>
			<header className="sticky top-0 z-10 space-y-2 border-b border-frame-ink bg-background/95 px-4 py-3 backdrop-blur">
				<div className="flex items-start justify-between gap-2">
					<div>
						<p className="font-ui text-caption uppercase tracking-[0.12em] text-muted-foreground">
							SalBot / Taxfix Chat Check
						</p>
						<h1 className="font-display text-heading-2">Text a spend</h1>
					</div>
					<a
						href="/"
						className="shrink-0 font-ui text-caption uppercase tracking-wide underline text-muted-foreground"
					>
						Tax Pulse /
					</a>
				</div>
				<p className="font-body text-caption text-muted-foreground">
					Useful in November. Honest maybe/no. No nag. Rough sketch, not advice.
				</p>
				<div className="flex items-center justify-between gap-2 border border-frame-ink bg-card px-3 py-2">
					<div>
						<p className="font-ui text-caption uppercase text-muted-foreground">
							Dossier week / YTD
						</p>
						<p className="font-display text-heading-3 tabular-nums">
							{ready ? `${formatEuro(weekly)} / ${formatEuro(ytd)}` : "—"}
						</p>
					</div>
					<p className="font-body text-caption text-muted-foreground">
						conf {ready ? yearFile.confidence : "—"}/100
					</p>
				</div>
			</header>

			<div
				ref={listRef}
				className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4"
				role="log"
				aria-label="Chat"
				aria-live="polite"
			>
				{messages.map((message) => (
					<article
						key={message.id}
						className={
							message.role === "user"
								? "ml-10 self-end rounded-2xl rounded-br-sm border border-frame-ink bg-card px-3 py-2 shadow-hard"
								: "mr-10 self-start rounded-2xl rounded-bl-sm border border-frame-ink bg-annotation px-3 py-2 text-annotation-foreground shadow-hard"
						}
					>
						<p className="font-body text-body-sm whitespace-pre-wrap">
							{message.text}
						</p>
						{message.imageNote ? (
							<p className="mt-1 font-body text-caption opacity-80">
								attach: {message.imageNote}
							</p>
						) : null}
						{message.role === "bot" &&
						message.verdict &&
						message.id !== "welcome" ? (
							<div className="mt-2 flex flex-wrap gap-2">
								<Button
									type="button"
									size="sm"
									variant={message.savedToFile ? "outline" : "default"}
									disabled={message.savedToFile}
									onClick={() => onSaveToFile(message.id)}
								>
									{message.savedToFile ? "Saved to dossier" : "Save to file"}
								</Button>
							</div>
						) : null}
					</article>
				))}
			</div>

			<div className="sticky bottom-0 space-y-2 border-t border-frame-ink bg-background px-3 py-3">
				<div className="flex flex-wrap gap-2">
					{DEMO_CHIPS.map((chip) => (
						<Button
							key={chip.label}
							type="button"
							size="sm"
							variant="outline"
							onClick={() => sendText(chip.text, false)}
						>
							{chip.label}
						</Button>
					))}
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={onResetDemo}
					>
						Reset chat
					</Button>
				</div>

				<form className="space-y-2" onSubmit={onSubmit}>
					<div className="flex gap-2">
						<Button
							type="button"
							variant={listening ? "default" : "outline"}
							size="lg"
							aria-pressed={listening}
							onClick={onVoice}
						>
							{listening ? "Stop" : "Voice"}
						</Button>
						<textarea
							className="min-h-12 flex-1 border border-frame-ink bg-background px-3 py-2 font-body text-body outline-none focus-visible:border-ring"
							value={input}
							onChange={(event) => setInput(event.target.value)}
							placeholder="coworking 45 — like texting a friend"
							rows={2}
						/>
					</div>
					{voiceHint ? (
						<p className="font-body text-caption text-muted-foreground">
							{voiceHint}
						</p>
					) : null}
					<label className="block space-y-1">
						<span className="font-ui text-caption uppercase tracking-wide text-muted-foreground">
							Image stub (optional)
						</span>
						<input
							type="file"
							accept="image/*"
							className="block w-full font-body text-caption"
							onChange={(event) => {
								const file = event.target.files?.[0];
								setImageName(file ? file.name : null);
							}}
						/>
					</label>
					<Button type="submit" className="w-full" size="lg">
						Send
					</Button>
				</form>
				<p className="font-body text-caption text-muted-foreground">
					WhatsApp = docs later. This Telegram-style chat is the live stand-in.
					Film path for Tax Pulse stays on `/`.
				</p>
			</div>
		</main>
	);
}

interface SpeechRecognitionLike {
	lang: string;
	interimResults: boolean;
	maxAlternatives: number;
	onresult:
		| ((event: {
				results: {
					[index: number]: { [index: number]: { transcript: string } };
				};
		  }) => void)
		| null;
	onerror: (() => void) | null;
	onend: (() => void) | null;
	start: () => void;
	stop: () => void;
}
