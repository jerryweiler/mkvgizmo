* BUG: Metadata propeties derived from tags should be optional

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

* FEATURE: Add multi-select for files. If multiple files can be selected,
should the stream details include the stream detail cards? or should there be a
group header with each group?
* FEATURE: Cache file data on first load. This will improve multi-select. Once
metadata modification is implemented, the ui might need a refresh button (same
row as the details/raw tabs, like the proposed filter buttons?)
* FEATURE: Add background, make the UI less generic
* FEATURE: Remember last window position?
* FEATURE: Add filter for languages. Should be dynamically generated based on
languages of all displayed streams
* FEATURE: Implement dark mode

* FEATURE: Have the stream selectors fill the width of the playback window
and dynamically resize with it. right now, they're fixed at 200px wide
* FEATURE: Add multiple streams for adaptive bitrates. high bitrate files
(such as raw 4K movies), can stutter.
* FEATURE: Allow subtitles and audio to be de-selected

* CLEANUP: Improve layout of stream-detail attributes. Currently it's ad-hoc
and mixes the layout and data model. Change it to generate an array of
attributes, then use that array in the layout generation.
