export class Config {
  #ffmpegPath: string = $state("");
  #startingPath: string = $state("");

  constructor(config: GizmoConfig) {
    this.#ffmpegPath = config.ffmpegPath;
    this.#startingPath = config.startingPath;
  }

  get ffmpegPath() { return this.#ffmpegPath; }
  get startingPath() { return this.#startingPath; }

  async update(update: GizmoConfig): Promise<boolean> {
    const result = await window.api.saveConfig(update);
    if (!result.success) {
      alert(result.errorMessage);
      return false;
    }

    this.#ffmpegPath = update.ffmpegPath;
    this.#startingPath = update.startingPath;

    return true;
  }
}

// load initial state
const starting = await window.api.loadConfig();
export const config = new Config(starting);
