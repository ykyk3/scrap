'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { UserSelector } from '@/components/UserSelector';
import { Message, User, AIProcessingMode } from '@/types/chat';
import {
  subscribeToMessages,
  broadcastMessage,
  unsubscribeFromMessages,
  isSupabaseConfigured,
} from '@/lib/supabase';

// デモ用のユーザー
const DEMO_USERS: User[] = [
  { id: 'user-1', name: 'ユーザーA' },
  { id: 'user-2', name: 'ユーザーB' },
];

const ROOM_ID = 'demo-room';

export default function RealtimeChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // メッセージリストの最下部へスクロール
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Supabase Realtime のセットアップ
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase is not configured. Running in local mode.');
      return;
    }

    // メッセージを受信したときの処理
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        // 重複チェック
        if (prev.some((m) => m.id === message.id)) {
          // 既存メッセージの更新（AI処理完了時など）
          return prev.map((m) => (m.id === message.id ? message : m));
        }
        return [...prev, message];
      });
    };

    // チャンネルに接続
    channelRef.current = subscribeToMessages(ROOM_ID, handleNewMessage);
    setIsConnected(true);

    // クリーンアップ
    return () => {
      unsubscribeFromMessages(channelRef.current);
      setIsConnected(false);
    };
  }, []);

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
      return content;
    }
  };

  // メッセージ送信
  const handleSend = async (content: string, processingMode: AIProcessingMode) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 処理中メッセージを作成
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

    // ローカルに追加
    setMessages((prev) => [...prev, pendingMessage]);

    // Realtimeでブロードキャスト（処理中状態）
    if (isSupabaseConfigured()) {
      await broadcastMessage(ROOM_ID, pendingMessage);
    }

    if (processingMode !== 'none') {
      setIsProcessing(true);

      // AI処理を実行
      const processedContent = await processWithAI(content, processingMode);

      // 完了したメッセージを作成
      const completedMessage: Message = {
        ...pendingMessage,
        content: processedContent,
        isProcessing: false,
      };

      // ローカルを更新
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? completedMessage : msg))
      );

      // Realtimeでブロードキャスト（完了状態）
      if (isSupabaseConfigured()) {
        await broadcastMessage(ROOM_ID, completedMessage);
      }

      setIsProcessing(false);
    }
  };

  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Chat - Realtime
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseConfigured && isConnected
                      ? 'bg-green-500'
                      : supabaseConfigured
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                />
                {supabaseConfigured
                  ? isConnected
                    ? 'リアルタイム接続中'
                    : '接続中...'
                  : 'ローカルモード（Supabase未設定）'}
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

      {/* Connection Notice */}
      {!supabaseConfigured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="max-w-4xl mx-auto text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Supabaseが設定されていません。複数ユーザー間のリアルタイム通信を有効にするには、
            <code className="mx-1 px-1 bg-yellow-200 dark:bg-yellow-800 rounded">
              .env.local
            </code>
            にSupabaseの設定を追加してください。
          </div>
        </div>
      )}

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
              {supabaseConfigured && (
                <p className="text-sm mt-4 text-blue-500">
                  別のブラウザやタブで開くと、リアルタイムでメッセージが同期されます。
                </p>
              )}
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
