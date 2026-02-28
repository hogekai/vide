## 7. Error Handling and Timeouts

If the media cannot be played the player should terminate the ad and fire an error using the standard VAST errors.

If either the interactive ad or player wants to terminate with an error the player should fire a 902 error. In cases where this is not possible like live server side ad insertion the player should remove the ad overlay and continue tracking quartiles and completion.

The ad or player should pass a specific error code to indicate why it errored out. The ad can also hand back a string with extra details about the error.