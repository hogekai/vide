import { dash } from "../dash/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
ns.dash = dash;
