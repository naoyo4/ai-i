# 報告書：Claude Code × GitHub 連携 設定作業

**作成日：** 2026-02-25  
**対象会話：** Integrating Claude Code GitHub (8ad7df78-5035-4e1d-bfd9-7615e21093cd)  
**対象リポジトリ：** `ai-i` (AI Interviews)

---

## 概要

`ai-i` リポジトリに対して、**Claude Code** を GitHub Actions と連携させるための設定を行った。  
これにより、Issue・PR のコメントで `@claude` とメンションするだけで、Claude AI が自動でコードレビュー・修正・ドキュメント更新などを実行できる環境を構築した。

---

## 実施内容

### 1. GitHub Actions ワークフローの追加

**ファイル：** `.github/workflows/claude.yml`

- `anthropics/claude-code-action@v1` を使用したワークフローを新規作成
- 以下のイベントをトリガーとして設定：

| イベント | 条件 |
|----------|------|
| `issue_comment` | コメントに `@claude` が含まれる場合 |
| `pull_request_review_comment` | コメントに `@claude` が含まれる場合 |
| `pull_request_review` | レビュー本文に `@claude` が含まれる場合 |
| `issues` | Issueが `claude[bot]` にアサインされた場合 |

- 必要な権限を付与：
  - `contents: write`（コードへの書き込み）
  - `pull-requests: write`（PRへの書き込み）
  - `issues: write`（Issueへの書き込み）
  - `id-token: write`（認証トークン）

### 2. CI ワークフローの確認

**ファイル：** `.github/workflows/ci.yml`

既存の CI ワークフローを確認。`main` ブランチへの push/PR 時に以下が自動実行される：

1. `npm run lint` — ESLint によるコードチェック
2. `npm test` — Vitest によるテスト実行
3. `npm run build` — プロダクションビルド確認

### 3. CLAUDE.md の整備

**ファイル：** `CLAUDE.md`

Claude が `ai-i` リポジトリで作業する際のガイドを定義。主な記載内容：

- **プロジェクト概要：** AI 面接アプリ（Next.js + Supabase + Google Gemini）
- **ディレクトリ構成：** `src/app/`, `src/components/`, `src/lib/`, `src/__tests__/`
- **コマンド一覧：** `npm run dev`, `npm run build`, `npm test` など
- **アーキテクチャ：** データフロー、AIストリーミング、DB設計
- **環境変数：** Supabase URL/Key、Google Generative AI API Key
- **テスト方針・CIパイプライン・コーディング規約**

---

## 技術スタック（プロジェクト全体）

| 分類 | 技術 |
|------|------|
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript |
| スタイリング | Tailwind CSS v4 |
| バックエンド/DB | Supabase (PostgreSQL + RLS) |
| AI | Google Gemini 2.0 Flash (`@ai-sdk/google`) |
| AIストリーミング | Vercel AI SDK (`streamText`, `useChat`) |
| CI/CD | GitHub Actions |
| テスト | Vitest + Testing Library + jsdom |
| Claude連携 | `anthropics/claude-code-action@v1` |

---

## 連携フロー（Claude Code GitHub）

```
開発者・ユーザー
     │
     ▼
Issue / PR コメントで @claude をメンション
     │
     ▼
GitHub Actions トリガー（claude.yml）
     │
     ▼
anthropics/claude-code-action@v1 が実行
     │
     ▼
Claude が コードレビュー / 修正提案 / ドキュメント更新 などを実行
     │
     ▼
GitHub 上に結果をコメント or コミット
```

---

## 必要な設定（GitHub リポジトリ側）

Claude Code GitHub 連携を動作させるには、リポジトリの Secrets に以下を登録する必要がある：

| Secret 名 | 内容 |
|-----------|------|
| `ANTHROPIC_API_KEY` | Anthropic の API キー |

**設定場所：** `Settings > Secrets and variables > Actions > New repository secret`

---

## 今後の活用例

- `@claude このPRをレビューして` → Claude が差分を確認してレビューコメントを投稿
- `@claude このIssueを修正して` → Claude がコードを修正してコミットを作成
- `@claude テストを追加して` → Claude が対象コードのテストを自動作成
- Issueを `claude[bot]` にアサイン → Claude が自律的にタスクを実行

---

## 参考リンク

- [Claude Code GitHub Action 公式ドキュメント](https://docs.anthropic.com/ja/docs/claude-code/github-actions)
- [anthropics/claude-code-action (GitHub)](https://github.com/anthropics/claude-code-action)

---

*この報告書は 2026-02-25 の作業内容をもとに Antigravity により自動生成されました。*
