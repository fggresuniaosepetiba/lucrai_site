import { spawn, execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const TIMEOUT = parseInt(process.env.DOCKER_WAIT_TIMEOUT || "120", 10);

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const SKIP = process.env.LUCRAI_SKIP_DOCKER_CHECK === "1";
const MODE = process.env.LUCRAI_DOCKER_MODE || "check"; // "check" | "auto" | "skip"

function isDockerRunning(): boolean {
  try {
    execSync("docker info", { encoding: "utf8", stdio: "pipe", windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

function isWindows(): boolean {
  return process.platform === "win32";
}

function isMac(): boolean {
  return process.platform === "darwin";
}

function isSystemd(): boolean {
  try {
    return process.platform === "linux" && fs.existsSync("/run/systemd/system");
  } catch {
    return false;
  }
}

function findExe(...candidates: string[]): string | undefined {
  return candidates.find((p) => fs.existsSync(p));
}

/** Executa um comando de forma assíncrona e desacoplada (não bloqueia nem anexa ao terminal). */
function runDetached(command: string, args: string[] = []): void {
  const child = spawn(command, args, {
    stdio: "ignore",
    detached: true,
    windowsHide: true,
  });
  child.on("error", () => {
    /* falha tratada pelo polling posterior */
  });
}

function manualHint(): void {
  if (isWindows()) {
    console.error("   Inicie o Docker manualmente: rode `docker desktop start` (ou abra o Docker Desktop) e execute de novo.");
  } else if (isMac()) {
    console.error("   Inicie o Docker manualmente: rode `open -a Docker` e execute de novo.");
  } else {
    console.error("   Inicie o Docker manualmente: `sudo systemctl start docker` (ou `sudo service docker start`) e execute de novo.");
  }
}

function startForPlatform(): string {
  if (isWindows()) {
    const desktop = findExe(
      path.join(process.env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "Docker Desktop.exe"),
      path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Docker", "Docker", "Docker Desktop.exe"),
    );

    if (desktop) {
      runDetached(desktop, ["-Autostart"]);
      return `Docker Desktop.exe (-Autostart) [${desktop}]`;
    }
    throw new Error("Docker Desktop não encontrado.");
  }

  if (isMac()) {
    const backend = "/Applications/Docker.app/Contents/MacOS/com.docker.backend";
    if (fs.existsSync(backend)) {
      runDetached(backend, ["-unattended", "-with-frontend=false"]);
      return `com.docker.backend (-unattended) [${backend}]`;
    }
    runDetached("open", ["-a", "Docker"]);
    return "open -a Docker";
  }

  // Linux
  const cmd = isSystemd() ? "systemctl" : "service";
  const args = isSystemd() ? ["start", "docker"] : ["docker", "start"];
  runDetached("sudo", [cmd, ...args]);
  return `sudo ${cmd} ${args.join(" ")}`;
}

async function waitForDocker(timeout = TIMEOUT): Promise<boolean> {
  const start = Date.now();
  let dots = 0;
  while (Date.now() - start < timeout * 1000) {
    await new Promise((r) => setTimeout(r, 3000));
    if (isDockerRunning()) return true;
    process.stdout.write(".");
    dots += 1;
    if (dots % 20 === 0) process.stdout.write(` ${Math.round((Date.now() - start) / 1000)}s`);
  }
  return isDockerRunning();
}

async function main(): Promise<void> {
  if (SKIP || MODE === "skip") {
    console.log("⏭  Docker guard skipped (LUCRAI_SKIP_DOCKER_CHECK=1 / LUCRAI_DOCKER_MODE=skip).");
    process.exit(0);
  }

  console.log("🔍 Checking Docker daemon...");
  if (isDockerRunning()) {
    console.log("✅ Docker is running.");
    process.exit(0);
  }

  if (MODE === "check") {
    console.error(`🐳 Docker daemon is not running (platform: ${os.platform()}).`);
    manualHint();
    console.error("   Para iniciar automaticamente em 2º plano, defina LUCRAI_DOCKER_MODE=auto no seu .env.");
    process.exit(1);
  }

  // MODE === "auto"
  console.log("🐳 Docker daemon is not running. Starting it in the background...");
  let strategy: string;
  try {
    strategy = startForPlatform();
  } catch (err) {
    console.error(`❌ Falha ao iniciar Docker (${err instanceof Error ? err.message : String(err)}).`);
    manualHint();
    process.exit(1);
  }

  console.log(`   Estratégia: ${strategy}`);
  console.log(`⏳ Aguardando Docker ficar pronto (até ${TIMEOUT}s)...`);
  const ready = await waitForDocker();
  if (!ready) {
    console.error("\n❌ Docker did not start within the timeout.");
    manualHint();
    process.exit(1);
  }
  console.log("\n✅ Docker is ready!");
  process.exit(0);
}

main();