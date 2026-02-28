import { hls } from "../hls/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
ns.hls = hls;
