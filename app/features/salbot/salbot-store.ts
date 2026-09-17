import type { DeductibilityVerdict } from "~/features/year-file/deductibility";

const CHAT_KEY = "salbot-chat-v1";

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
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function saveChat(messages: SalBotMessage[]): void {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

export function clearChat(): void {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.removeItem(CHAT_KEY);
}
