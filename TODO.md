* BUG: Loading of size attribute from stream metadata needs to be dynamic and select the tag that starts with 'NUMBER_OF_BYTES' instead of hardcoding 'NUMBER_OF_BYTES-eng'. A rip from a japanese import BluRay was found that doesn't have the '-eng' suffix.
* BUG: Add metadata propeties derived from tags should be optional
* BUG: Add more validation of stream metadata. if stream metadata isn't in the correct format, the ui will partially disappear and give no indication of what's wrong. this can happen in several case: ffprobe is an old version that doesn't support json, some attributes are missing from streams, etc. This has only been tested with files created by recent versions of makemkv, but are all mkv files like that?

* TESTS: WRITE SOME!

* FEATURE: Add tooltips for button strip.
* FEATURE: Add filter buttons for video/audio/subtitles. Maybe use some of the space in the line with the 'details/raw' tabs.
* FEATURE: Add multi-select for files. If multiple files can be selected, should the stream details include the stream detail cards? or should there be a group header with each group?
* FEATURE: Add preview for subtitles (textarea, like the raw details).
* FEATURE: Add playback where the user can select which streams to use
* FEATURE: Cache file data on first load. This will improve multi-select. Once metadata modification is implemented, the ui might need a refresh button (same row as the details/raw tabs, like the proposed filter buttons?)
* FEATURE: Add background, make the UI less generic
* FEATURE: Remember last window position?
* FEATURE: Add filter for languages. Should be dynamically generated based on languages of all displayed streams
* FEATURE: Add number of channels to audio stream metadata that's displayed
* FEATURE: Add 'forced' attribute to displayed metadata
* FEATURE (suggestion): Add a 'preview' button. This can be embedded in each file's stream data group header in multi-select.
* FEATURE: Add information panel at buttom, similar to VS output pane

* CLEANUP: the state management could use some cleanup. issues:
1. this has been a learning project, and the various docs and tutorials have been used. most state is svelte 5, but some examples and libs from svelte 3/4 have been used (such as component 'export let' to define properties)
2. application state is mostly encapsulated in the renderer/src/state directory, but component initialization is inconsistent. some components grab state directly from app state, while others are given state by their parent. components probably should not grab state directly. I should learn more about the proper model (need to go through advanced svelte tutorial).

* CLEANUP: The raw file details component currently has a hack where the 'setCurrentFile' state API directly updates the textarea height. This was done because textarea is not very friendly and is unable to size itself to its contents. After trying several alternatives, I added this (hopefully temporary) hack to make things work, but this should be fixed. The component should handle its own layout and not rely on state management to do it. The state should be exposed so that a $effect can be used to update the layout.
