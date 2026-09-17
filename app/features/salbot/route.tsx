import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import {
	addExpenseToSalBotAkte,
	loadSalBotAkte,
	saveSalBotAkte,
} from "~/features/salbot/salbot-akte-store";
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
	emptyYearFile,
	weeklySaveEuro,
	type YearFileState,
	ytdImpactEuro,
} from "~/features/year-file/year-file-store";

const MAX_CHAT_INPUT = 500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const NOT_ADVICE =
	"Keine Steuerberatung / keine Rechtsberatung (StBerG). Heuristik zur Orientierung — not tax advice.";

const DEMO_CHIPS = [
	{ label: "coworking 45", text: "coworking day pass 45" },
	{ label: "Bahn 28.50", text: "Bahn to client meeting 28.50" },
	{ label: "Netflix 12.99", text: "Netflix 12.99" },
] as const;

const DEMO_SCRIPT = [
	{ text: "coworking day pass 45", autoSave: true, context: "work" as const },
	{
		text: "Bahn to client meeting 28.50",
		autoSave: true,
		context: "mixed" as const,
	},
	{ text: "Netflix 12.99", autoSave: false, context: "private" as const },
] as const;

const CONTEXT_CHIPS = [
	{ label: "Work", hint: "work" as const },
	{ label: "Mixed", hint: "mixed" as const },
	{ label: "Private", hint: "private" as const },
];

