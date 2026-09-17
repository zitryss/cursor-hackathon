import { useEffect, useEffectEvent, useRef, useState } from "react";

import { PITCH_DURATION_MS } from "~/features/taxfix-pitch/pitch-timeline";

export type PlaybackStatus = "idle" | "playing" | "paused" | "complete";

export function usePitchPlayback() {
	const [elapsedMs, setElapsedMs] = useState(0);
	const [status, setStatus] = useState<PlaybackStatus>("idle");
	const statusRef = useRef(status);
	const elapsedRef = useRef(0);
	const originRef = useRef(0);

	statusRef.current = status;

	const tick = useEffectEvent((now: number) => {
		if (statusRef.current !== "playing") {
			return;
		}

		const next = Math.min(PITCH_DURATION_MS, now - originRef.current);
		elapsedRef.current = next;
		setElapsedMs(next);

		if (next >= PITCH_DURATION_MS) {
			setStatus("complete");
		}
	});

	useEffect(() => {
		if (status !== "playing") {
			return;
		}

		let frame = 0;
		const loop = (now: number) => {
			tick(now);
			if (statusRef.current === "playing") {
				frame = requestAnimationFrame(loop);
			}
		};

		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, [status]);

	function start() {
		if (status === "playing" || status === "complete") {
			return;
		}

		originRef.current = performance.now() - elapsedRef.current;
		setStatus("playing");
	}

	function pause() {
		if (status !== "playing") {
			return;
		}

		setStatus("paused");
	}

	function toggle() {
		if (status === "idle" || status === "paused") {
			start();
			return;
		}

		if (status === "playing") {
			pause();
		}
	}

	const onToggle = useEffectEvent(toggle);

	useEffect(() => {
		function onKey(event: KeyboardEvent) {
			if (event.code !== "Space") {
				return;
			}

			event.preventDefault();
			onToggle();
		}

		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return { elapsedMs, status, start, pause, toggle };
}
