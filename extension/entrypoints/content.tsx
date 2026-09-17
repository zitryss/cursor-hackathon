import ReactDOM from "react-dom/client";
import { createShadowRootUi, defineContentScript } from "#imports";

import { TaxLensPanel } from "../components/TaxLensPanel";
import { detectProduct, isSupportedCategory } from "../lib/product-detector";
import { connectedProfile } from "../lib/profile";
import "../components/taxlens.css";

/**
 * The trigger surface.
 *
 * Reads the product the page already publishes, decides whether a work-expense
 * estimate is plausible, and mounts the panel inside a shadow root so the
 * retailer's CSS and TaxLens never touch each other.
 */
export default defineContentScript({
	matches: [
		"http://localhost/*",
		"http://127.0.0.1/*",
		"https://*.amazon.de/*",
		"https://*.mediamarkt.de/*",
		"https://*.notebooksbilliger.de/*",
	],
	runAt: "document_idle",
	cssInjectionMode: "ui",

	async main(ctx) {
		const product = detectProduct();
		if (!product || !isSupportedCategory(product)) {
			// Nothing plausible on this page: stay silent rather than guess.
			return;
		}

		const ui = await createShadowRootUi(ctx, {
			name: "taxfix-taxlens",
			position: "overlay",
			anchor: "body",
			onMount(container) {
				const root = ReactDOM.createRoot(container);
				root.render(
					<TaxLensPanel
						product={product}
						profile={connectedProfile()}
						productUrl={location.href}
					/>,
				);
				return root;
			},
			onRemove(root) {
				root?.unmount();
			},
		});

		ui.mount();
	},
});
