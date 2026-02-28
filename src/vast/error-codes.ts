// === VAST 4.2 Error Codes (Section 2.3.6.3) ===

/** 100: XML parsing error. */
export const VAST_XML_PARSE_ERROR = 100;

/** 101: VAST schema validation error. */
export const VAST_SCHEMA_ERROR = 101;

/** 102: VAST version of response not supported. */
export const VAST_VERSION_UNSUPPORTED = 102;

/** 200: Trafficking error. Media player received an Ad type it was not expecting and/or cannot play. */
export const VAST_TRAFFICKING_ERROR = 200;

/** 201: Media player expecting different linearity. */
export const VAST_LINEARITY_ERROR = 201;

/** 202: Media player expecting different duration. */
export const VAST_DURATION_ERROR = 202;

/** 203: Media player expecting different size. */
export const VAST_SIZE_ERROR = 203;

/** 204: Ad category was required but not provided. */
export const VAST_CATEGORY_REQUIRED = 204;

/** 205: InLine Category violates Wrapper BlockedAdCategories. */
export const VAST_CATEGORY_BLOCKED = 205;

/** 206: Ad Break shortened. Ad was not served. */
export const VAST_BREAK_SHORTENED = 206;

/** 300: General Wrapper error. */
export const VAST_WRAPPER_ERROR = 300;

/** 301: Timeout of VAST URI provided in Wrapper element. */
export const VAST_WRAPPER_TIMEOUT = 301;

/** 302: Wrapper limit reached, too many Wrapper responses with no InLine response. */
export const VAST_WRAPPER_LIMIT = 302;

/** 303: No VAST response after one or more Wrappers. */
export const VAST_NO_ADS = 303;

/** 304: InLine response returned ad unit that failed to result in ad display within defined time limit. */
export const VAST_INLINE_TIMEOUT = 304;

/** 400: General Linear error. Media player is unable to display the Linear Ad. */
export const VAST_LINEAR_ERROR = 400;

/** 401: File not found. Unable to find Linear/MediaFile from URI. */
export const VAST_MEDIA_NOT_FOUND = 401;

/** 402: Timeout of MediaFile URI. */
export const VAST_MEDIA_TIMEOUT = 402;

/** 403: Couldn't find MediaFile that is supported by this media player. */
export const VAST_MEDIA_UNSUPPORTED = 403;

/** 405: Problem displaying MediaFile. MediaFile may include unsupported codecs, different MIME type, etc. */
export const VAST_MEDIA_DISPLAY_ERROR = 405;

/** 406: Mezzanine was required but not provided. Ad not served. */
export const VAST_MEZZANINE_REQUIRED = 406;

/** 407: Mezzanine is in the process of being downloaded. Ad will not be served until mezzanine is transcoded. */
export const VAST_MEZZANINE_DOWNLOADING = 407;

/** 408: Conditional ad rejected (deprecated along with conditionalAd). */
export const VAST_CONDITIONAL_REJECTED = 408;

/** 409: Interactive unit in the InteractiveCreativeFile node was not executed. */
export const VAST_INTERACTIVE_NOT_EXECUTED = 409;

/** 410: Verification unit in the Verification node was not executed. */
export const VAST_VERIFICATION_NOT_EXECUTED = 410;

/** 411: Mezzanine was provided but did not meet required specification. Ad not served. */
export const VAST_MEZZANINE_INVALID = 411;

/** 500: General NonLinearAds error. */
export const VAST_NONLINEAR_ERROR = 500;

/** 501: Unable to display NonLinearAd because creative dimensions do not align with creative display area. */
export const VAST_NONLINEAR_SIZE_ERROR = 501;

/** 502: Unable to fetch NonLinearAds/NonLinear resource. */
export const VAST_NONLINEAR_FETCH_ERROR = 502;

/** 503: Couldn't find NonLinear resource with supported type. */
export const VAST_NONLINEAR_UNSUPPORTED = 503;

/** 600: General CompanionAds error. */
export const VAST_COMPANION_ERROR = 600;

/** 601: Unable to display Companion because creative dimensions do not fit within Companion display area. */
export const VAST_COMPANION_SIZE_ERROR = 601;

/** 602: Unable to display required Companion. */
export const VAST_COMPANION_REQUIRED_ERROR = 602;

/** 603: Unable to fetch CompanionAds/Companion resource. */
export const VAST_COMPANION_FETCH_ERROR = 603;

/** 604: Couldn't find Companion resource with supported type. */
export const VAST_COMPANION_UNSUPPORTED = 604;

/** 900: Undefined Error. */
export const VAST_UNDEFINED_ERROR = 900;

/** 901: General VPAID error. */
export const VAST_VPAID_ERROR = 901;

/** 902: General InteractiveCreativeFile error. */
export const VAST_INTERACTIVE_ERROR = 902;
