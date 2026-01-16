import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Message } from '@/types/chat';

// Supabase クライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// クライアントが設定されているかチェック
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Realtime チャンネルのセットアップ
export function subscribeToMessages(
  roomId: string,
  onMessage: (message: Message) => void
): RealtimeChannel | null {
  if (!supabase) {
    console.warn('Supabase is not configured. Realtime features are disabled.');
    return null;
  }

  const channel = supabase
    .channel(`chat:${roomId}`)
    .on('broadcast', { event: 'message' }, (payload) => {
      const message = payload.payload as Message;
      // タイムスタンプをDateオブジェクトに変換
      message.timestamp = new Date(message.timestamp);
      onMessage(message);
    })
    .subscribe();

  return channel;
}

// メッセージをブロードキャスト
export async function broadcastMessage(
  roomId: string,
  message: Message
): Promise<void> {
  if (!supabase) {
    console.warn('Supabase is not configured. Message broadcast skipped.');
    return;
  }

  const channel = supabase.channel(`chat:${roomId}`);

  await channel.send({
    type: 'broadcast',
    event: 'message',
    payload: message,
  });
}

// チャンネルの購読解除
export function unsubscribeFromMessages(channel: RealtimeChannel | null): void {
  if (channel && supabase) {
    supabase.removeChannel(channel);
  }
}
