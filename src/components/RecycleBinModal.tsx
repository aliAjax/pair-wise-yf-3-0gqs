import { useEffect } from 'react';
import { X, RotateCcw, Trash2, Trash } from 'lucide-react';
import type { SmellMemory } from '../utils/constants';
import { getSeasonInfo, getSmellTypeInfo, getEmotionInfo } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import type { TrashedMemory } from '../store/memoryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trashed: TrashedMemory[];
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
  onEmpty: () => void;
}

function TrashedRow({
  item,
  onRestore,
  onPurge,
}: {
  item: TrashedMemory;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
}) {
  const m: SmellMemory = item.memory;
  const season = getSeasonInfo(m.season);
  const stype = getSmellTypeInfo(m.smell_type);
  const emotion = getEmotionInfo(m.emotion);

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-paper-100/70 border border-paper-200/80">
      <div
        className="w-1.5 self-stretch shrink-0 rounded-full opacity-50"
        style={{ backgroundColor: m.color_association }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-ink-800 leading-tight truncate">
            {m.location}
          </h3>
          <span className="shrink-0 text-xs text-ink-700/50">
            强度 {m.intensity}/10
          </span>
        </div>
        <p className="text-sm text-ink-700/65 mt-0.5 truncate">
          <span className="mr-1">{stype.emoji}</span>
          {m.source_guess}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-ink-700/50">
          <span className={`scent-tag ${emotion.bg} ${emotion.text}`}>
            {emotion.emoji} {emotion.label}
          </span>
          <span>{season.emoji} {season.label}</span>
          <span>封存于 {formatDate(m.created_at)}</span>
          <span className="text-brick-500/80">移入回收站 {formatDate(item.trashedAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onRestore(m.id)}
          title="恢复到主列表"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-moss-600 hover:bg-moss-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">恢复</span>
        </button>
        <button
          onClick={() => onPurge(m.id)}
          title="永久删除"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-brick-500 hover:bg-brick-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">彻底删除</span>
        </button>
      </div>
    </div>
  );
}

export default function RecycleBinModal({
  isOpen,
  onClose,
  trashed,
  onRestore,
  onPurge,
  onEmpty,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-8 md:p-6 overflow-y-auto">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />
      <div className="relative w-full max-w-2xl bg-paper-50 rounded-3xl shadow-2xl border border-paper-300 animate-slideDown">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-paper-200 rounded-t-3xl bg-paper-50/95 backdrop-blur">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink-800 flex items-center gap-2">
              <Trash className="w-5 h-5 text-ochre-600" />
              回收站
            </h2>
            <p className="text-sm text-ink-700/60 mt-0.5 font-hand">
              这里的气味不会计入统计，恢复后可回到主列表
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-700/60 hover:text-ink-800 hover:bg-paper-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {trashed.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4 select-none">🗑️</div>
              <h3 className="font-serif text-xl text-ink-800 mb-2">回收站是空的</h3>
              <p className="text-ink-700/55 text-sm">
                误删的气味会先暂存在这里，随时可以找回
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-ink-700/50">
                  共 {trashed.length} 条待处理
                </span>
                <button
                  onClick={onEmpty}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brick-500 hover:bg-brick-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空回收站
                </button>
              </div>
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {trashed.map((item) => (
                  <TrashedRow
                    key={item.memory.id}
                    item={item}
                    onRestore={onRestore}
                    onPurge={onPurge}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-paper-200 rounded-b-3xl">
          <button type="button" onClick={onClose} className="btn-secondary">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
