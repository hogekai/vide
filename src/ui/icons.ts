const NS = "http://www.w3.org/2000/svg";

function icon(build: (s: SVGSVGElement) => void): SVGSVGElement {
	const s = document.createElementNS(NS, "svg");
	s.setAttribute("viewBox", "0 0 24 24");
	s.setAttribute("width", "24");
	s.setAttribute("height", "24");
	s.setAttribute("fill", "none");
	s.setAttribute("stroke", "currentColor");
	s.setAttribute("stroke-width", "1.9");
	s.setAttribute("stroke-linecap", "round");
	s.setAttribute("stroke-linejoin", "round");
	s.setAttribute("aria-hidden", "true");
	build(s);
	return s;
}

function p(s: SVGSVGElement, pathData: string): void {
	const el = document.createElementNS(NS, "path");
	el.setAttribute("d", pathData);
	s.appendChild(el);
}

/** Filled polygon (no stroke) — play triangle, speaker cone */
function poly(s: SVGSVGElement, points: string): void {
	const el = document.createElementNS(NS, "polygon");
	el.setAttribute("points", points);
	el.setAttribute("fill", "currentColor");
	el.setAttribute("stroke", "none");
	s.appendChild(el);
}

function ln(
	s: SVGSVGElement,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): void {
	const el = document.createElementNS(NS, "line");
	el.setAttribute("x1", String(x1));
	el.setAttribute("y1", String(y1));
	el.setAttribute("x2", String(x2));
	el.setAttribute("y2", String(y2));
	s.appendChild(el);
}

function fillRect(
	s: SVGSVGElement,
	x: number,
	y: number,
	w: number,
	h: number,
	rx = 0,
): void {
	const el = document.createElementNS(NS, "rect");
	el.setAttribute("x", String(x));
	el.setAttribute("y", String(y));
	el.setAttribute("width", String(w));
	el.setAttribute("height", String(h));
	if (rx) el.setAttribute("rx", String(rx));
	el.setAttribute("fill", "currentColor");
	el.setAttribute("stroke", "none");
	s.appendChild(el);
}

/** Play triangle ▶ */
export function iconPlay(): SVGSVGElement {
	return icon((s) => poly(s, "5 3 19 12 5 21"));
}

/** Pause bars ❚❚ */
export function iconPause(): SVGSVGElement {
	return icon((s) => {
		fillRect(s, 5, 4, 4, 16, 0.5);
		fillRect(s, 15, 4, 4, 16, 0.5);
	});
}

/** Speaker with sound waves (high volume) */
export function iconVolumeHigh(): SVGSVGElement {
	return icon((s) => {
		poly(s, "3 9 3 15 7 15 13 20 13 4 7 9");
		p(s, "M16.5 7.5a5 5 0 0 1 0 9");
		p(s, "M19.5 4.5a9 9 0 0 1 0 15");
	});
}

/** Speaker with one wave (low volume) */
export function iconVolumeLow(): SVGSVGElement {
	return icon((s) => {
		poly(s, "3 9 3 15 7 15 13 20 13 4 7 9");
		p(s, "M16.5 7.5a5 5 0 0 1 0 9");
	});
}

/** Speaker with X (muted) */
export function iconVolumeMute(): SVGSVGElement {
	return icon((s) => {
		poly(s, "3 9 3 15 7 15 13 20 13 4 7 9");
		ln(s, 17, 9, 23, 15);
		ln(s, 23, 9, 17, 15);
	});
}

/** Four corners expanding (enter fullscreen) */
export function iconFullscreenEnter(): SVGSVGElement {
	return icon((s) => {
		p(
			s,
			"M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3",
		);
	});
}

/** Four corners contracting (exit fullscreen) */
export function iconFullscreenExit(): SVGSVGElement {
	return icon((s) => {
		p(s, "M8 3v3a2 2 0 0 1-2 2H3");
		p(s, "M21 8h-3a2 2 0 0 1-2-2V3");
		p(s, "M3 16h3a2 2 0 0 1 2 2v3");
		p(s, "M16 21v-3a2 2 0 0 1 2-2h3");
	});
}

/** Skip forward arrow */
export function iconSkipForward(): SVGSVGElement {
	return icon((s) => {
		poly(s, "5 4 15 12 5 20");
		ln(s, 19, 5, 19, 19);
	});
}

/** External link arrow (arrow-up-right from square) */
export function iconExternalLink(): SVGSVGElement {
	return icon((s) => {
		p(s, "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6");
		p(s, "M15 3h6v6");
		ln(s, 10, 14, 21, 3);
	});
}
