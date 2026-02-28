## 4. API Reference

SIMID API is a set of messages and data structures that ad-rendering parties exchange via § 8 Messaging Protocol.

### 4.1. Reference Table

| API | resolve | reject |
|---|---|---|
| § 4.2.1 SIMID:Media:durationchange | n/a | n/a |
| § 4.2.2 SIMID:Media:ended | n/a | n/a |
| § 4.2.3 SIMID:Media:error | n/a | n/a |
| § 4.2.4 SIMID:Media:pause | n/a | n/a |
| § 4.2.5 SIMID:Media:play | n/a | n/a |
| § 4.2.6 SIMID:Media:playing | n/a | n/a |
| § 4.2.7 SIMID:Media:seeked | n/a | n/a |
| § 4.2.8 SIMID:Media:seeking | n/a | n/a |
| § 4.2.9 SIMID:Media:stalled | n/a | n/a |
| § 4.2.10 SIMID:Media:timeupdate | n/a | n/a |
| § 4.2.11 SIMID:Media:volumechange | n/a | n/a |
| § 4.3.1 SIMID:Player:adSkipped | § 4.3.1.1 resolve | n/a |
| § 4.3.2 SIMID:Player:adStopped | § 4.3.2.1 resolve | n/a |
| § 4.3.3 SIMID:Player:appBackgrounded | § 4.3.3.1 resolve | n/a |
| § 4.3.4 SIMID:Player:appForegrounded | n/a | n/a |
| § 4.3.5 SIMID:Player:collapseNonlinear | n/a | n/a |
| § 4.3.6 SIMID:Player:fatalError | § 4.3.6.1 resolve | n/a |
| § 4.3.7 SIMID:Player:init | § 4.3.7.1 resolve | § 4.3.7.2 reject |
| § 4.3.8 SIMID:Player:log | n/a | n/a |
| § 4.3.9 SIMID:Player:resize | n/a | n/a |
| § 4.3.10 SIMID:Player:startCreative | § 4.3.10.1 resolve | § 4.3.10.2 reject |
| § 4.4.1 SIMID:Creative:clickThru | n/a | n/a |
| § 4.4.2 SIMID:Creative:collapseNonlinear | § 4.4.2.1 resolve | n/a |
| § 4.4.3 SIMID:Creative:expandNonlinear | § 4.4.3.1 resolve | § 4.4.3.2 reject |
| § 4.4.4 SIMID:Creative:fatalError | n/a | n/a |
| § 4.4.5 SIMID:Creative:getMediaState | § 4.4.5.1 resolve | n/a |
| § 4.4.6 SIMID:Creative:log | n/a | n/a |
| § 4.4.7 SIMID:Creative:reportTracking | § 4.4.7.1 resolve | § 4.4.7.2 reject |
| § 4.4.8 SIMID:Creative:requestChangeAdDuration | § 4.4.8.1 resolve | § 4.4.8.2 reject |
| § 4.4.9 SIMID:Creative:requestChangeVolume | § 4.4.9.1 resolve | § 4.4.9.2 reject |
| § 4.4.10 SIMID:Creative:requestFullscreen | § 4.4.10.1 resolve | § 4.4.10.2 reject |
| § 4.4.11 SIMID:Creative:requestExitFullscreen | § 4.4.11.1 resolve | § 4.4.11.2 reject |
| § 4.4.13 SIMID:Creative:requestPause | § 4.4.13.1 resolve | § 4.4.13.2 reject |
| § 4.4.14 SIMID:Creative:requestPlay | § 4.4.14.1 resolve | § 4.4.14.2 reject |
| § 4.4.15 SIMID:Creative:requestResize | § 4.4.15.1 resolve | § 4.4.15.2 reject |
| § 4.4.16 SIMID:Creative:requestSkip | § 4.4.16.1 resolve | § 4.4.16.2 reject |
| § 4.4.17 SIMID:Creative:requestStop | § 4.4.17.1 resolve | § 4.4.17.2 reject |