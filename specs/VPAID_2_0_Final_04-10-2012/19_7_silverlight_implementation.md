# 7 Silverlight Implementation

## 7.1 API Specifics

The Silverlight ad unit will expose the above APIs to support the communication from the video player. As it's not very easy to access getVPAID method on an ad unit, the ad unit will implement "IVPAID" interface. The video player can determine if the ad unit implements "IVPAID" interface and if it does, will understand that the ad unit is a VPAID compliant ad. A video player/ad unit combination may decide that using VPAID is unsafe, but the recommended way would be to use a type safe interface, which defines the above APIs. This type safety can be achieved by using the binary IVPAID interface that the ad unit can implement. The video player will also use this binary interface to check if the ad unit implements the interface and thus can be sure that the ad unit is a VPAID compliant ad. More information about this interface can be found at http://www.iab.net/iab_products_and_industry_services/508676/508950/vpaid).

Following is the interface which VPAID-compliant Silverlight ads will implement (based on above explanation of VPAID.

```csharp
public interface IVPAID {

  #region VPAID Methods

  string handshakeVersion(string version);
  void initAd(uint width, uint height, string viewMode, int desiredBitrate, string creativeData="",
    string environmentVars="");
  void startAd();
  void stopAd();
  void resizeAd(uint width, uint height, string viewMode);
  void pauseAd();
  void resumeAd();
  void expandAd();
  void collapseAd();
  void skipAd();

  #endregion

  #region VPAID Properties

  bool adLinear { get; }
  uint adWidth { get; }
  uint adHeight { get; }
  bool adExpanded { get; }
  bool adSkippableState { get; }
  TimeSpan adRemainingTime { get; }
  TimeSpan adDuration { get; }
  string adCompanions { get; }
  float adVolume { get; set; }
  bool adIcons { get; }

  #endregion

  #region VPAID Events

  event EventHandler AdLoaded;
  event EventHandler AdStarted;
  event EventHandler AdStopped;
  event EventHandler AdSkipped;
  event EventHandler AdPaused;
  event EventHandler AdSizeChange;
  event EventHandler AdPlaying;
  event EventHandler AdExpandedChange;
  event EventHandler AdSkippableStateChange;
  event EventHandler AdLinearChange;
  event EventHandler AdVolumeChange;
  event EventHandler AdVideoStart;
  event EventHandler AdVideoFirstQuartile;
  event EventHandler AdVideoMidPoint;
  event EventHandler AdVideoThirdQuartile;
  event EventHandler AdVideoComplete;
  event EventHandler AdUserAcceptInvitation;
  event EventHandler AdUserClose;
  event EventHandler AdUserMinimize;
  event EventHandler<ClickThroughArgs> AdClickThru;
  event EventHandler<AdInteraction Args> AdInteraction;
  event EventHandler<StringEventArgs> AdError;
  event EventHandler<StringEventArgs> AdLog;
  event EventHandler AdDurationChange;
  event EventHandler AdRemainingTimeChange;
  event EventHandler AdImpression;

  #endregion
}
```

## 7.2 Custom Events

```csharp
#region Event Argument classes

public class StringEventArgs : EventArgs {
  string Message { get; set; }
}

public class ClickThroughArgs : EventArgs {
  public string Url { get; set; }
  public string Id { get; set; }
  public bool PlayerHandles { get; set; }
}

#endregion
```

## 7.3 Security

The Silverlight ad XAP must be served from a domain where policy file allows the ad XAP to be loaded by the video player domain or \*.