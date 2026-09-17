import type { TaxLensProduct } from "@taxfix/taxlens-core";

/**
 * Reads the product a page is showing, using what the retailer already
 * publishes for search engines. Everything here runs locally in the content
 * script — no page content is transmitted anywhere.
 */

interface JsonLdProduct {
	"@type"?: string | string[];
	name?: string;
	category?: string;
	offers?: JsonLdOffer | JsonLdOffer[];
}

interface JsonLdOffer {
	price?: string | number;
	priceCurrency?: string;
}

/** Categories TaxLens is willing to estimate for. */
const SUPPORTED_CATEGORY_PATTERNS: readonly RegExp[] = [
	/laptop|notebook|computer|macbook|pc\b/i,
	/monitor|display|bildschirm/i,
	/desk|schreibtisch|chair|stuhl|office/i,
	/headset|kopfhörer|keyboard|tastatur|maus|mouse/i,
	/software|lizenz|licence|license|abo|subscription/i,
	/kurs|course|seminar|fortbildung|training/i,
];

function parsePrice(value: string | number | undefined): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}
	if (typeof value !== "string") {
		return null;
	}
	// Accept both "1.999,00" (de-DE) and "1999.00" (en) shapes.
	const cleaned = value.replace(/[^\d.,]/g, "");
	const normalized =
		cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
			? cleaned.replace(/\./g, "").replace(",", ".")
			: cleaned.replace(/,/g, "");
	const parsed = Number.parseFloat(normalized);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function firstOffer(
	offers: JsonLdOffer | JsonLdOffer[] | undefined,
): JsonLdOffer | undefined {
	return Array.isArray(offers) ? offers[0] : offers;
}

function isProductNode(node: JsonLdProduct): boolean {
	const type = node["@type"];
	return Array.isArray(type) ? type.includes("Product") : type === "Product";
}

function flattenJsonLd(value: unknown): JsonLdProduct[] {
	if (Array.isArray(value)) {
		return value.flatMap(flattenJsonLd);
	}
	if (value && typeof value === "object") {
		const node = value as JsonLdProduct & { "@graph"?: unknown };
		const nested = node["@graph"] ? flattenJsonLd(node["@graph"]) : [];
		return [node, ...nested];
	}
	return [];
}

function fromJsonLd(doc: Document): TaxLensProduct | null {
	const scripts = doc.querySelectorAll<HTMLScriptElement>(
		'script[type="application/ld+json"]',
	);

	for (const script of scripts) {
		let parsed: unknown;
		try {
			parsed = JSON.parse(script.textContent ?? "");
		} catch {
			continue;
		}

		for (const node of flattenJsonLd(parsed)) {
			if (!isProductNode(node) || !node.name) {
				continue;
			}
			const offer = firstOffer(node.offers);
			const price = parsePrice(offer?.price);
			if (price === null || (offer?.priceCurrency ?? "EUR") !== "EUR") {
				continue;
			}
			return {
				name: node.name,
				category: node.category ?? "Product",
				price,
				currency: "EUR",
				retailer: doc.location.hostname.replace(/^www\./, ""),
				specs: [],
			};
		}
	}

	return null;
}

function metaContent(doc: Document, property: string): string | null {
	const element = doc.querySelector<HTMLMetaElement>(
		`meta[property="${property}"], meta[name="${property}"]`,
	);
	return element?.content?.trim() || null;
}

function fromOpenGraph(doc: Document): TaxLensProduct | null {
	const name = metaContent(doc, "og:title");
	const price = parsePrice(
		metaContent(doc, "product:price:amount") ??
			metaContent(doc, "og:price:amount") ??
			undefined,
	);
	if (!name || price === null) {
		return null;
	}
	return {
		name,
		category: metaContent(doc, "product:category") ?? "Product",
		price,
		currency: "EUR",
		retailer: doc.location.hostname.replace(/^www\./, ""),
		specs: [],
	};
}

export function detectProduct(doc: Document = document): TaxLensProduct | null {
	return fromJsonLd(doc) ?? fromOpenGraph(doc);
}

/**
 * TaxLens only speaks up for categories where a work-expense estimate is
 * plausible. Everything else stays silent rather than guessing.
 */
export function isSupportedCategory(product: TaxLensProduct): boolean {
	const haystack = `${product.category} ${product.name}`;
	return SUPPORTED_CATEGORY_PATTERNS.some((pattern) => pattern.test(haystack));
}
