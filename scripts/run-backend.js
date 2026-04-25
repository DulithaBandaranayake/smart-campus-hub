const path = require("path");
const { spawn } = require("child_process");

const backendDir = path.resolve(__dirname, "..", "backend");
const isWindows = process.platform === "win32";
const command = isWindows ? "mvnw.cmd" : "./mvnw";

const child = spawn(command, ["spring-boot:run"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: isWindows,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`Failed to start backend using ${command}:`, error.message);
  process.exit(1);
});
