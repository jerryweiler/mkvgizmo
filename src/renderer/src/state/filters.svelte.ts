import { selectedFile } from "./current-file.svelte";

export class Filters {
  #video: boolean = $state(true);
  #audio: boolean = $state(true);
  #subtitles: boolean = $state(true);
  #language: string = $state("All");

  #languages: string[] = $derived.by(() => {
    let languages: Set<string> = new Set(
      selectedFile.streams.filter((s) => s.language).map((s) => s.language),
    );
    return ["All", ...languages];
  });

  get video(): boolean {
    return this.#video;
  }

  set video(value: boolean) {
    this.#video = value;
  }

  get audio(): boolean {
    return this.#audio;
  }

  set audio(value: boolean) {
    this.#audio = value;
  }

  get subtitles(): boolean {
    return this.#subtitles;
  }

  set subtitles(value: boolean) {
    this.#subtitles = value;
  }

  get languages(): string[] {
    return this.#languages;
  }

  get language(): string {
    return this.#language;
  }

  set language(value: string) {
    this.#language = value;
  }

  shouldDisplayStream(stream: StreamDetails): boolean {
    switch (stream.type) {
      case "video":
        return this.#video;
      case "audio":
        return (
          this.#audio &&
          (this.#language === "All" || this.#language === stream.language)
        );
      case "subtitle":
        return (
          this.#subtitles &&
          (this.#language === "All" || this.#language === stream.language)
        );
      default:
        return false;
    }
  }
}

export let filters = new Filters();
