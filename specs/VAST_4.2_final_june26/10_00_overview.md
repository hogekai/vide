# 1 General Overview

VAST is used to send in-stream ad details to a media player. Historically, the player (client) has received, executed, and tracked streaming video or audio ads. However, with the increase in player devices, the player is often unable to execute anything more than a single stream of content. Players might have compensated for this by using one player for content and loading a secondary player for ad playback. After ad playback, the original player would be reloaded for resuming content playback. This process caused a brief buffering period between player loads.

The solution that has emerged for this challenge is a service that involves inserting ads into a stream of content for the player. The result is a seamless experience for the viewer along with the ability to select ads dynamically for insertion and more sophisticated tracking options.

VAST 4.x includes support for high-quality video formats necessary for long-form video content and server-side tracking for use when ad-stitching is leveraged to reach devices that cannot use client-side tracking methods. Version 4.x also allows embedding optional scripts for viewability and ad verification.