const ORCH_SEATS = [
	{ name: "Hackermans", detail: "scope · clock" },
	{ name: "Cursor Agent", detail: "Sapne · $50 · 002e4e0→76a4054" },
	{ name: "Titans", detail: "plan · docs" },
	{ name: "coder", detail: "PE · Akte" },
] as const;

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

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
	const [typing, setTyping] = useState(false);
	const [demoRunning, setDemoRunning] = useState(false);
	const [contextHint, setContextHint] = useState<
		"work" | "mixed" | "private" | null
	>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<{ stop: () => void } | null>(null);
	const akteRef = useRef<YearFileState>(emptyYearFile());
	const demoCancelRef = useRef(false);

	useEffect(() => {
		const stored = loadChat();
		setMessages(stored.length > 0 ? stored : [WELCOME]);
		const akte = loadSalBotAkte();
		akteRef.current = akte;
		setYearFile(akte);
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

	function sendText(
		raw: string,
		hasImage: boolean,
		overrideContext?: "work" | "mixed" | "private" | null,
	) {
		const trimmed = raw.trim().slice(0, MAX_CHAT_INPUT);
		if (!trimmed && !hasImage) {
			return null;
		}
		const userText = trimmed || "(image — add a caption next time)";
		const userMsg: SalBotMessage = {
			id: crypto.randomUUID(),
			role: "user",
			createdAt: new Date().toISOString(),
			text: userText,
			imageNote: hasImage ? (imageName ?? "image") : undefined,
		};
		const botMsg = softBeat(
			trimmed || "receipt photo",
			hasImage,
			overrideContext === undefined ? contextHint : overrideContext,
		);
		setMessages((prev) => [...prev, userMsg, botMsg]);
		setInput("");
		setImageName(null);
		return botMsg;
	}

	function saveBotMessage(botMsg: SalBotMessage) {
		if (!botMsg.description) {
			return;
		}
		const amountEuro = botMsg.amountEuro;
		if (
			typeof amountEuro !== "number" ||
			!Number.isFinite(amountEuro) ||
			amountEuro <= 0
		) {
			return;
		}
		const result = addExpenseToSalBotAkte(akteRef.current, {
			description: botMsg.description,
			amountEuro,
			id: `akte-${botMsg.id}`,
		});
		if (!result) {
			return;
		}
		akteRef.current = result.state;
		setYearFile(result.state);
		setMessages((prev) =>
			prev.map((message) =>
				message.id === botMsg.id
					? {
							...message,
							savedToFile: true,
							text:
								message.text +
								` In your Akte. Weekly ${formatEuro(weeklySaveEuro(result.state.expenses))} / YTD ${formatEuro(ytdImpactEuro(result.state.expenses))}.`,
						}
					: message,
			),
		);
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
		saveBotMessage(target);
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
			setVoiceHint("Mic API unavailable — mock transcript ready. Tap Send.");
			setInput("coworking day pass 45");
			setListening(false);
			return;
		}

		if (listening && recognitionRef.current) {
			recognitionRef.current.stop();
			setListening(false);
			return;
		}

		try {
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
				setVoiceHint("Voice failed — mock loaded instead. Edit or tap Send.");
				setInput((prev) => prev || "coworking day pass 45");
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
		} catch {
			setVoiceHint("Mic blocked — mock transcript ready. Tap Send.");
			setInput("coworking day pass 45");
			setListening(false);
		}
	}

	function onResetDemo() {
		demoCancelRef.current = true;
		setDemoRunning(false);
		setTyping(false);
		clearChat();
		const empty = emptyYearFile();
		saveSalBotAkte(empty);
		akteRef.current = empty;
		setYearFile(empty);
		setMessages([WELCOME]);
		setInput("");
		setImageName(null);
		setVoiceHint(null);
		setContextHint(null);
	}

	async function runDemoMode() {
		if (demoRunning) {
			return;
		}
		demoCancelRef.current = true;
		clearChat();
		const empty = emptyYearFile();
		saveSalBotAkte(empty);
		akteRef.current = empty;
		setYearFile(empty);
		setMessages([WELCOME]);
		setInput("");
		setImageName(null);
		setVoiceHint(null);
		setContextHint(null);
		setTyping(false);
		demoCancelRef.current = false;
		setDemoRunning(true);
		await sleep(400);
		if (demoCancelRef.current) {
			setDemoRunning(false);
			return;
		}

		for (const step of DEMO_SCRIPT) {
			if (demoCancelRef.current) {
				break;
			}
			setTyping(true);
			await sleep(900);
			setTyping(false);
			if (demoCancelRef.current) {
				break;
			}
			const botMsg = sendText(step.text, false, step.context);
			await sleep(700);
			if (demoCancelRef.current) {
				break;
			}
			if (botMsg && step.autoSave) {
				saveBotMessage(botMsg);
			}
			await sleep(1000);
		}

		if (!demoCancelRef.current) {
			setTyping(true);
			await sleep(800);
			setTyping(false);
			const close: SalBotMessage = {
				id: crypto.randomUUID(),
				role: "bot",
				createdAt: new Date().toISOString(),
				text: `Weekly ${formatEuro(weeklySaveEuro(akteRef.current.expenses))} in the Akte. I'd text this in November — not because Taxfix nagged me.`,
			};
			setMessages((prev) => [...prev, close]);
		}
		setDemoRunning(false);
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

				<section
					aria-label="Live orchestration"
					className="border border-frame-ink bg-card px-2 py-2"
				>
					<div className="mb-1 flex items-center justify-between gap-2">
						<p className="font-ui text-caption uppercase tracking-wide text-muted-foreground">
							Live orchestration
						</p>
						<a
							className="font-ui text-caption uppercase underline"
							href="/how-we-built"
						>
							How we built
						</a>
					</div>
					<ul className="grid grid-cols-2 gap-1">
						{ORCH_SEATS.map((seat) => (
							<li
								key={seat.name}
								className="border border-frame-ink/40 px-2 py-1"
							>
								<p className="font-ui text-caption font-bold">{seat.name}</p>
								<p className="font-body text-[10px] text-muted-foreground">
									{seat.detail}
								</p>
							</li>
						))}
					</ul>
				</section>

				<p className="font-body text-caption text-muted-foreground">
					Useful in November. Soft certainty. No nag. {NOT_ADVICE}
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
				<Button
					type="button"
					className="w-full"
					size="lg"
					disabled={demoRunning}
					onClick={() => void runDemoMode()}
				>
					{demoRunning ? "Demo running…" : "Demo Mode (one tap)"}
				</Button>
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
				{typing ? (
					<p className="mr-10 self-start rounded-2xl border border-frame-ink bg-annotation px-3 py-2 font-body text-caption text-annotation-foreground">
						SalBot is typing…
					</p>
				) : null}
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
							disabled={demoRunning}
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
							disabled={demoRunning}
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
							disabled={demoRunning}
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
							disabled={demoRunning}
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (!file) {
									setImageName(null);
									return;
								}
								if (
									file.size > MAX_IMAGE_BYTES ||
									!file.type.startsWith("image/")
								) {
									setImageName(null);
									event.target.value = "";
									return;
								}
								setImageName(file.name.slice(0, 120));
							}}
						/>
					</label>
					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={demoRunning}
					>
						Send
					</Button>
				</form>
				<p className="font-body text-caption text-muted-foreground">
					<span className="font-ui uppercase tracking-wide">
						Built with Cursor Agent
					</span>
					{" — "}
					Sapne co-drive · $50 credits ·{" "}
					<a className="underline" href="/how-we-built">
						How we built
					</a>
					. {NOT_ADVICE} Tax Pulse stays on `/`.
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
