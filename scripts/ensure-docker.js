const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" });
  } catch {
    return "";
  }
}

function isDockerRunning() {
  try {
    execSync("docker info", { encoding: "utf8", stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function findDockerDesktop() {
  const candidates = [
    path.join(process.env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "Docker Desktop.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Docker", "Docker", "Docker Desktop.exe"),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

async function waitForDocker(timeout = 120) {
  const start = Date.now();
  while (Date.now() - start < timeout * 1000) {
    await new Promise((r) => setTimeout(r, 3000));
    if (isDockerRunning()) return true;
    process.stdout.write(".");
  }
  return false;
}

async function main() {
  if (isDockerRunning()) {
    console.log("✅ Docker is running.");
    process.exit(0);
  }

  const dockerPath = findDockerDesktop();
  if (!dockerPath) {
    console.error("❌ Docker Desktop not found. Please install Docker Desktop.");
    console.error("   https://www.docker.com/products/docker-desktop/");
    process.exit(1);
  }

  console.log("🐳 Docker Desktop not running. Starting it...");
  execSync(`"${dockerPath}"`, { stdio: "ignore", windowsHide: true });

  console.log("⏳ Waiting for Docker to start (up to 120s)...");
  const ready = await waitForDocker();

  if (!ready) {
    console.error("\n❌ Docker did not start within 120 seconds.");
    console.error("   Try starting Docker Desktop manually and run again.");
    process.exit(1);
  }

  console.log("\n✅ Docker Desktop is ready!");
  process.exit(0);
}

main();
