/** Generate a human-readable label from a video height value. */
export function qualityLabel(height: number): string {
	if (height >= 2160) return "4K";
	if (height >= 1440) return "1440p";
	if (height >= 1080) return "1080p";
	if (height >= 720) return "720p";
	if (height >= 480) return "480p";
	if (height >= 360) return "360p";
	if (height >= 240) return "240p";
	return `${height}p`;
}
