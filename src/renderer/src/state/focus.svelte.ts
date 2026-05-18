// this file manages which component has the current focus and handles
// navigation (particularly via keyboard) for the current page.

import { workingDir } from "./current-directory.svelte";
import { selectedFile } from "./current-file.svelte";
import { logger } from "./logger.svelte";

// A List of all of the element types that can have focus
const elementPrefixes: Set<string> = new Set([
  "chooseDir",
  "editConfig",
  "save",
  "currentDir",
  "currentFile",
  "streamDetailTab",
  "streamRawTab",
  "keyframeTab",
  "toggleVideo",
  "toggleAudio",
  "toggleSubs",
  "languages",
  "play",
  "navItem",
  "stream",
  "keyframe",
  "default",
  "forced",
]);

type FocusInfo = {
  type: string;
  id: string;
};

function focusItem(itemId: string): void {
  document.getElementById(itemId).focus();
}

// gets a list of the details tab ids and the index of the active one
function getDetailTabElements(): { ids: string[]; activeIdx: number } {
  function addElement(element: Element): void {
    if (element.getAttribute("data-state") === "active") {
      activeIdx = ids.length;
    }
    ids.push(element.id);
  }

  let ids: string[] = [];
  let activeIdx: number = 0;

  addElement(document.getElementById("streamDetailTab"));
  addElement(document.getElementById("streamRawTab"));
  document.querySelectorAll('[id^="keyframeTab"').forEach((e) => addElement(e));

  return { ids, activeIdx };
}

function getActiveDetailTabId(): string {
  const tabList = getDetailTabElements();
  return tabList.ids[tabList.activeIdx];
}

// get an ordered list of elements of a specified type. if an active element
// is specified, the index of that item will be returned, too
function getListElements(
  itemPrefix: string,
  activeItemId: string = "",
): { ids: string[]; activeIdx: number } {
  if (!itemPrefix.endsWith("-")) {
    throw new Error("item prefix must end with '-'");
  }

  let ids: string[] = [];
  let activeIdx: number = 0;

  const items = document.querySelectorAll(`[id^="${itemPrefix}"]`);
  for (const item of items) {
    if (item.id === activeItemId) {
      activeIdx = ids.length;
    }
    ids.push(item.id);
  }

  return { ids, activeIdx };
}

// gets the type and id of the element if it a valid one in our list of
// navigable item types. If it's not one we care about, return undefined.
function getElementInfo(elt: Element): FocusInfo | undefined {
  if (elt === undefined) return undefined;

  const id: string = elt.id;
  const idx: number = id.indexOf("-");

  let type: string = id;
  if (idx !== -1) {
    type = id.substring(0, idx);
  }

  if (!elementPrefixes.has(type)) {
    return undefined;
  }
  return { type, id };
}

function handleArrowUp(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "editConfig":
      focusItem("chooseDir");
      break;
    case "save":
      focusItem("editConfig");
      break;
    case "navItem":
      {
        const navItemList = getListElements("navItem-", focusInfo.id);
        if (navItemList.activeIdx > 0) {
          focusItem(navItemList.ids[navItemList.activeIdx - 1]);
        } else {
          focusItem("currentDir");
        }
      }
      break;
    case "streamDetailTab":
    case "streamRawTab":
    case "keyframeTab":
    case "toggleVideo":
    case "toggleAudio":
    case "toggleSubs":
    case "languages":
    case "play":
      focusItem("currentFile");
      break;
    case "stream":
    case "keyframe":
      {
        const items = getListElements(focusInfo.type + "-", focusInfo.id);
        if (items.activeIdx > 0) {
          focusItem(items.ids[items.activeIdx - 1]);
        } else {
          focusItem(getActiveDetailTabId());
        }
      }
      break;
    case "default":
    case "forced":
      {
        // the parent should be the corresponding 'stream-id' element.
        // navigate up from that
        const items = getListElements(
          "stream-",
          focusInfo.id.replace(focusInfo.type, "stream"),
        );
        if (items.activeIdx > 0) {
          focusItem(items.ids[items.activeIdx - 1]);
        } else {
          focusItem(getActiveDetailTabId());
        }
      }
      break;
  }
}

