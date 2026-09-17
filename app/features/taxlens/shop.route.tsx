import {
	DEMO_PRODUCT,
	DEMO_PROFILE,
	emptyTaxPlan,
	formatEuro,
	type TaxPlanState,
} from "@taxfix/taxlens-core";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { TaxLensPanel } from "~/features/taxlens/TaxLensPanel";
import { loadTaxPlan, saveTaxPlan } from "~/features/taxlens/tax-plan-store";

export function meta() {
	return [
		{ title: `${DEMO_PRODUCT.name} — Elektromarkt` },
		{
			name: "description",
			content:
				"Mock retailer page used to demonstrate the TaxLens browser extension.",
		},
	];
}

/**
 * Structured data the real extension reads.
 *
 * `extension/lib/product-detector.ts` looks for exactly this — schema.org
 * Product markup that retailers already publish for search engines — so the
 * shipped content script detects this page with no page-specific code.
 */
const productJsonLd = {
	"@context": "https://schema.org",
	"@type": "Product",
	name: DEMO_PRODUCT.name,
	category: DEMO_PRODUCT.category,
	brand: { "@type": "Brand", name: "ProBook" },
	offers: {
		"@type": "Offer",
		price: DEMO_PRODUCT.price,
		priceCurrency: DEMO_PRODUCT.currency,
		availability: "https://schema.org/InStock",
	},
};

export default function ShopRoute() {
	const [plan, setPlan] = useState<TaxPlanState>(emptyTaxPlan);
	const [productUrl, setProductUrl] = useState("");

	useEffect(() => {
		setPlan(loadTaxPlan());
		setProductUrl(window.location.href);
	}, []);

	function onPlanChange(next: TaxPlanState) {
		setPlan(next);
		saveTaxPlan(next);
	}

	return (
		<div className="min-h-dvh bg-slate-100 font-sans text-slate-900">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is a static literal with no user input; this is the standard way to emit structured data.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
			/>

			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
					<span className="text-lg font-black tracking-tight text-blue-700">
						Elektromarkt
					</span>
					<div className="hidden flex-1 sm:block">
						<div className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-400">
							Search 40,000 products…
						</div>
					</div>
					<nav className="flex items-center gap-4 text-sm text-slate-600">
						<span>Account</span>
						<span>Basket (0)</span>
					</nav>
				</div>
			</header>

			<main
				id="main-content"
				className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.4fr_1fr]"
			>
				<div className="grid gap-6">
					<nav className="text-xs text-slate-500" aria-label="Breadcrumb">
						Home / Computers / Laptops / {DEMO_PRODUCT.name}
					</nav>

					<div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-[240px_1fr]">
						<div
							className="grid aspect-square place-items-center rounded-lg bg-slate-100 text-slate-400"
							role="img"
							aria-label={`Product photo of the ${DEMO_PRODUCT.name}`}
						>
							<svg
								viewBox="0 0 120 80"
								className="w-32"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								aria-hidden="true"
							>
								<rect x="18" y="12" width="84" height="52" rx="4" />
								<path d="M6 68h108l-8 8H14z" />
							</svg>
						</div>

						<div className="grid content-start gap-3">
							<h1 className="text-2xl font-black tracking-tight">
								{DEMO_PRODUCT.name}
							</h1>
							<p className="text-sm text-slate-600">
								{DEMO_PRODUCT.category} · lightweight aluminium chassis, built
								for long working days.
							</p>
							<ul className="grid gap-1 text-sm text-slate-600">
								{DEMO_PRODUCT.specs.map((spec) => (
									<li key={spec}>• {spec}</li>
								))}
							</ul>
							<p className="text-xs text-emerald-700">
								In stock · free delivery by Friday
							</p>
						</div>
					</div>

					<section className="rounded-xl border border-slate-200 bg-white p-6">
						<h2 className="text-base font-bold">Product details</h2>
						<p className="mt-2 text-sm leading-relaxed text-slate-600">
							A 14-inch machine that stays quiet under load: 32 GB of memory and
							a 1 TB SSD keep large projects, virtual machines and a browser
							full of tabs moving. Two years of manufacturer warranty are
							included, with an optional extension at checkout.
						</p>
					</section>
				</div>

				<aside className="grid content-start gap-4">
					<div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-6">
						<span className="text-3xl font-black tabular-nums tracking-tight">
							{formatEuro(DEMO_PRODUCT.price)}
						</span>
						<p className="text-xs text-slate-500">
							incl. VAT, plus delivery if applicable
						</p>
						<button
							type="button"
							className="min-h-11 rounded-md bg-blue-700 px-6 font-bold text-white hover:bg-blue-800"
						>
							Add to basket
						</button>
						<button
							type="button"
							className="min-h-11 rounded-md border border-slate-300 px-6 font-bold text-slate-700 hover:bg-slate-50"
						>
							Save for later
						</button>
					</div>

					{/*
					 * Where the extension injects itself. On a real retailer this is a
					 * shadow root mounted by the content script; here it is the same
					 * panel rendered inline so the flow demos without an install.
					 */}
					<TaxLensPanel
						product={DEMO_PRODUCT}
						profile={DEMO_PROFILE}
						productUrl={productUrl}
						plan={plan}
						onPlanChange={onPlanChange}
					/>

					<p className="text-center text-xs text-slate-500">
						{plan.opportunities.length > 0 ? (
							<Link to="/tax-plan" className="underline underline-offset-2">
								{plan.opportunities.length} item
								{plan.opportunities.length === 1 ? "" : "s"} in My Tax Plan →
							</Link>
						) : (
							"TaxLens runs locally. Nothing is sent to Taxfix until you save."
						)}
					</p>
				</aside>
			</main>
		</div>
	);
}
