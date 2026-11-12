import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

try {
  const { tool_input } = JSON.parse(readFileSync(0, "utf8"));
  if (typeof tool_input?.file_path !== "string" || !tool_input.file_path.trim()) {
    throw new Error("Expected tool_input.file_path in hook input.");
  }
  const root = realpathSync(process.env.CLAUDE_PROJECT_DIR);
  const file = realpathSync(resolve(root, tool_input.file_path));
  const localPath = relative(root, file);
  if (isAbsolute(localPath) || localPath === ".." || localPath.startsWith(`..${sep}`)) {
    process.exit(0);
  }
  if (!statSync(file).isFile()) process.exit(0);

  const result = spawnSync(
    process.execPath,
    [join(root, "node_modules/prettier/bin/prettier.cjs"),
      "--write", "--ignore-unknown", "--no-error-on-unmatched-pattern", "--", file],
    { cwd: root, stdio: ["ignore", "inherit", "inherit"] },
  );
  if (result.error) throw result.error;
  process.exit(result.status === 0 ? 0 : 2);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}