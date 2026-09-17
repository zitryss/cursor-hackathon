import { PitchStage } from "~/features/taxfix-pitch/pitch-stage";
import { getPitchFrame } from "~/features/taxfix-pitch/pitch-timeline";
import { usePitchPlayback } from "~/features/taxfix-pitch/use-pitch-playback";
import "~/features/taxfix-pitch/pitch.css";

export function meta() {
	return [
		{ title: "Taxfix Card — Pay every day. Do less in April." },
		{
			name: "description",
			content:
				"A two-minute vision pitch: Taxfix Card files while you spend. Not a live issued card.",
		},
	];
}

export default function TaxfixPitchRoute() {
	const playback = usePitchPlayback();
	const frame = getPitchFrame(playback.elapsedMs);

	return (
		<main id="main-content" className="pitch-shell">
			<PitchStage
				frame={frame}
				status={playback.status}
				onToggle={playback.toggle}
			/>
		</main>
	);
}
