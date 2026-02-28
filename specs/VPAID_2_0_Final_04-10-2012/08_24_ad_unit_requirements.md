## 2.4 Ad Unit Requirements

If the ad unit implements VPAID, it must indicate the correct version. The ad unit must implement all methods and properties listed, but can either decline from responding or return a value that indicates that the method or property is not supported. For example, if the ad unit implements VPAID 2.0, then values for properties such as `adCompanions` or `adDuration` should be provided but can provide values that indicate that the property is not in use.

The ad unit should never allow uncaught exceptions to be thrown during calls into VPAID from the video player. See Implementation sections for more specific requirements.