const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

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

  try {
    console.log("🐳 Starting Docker service...");
    execSync("net start com.docker.service", { stdio: "pipe", windowsHide: true });
  } catch {
    const dockerPath = findDockerDesktop();
    if (!dockerPath) {
      console.error("❌ Docker Desktop not found. Please start Docker manually.");
      process.exit(1);
    }
    console.log("   Launching Docker Desktop silently...");
    execSync(`"${dockerPath}"`, { stdio: "ignore", windowsHide: true });
  }

  console.log("⏳ Waiting for Docker to be ready (up to 120s)...");
  const ready = await waitForDocker();
  if (!ready) {
    console.error("\n❌ Docker did not start within 120 seconds.");
    process.exit(1);
  }
  console.log("\n✅ Docker is ready!");
  process.exit(0);
}

main();
