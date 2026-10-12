import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

test("Docker runs a supervisor so a failed worker cannot leave a healthy web process", () => {
  const docker = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
  assert.match(docker, /CMD \["node", "scripts\/runtime-supervisor\.mjs"\]/);
});

test("worker failure shuts down its sibling and exits with failure", async () => {
  const { superviseRuntime } = await import("../scripts/runtime-supervisor.mjs");
  const children = [];
  let complete;
  const done = new Promise(resolve => { complete = resolve; });
  const runtime = superviseRuntime([
    { label: "web", args: ["-e", "setInterval(()=>{},1000)"] },
    { label: "worker", args: ["-e", "process.exit(7)"] },
  ], { spawnChild: (...args) => { const child = spawn(...args); children.push(child); return child; }, finish: complete, graceMs: 300 });
  const timer = setTimeout(() => runtime.shutdown(99), 5000);
  try {
    assert.equal(await done, 7);
    assert.ok(children.every(child => child.exitCode !== null || child.signalCode !== null));
  } finally { clearTimeout(timer); runtime.shutdown(99); }
});

test("failed child launch stops already running children", async () => {
  const { superviseRuntime } = await import("../scripts/runtime-supervisor.mjs");
  let calls = 0;
  let complete;
  const done = new Promise(resolve => { complete = resolve; });
  let sibling;
  superviseRuntime([{ label: "web", args: [] }, { label: "worker", args: [] }], {
    spawnChild: () => {
      calls++;
      if (calls === 2) return spawn("rainy-missing-executable");
      sibling = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"]);
      return sibling;
    }, finish: complete, graceMs: 300,
  });
  assert.equal(await done, 1);
  assert.ok(sibling.exitCode !== null || sibling.signalCode !== null);
});
