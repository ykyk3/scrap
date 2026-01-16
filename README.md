# AI Chat Prototype

AIを介したコミュニケーションツールのプロトタイプです。ユーザー同士のメッセージがAIを経由して届くチャットアプリで、送信前にAIがメッセージを処理（変換・翻訳・補足など）することで、コミュニケーションを補助します。

## 機能

- **メッセージ変換**: 丁寧な表現 / カジュアルな表現への変換
- **要約**: メッセージを簡潔にまとめる
- **翻訳**: 日本語 ↔ 英語の翻訳
- **補足追加**: メッセージに説明や背景情報を追加
- **リアルタイム通信**: Supabase Realtimeによる複数ユーザー対応

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **スタイリング**: Tailwind CSS
- **リアルタイム通信**: Supabase Realtime
- **AI**: Anthropic Claude API + Vercel AI SDK
- **言語**: TypeScript

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、必要な値を設定してください。

```bash
cp .env.example .env.local
```

#### Anthropic API Key

AI処理機能を使用するために必要です。
[Anthropic Console](https://console.anthropic.com/) でAPIキーを取得してください。

```
ANTHROPIC_API_KEY=your_api_key_here
```

#### Supabase設定（オプション）

複数ユーザー間のリアルタイム通信を有効にするために必要です。

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. プロジェクトの設定からURLとanon keyを取得
3. `.env.local` に設定

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ページ構成

- `/` - ローカルステートのみのシンプルなチャット（Supabase不要）
- `/chat` - Supabase Realtimeを使用したリアルタイムチャット

## 使い方

1. 画面右上のボタンでユーザーを切り替え（デモ用にユーザーA/Bを用意）
2. 入力欄上部の「AI処理」をクリックして処理モードを選択
3. メッセージを入力して送信
4. AI処理が選択されている場合、メッセージは処理されてから表示
5. 「元のメッセージを表示」をクリックすると、処理前の内容を確認可能

## アーキテクチャ

```
[User A] ←→ [Next.js App] ←→ [User B]
                 ↓
            [AI処理層]
         (Anthropic API)
                 ↓
         [Supabase Realtime]
           (メッセージ同期)
```

## ライセンス

MIT
