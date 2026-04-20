export function formatSize(bytes: number): string {
  let suffix: string = "";
  if (bytes > 1024) {
    suffix = " KB";
    bytes /= 1024;
  }
  if (bytes > 1024) {
    suffix = " MB";
    bytes /= 1024;
  }
  if (bytes > 1024) {
    suffix = " GB";
    bytes /= 1024;
  }

  return bytes.toFixed(2) + suffix;
}

export function formatDuration(duration: number): string {
  let hours: number = 0;
  let minutes: number = 0;
  let seconds: number = 0;

  if (duration >= 3600) {
    hours = Math.floor(duration / 3600);
    duration -= hours * 3600;
  }

  if (duration >= 60) {
    minutes = Math.floor(duration / 60);
    duration -= minutes * 60;
  }

  seconds = duration;

  let result = `${seconds.toFixed(3)}s`;
  if (minutes > 0) result = `${minutes}m ${result}`;
  if (hours > 0) result = `${hours}h ${result}`;
  return result;
}
