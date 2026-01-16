'use client';

import { User } from '@/types/chat';

interface UserSelectorProps {
  users: User[];
  currentUser: User;
  onUserChange: (user: User) => void;
}

export function UserSelector({ users, currentUser, onUserChange }: UserSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300">ユーザー切替:</span>
      <div className="flex gap-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserChange(user)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentUser.id === user.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
}
