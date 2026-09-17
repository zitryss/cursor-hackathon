import type { DeductibilityVerdict } from "~/features/year-file/deductibility";

/** Chat transcript only — never year-file-pulse-v1 / salbot-akte-v1. */
export const CHAT_KEY = "salbot-chat-v1";
const MAX_CHAT_MESSAGES = 200;
const MAX_TEXT_LEN = 2000;

export type ChatRole = "user" | "bot";

export interface SalBotMessage {
	id: string;
	role: ChatRole;
	text: string;
	createdAt: string;
	verdict?: DeductibilityVerdict;
	why?: string;
	amountEuro?: number;
	impactEuro?: number;
	description?: string;
	imageNote?: string;
	savedToFile?: boolean;
}

function sanitizeMessage(message: SalBotMessage): SalBotMessage | null {
	if (!message || typeof message !== "object") {
		return null;
	}
	if (message.role !== "user" && message.role !== "bot") {
		return null;
	}
	if (typeof message.id !== "string" || typeof message.text !== "string") {
		return null;
	}
	const amount =
		typeof message.amountEuro === "number" && Number.isFinite(message.amountEuro)
			? message.amountEuro
			: undefined;
	return {
		...message,
		text: message.text.slice(0, MAX_TEXT_LEN),
		amountEuro: amount !== undefined && amount > 0 ? amount : undefined,
	};
}

export function loadChat(): SalBotMessage[] {
	if (typeof window === "undefined") {
		return [];
	}
	try {
		const raw = window.localStorage.getItem(CHAT_KEY);
		if (!raw) {
			return [];
		}
		const parsed = JSON.parse(raw) as SalBotMessage[];
		if (!Array.isArray(parsed)) {
			return [];
		}
		return parsed
			.map(sanitizeMessage)
			.filter((message): message is SalBotMessage => message !== null)
			.slice(-MAX_CHAT_MESSAGES);
	} catch {
		return [];
	}
}

export function saveChat(messages: SalBotMessage[]): void {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.setItem(
		CHAT_KEY,
		JSON.stringify(messages.slice(-MAX_CHAT_MESSAGES)),
	);
}

export function clearChat(): void {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.removeItem(CHAT_KEY);
}
