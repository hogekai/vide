// === Error Code Constants ===
// Each plugin owns a range. User-facing: compare against these constants.

/** Core: HTMLMediaElement error. */
export const ERR_MEDIA = 1000;

/** HLS: browser does not support MSE or hls.js. */
export const ERR_HLS_UNSUPPORTED = 2000;
/** HLS: dynamic import of hls.js failed. */
export const ERR_HLS_IMPORT = 2001;
/** HLS: fatal hls.js playback error. */
export const ERR_HLS_FATAL = 2002;

/** DASH: dynamic import of dashjs failed. */
export const ERR_DASH_IMPORT = 3000;
/** DASH: dashjs playback error. */
export const ERR_DASH_PLAYBACK = 3001;

/** DRM: no supported key system found. */
export const ERR_DRM_UNSUPPORTED = 4000;
/** DRM: key system detection failed. */
export const ERR_DRM_DETECTION = 4001;
/** DRM: license request failed. */
export const ERR_DRM_LICENSE = 4002;
/** DRM: certificate request failed. */
export const ERR_DRM_CERTIFICATE = 4003;

/** IMA: SDK script failed to load (ad blocker, network error). */
export const ERR_IMA_SDK_LOAD = 5000;
