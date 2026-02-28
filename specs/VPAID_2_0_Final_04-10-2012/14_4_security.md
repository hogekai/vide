## 4 Security

VPAID was designed to allow for unidirectional scripting, where possible. All VPAID methods and properties are on the VPAID member of the ad object, allowing scripting from the video player to the ad unit. However, the ad unit can only send notification of an event to the video player. For client platforms such as Flash, this allows unidirectional scripting from video player to ad unit but prevents the ad unit from scripting into the video player or using a JavaScript bridge to attack the web page.

In some cases a publisher may allow scripting to the video player using ExternalInterface (allowScriptAccess="always"). Allowing script access may be used to support verification services because it allows for transparency around the context in which the ad is being served. However, allowing scripting from the ad to the video player can cause discrepancies in publisher data and poses a security risk. Publishers and advertisers should discuss script access as part of campaign setup.

For each implementation technology represented in sections 6-8, a security subsection provides details necessary for secure implementation.