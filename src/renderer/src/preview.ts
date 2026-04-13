import { mount } from "svelte";

import "./assets/main.css";

import Preview from "./Preview.svelte";

const preview = mount(Preview, {
  target: document.getElementById("preview")!,
});

export default preview;
