## 4.4. Messages from the Creative to the Player

The creative posts messages to the player to requests the ad's state changes, obtain data, and to send notifications. The creative prefixes its messages with the namespace `SIMID:Creative`.

`SIMID:Creative` messages may require the player to accept and process arguments. With some messages, the creative expects the player to respond with resolutions.

Note: In SIMID, the creative initializes the session and posts the first message, `createSession`. See § 8.4 Session Layer.

`SIMID:Creative` messages summary.

| Message type | `args` parameters | Responses |
|---|---|---|
| § 4.4.1 `SIMID:Creative:clickThru` | x y | n/a |
| § 4.4.4 `SIMID:Creative:fatalError` | errorCode errorMessage | n/a |
| § 4.4.5 `SIMID:Creative:getMediaState` | n/a | § 4.4.5.1 resolve |
| § 4.4.6 `SIMID:Creative:log` | message | n/a |
| § 4.4.7 `SIMID:Creative:reportTracking` | trackingUrls | § 4.4.7.1 resolve § 4.4.7.2 reject |
| § 4.4.8 `SIMID:Creative:requestChangeAdDuration` | duration | § 4.4.8.1 resolve § 4.4.8.2 reject |
| § 4.4.9 `SIMID:Creative:requestChangeVolume` | volume muted | § 4.4.9.1 resolve § 4.4.9.2 reject |
| § 4.4.11 `SIMID:Creative:requestExitFullscreen` | n/a | § 4.4.11.1 resolve § 4.4.11.2 reject |
| § 4.4.10 `SIMID:Creative:requestFullscreen` | n/a | § 4.4.10.1 resolve § 4.4.10.2 reject |
| § 4.4.13 `SIMID:Creative:requestPause` | n/a | § 4.4.13.1 resolve § 4.4.13.2 reject |
| § 4.4.14 `SIMID:Creative:requestPlay` | n/a | § 4.4.14.1 resolve § 4.4.14.2 reject |
| § 4.4.15 `SIMID:Creative:requestResize` | n/a | § 4.4.15.1 resolve § 4.4.15.2 reject |
| § 4.4.16 `SIMID:Creative:requestSkip` | n/a | § 4.4.16.1 resolve § 4.4.16.2 reject |
| § 4.4.17 `SIMID:Creative:requestStop` | n/a | § 4.4.17.1 resolve § 4.4.17.2 reject |

### 4.4.1. SIMID:Creative:clickThru

The `SIMID:Creative:clickThru` message notifies the player of a `clickthrough` for event tracking. SIMID delegates clickthrough execution to the creative, including redirecting the user to the landing page. The interactive component posts `clickThru` only when the creative classifies a user interaction as a clickthrough.

The interactive component posts the `Creative:clickThru` message only when the creative classifies a user interaction as a `clickthrough`. To open the landing page in the situations when user interaction does not constitute `clickthrough`, the creative must utilize § 4.4.12 `SIMID:Creative:requestNavigation` message.

Note: Not all clickthrough metrics require the opening of a landing page. The player must assume that a `clickThru` message that does not provide a landing page URL is still a valid `clickthrough` notification, such as in the case of "deep links" or links to the app store in a device.

#### Deep Links

Deep links navigate the user to an app or the app store in a device. The URL for navigating to an app generally contains query parameters that can take a user to a specific view in the app and may involve a process for getting setup before a deep link will be allowed or recognized. For example in iOS, advertisers must register a SKAdNetwork ID for their deep links. SIMID can support launching a deep link, but ad developers must include the relevant details depending on environment in order for the device OS to execute the link.

The message, `clickThru`, is not an explicit media-pausing directive to the player. If the environment permits, the player must pause ad media in all cases when the user navigates away from the player-hosting page or app, including `clickthrough`. See Page Visibility API.

```webidl
dictionary MessageArgs {
  short x;
  short y;
  boolean playerHandles;
  DOMString url;
};
```

**x,**

The click left offset in the creative's coordinate system.

**y,**

The click top offset in the creative's coordinate system.

**playerHandles,**

When `true` - creative requests the player to open the landing page. The creative must not require the player to open the external page if the § 4.3.7 SIMID:Player.init message argument `navigationSupport` value is not `playerHandles`.

**url,**

Landing page address. In the cases when the creative handles landing page redirect internally, it may not provide `url` value. In such scenarios, the creative sets `playerHandles` value to `false`.

*Creative:clickThru Handling*

[Figure: A sequence diagram showing the interaction between user, player, creative, and window. 1) User calls click() on player. 2) A "clickthrough button event" is sent from creative. 3) The player sends clickThru [playerHandles = true] «message» to creative. 4) Creative sends resolve back to player. 5) Player calls open(url) on window.]

1. User clicks on clickthrough button.
2. Creative sets `playerHandles` = `true` and posts § 4.4.1 SIMID:Creative:clickThru message.
3. Player posts §4.4.1.1 resolve message before redirecting user to the landing page.
4. Player opens the landing page window.

### 4.4.1.1. resolve

In the scenarios when the player handles landing page redirects, it responds with `resolve` before the landing page opens.

### 4.4.1.2. reject

The player posts `reject` if the creative requested the player to handle navigation when the player does not implement user redirects, creative fails to provide url, or the url is invalid. The player provides the `errorCode` 1214.

```webidl
dictionary MessageArgs{
  required short errorCode;
  DOMString reason;
};
```

**errorCode,**

1214.

**reason,**

Additional information. For example: "Invalid URL".