* BUG: raw tab doesn't populate until after it's opened and a new file is selected. selecting a file then opening the raw tab should display data.
* BUG: Currently selected file in file list should be highlighted.
* BUG: tooltip is currently on the file/directory name text element. This makes the experience inconsistent, because the mouse needs to hover directly on the text, not anywhere in the associated item. Move the 'title' attribute that triggers the tooltip to the parent button element.
* BUG: Add more validation of stream metadata. if stream metadata isn't in the correct format, the ui will partially disappear and give no indication of what's wrong. this can happen in several case: ffprobe is an old version that doesn't support json, some attributes are missing from streams, etc. This has only been tested with files created by recent versions of makemkv, but are all mkv files like that?

* TESTS: WRITE SOME!

* FEATURE: should a directory be opened automatically on program start? last opened directory? or a configured base directory - base directory of rips so the user can then click on the child directory to open. a configured directory seems best.
* FEATURE: Add filter buttons for video/audio/subtitles. Maybe use some of the space in the line with the 'details/raw' tabs
* FEATURE: Add multi-select for files. If multiple files can be selected, should the stream details include the stream detail cards? of should there be a group header with each group?
* FEATURE: Add preview for subtitles (textarea, like the raw details).
* FEATURE: Add playback where the user can select which streams to use
* FEATURE: Cache file data on first load. This will improve multi-select. Once metadata modification is implemented, the ui might need a refresh button (same row as the details/raw tabs, like the proposed filter buttons?)

* CLEANUP: the state management could use some cleanup. issues:
1. this has been a learning project, and the various docs and tutorials have been used. most state is svelte 5, but some examples and libs from svelte 3/4 have been used (such as component 'export let' to define properties)
2. application state is mostly encapsulated in the renderer/src/state directory, but component initialization is inconsistent. some components grab state directly from app state, while others are given state by their parent. components probably should not grab state directly. I should learn more about the proper model (need to go through advanced svelte tutorial).

* CLEANUP: The raw file details component currently has a hack where the 'setCurrentFile' state API directly updates the textarea height. This was done because textarea is not very friendly and is unable to size itself to its contents. After trying several alternatives, I added this (hopefully temporary) hack to make things work, but this should be fixed. The component should handle its own layout and not rely on state management to do it. The state should be exposed so that a $effect can be used to update the layout.
