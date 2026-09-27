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

export interface TrashedMemory {
  memory: SmellMemory;
  trashedAt: string;
}

interface MemoryStore {
  memories: SmellMemory[];
  trashedMemories: TrashedMemory[];
  seeded: boolean;
  addMemory: (input: MemoryInput) => void;
  updateMemory: (id: string, input: MemoryInput) => void;
  /** 软删除：移入回收站，不参与列表与统计，但仍保存在本地 */
  deleteMemory: (id: string) => void;
  /** 从回收站恢复到主列表 */
  restoreMemory: (id: string) => void;
  /** 彻底删除回收站中的单条记录（本地持久化同步移除） */
  purgeMemory: (id: string) => void;
  /** 清空回收站（本地持久化同步移除） */
  emptyTrash: () => void;
  initIfEmpty: () => void;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: [],
      trashedMemories: [],
      seeded: false,
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
        const target = get().memories.find((m) => m.id === id);
        if (!target) return;
        set({
          memories: get().memories.filter((m) => m.id !== id),
          trashedMemories: [
            { memory: target, trashedAt: new Date().toISOString() },
            ...get().trashedMemories.filter((t) => t.memory.id !== id),
          ],
        });
      },
      restoreMemory: (id) => {
        const entry = get().trashedMemories.find((t) => t.memory.id === id);
        if (!entry) return;
        // 恢复后放在列表最前，方便用户立刻看到找回的记录
        set({
          memories: [entry.memory, ...get().memories.filter((m) => m.id !== id)],
          trashedMemories: get().trashedMemories.filter((t) => t.memory.id !== id),
        });
      },
      purgeMemory: (id) => {
        set({
          trashedMemories: get().trashedMemories.filter((t) => t.memory.id !== id),
        });
      },
      emptyTrash: () => {
        set({ trashedMemories: [] });
      },
      initIfEmpty: () => {
        if (!get().seeded) {
          set({ memories: mockMemories, seeded: true });
        }
      },
    }),
    {
      name: 'scent-memory-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // v0 的存档没有 seeded 标记：老用户已经初始化过，不应在删空后重新灌入示例数据
      migrate: (persistedState: unknown, version) => {
        const state = (persistedState ?? {}) as Partial<MemoryStore>;
        if (version < 1) {
          return { ...state, seeded: true };
        }
        return state;
      },
    },
  ),
);
