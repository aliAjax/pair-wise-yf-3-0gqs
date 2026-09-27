import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import TrashItem from '../components/TrashItem';
import { useMemoryStore } from '../store/memoryStore';
import { getTrashedMemories } from '../utils/helpers';

export default function Trash() {
  const {
    memories,
    initIfEmpty,
    restoreMemory,
    purgeMemory,
    clearTrash,
  } = useMemoryStore();

  useEffect(() => {
    initIfEmpty();
  }, [initIfEmpty]);

  const trashed = useMemo(() => getTrashedMemories(memories), [memories]);

  const handlePurge = (id: string) => {
    const target = trashed.find((m) => m.id === id);
    const ok = window.confirm(
      `确认永久删除「${target?.location ?? '这段记忆'}」吗？\n删除后将无法恢复。`,
    );
    if (ok) purgeMemory(id);
  };

  const handleClearAll = () => {
    const ok = window.confirm(
      `确认清空回收站吗？共 ${trashed.length} 段气味记忆将被永久删除，无法恢复。`,
    );
    if (ok) clearTrash();
  };

  return (
    <div className="min-h-screen">
      <header className="relative pt-12 pb-6 md:pt-16 md:pb-10">
        <div className="container max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ochre-600 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            返回气味档案
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-800 flex items-center gap-3">
                <span className="text-brick-500/80">
                  <Trash2 className="w-8 h-8 md:w-9 md:h-9" />
                </span>
                回收站
              </h1>
              <p className="mt-2 font-hand text-lg text-ink-700/60">
                {trashed.length > 0
                  ? `这里躺着 ${trashed.length} 段被误删的气味，恢复或永久清理都可以`
                  : '误删的气味会先来到这里，还可以把它们救回去'}
              </p>
            </div>
            {trashed.length > 0 && (
              <button
                onClick={handleClearAll}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brick-500 hover:bg-brick-600 text-paper-50 transition-all duration-200 shadow-paper hover:-translate-y-0.5"
              >
                <Trash2 className="w-4 h-4" />
                清空回收站（{trashed.length}）
              </button>
            )}
          </div>
          <div
            className="mt-6 h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #CBB993 20%, #CBB993 80%, transparent 100%)',
            }}
          />
        </div>
      </header>

      <main className="container max-w-6xl pb-20">
        {trashed.length === 0 ? (
          <div className="bg-paper-50/70 backdrop-blur rounded-3xl border-2 border-dashed border-paper-400 py-20 text-center">
            <div className="text-6xl mb-4 select-none">🗑️</div>
            <h3 className="font-serif text-2xl text-ink-800 mb-2">回收站是空的</h3>
            <p className="text-ink-700/60 max-w-md mx-auto mb-6">
              被误删的气味会暂时保存在这里；清空之后才会从本地彻底消失
            </p>
            <Link to="/" className="btn-primary inline-flex">
              回到气味档案
            </Link>
          </div>
        ) : (
          <div className="masonry-grid">
            {trashed.map((m, idx) => (
              <div key={m.id} data-memory-id={m.id}>
                <TrashItem
                  memory={m}
                  index={idx}
                  onRestore={() => restoreMemory(m.id)}
                  onPurge={() => handlePurge(m.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="pb-10 pt-4 text-center text-xs text-ink-700/40 font-hand text-lg">
        <p>愿每一缕气味，都是打开旧时光的钥匙 · Scent Archive</p>
      </footer>
    </div>
  );
}
