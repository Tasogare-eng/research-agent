// 検索のモック。外部には接続せず、検索語と何回目かが分かる結果を返す
export function search(query: string, count: number): string {
  return `「${query}」の検索結果(モック ${count}件目の資料)`;
}
