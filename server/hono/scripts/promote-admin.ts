import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

const parseArgs = (argv: string[]) => {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) continue;
    const [key, inlineValue] = part.slice(2).split("=");
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
    }
  }
  return args;
};

const usage = () => {
  console.log(
    [
      "Promote an existing user to admin role.",
      "",
      "Usage:",
      "  pnpm -C server auth:promote-admin -- --email you@example.com",
    ].join("\n")
  );
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const email = (args.email ?? "").trim().toLowerCase();

  if (!email) {
    usage();
    process.exit(1);
  }

  const updated = await db
    .update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email, role: users.role });

  if (updated.length === 0) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  console.log(`Promoted to admin: ${updated[0].email} (${updated[0].id})`);
};

main().catch((error) => {
  console.error("auth:promote-admin failed", error);
  process.exit(1);
});
