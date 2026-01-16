'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { UserSelector } from '@/components/UserSelector';
import { Message, User, AIProcessingMode } from '@/types/chat';

// デモ用のユーザー
const DEMO_USERS: User[] = [
  { id: 'user-1', name: 'ユーザーA' },
  { id: 'user-2', name: 'ユーザーB' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージリストの最下部へスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI処理を実行
  const processWithAI = async (content: string, mode: AIProcessingMode): Promise<string> => {
    if (mode === 'none') {
      return content;
    }

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode }),
      });

      if (!response.ok) {
        throw new Error('AI processing failed');
      }

      const data = await response.json();
      return data.processedContent;
    } catch (error) {
      console.error('AI processing error:', error);
      // エラー時は元のメッセージを返す
      return content;
    }
  };

  // メッセージ送信
  const handleSend = async (content: string, processingMode: AIProcessingMode) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 処理中メッセージを追加
    const pendingMessage: Message = {
      id: messageId,
      content: content,
      originalContent: content,
      senderId: currentUser.id,
      senderName: currentUser.name,
      timestamp: new Date(),
      processingMode,
      isProcessing: processingMode !== 'none',
    };

    setMessages((prev) => [...prev, pendingMessage]);

    if (processingMode !== 'none') {
      setIsProcessing(true);

      // AI処理を実行
      const processedContent = await processWithAI(content, processingMode);

      // メッセージを更新
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: processedContent, isProcessing: false }
            : msg
        )
      );

      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Chat Prototype
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AIを介したコミュニケーション
              </p>
            </div>
            <UserSelector
              users={DEMO_USERS}
              currentUser={currentUser}
              onUserChange={setCurrentUser}
            />
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium">メッセージがありません</p>
              <p className="text-sm mt-2">
                下の入力欄からメッセージを送信してみましょう。<br />
                AI処理オプションを選択すると、メッセージが変換されます。
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUser.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSend={handleSend} disabled={isProcessing} />
      </div>
    </div>
  );
}
