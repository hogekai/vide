# 2.1. SIMID vs. VPAID Comparison

*VPAID vs. SIMID APIs*

**SIMID vs. VPAID Comparison.**

| Feature | VPAID | SIMID |
|---|---|---|
| Security | Creative directly accesses player DOM and shared global JavaScript context. | Creative is sandboxed into a cross-origin iframe. No player DOM access or shared JavaScript context. |
| Ad media asset management | Creative manages ad video loading and playback. | Player manages ad media loading and playback (audio or video). |
| Pre-caching | Only the VPAID script can be reliably pre-cached. Video asset cannot be pre-cached. | Audio or video asset and SIMID creative can both be pre-cached. |
| Errors influence on performance or UX | Fatal script errors from ad creative can result in significant player or publisher site performance and user experience deterioration (due to shared security sandbox). | Fatal script errors from ad creative do not affect player or publisher site directly. Impact is limited to performance and user experience of the creative, only. |
| SSAI feasibility | SSAI is not possible. | Interactive creatives can be rendered in SSAI context. |
| Latencies | Publishers are at the mercy of VPAID creative implementation efficiency and uncontrollable internal processes (verification, trading, wrapping, etc.). Each of these behaviors can impose significant latencies. | Players can pre-load media and creative assets due to maintaining full control over decisioning, loading and displaying of the ad unit. Ad decisioning latency is removed, risks of internal processes are minimized due to separate security sandboxes. |
| API | Both the player and creative must support specific JavaScript functions. Each component calls functions directly on the other in a shared security sandbox (insecure). | No functions are directly called on either component by the other. All communication is achieved using standard postMessage API and SIMID messaging protocol across separate security sandboxes. |
| Ad blocking | VPAID can prevent an ad from rendering. | SIMID is built for interactivity and was not designed for ad blocking. The Open Measurement SDK (OMID) is expected to support this capability in the future. |
| Verification services | Verification features can be fully implemented and executed in shared DOM and global Javascript context. | SIMID creative cannot access any DOM, elements, or JS context outside of its own security sandbox so is unable to handle any verification use cases. OMID handles the use case for verification allowing SIMID to be focused on interactivity only. |
| Creative wrapping | VPAID ads can load other ads (including other VPAID ads). | Cannot be executed. |
| Audio advertising | Out of standard scope. | Enables interactive components serving with audio ads. |
| Environment constraints | Player must be an HTML video element. | Player can be native or web so long as the SIMID creative has sandboxed DOM access (such as a web view). |
| Resource MIME type | application/javascript | text/html |