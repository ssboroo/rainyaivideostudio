import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export function superviseRuntime(specs, { spawnChild = spawn, finish = code => process.exit(code), graceMs = 8000 } = {}) {
  const children = new Set();
  let stopping = false, exitCode = 0, killer;
  function finishIfStopped() {
    if (!stopping || children.size) return;
    clearTimeout(killer);
    finish(exitCode);
  }
  function shutdown(code = 0) {
    if (stopping) return;
    stopping = true;
    exitCode = code;
    for (const child of children) child.kill("SIGTERM");
    killer = setTimeout(() => {
      for (const child of children) child.kill("SIGKILL");
    }, graceMs);
    killer.unref();
    finishIfStopped();
  }
  for (const { args, label } of specs) {
    if (stopping) break;
    let child;
    try { child = spawnChild(process.execPath, args, { env: process.env, stdio: "inherit" }); }
    catch { shutdown(1); break; }
    children.add(child);
    child.once("error", () => {
      console.error(label, "could not start");
      shutdown(1);
    });
    child.once("exit", (code, signal) => {
      if (stopping) return;
      console.error(label, "exited", code, signal);
      shutdown(code || 1);
    });
    child.once("close", () => { children.delete(child); finishIfStopped(); });
  }
  return { shutdown };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.env.PORT ||= "3000";
  const runtime = superviseRuntime([
    { label: "web", args: ["server.js"] },
    { label: "worker", args: ["--import", "tsx", "scripts/movie-worker.mjs"] },
  ]);
  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => runtime.shutdown(0));
}
