## 1.2 Ad Verification

VPAID, the Video Player-Ad Interface Definition, was originally designed to support interactive ads that controlled the entirety of creative execution. As this was, at the time, the only way to execute code at impression time, ad verification services adopted VPAID in order to run code that verifies and measures playback (including viewability).

An unfortunate side effect of this approach is that, rather than simply enabling monitoring of player-controlled video playback, responsibility for creative rendering is placed on the verification service. In many cases, multiple data-collection VPAID "wrappers" may be used, leading to a fragile chain of intermediaries in the critical path which can significantly delay page rendering and create a negative experience for the viewer.

In order to support verification with minimal impact to performance, VAST 4 separates media resources from those intended for measurement.

### 1.2.1 Loading Verification Resources

The `<AdVerifications>` element provides a place for verification vendors to specify their executable resources and related metadata, as described in section 3.16. The IAB Tech Lab strongly recommends using code that supports the Open Measurement Interface Definition (OMID) for this purpose, and strongly against using VPAID (which is being retired). OMID has been designed from the ground up to support the needs of verification efficiently, while providing a level of flexibility and transparency that was unavailable in previous VAST generations.

See section 3.16 for details.