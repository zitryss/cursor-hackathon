import { defineBackground } from "#imports";

/**
 * TaxLens keeps almost nothing in the background.
 *
 * There is no browsing monitor and no polling: the content script only runs on
 * the handful of retailers in `host_permissions`, and the popup reads the plan
 * straight from `browser.storage`. This entrypoint exists to open the Taxfix
 * app when the user asks for it.
 */
export default defineBackground(() => {
	// A production build would exchange a scoped Taxfix token here, once, after
	// the user connects their account.
});
