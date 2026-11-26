import { parseArgs } from "node:util";
import { runAgent } from "./agent.ts";
import { answerAfter, never, type Llm } from "./llm.ts";

const DEFAULT_MAX = 3;

function fail(message: string): never {
  console.error(`エラー: ${message}`);
  process.exit(1);
}

function toLlm(name: string): Llm {
  if (name === "never") return never;
  const matched = name.match(/^answer-after-(\d+)$/);
  if (matched) return answerAfter(Number(matched[1]));
  return fail(`--llm は never か answer-after-<N> を指定してください(指定された値: ${name})`);
}

// parseArgs は「--max -1」の -1 を別のオプションとみなすので、「--max=-1」の形にまとめる
const args = process.argv.slice(2).join("\0").replace(/(^|\0)--max\0(?=-\d)/g, "$1--max=").split("\0").filter(Boolean);

const { values, positionals } = parseArgs({
  args,
  options: {
    max: { type: "string" },
    llm: { type: "string", default: "answer-after-2" },
  },
  allowPositionals: true,
});

const max = values.max === undefined ? DEFAULT_MAX : Number(values.max);
if (!Number.isInteger(max) || values.max?.trim() === "") {
  fail(`--max は整数で指定してください(指定された値: ${values.max})`);
}
if (max <= 0) {
  fail(`--max は 1 以上を指定してください(指定された値: ${max})`);
}

const question = positionals.join(" ") || "エージェントのループとは";
const result = runAgent(question, toLlm(values.llm), max);

console.log(`検索回数: ${result.searchCount}回`);
if (result.ok) {
  console.log(`答え: ${result.answer}`);
} else {
  console.error(`エラー: ${result.reason}`);
  process.exitCode = 1;
}
