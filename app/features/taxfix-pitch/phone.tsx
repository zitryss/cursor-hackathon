import {
	formatEuro,
	MONEY,
	type PitchFrame,
} from "~/features/taxfix-pitch/pitch-timeline";

const SUGGESTIONS = {
	laptop: {
		merchant: "MediaMarkt",
		title: "Work laptop",
		amount: MONEY.laptopSpend,
		reason: "Work equipment for your hybrid job.",
		impact: MONEY.laptopRefund,
	},
	chair: {
		merchant: "IKEA",
		title: "Home-office chair",
		amount: MONEY.chairSpend,
		reason: "Desk equipment for days you work from home.",
		impact: MONEY.chairRefund,
	},
	coffee: {
		merchant: "Bonanza Coffee",
		title: "Flat white",
		amount: MONEY.coffeeSpend,
		reason: "Looks like a personal treat — not a work cost.",
		impact: 0,
	},
} as const;

export function PhoneChrome({ children }: { children: React.ReactNode }) {
	return (
		<div className="pitch-phone">
			<div className="pitch-phone-bezel">
				<div className="pitch-phone-island" />
				<div className="pitch-phone-status">
					<span>9:41</span>
					<span>Taxfix</span>
					<span>5G</span>
				</div>
				<div className="pitch-phone-screen">{children}</div>
			</div>
		</div>
	);
}

export function PhoneApp({ frame }: { frame: PitchFrame }) {
	return (
		<div className="pitch-app">
			<header className="pitch-app-bar">
				<div className="pitch-mark" aria-hidden="true">
					%
				</div>
				<div>
					<p className="pitch-app-kicker">Your 2025 return</p>
					<p className="pitch-app-user">Maya K. · Berlin</p>
				</div>
			</header>

			<section className="pitch-refund" aria-live="polite">
				<p className="pitch-refund-label">Estimated refund</p>
				<p className="pitch-refund-value">{formatEuro(frame.refundEuro)}</p>
			</section>

			{frame.phoneKind === "home" ? (
				<HomeScreen showCard={frame.showCard} />
			) : null}
			{frame.phoneKind === "suggestion" && frame.suggestion ? (
				<SuggestionScreen frame={frame} />
			) : null}
			{frame.phoneKind === "documents" ? <DocumentsScreen /> : null}
			{frame.phoneKind === "calendar" ? <CalendarScreen /> : null}
			{frame.phoneKind === "ready" ? <ReadyScreen /> : null}

			{frame.finger.visible ? (
				<div
					className={`pitch-finger${frame.finger.pressing ? " is-pressing" : ""}`}
					style={{ left: `${frame.finger.x}%`, top: `${frame.finger.y}%` }}
					aria-hidden="true"
				/>
			) : null}
		</div>
	);
}

function HomeScreen({ showCard }: { showCard: boolean }) {
	return (
		<div className="pitch-stack">
			{showCard ? <DebitCard /> : <EmptyYear />}
			<ul className="pitch-nav">
				<li className="is-active">Home</li>
				<li>Documents</li>
				<li>Card</li>
			</ul>
		</div>
	);
}

function EmptyYear() {
	return (
		<div className="pitch-empty">
			<p>Nothing filed yet this year.</p>
			<p>Come back in April — or pay with Taxfix every day.</p>
		</div>
	);
}

function DebitCard() {
	return (
		<article className="pitch-card" aria-label="Taxfix debit card">
			<div className="pitch-card-top">
				<span>TAXFIX</span>
				<span>Debit</span>
			</div>
			<div className="pitch-card-chip" />
			<p className="pitch-card-pan">•••• 4412</p>
			<div className="pitch-card-bottom">
				<span>MAYA K.</span>
				<span className="pitch-card-percent">%</span>
			</div>
		</article>
	);
}

function SuggestionScreen({ frame }: { frame: PitchFrame }) {
	if (!frame.suggestion) {
		return null;
	}

	const item = SUGGESTIONS[frame.suggestion];
	const keepHot = frame.highlight === "keep";
	const skipHot = frame.highlight === "skip";

	return (
		<div className="pitch-stack">
			<div className="pitch-push">
				<p>This looks deductible</p>
				<p>
					{item.merchant} · {formatEuro(item.amount)}
				</p>
			</div>
			<article className="pitch-suggest">
				<h3>{item.title}</h3>
				<p>{item.reason}</p>
				<p className="pitch-suggest-impact">
					{item.impact > 0
						? `Est. refund ${formatEuro(item.impact)}`
						: "No refund impact"}
				</p>
				<div className="pitch-actions">
					<span className={keepHot ? "is-hot" : undefined}>Keep</span>
					<span className={skipHot ? "is-hot is-skip" : undefined}>Skip</span>
				</div>
				{frame.decision ? (
					<p className="pitch-decision">
						{frame.decision === "keep" ? "Saved to Documents" : "Skipped"}
					</p>
				) : null}
			</article>
		</div>
	);
}

function DocumentsScreen() {
	return (
		<div className="pitch-stack">
			<h3 className="pitch-section-title">Documents</h3>
			<ul className="pitch-docs">
				<li>
					<span>Work laptop</span>
					<span>{formatEuro(MONEY.laptopSpend)}</span>
				</li>
				<li>
					<span>Home-office chair</span>
					<span>{formatEuro(MONEY.chairSpend)}</span>
				</li>
			</ul>
			<p className="pitch-roundup">
				Round-up this month: {formatEuro(MONEY.roundUpMonth)} filed
			</p>
		</div>
	);
}

const CALENDAR_MONTHS = [
	{ id: "jan", letter: "J", on: false },
	{ id: "feb", letter: "F", on: true },
	{ id: "mar", letter: "M", on: true },
	{ id: "apr", letter: "A", on: true },
	{ id: "may", letter: "M", on: true },
	{ id: "jun", letter: "J", on: true },
	{ id: "jul", letter: "J", on: true },
	{ id: "aug", letter: "A", on: true },
	{ id: "sep", letter: "S", on: true },
	{ id: "oct", letter: "O", on: true },
	{ id: "nov", letter: "N", on: true },
	{ id: "dec", letter: "D", on: true },
] as const;

function CalendarScreen() {
	return (
		<div className="pitch-stack">
			<h3 className="pitch-section-title">Card pings this year</h3>
			<ol className="pitch-cal">
				{CALENDAR_MONTHS.map((month) => (
					<li key={month.id} className={month.on ? "is-on" : undefined}>
						{month.letter}
					</li>
				))}
			</ol>
			<p className="pitch-roundup">11 taps. Filing is already underway.</p>
		</div>
	);
}

function ReadyScreen() {
	return (
		<div className="pitch-ready">
			<p>Ready for April</p>
			<p>{formatEuro(MONEY.totalRefund)}</p>
		</div>
	);
}
