import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { tsImport } from "tsx/esm/api";

test("Postgres rolls back account and token changes, then accepts exactly one concurrent token use", {
  skip: process.env.INTEGRATION_DATABASE_ENABLED !== "true",
}, async () => {
  const { db } = await tsImport("../lib/db.ts", { parentURL: import.meta.url });
  const { consumeEmailToken, createEmailToken } = await tsImport("../lib/email-auth.ts", { parentURL: import.meta.url });
  const user = await db.user.create({ data: { email: `${randomUUID()}@integration.invalid`, passwordHash: "old" } });
  try {
    const token = await createEmailToken(user.id, "RESET");
    await assert.rejects(consumeEmailToken(token, "RESET", async tx => {
      await tx.user.update({ where: { id: user.id }, data: { passwordHash: "not-committed" } });
      throw new Error("rollback probe");
    }), /rollback probe/);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id: user.id } })).passwordHash, "old");
    assert.equal((await db.emailToken.findFirstOrThrow({ where: { userId: user.id } })).consumedAt, null);
    const results = await Promise.allSettled([0, 1].map(() => consumeEmailToken(token, "RESET", async tx => {
      await tx.user.update({ where: { id: user.id }, data: { passwordHash: "new" } });
    })));
    assert.equal(results.filter(result => result.status === "fulfilled" && result.value === user.id).length, 1);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id: user.id } })).passwordHash, "new");
    assert.equal(await consumeEmailToken(token, "RESET"), null);
  } finally {
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
});
