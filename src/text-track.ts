import type { VideCue, VideTextTrack } from "./types.js";

export function buildVideTextTrack(
	track: TextTrack,
	index: number,
): VideTextTrack {
	return {
		id: index,
		label: track.label,
		language: track.language,
		kind: track.kind as VideTextTrack["kind"],
		active: track.mode === "showing",
	};
}

export function buildVideCues(cueList: TextTrackCueList | null): VideCue[] {
	if (!cueList) return [];
	const cues: VideCue[] = [];
	for (let i = 0; i < cueList.length; i++) {
		const cue = cueList[i];
		cues.push({
			startTime: cue.startTime,
			endTime: cue.endTime,
			text: (cue as VTTCue).text ?? "",
		});
	}
	return cues;
}
