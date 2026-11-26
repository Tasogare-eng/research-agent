import type { Llm } from "./llm.ts";
import { search } from "./search.ts";

export type AgentResult =
  | { ok: true; answer: string; searchCount: number }
  | { ok: false; reason: string; searchCount: number };

// 止める条件は3つ:LLM が答えを返したとき、検索が最大実行回数に達したとき、
// 同じ言葉で2回続けて検索しようとしたとき
export function runAgent(question: string, llm: Llm, max: number): AgentResult {
  const results: string[] = [];
  let previousQuery: string | undefined;

  while (true) {
    const decision = llm(question, results);

    if (decision.type === "answer") {
      return { ok: true, answer: decision.text, searchCount: results.length };
    }

    if (results.length >= max) {
      return {
        ok: false,
        reason: `最大実行回数(${max}回)に達しても、LLM が答えを返さず、さらに検索しようとしたため停止しました`,
        searchCount: results.length,
      };
    }

    if (decision.query === previousQuery) {
      return { ok: false, reason: "同じ検索の繰り返し", searchCount: results.length };
    }
    previousQuery = decision.query;

    const result = search(decision.query, results.length + 1);
    results.push(result);
    console.log(`[検索 ${results.length}回目] ${result}`);
  }
}
