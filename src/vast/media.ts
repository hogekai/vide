/** Select the best media file: prefer mp4, then highest bitrate. */
export function selectMediaFile(
	files: {
		url: string;
		mimeType: string;
		bitrate?: number | undefined;
		apiFramework?: string | undefined;
	}[],
): { url: string; mimeType: string } | null {
	if (files.length === 0) return null;

	const playable = files.filter((f) => f.apiFramework !== "VPAID");
	if (playable.length === 0) return null;

	const mp4Files = playable.filter((f) => f.mimeType === "video/mp4");
	const candidates = mp4Files.length > 0 ? mp4Files : playable;

	return candidates.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
}
