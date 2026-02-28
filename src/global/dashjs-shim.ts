// IIFE shim: resolve dashjs from globalThis (loaded via <script> tag)
// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const dashjs = (globalThis as any).dashjs;
export default dashjs;
