import { omid } from "../omid/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
ns.omid = omid;
