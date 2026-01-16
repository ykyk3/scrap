'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { AIProcessingMode, AI_PROCESSING_OPTIONS } from '@/types/chat';

interface ChatInputProps {
  onSend: (content: string, processingMode: AIProcessingMode) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [processingMode, setProcessingMode] = useState<AIProcessingMode>('none');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled) {
      onSend(content.trim(), processingMode);
      setContent('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const selectedOption = AI_PROCESSING_OPTIONS.find(opt => opt.value === processingMode);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {/* AI Processing Options */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI処理: <span className="font-medium">{selectedOption?.label}</span>
          <svg className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showOptions && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AI_PROCESSING_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setProcessingMode(option.value);
                  setShowOptions(false);
                }}
                className={`p-2 rounded-lg text-left transition-colors ${
                  processingMode === option.value
                    ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Shift+Enterで改行)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          送信
        </button>
      </form>
    </div>
  );
}
