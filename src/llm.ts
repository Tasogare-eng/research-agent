// LLM のモック。これまでの検索結果を見て、次の行動を返す
export type Decision =
  | { type: "search"; query: string }
  | { type: "answer"; text: string };

export type Llm = (question: string, results: string[]) => Decision;

// N 回検索したら答える
export function answerAfter(n: number): Llm {
  return (question, results) =>
    results.length >= n
      ? { type: "answer", text: `「${question}」への答え(検索結果 ${results.length} 件をまとめたもの)` }
      : { type: "search", query: `${question} 調査${results.length + 1}` };
}

// 毎回「もっと検索する」を選び、答えを出さない
export const never: Llm = (question) => ({ type: "search", query: question });
