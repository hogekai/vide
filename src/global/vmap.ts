import { vmap, parseVmap, createScheduler } from "../vmap/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, { vmap, parseVmap, createScheduler });
