import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SmellMemory, Season, SmellType, Emotion } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { mockMemories } from '../data/mockData';

export interface MemoryInput {
  location: string;
  source_guess: string;
  intensity: number;
  humidity: number;
  season: Season;
  smell_type: SmellType;
  memory_text: string;
  color_association: string;
  emotion: Emotion;
  want_again: boolean;
}

interface MemoryStore {
  memories: SmellMemory[];
  /** 是否已经完成过初始化（避免清空后又被 mock 数据复活） */
  initialized: boolean;
  addMemory: (input: MemoryInput) => void;
  updateMemory: (id: string, input: MemoryInput) => void;
  /** 软删除：移入回收站 */
  deleteMemory: (id: string) => void;
  /** 从回收站恢复 */
  restoreMemory: (id: string) => void;
  /** 永久删除单条 */
  purgeMemory: (id: string) => void;
  /** 清空回收站（从本地存储彻底移除） */
  clearTrash: () => void;
  initIfEmpty: () => void;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: [],
      initialized: false,
      addMemory: (input) => {
        const now = new Date().toISOString();
        const newMem: SmellMemory = {
          id: generateId(),
          ...input,
          created_at: now,
          updated_at: now,
        };
        set({ memories: [newMem, ...get().memories] });
      },
      updateMemory: (id, input) => {
        set({
          memories: get().memories.map((m) =>
            m.id === id
              ? { ...m, ...input, updated_at: new Date().toISOString() }
              : m,
          ),
        });
      },
      deleteMemory: (id) => {
        const now = new Date().toISOString();
        set({
          memories: get().memories.map((m) =>
            m.id === id ? { ...m, deleted_at: now } : m,
          ),
        });
      },
      restoreMemory: (id) => {
        set({
          memories: get().memories.map((m) => {
            if (m.id !== id) return m;
            const { deleted_at, ...rest } = m;
            void deleted_at;
            return rest;
          }),
        });
      },
      purgeMemory: (id) => {
        set({ memories: get().memories.filter((m) => m.id !== id) });
      },
      clearTrash: () => {
        set({ memories: get().memories.filter((m) => !m.deleted_at) });
      },
      initIfEmpty: () => {
        if (get().initialized) return;
        // 首次使用且没有任何档案时灌入示例数据
        if (get().memories.filter((m) => !m.deleted_at).length === 0) {
          set({ memories: mockMemories, initialized: true });
        } else {
          set({ initialized: true });
        }
      },
    }),
    {
      name: 'scent-memory-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
