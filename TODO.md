* BUG: Metadata propeties derived from tags should be optional

Race conditions? Things work fine when loading small files and waiting for
things to populate before selecting another, but there are problems:
* BUG: Clicking multiple files in rapid succession can cause the UI to hang
or the Keyframe tab to stop populating. This shows as unhandled exceptions in
the browser console. Likely issue is that a previous metadata load method is
still processing continuations in the background after the selection changes,
causing data to (potentially) get added to the wrong object.
* BUG: loading a small (<1 minute) file loads fine, but loading a large file
(full anime episode, much less a 4K movie) never loads the keyframe list.
* BUG: Larger files can take a long time to load the keyframe list. See if
there's a way to load the data in smaller chunks.

* TESTS: WRITE SOME!
some ideas for validation of things I've had to fix over various versions:
* TEST LAYOUT: Test overflow and scrollbars for each component type. Make sure
they have them when needed and don't when they shouldn't have them.
* TEST LAYOUT: Test text truncate behavior for nav items and current
directory/file items
* TEST LAYOUT: Validate scroll size for nav item list, detail list, and raw
details. Make sure bottom of pane is vibile when scrolled to bottom and is not
hidden by element below the pane
* TEST LAYOUT: Validate alignment of various elements that should line up (left
side of current-directory and navigation items, etc)
* TEST LAYOUT: Verify that panes that get scrollbars have proper margins and
that borders of items don't overlap the scrollbar. Eg: nav items should have a
small gap between the right side of the buttons and scrollbar.
* TEST LAYOUT: Verify that whole-page scrollbars don't show up with long item
lists or long directory/file names
* TEST IPC: Verify IPC call success paths
* TEST IPC: Verify that errors from 'save config' are returned properly. eg:
directory doesn't contain ffmpeg or doesn't exist
* TEST IPC: Verify that errors from getStreamList are returned properly. eg:
file isn't mkv, using ffprobe version that's too old for json (v4 doesn't work)

* FEATURE: throttle loading of key frame screenshots
* FEATURE: Add multi-select for files. If multiple files can be selected,
should the stream details include the stream detail cards? or should there be a
group header with each group?
* FEATURE: Add preview for subtitles (textarea, like the raw details).
* FEATURE: Add playback where the user can select which streams to use
* FEATURE: Cache file data on first load. This will improve multi-select. Once
metadata modification is implemented, the ui might need a refresh button (same
row as the details/raw tabs, like the proposed filter buttons?)
* FEATURE: Add background, make the UI less generic
* FEATURE: Remember last window position?
* FEATURE: Add filter for languages. Should be dynamically generated based on
languages of all displayed streams
* FEATURE (suggestion): Add a 'preview' button. This can be embedded in each
file's stream data group header in multi-select.
* FEATURE: Implement dark mode
* FEATURE: Add a spinner to the keyframe tab while loading the keyframe list.

* CLEANUP: Implement a snippet/component for buttons. they each repeat about 10
lines (plus more for wrapped lines). needs parameters for text, icon, and
onclick handler. nav-item button needs customization for variant.
