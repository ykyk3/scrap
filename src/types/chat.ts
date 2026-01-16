export type AIProcessingMode =
  | 'none'           // AI処理なし
  | 'polite'         // 丁寧に変換
  | 'casual'         // カジュアルに変換
  | 'concise'        // 簡潔に要約
  | 'translate_en'   // 英語に翻訳
  | 'translate_ja'   // 日本語に翻訳
  | 'supplement';    // 補足説明を追加

export interface Message {
  id: string;
  content: string;
  originalContent?: string;  // AI処理前の元メッセージ
  senderId: string;
  senderName: string;
  timestamp: Date;
  processingMode?: AIProcessingMode;
  isProcessing?: boolean;
}

export interface User {
  id: string;
  name: string;
}

export const AI_PROCESSING_OPTIONS: { value: AIProcessingMode; label: string; description: string }[] = [
  { value: 'none', label: 'なし', description: 'メッセージをそのまま送信' },
  { value: 'polite', label: '丁寧に', description: '敬語を使った丁寧な表現に変換' },
  { value: 'casual', label: 'カジュアルに', description: 'フレンドリーな表現に変換' },
  { value: 'concise', label: '簡潔に', description: '要点をまとめて短くする' },
  { value: 'translate_en', label: '英語に翻訳', description: '英語に翻訳して送信' },
  { value: 'translate_ja', label: '日本語に翻訳', description: '日本語に翻訳して送信' },
  { value: 'supplement', label: '補足追加', description: '説明や背景情報を追加' },
];
