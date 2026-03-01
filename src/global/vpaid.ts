import { vpaid } from "../vpaid/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
// biome-ignore lint/suspicious/noAssignInExpressions: intentional ??= for global namespace init
const ns = ((globalThis as any).Vide ??= {});
ns.vpaid = vpaid;
