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