function handleArrowDown(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "chooseDir":
      focusItem("editConfig");
      break;
    case "editConfig":
      focusItem("save");
      break;
    case "currentDir":
      focusItem("navItem-0");
      break;
    case "currentFile":
      focusItem(getActiveDetailTabId());
      break;
    case "streamDetailTab":
    case "keyframeTab":
    case "toggleVideo":
    case "toggleAudio":
    case "toggleSubs":
    case "languages":
    case "play":
      // We want to go to the top content element of whichever tab is active.
      // Note that if we start out on a tab, we could simplify this a little
      // since we already know the active tab. but that would duplicate
      // portions of the code in a lot of separate cases.
      {
        const activeTab = getActiveDetailTabId();
        if (activeTab === "streamDetailTab") {
          const streamList = getListElements("stream-");
          if (streamList.ids.length > 0) {
            focusItem(streamList.ids[0]);
          }
        } else if (activeTab.startsWith("keyframeTab")) {
          const keyframeInfo = getListElements("keyframe-");
          if (keyframeInfo.ids.length > 0) {
            focusItem(keyframeInfo.ids[0]);
          }
        }
      }
      break;
    case "navItem":
    case "stream":
    case "keyframe":
      {
        const items = getListElements(focusInfo.type + "-", focusInfo.id);
        if (items.activeIdx < items.ids.length - 1) {
          focusItem(items.ids[items.activeIdx + 1]);
        }
      }
      break;
    case "default":
    case "forced":
      {
        // the parent should be the corresponding 'stream-id' element.
        // navigate down from that
        const items = getListElements(
          "stream-",
          focusInfo.id.replace(focusInfo.type, "stream"),
        );
        if (items.activeIdx < items.ids.length - 1) {
          focusItem(items.ids[items.activeIdx + 1]);
        }
      }
      break;
  }
}

function handleArrowLeft(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "currentDir":
      focusItem("chooseDir");
      break;
    case "navItem":
      focusItem("save");
      break;
    case "currentFile":
      focusItem("currentDir");
      break;
    case "toggleVideo":
      focusItem(getActiveDetailTabId());
      break;
    case "toggleAudio":
      focusItem("toggleVideo");
      break;
    case "toggleSubs":
      focusItem("toggleAudio");
      break;
    case "languages":
      focusItem("toggleSubs");
      break;
    case "play":
      focusItem("languages");
      break;
    case "stream":
    case "keyframe":
    case "default":
    case "forced":
      {
        const navItemList = getListElements("navItem-", focusInfo.id);
        if (navItemList.ids.length > 0) {
          focusItem(`navItem-${selectedFile.handle}`);
        }
      }
      break;
  }
}

function handleArrowRight(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "chooseDir":
      focusItem("currentDir");
      break;
    case "editConfig":
    case "save":
      {
        const navItemList = getListElements("navItem-", focusInfo.id);
        if (navItemList.ids.length > 0) {
          focusItem(`navItem-${selectedFile.handle}`);
        }
      }
      break;
    case "currentDir":
      focusItem("currentFile");
      break;
    case "navItem":
      focusItem(getActiveDetailTabId());
      break;
    case "toggleVideo":
      focusItem("toggleAudio");
      break;
    case "toggleAudio":
      focusItem("toggleSubs");
      break;
    case "toggleSubs":
      focusItem("languages");
      break;
    case "languages":
      focusItem("play");
      break;
    case "default":
    case "forced":
      focusItem(focusInfo.id.replace(focusInfo.type, "stream"));
      break;
  }
}

function handlePageDown(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "navItem":
    case "stream":
    case "keyframe":
      {
        // start by finding the parent scroll area
        let elt: Element = document.getElementById(focusInfo.id);
        while (elt && elt.getAttribute("data-slot") !== "scroll-area")
          elt = elt.parentElement;
        const scrollRect = elt.getBoundingClientRect();

        elt = null;

        // Now get the list of elements and see which one is at the bottom of
        // the scroll area
        // TODO: this seems to use the coordinates before the scroll area
        // updates and re-calculates its area
        const items = document.querySelectorAll(`[id^="${focusInfo.type}-"]`);
        for (const item of items) {
          const rect = item.getBoundingClientRect();
          if (rect.bottom <= scrollRect.bottom) {
            elt = item;
          }
        }

        if (elt) focusItem(elt.id);
      }
      break;
  }
}

function handlePageUp(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "navItem":
    case "stream":
    case "keyframe":
      {
        // start by finding the parent scroll area
        let elt: Element = document.getElementById(focusInfo.id);
        while (elt && elt.getAttribute("data-slot") !== "scroll-area")
          elt = elt.parentElement;
        const scrollRect = elt.getBoundingClientRect();

        elt = null;

        // Now get the list of elements and see which one is at the top of
        // the scroll area.
        // TODO: this seems to use the coordinates before the scroll area
        // updates and re-calculates its area
        const items = document.querySelectorAll(`[id^="${focusInfo.type}-"]`);
        for (const item of items) {
          const rect = item.getBoundingClientRect();
          if (rect.top >= scrollRect.top) {
            elt = item;
            break;
          }
        }

        if (elt) focusItem(elt.id);
      }
      break;
  }
}

