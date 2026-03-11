import type { PlaygroundConfig } from "./playground-codegen";

export interface PlaygroundUrlState {
	presetId: string;
	config: PlaygroundConfig;
	customCode?: string;
}

const PREFIX = "#pg=";

export function encodeState(state: PlaygroundUrlState): string {
	return PREFIX + btoa(encodeURIComponent(JSON.stringify(state)));
}

export function decodeState(hash: string): PlaygroundUrlState | null {
	if (!hash.startsWith(PREFIX)) return null;
	try {
		const json = decodeURIComponent(atob(hash.slice(PREFIX.length)));
		const parsed = JSON.parse(json);
		if (!parsed.presetId || !parsed.config?.sourceUrl) return null;
		return parsed as PlaygroundUrlState;
	} catch {
		return null;
	}
}

export function saveToUrl(state: PlaygroundUrlState): void {
	const encoded = encodeState(state);
	history.replaceState(null, "", encoded);
}
