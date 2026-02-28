/** Select the best media file: prefer mp4, then highest bitrate. */
export function selectMediaFile(
	files: { url: string; mimeType: string; bitrate?: number | undefined }[],
): { url: string; mimeType: string } | null {
	if (files.length === 0) return null;

	const mp4Files = files.filter((f) => f.mimeType === "video/mp4");
	const candidates = mp4Files.length > 0 ? mp4Files : files;

	return candidates.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
}
