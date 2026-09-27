import type { SmellMemory } from '../utils/constants';
import { getSeasonInfo, getSmellTypeInfo, getEmotionInfo } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { RotateCcw, Trash2 } from 'lucide-react';

interface Props {
  memory: SmellMemory;
  index: number;
  onRestore: () => void;
  onPurge: () => void;
}

export default function TrashItem({ memory, index, onRestore, onPurge }: Props) {
  const season = getSeasonInfo(memory.season);
  const stype = getSmellTypeInfo(memory.smell_type);
  const emotion = getEmotionInfo(memory.emotion);

  return (
    <article
      className="relative bg-paper-50/80 rounded-2xl border border-dashed border-paper-400 shadow-card overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300 animate-fadeInUp"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <div className="flex">
        <div
          className="w-2 shrink-0 grayscale"
          style={{ backgroundColor: memory.color_association }}
        />
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg font-semibold text-ink-800/80 leading-tight truncate">
                {memory.location}
              </h3>
              <p className="text-sm text-ink-700/60 mt-0.5 truncate">
                <span className="mr-1" style={{ color: stype.color }}>{stype.emoji}</span>
                {memory.source_guess}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-full bg-paper-200/80 text-ink-700/60 text-[11px]">
              <Trash2 className="w-3 h-3" />
              已删除
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`scent-tag ${emotion.bg} ${emotion.text} opacity-80`}>
              {emotion.emoji} {emotion.label}
            </span>
            <span className="scent-tag bg-ochre-100 text-ochre-600 opacity-80">
              {season.emoji} {season.label}
            </span>
            <span
              className="scent-tag text-paper-50 opacity-80"
              style={{ backgroundColor: stype.color }}
            >
              {stype.label}
            </span>
            <span className="scent-tag bg-paper-200 text-ink-700/70">
              强度 {memory.intensity}/10
            </span>
          </div>

          {memory.memory_text && (
            <p className="text-[13px] leading-relaxed text-ink-700/50 font-serif line-clamp-2 mb-3">
              {memory.memory_text}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-paper-200/70">
            <span className="text-[11px] text-ink-700/45">
              于 {formatDate(memory.deleted_at!)} 移入回收站
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onRestore}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-moss-600 hover:bg-moss-100 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 恢复
              </button>
              <button
                onClick={onPurge}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-brick-500 hover:bg-brick-500/10 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> 永久删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
