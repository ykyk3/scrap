import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { AIProcessingMode } from '@/types/chat';

const PROCESSING_PROMPTS: Record<AIProcessingMode, string> = {
  none: '',
  polite: `以下のメッセージを、敬語を使った丁寧な表現に変換してください。
メッセージの意味や内容は変えずに、ビジネスや公式な場面でも使える丁寧な言葉遣いにしてください。
変換したメッセージのみを出力し、説明は不要です。`,

  casual: `以下のメッセージを、カジュアルでフレンドリーな表現に変換してください。
友達同士の会話のような親しみやすい言葉遣いにしてください。
変換したメッセージのみを出力し、説明は不要です。`,

  concise: `以下のメッセージを、簡潔に要約してください。
重要なポイントだけを残して、短く分かりやすくまとめてください。
要約したメッセージのみを出力し、説明は不要です。`,

  translate_en: `以下のメッセージを英語に翻訳してください。
自然な英語表現を使い、元のニュアンスを保ってください。
翻訳したメッセージのみを出力し、説明は不要です。`,

  translate_ja: `以下のメッセージを日本語に翻訳してください。
自然な日本語表現を使い、元のニュアンスを保ってください。
翻訳したメッセージのみを出力し、説明は不要です。`,

  supplement: `以下のメッセージに、理解を助ける補足説明を追加してください。
元のメッセージの後に、関連する背景情報や詳細な説明を追加してください。
形式: [元のメッセージ]

📝 補足: [追加の説明]`,
};

export async function POST(request: Request) {
  try {
    const { content, mode } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (mode === 'none' || !mode) {
      return NextResponse.json({ processedContent: content });
    }

    const prompt = PROCESSING_PROMPTS[mode as AIProcessingMode];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid processing mode' },
        { status: 400 }
      );
    }

    // ANTHROPIC_API_KEY環境変数が設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY is not set. Using mock response.');
      // デモ用のモック処理
      const mockProcessedContent = getMockResponse(content, mode as AIProcessingMode);
      return NextResponse.json({ processedContent: mockProcessedContent });
    }

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt: `${prompt}\n\nメッセージ:\n${content}`,
    });

    return NextResponse.json({ processedContent: text });
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// デモ用のモックレスポンス生成
function getMockResponse(content: string, mode: AIProcessingMode): string {
  switch (mode) {
    case 'polite':
      return `${content}（丁寧バージョン - APIキーを設定するとAI処理が有効になります）`;
    case 'casual':
      return `${content}（カジュアルバージョン - APIキーを設定するとAI処理が有効になります）`;
    case 'concise':
      return `[要約] ${content.substring(0, 50)}...（APIキーを設定するとAI処理が有効になります）`;
    case 'translate_en':
      return `[English translation will appear here when API key is set] Original: ${content}`;
    case 'translate_ja':
      return `[APIキー設定後に翻訳が表示されます] 原文: ${content}`;
    case 'supplement':
      return `${content}\n\n📝 補足: （APIキーを設定すると、AIによる補足説明が追加されます）`;
    default:
      return content;
  }
}
