import { defineConfig } from "wxt";

/**
 * TaxLens is a trigger surface, not the product. It detects a potentially
 * tax-relevant purchase, renders a local estimate, and — only on an explicit
 * click — hands the item to the Taxfix Tax Plan.
 *
 * Permissions stay deliberately narrow: no tabs, no history, no background
 * browsing access, and host permissions limited to the retailers TaxLens
 * actually supports.
 */
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: {
		name: "TaxLens by Taxfix",
		short_name: "TaxLens",
		description:
			"See the potential tax-adjusted price before you buy, and save it to your Taxfix Tax Plan.",
		permissions: ["storage"],
		host_permissions: [
			"http://localhost/*",
			"http://127.0.0.1/*",
			"https://*.amazon.de/*",
			"https://*.mediamarkt.de/*",
			"https://*.notebooksbilliger.de/*",
		],
		action: {
			default_title: "TaxLens — My Tax Plan",
		},
	},
});
