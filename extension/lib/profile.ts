import { DEMO_PROFILE, type TaxLensProfile } from "@taxfix/taxlens-core";

/**
 * The scoped slice of the Taxfix account the extension is allowed to read.
 *
 * A production build fetches this once after the user connects their account:
 * enough to produce an estimate, never the tax return itself. The prototype
 * ships the demo profile so the panel works without a login.
 */
export function connectedProfile(): TaxLensProfile {
	return DEMO_PROFILE;
}
