// IIFE shim: resolve hls.js from globalThis (loaded via <script> tag)
// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const Hls = (globalThis as any).Hls;
export default Hls;
