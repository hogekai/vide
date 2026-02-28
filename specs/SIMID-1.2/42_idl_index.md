## IDL Index

```webidl
dictionary MessageArgs {
  required float duration;
};

dictionary MessageArgs {
  required unsigned short error;
  required DOMString message;
};

dictionary MessageArgs {
  required float currentTime;
};

dictionary MessageArgs {
  required float volume;
  required boolean muted;
};

dictionary MessageArgs {
  required unsigned short code;
};

dictionary MessageArgs {
    required unsigned short errorCode;
    DOMString errorMessage;
};

dictionary MessageArgs {
    required EnvironmentData environmentData;
    required CreativeData creativeData;
};

dictionary CreativeData {
    required DOMString adParameters;
    DOMString clickThruUrl;
};

dictionary EnvironmentData {
    required Dimensions videoDimensions;
    required Dimensions creativeDimensions;
    required boolean fullscreen;
    required boolean fullscreenAllowed;
    required boolean variableDurationAllowed;
    required SkippableState skippableState;
    DOMString skipOffset;
    required DOMString version;
    DOMString siteUrl;
    DOMString appId;
    DOMString uxsupport;
    DOMString deviceId;
    boolean muted;
    float volume;
    NavigationSupport navigationSupport;
    CloseButtonSupport closeButtonSupport;
    float nonlinearDuration;
};

dictionary Dimensions {
    required long x;
    required long y;
    required long width;
    required long height;
};

enum SkippableState {"playerHandles", "adHandles", "notSkippable"};
enum NavigationSupport {"adHandles", "playerHandles", "notSupported"};
enum CloseButtonSupport {"adHandles", "playerHandles"};

dictionary MessageArgs {
    required unsigned short errorCode;
    DOMString reason;
};

dictionary MessageArgs {
    required DOMString message;
};

dictionary MessageArgs {
    required Dimensions videoDimensions;
    required Dimensions creativeDimensions;
    required boolean fullscreen;
};

dictionary Dimensions {
    required long x;
    required long y;
    required long width;
    required long height;
};

dictionary MessageArgs {
    required unsigned short errorCode;
    DOMString reason;
};

dictionary MessageArgs {
    short x;
    short y;
    boolean playerHandles;
    DOMString url;
};

dictionary MessageArgs {
    required short errorCode;
    DOMString reason;
};

dictionary MessageArgs {
    required Dimensions creativeDimensions;
};

dictionary Dimensions {
    required long x;
    required long y;
    required long width;
    required long height;
};

dictionary MessageArgs {
    required unsigned short errorCode;
    DOMString errorMessage;
};

dictionary MessageArgs {
    DOMString currentSrc;
    float currentTime;
    float duration;
    boolean ended;
    boolean muted;
    boolean paused;
    float volume;
    boolean fullscreen;
};

dictionary MessageArgs {
    required DOMString message;
};

dictionary MessageArgs {
    required Array trackingUrls;
};

dictionary MessageArgs {
    required unsigned short errorCode;
    DOMString reason;
};

dictionary MessageArgs {
    required float duration;
};

dictionary MessageArgs {
    required float volume;
    required boolean muted;
};

dictionary MessageArgs {
    required string uri;
};

dictionary MessageArgs {
    required Dimensions mediaDimensions;
    required Dimensions creativeDimensions;
};

dictionary Dimensions {
    required long x;
    required long y;
    required long width;
    required long height;
};

dictionary Message {
    required DOMString sessionId;
    required unsigned long messageId;
    required unsigned long timestamp;
    required DOMString type;
    any args;
};

dictionary ResolveMessageArgs {
    required unsigned long messageId;
    any value;
};

dictionary RejectMessageArgsValue {
    unsigned long errorCode;
    DOMString message;
};
```