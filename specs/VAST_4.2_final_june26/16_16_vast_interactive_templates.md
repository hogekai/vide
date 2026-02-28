# 1.6 VAST Interactive Templates

While interactive video ads command a premium, they are not supported on all platforms or by all publishers. While this is partly due to concerns around VPAID, which are being addressed by VAST4 and the replacement for VPAID, the execution of unknown code may never be allowed in many cases. To address this, VAST 4.1 introduces the concept of "VAST Interactive Templates". These are interactive experiences that only require some visual assets (images, css, etc.) and some instructions/metadata in the VAST tag. The publisher implements the interactive code and uses the metadata to run the interactive ad.

In VAST 4.1 we have included an "end-card" (Section 3.13) based on a use case that has already been informally implemented in the industry. We expect to add more such templates in the future.

**Note** - The IAB Tech Lab recommends the use of VAST extensions for the industry to experiment with such experiences, and then bring in proposals to the Digital Video Technical Working Group to formalize them as standard templates.