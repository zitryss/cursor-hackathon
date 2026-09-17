import { PhoneApp, PhoneChrome } from "~/features/taxfix-pitch/phone";
import {
	PITCH_CREDIT,
	PITCH_HONESTY,
	type PitchFrame,
} from "~/features/taxfix-pitch/pitch-timeline";
import type { PlaybackStatus } from "~/features/taxfix-pitch/use-pitch-playback";

export function PitchStage({
	frame,
	status,
	onToggle,
}: {
	frame: PitchFrame;
	status: PlaybackStatus;
	onToggle: () => void;
}) {
	return (
		<div className="pitch-stage">
			<button
				type="button"
				className="pitch-hitbox"
				onClick={onToggle}
				aria-label={
					status === "idle"
						? "Start pitch"
						: status === "playing"
							? "Pause pitch"
							: status === "paused"
								? "Resume pitch"
								: "Pitch complete"
				}
			/>
			<div className="pitch-copy">
				<p className="pitch-kicker">Taxfix Card · vision</p>
				<h1>{frame.beat.headline}</h1>
				<p className="pitch-body">{frame.beat.body}</p>
			</div>
			<div className="pitch-device">
				<PhoneChrome>
					<PhoneApp frame={frame} />
				</PhoneChrome>
			</div>
			<p className="pitch-credit">
				<span>{PITCH_HONESTY}</span>
				<span aria-hidden="true"> · </span>
				<span>{PITCH_CREDIT}</span>
			</p>
			{status === "idle" ? (
				<p className="pitch-start-hint">Click or press Space to start</p>
			) : null}
		</div>
	);
}
