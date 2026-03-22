import { spawn } from "child_process";

export type ProcessResult = {
  output: Buffer;
  errorMessage?: string;
};

export function runProcess(command: string, args: string[]) : Promise<ProcessResult> {
  return new Promise(resolve => {
    const process = spawn(command, args);

    let output: Buffer = Buffer.alloc(0);
    let errorMessage = "";

    process.stdout.on("data", chunk => output = Buffer.concat([output, chunk]));
    process.stderr.on("data", chunk => errorMessage += chunk.toString());
    process.on("error", err => {
      errorMessage += err.message;
      resolve({output, errorMessage});
    });
    process.on("close", () => resolve({output, errorMessage}));
  });
}
