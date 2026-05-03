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

* FEATURE: Add multiple streams for adaptive bitrates. high bitrate files
can stutter, such as raw 4K movies.

* FEATURE: Add skip buttons to playback:
  * next/previous subtitle for the subtitle stream
* FEATURE: Add updatable 'forced' checkbox to subtitle stream details panel.
Changing it should write a metadata update to the file. Open Q: Should updates
be gated behind a 'commit' or 'save' button to prevent updates from an
accidental press of the spacebar? If so, make sure multiple changes can be
queued, at least at the directory level (change all the files then commit them)
* FEATURE: Add updatable 'default' checkbox to audio stream details panel.
* FEATURE: Make sure only one stream per file has each of 'default' or 'forced'
attributes selected.
* FEATURE: Make the UI navigable by keyboard:
  * left/right arrow to switch between file list and stream list
  * up/down arrow to navigate the selected list
  * need keyboard shortcut for changing checkboxes (forced/default). Space will
  work if each stream only has a single updatable field, but what if there
  are more? For an audio stream, there's a desire to allow changing the
  'default' option and the language for files with incorrect metadata.
  * when changing the active file, maintain a 'compatible' selection on the
  stream list. this will allow quick modification to a series of files
  (updating the forced subtitle stream) as long as all of the files have
  similar streams
* FEATURE: Add visual indicator of smallest/largest subtitle stream. Perhaps an
up/down arrow icon in front of the size attribute. This will make it faster to
identify which stream should be the forced subtitle stream.
* CLEANUP: Make sure everything has a tooltip. Most components do already,
but some recent changes do not, like the playback stream selectors.
* CLEANUP: Fix visual state for 'show stream type' toggles above the stream
list. It's hard to tell what state they're in.
