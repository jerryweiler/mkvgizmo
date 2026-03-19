import { spawn } from "child_process";

export type ProcessResult = {
  output: string;
  errorMessage?: string;
};

export function runTextProcess(command: string, args: string[]) : Promise<ProcessResult> {
  return new Promise(resolve => {
    const process = spawn(command, args);

    let output = "";
    let errorMessage = "";

    process.stdout.on("data", chunk => output += chunk.toString());
    process.stderr.on("data", chunk => errorMessage += chunk.toString());
    process.on("error", err => {
      errorMessage += err.message;
      resolve({output, errorMessage});
    });
    process.on("close", () => resolve({output, errorMessage}));
  });
}
