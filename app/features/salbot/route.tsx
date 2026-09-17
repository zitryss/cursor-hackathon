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

const CONTEXT_CHIPS = [
	{ label: "Work", hint: "work" as const },
	{ label: "Mixed", hint: "mixed" as const },
	{ label: "Private", hint: "private" as const },
];

const WELCOME: SalBotMessage = {
	id: "welcome",
	role: "bot",
	createdAt: new Date(0).toISOString(),
	text: 'Drop a scrap like you text a friend — "Bahn 12,40 Buero" or "Laptop 899". One clear beat back. No forms. No nag.',
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

function softBeat(
	raw: string,
	hasImage: boolean,
	contextHint: "work" | "mixed" | "private" | null,
): SalBotMessage {
	const { description, amountEuro } = parseSpend(raw);
	let hay = (description || raw).trim();
	if (contextHint === "work" && !/work|buero|büro|laptop|client/i.test(hay)) {
		hay = `${hay} work`;
	}
	if (
		contextHint === "private" &&
		!/private|pizza|netflix|restaurant/i.test(hay)
	) {
		hay = `${hay} private`;
	}
	if (contextHint === "mixed") {
		hay = `${hay} bahn`;
	}

	const assessment = assessDeductibility(hay || raw);
	const amount = amountEuro ?? 40;
	const impact = roughTaxImpactEuro(amount, assessment.share);
	const win =
		assessment.verdict === "unlikely" || impact <= 0
			? null
			: `+${formatEuro(impact)} this week`;

	const label = description || raw;
	let text: string;
	if (assessment.verdict === "likely") {
		text = win
			? `${label}? If work → typically absetzbar · ${win}. Want it in your Akte?`
			: `${label}? If work → typically absetzbar. Want it in your Akte?`;
	} else if (assessment.verdict === "unlikely") {
		text = "Looks private — skip, or was it a client meal?";
	} else {
		text = win
			? `Mixed signal — keep the receipt · ${win} if the business share holds. Want it in your Akte?`
			: "Mixed signal — keep the receipt. Want it in your Akte?";
	}
	if (hasImage) {
		text += " Photo noted (no OCR — caption did the work).";
	}

	return {
		id: crypto.randomUUID(),
		role: "bot",
		createdAt: new Date().toISOString(),
		text,
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
				"Chat a spend — soft beat + Akte. Experiment. Does not replace Tax Pulse on /.",
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
	const [contextHint, setContextHint] = useState<
		"work" | "mixed" | "private" | null
	>(null);
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
		const botMsg = softBeat(trimmed || "receipt photo", hasImage, contextHint);
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
		if (target?.role !== "bot" || !target.description) {
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
								` In your Akte. Weekly ${formatEuro(weeklySaveEuro(state.expenses))} / YTD ${formatEuro(ytdImpactEuro(state.expenses))}.`,
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
			setVoiceHint("No mic API — mock transcript loaded. Edit or send.");
			setInput("coworking day pass 45");
			setListening(false);
			return;
		}

		if (listening && recognitionRef.current) {
			recognitionRef.current.stop();
			setListening(false);
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.lang = "de-DE";
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		recognition.onresult = (event: {
			results: {
				[index: number]: { [index: number]: { transcript: string } };
			};
		}) => {
			const transcript = event.results[0]?.[0]?.transcript ?? "";
			setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
			setVoiceHint("Voice captured — tap Send.");
		};
		recognition.onerror = () => {
			setVoiceHint("Voice failed — type it, or tap Voice for a mock line.");
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
		setContextHint(null);
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
						className="shrink-0 font-ui text-caption uppercase tracking-wide text-muted-foreground underline"
					>
						Tax Pulse /
					</a>
				</div>
				<p className="font-body text-caption text-muted-foreground">
					Useful in November. Soft certainty. No nag. Rough sketch — not tax
					advice.
				</p>
				<div className="flex items-center justify-between gap-2 border border-frame-ink bg-card px-3 py-2">
					<div>
						<p className="font-ui text-caption uppercase text-muted-foreground">
							Akte week / YTD
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
				role="log"
				aria-label="Chat"
				aria-live="polite"
				className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4"
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
						<p className="whitespace-pre-wrap font-body text-body-sm">
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
								{message.verdict !== "unlikely" || message.savedToFile ? (
									<Button
										type="button"
										size="sm"
										variant={message.savedToFile ? "outline" : "default"}
										disabled={message.savedToFile}
										onClick={() => onSaveToFile(message.id)}
									>
										{message.savedToFile ? "In your Akte" : "Save to Akte"}
									</Button>
								) : (
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => onSaveToFile(message.id)}
									>
										Save anyway
									</Button>
								)}
							</div>
						) : null}
					</article>
				))}
			</div>

			<div className="sticky bottom-0 space-y-2 border-t border-frame-ink bg-background px-3 py-3">
				<div className="flex flex-wrap gap-2">
					{CONTEXT_CHIPS.map((chip) => (
						<Button
							key={chip.label}
							type="button"
							size="sm"
							variant={contextHint === chip.hint ? "default" : "outline"}
							onClick={() =>
								setContextHint((prev) =>
									prev === chip.hint ? null : chip.hint,
								)
							}
						>
							{chip.label}
						</Button>
					))}
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
							placeholder="Laptop 899 — or Bahn 12,40 Buero"
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
					Work / Mixed / Private chips + free text. Rough sketch — not tax
					advice. WhatsApp later. Tax Pulse film path stays on `/`.
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
