'use client';

import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-1 opacity-70">
            {message.senderName}
          </div>
        )}

        {message.isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="animate-pulse">AI処理中...</div>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap break-words">{message.content}</div>

            {message.originalContent && message.originalContent !== message.content && (
              <details className="mt-2 text-xs opacity-70">
                <summary className="cursor-pointer hover:opacity-100">
                  元のメッセージを表示
                </summary>
                <div className="mt-1 p-2 bg-black/10 dark:bg-white/10 rounded">
                  {message.originalContent}
                </div>
              </details>
            )}
          </>
        )}

        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'opacity-50'}`}>
          {formatTime(message.timestamp)}
          {message.processingMode && message.processingMode !== 'none' && (
            <span className="ml-2">
              ({message.processingMode === 'polite' && '丁寧に'}
              {message.processingMode === 'casual' && 'カジュアルに'}
              {message.processingMode === 'concise' && '簡潔に'}
              {message.processingMode === 'translate_en' && '英訳'}
              {message.processingMode === 'translate_ja' && '和訳'}
              {message.processingMode === 'supplement' && '補足付き'})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
