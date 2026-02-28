import { simid } from "../simid/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
ns.simid = simid;
