import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  productIds: string[];
  compareIds: string[];
  suggestions: string[];
  status: 'streaming' | 'done' | 'stopped' | 'error';
  createdAt: number;
}

interface AssistantState {
  messages: AssistantMessage[];
  add: (message: Omit<AssistantMessage, 'id' | 'createdAt'>) => string;
  update: (id: string, patch: Partial<AssistantMessage>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      messages: [],
      add: (message) => {
        const id = createId();
        set((state) => ({
          messages: [...state.messages, { ...message, id, createdAt: Date.now() }],
        }));
        return id;
      },
      update: (id, patch) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, ...patch } : message,
          ),
        })),
      remove: (id) =>
        set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),
      clear: () => set({ messages: [] }),
    }),
    {
      name: 'klarwerk.assistant.v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        messages: state.messages.map((message) =>
          message.status === 'streaming' ? { ...message, status: 'stopped' as const } : message,
        ),
      }),
    },
  ),
);
