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

* FEATURE: Add background, make the UI less generic
* FEATURE: Remember last window position?
* FEATURE: Implement dark mode
* FEATURE: Add multiple streams for adaptive bitrates. high bitrate files
can stutter, such as raw 4K movies.
* FEATURE: Add skip buttons to playback:
  * next/previous subtitle for the subtitle stream
* FEATURE: Add tooltips for pending updates
* CLEANUP: Make sure everything has a tooltip. Most components do already,
but some recent changes do not, like the playback stream selectors.
* FEATURE: Implement focus/navigation for the text areas: raw details
and log message area.
* INVESTIGATE: Sometimes stream list doesn't populate when selecting a file.
Consistent with specific files. Observed on friend's machine while testing.
Need a repro to investigate why.
* INVESTIGATE: Add more typescript linting. stream size is typed as a number,
but was being populated from an untyped string value without warning, leading
to unexpected sorting behavior.
