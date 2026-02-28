## 8.1.4 Ad Rendering and Namespace Management

To provide interoperability between the video player and ad unit implementations, the video player and the ad unit must follow, beyond the API specification, guidelines related to ad loading and rendering. The ad loading and rendering guidelines are described below and include example code.

- In order to avoid namespace collisions across multiple ads on the same page, all ad javascript should be loaded in a friendly iframe, effectively making the ad javascript the only element in the new DOM.
- A standardized global factory function named 'getVPAIDAd()' will be called in the iframe to get an object of the ad and returned to the video player on the content page.
- Any supporting javascript required by the ad unit would need to be loaded by the ad in the friendly iframe.
- This is the same approach as recommended by the IAB Best Practice for Rich Media Ads in Asynchronous Ad Documents.