# Vercel デプロイ トラブルシューティング
---
description: Vercel デプロイエラーの調査・修正手順

## このプロジェクト（ai-i）でこれまでに発生したエラーと対処法

---

## ❶ TypeScript ビルドエラー: `initialMessages` does not exist

### 症状
```
Type error: Object literal may only specify known properties,
and 'initialMessages' does not exist in type 'UseChatOptions<UIMessage>'
```

### 原因
`@ai-sdk/react` v3 / `ai` v6 の API 変更により `initialMessages` が廃止された。

### 対処
`src/components/chat/ChatInterface.tsx` で `initialMessages` → `messages` に変更：
```ts
// ❌ 旧
initialMessages: [{ id: 'init-1', role: 'assistant', parts: [...] }]

// ✅ 新
messages: [{ id: 'init-1', role: 'assistant', parts: [...] }]
```

---

## ❷ TypeScript ビルドエラー: `vitest/config` not found

### 症状
```
Type error: Cannot find module 'vitest/config' or its corresponding type declarations.
```

### 原因
`vitest.config.ts` が `tsconfig.json` のコンパイル対象に含まれているが、
`vitest` パッケージが `devDependencies` にインストールされていない。

### 対処
`tsconfig.json` の `exclude` に追加：
```json
"exclude": ["node_modules", "vitest.config.ts"]
```

---

## ❸ ランタイムエラー: Failed to create interview session (Supabase 停止)

### 症状
UI に「Failed to start session / Failed to create interview session」と表示される。

### 原因
**Supabase 無料プランのプロジェクトが非アクティブにより自動停止（Paused）** していた。

### 診断方法
```bash
curl -s --max-time 10 "https://<project-ref>.supabase.co/rest/v1/" \
  -H "apikey: <anon-key>"
# exit code 6 → ホスト名が解決できない = プロジェクト停止中
```

### 対処
1. [https://supabase.com/dashboard](https://supabase.com/dashboard) にアクセス
2. 該当プロジェクトを開く
3. **「Restore project」** をクリックして再開（数分かかる）
4. 復旧後に再度 curl でテスト

> ⚠️ Supabase 無料プランは **一定期間（約1週間）アクセスがないと自動停止**する。
> 定期的にアクセスするか、有料プランへのアップグレードを検討。

---

## ❹ ランタイムエラー: Unable to connect to AI (Google API Key 未設定)

### 症状
チャット画面に「Unable to connect to AI. Please check your API key.」と表示される。

### 原因
Vercel の環境変数に `GOOGLE_GENERATIVE_AI_API_KEY` が設定されていない。

### 対処
Vercel ダッシュボード → **Settings → Environment Variables** で以下を追加してリデプロイ：

| 変数名 | 値の場所 |
|--------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |

> ⚠️ `.env.local` は `.gitignore` で除外されているため **Vercel には自動反映されない**。
> 環境変数を変更したら必ず **Redeploy** を実行すること。

---

## ❺ ランタイムエラー: Google AI 404 Not Found (モデル廃止)

### 症状
AIとのチャットで 404 エラーが発生する。

### 原因
使用していた `gemini-2.0-flash-exp`（実験的モデル）が廃止された。

### 対処
`src/app/api/chat/route.ts` と `src/app/api/report/route.ts` の両方を変更：
```ts
// ❌ 廃止
model: google('gemini-2.0-flash-exp')

// ✅ 正式版
model: google('gemini-2.0-flash')
```

> ⚠️ `-exp` や `-preview` 系のモデルは予告なく廃止されることがある。
> モデルの最新情報は [Google AI Studio](https://aistudio.google.com/) で確認。

---

## デプロイ前チェックリスト

1. `npm run build` でローカルビルドが通るか確認
2. Supabase ダッシュボードでプロジェクトが **Active** になっているか確認
3. Vercel の **Environment Variables** に全キーが設定されているか確認
4. 使用中の Gemini モデル名が最新か確認
