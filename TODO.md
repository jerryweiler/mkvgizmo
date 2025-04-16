* BUG: Metadata propeties derived from tags should be optional
* BUG: logger doesn't work when implemented as a class (not reactive). figure out why?

* TESTS: WRITE SOME!
some ideas for validation of things I've had to fix over various versions:
* TEST LAYOUT: Test overflow and scrollbars for each component type. Make sure they have them when needed and don't when they shouldn't have them.
* TEST LAYOUT: Test text truncate behavior for nav items and current directory/file items
* TEST LAYOUT: Validate scroll size for nav item list, detail list, and raw details. Make sure bottom of pane is vibile when scrolled to bottom and is not hidden by element below the pane
* TEST LAYOUT: Validate alignment of various elements that should line up (left side of current-directory and navigation items, etc)
* TEST LAYOUT: Verify that panes that get scrollbars have proper margins and that borders of items don't overlap the scrollbar. Eg: nav items should have a small gap between the right side of the buttons and scrollbar.
* TEST LAYOUT: Verify that whole-page scrollbars don't show up with long item lists or long directory/file names
* TEST IPC: Verify IPC call success paths
* TEST IPC: Verify that errors from 'save config' are returned properly. eg: directory doesn't contain ffmpeg or doesn't exist
* TEST IPC: Verify that errors from getMkvDetails are returned properly. eg: file isn't mkv, using ffprobe version that's too old for json (v4 doesn't work)

* FEATURE: Add filter buttons for video/audio/subtitles. Maybe use some of the space in the line with the 'details/raw' tabs.
* FEATURE: Add multi-select for files. If multiple files can be selected, should the stream details include the stream detail cards? or should there be a group header with each group?
* FEATURE: Add preview for subtitles (textarea, like the raw details).
* FEATURE: Add playback where the user can select which streams to use
* FEATURE: Cache file data on first load. This will improve multi-select. Once metadata modification is implemented, the ui might need a refresh button (same row as the details/raw tabs, like the proposed filter buttons?)
* FEATURE: Add background, make the UI less generic
* FEATURE: Remember last window position?
* FEATURE: Add filter for languages. Should be dynamically generated based on languages of all displayed streams
* FEATURE (suggestion): Add a 'preview' button. This can be embedded in each file's stream data group header in multi-select.
* FEATURE: Implement dark mode

* CLEANUP: the state management could use some cleanup. issues:
1. this has been a learning project, and the various docs and tutorials have been used. most state is svelte 5, but some examples and libs from svelte 3/4 have been used (such as component 'export let' to define properties)
2. application state is mostly encapsulated in the renderer/src/state directory, but component initialization is inconsistent. some components grab state directly from app state, while others are given state by their parent. components probably should not grab state directly. I should learn more about the proper model (need to go through advanced svelte tutorial).
* CLEANUP: Implement a snippet/component for buttons. they each repeat about 10 lines (plus more for wrapped lines). needs parameters for text, icon, and onclick handler. nav-item button needs customization for variant.