function handleHome(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "navItem":
    case "stream":
    case "keyframe":
      {
        const items = getListElements(focusInfo.type + "-");
        if (items.ids.length > 0) {
          focusItem(items.ids[0]);
        }
      }
      break;
  }
}

function handleEnd(focusInfo: FocusInfo): void {
  switch (focusInfo.type) {
    case "navItem":
    case "stream":
    case "keyframe":
      {
        const items = getListElements(focusInfo.type + "-");
        if (items.ids.length > 0) {
          focusItem(items.ids[items.ids.length - 1]);
        }
      }
      break;
  }
}

function handleKeyboardNavigation(focusInfo: FocusInfo, key: string): void {
  switch (key) {
    case "ArrowUp":
      handleArrowUp(focusInfo);
      break;
    case "ArrowDown":
      handleArrowDown(focusInfo);
      break;
    case "ArrowLeft":
      handleArrowLeft(focusInfo);
      break;
    case "ArrowRight":
      handleArrowRight(focusInfo);
      break;
    case "PageDown":
      handlePageDown(focusInfo);
      break;
    case "PageUp":
      handlePageUp(focusInfo);
      break;
    case "Home":
      handleHome(focusInfo);
      break;
    case "End":
      handleEnd(focusInfo);
      break;
    case " ":
      if (focusInfo.type === "navItem") {
        document.getElementById(focusInfo.id).click();
      }
      break;
  }
}

export function handleKeyboardEvent(e: KeyboardEvent): void {
  // start by retrieving the id of the element with focus.
  // in some cases, focus might be on one of the child elements of
  // an item we care about navigating among. so check the active element
  // first, then its parent.
  let elt: Element = document.activeElement;
  let focusInfo = getElementInfo(elt);
  if (!focusInfo) focusInfo = getElementInfo(elt?.parentElement);
  if (!focusInfo) return;

  handleKeyboardNavigation(focusInfo, e.key);
}

export function handleKeyboardCapture(e: KeyboardEvent): void {
  // First chance capture of keydown events before it goes to the element.
  // We intercept arrow key navigation in specific cases, like right arrow
  // on the right-most detail tab, or arrows when on a checkbox.
  // In both cases, we want to navigate to another control, instead of
  // letting the control's handler swallow the event.
  let elt: Element = document.activeElement;
  let focusInfo = getElementInfo(elt);

  // arrow key from a checkbox should navigate to the next control
  if (
    e.key.startsWith("Arrow") &&
    (focusInfo.type === "default" || focusInfo.type === "forced")
  ) {
    handleKeyboardNavigation(focusInfo, e.key);
    e.stopPropagation();
  }

  logger.add(`elt: ${focusInfo.id}, key: ${e.key}`);

  // left arrow from the left-most tab or right arrow from the right-most tab
  // should navigate out of the tab array. anything else, use the default
  // handling. Note: don't handle these in handleKeyboardNavigation.
  // The tab component handles arrow events to activate the next tab
  // and also lets the event propagate out. We handle these specific
  // events to navigate out, which the component doesn't implement,
  // then stop the event from propagating so that it doesn't double-navigate.
  if (e.key === "ArrowLeft" && focusInfo.id === "streamDetailTab") {
    const navItemList = getListElements("navItem-", focusInfo.id);
    if (navItemList.ids.length > 0) {
      focusItem(`navItem-${selectedFile.handle}`);
    }
    e.stopPropagation();
  }

  let tabs = getDetailTabElements();
  if (
    e.key === "ArrowRight" &&
    focusInfo.id === tabs.ids[tabs.ids.length - 1]
  ) {
    focusItem("toggleVideo");
    e.stopPropagation();
  }
}

export function setInitialFocus() {
  // the window should be populated now. set focus to something reasonable.
  // try the first file in the working directory. if there is no directory,
  // set focus to the 'choose directory' button
  const firstFile = workingDir.children.find((child) => !child.isDirectory);
  if (firstFile) {
    focusItem(`navItem-${firstFile.handle}`);
    return;
  }

  // there is no file, set focus to the first entry (directory) that's not '..'
  const firstDir = workingDir.children.find((child) => child.handle);
  if (firstDir) {
    focusItem(`navItem-${firstDir.handle}`);
    return;
  }

  // either there's no working directory or it's emmpty.
  // set focus to the 'choose directory' button
  focusItem("chooseDir");
}
