import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { X, MessageSquarePlus, Target, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { momentsApi } from '../../lib/api/moments';
import { supabase } from '../../lib/supabaseClient';
import type { EntityRef } from '../../lib/api/moments';

interface ChangeItem {
  label: string;
  from?: unknown;
  to?: unknown;
}

interface MomentPromptType {
  id: string;
  entityRef: EntityRef;
  entityName?: string;
  changes: ChangeItem[];
}

interface MomentPromptProps {
  prompt: MomentPromptType;
  onDismiss: () => void;
}

interface ExtraMomentType {
  type: 'target' | 'definition';
  label: string;
  icon: LucideIcon;
  description: string;
  inputType: 'date' | 'text';
  placeholder: string | null;
}

const EXTRA_MOMENT_TYPES: ExtraMomentType[] = [
  {
    type: 'target',
    label: 'Set a target',
    icon: Target,
    description:
      'Your personal goal date — when you want it done, not when it must be done.',
    inputType: 'date',
    placeholder: null,
  },
  {
    type: 'definition',
    label: 'Define the work',
    icon: BookOpen,
    description:
      'What kind of work is this? What does "done" mean conceptually? (Used for future analysis, not day-to-day tracking.)',
    inputType: 'text',
    placeholder:
      'e.g. "Creative research — done when the hypothesis is validated, not when a deliverable ships."',
  },
];

function ChangeChip({ change }: { change: ChangeItem }) {
  return (
    <span className="bg-ink-700 text-ink-300 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
      <span className="text-ink-500">{change.label}</span>
      {change.from != null && (
        <>
          <span className="text-ink-600 line-through">
            {String(change.from)}
          </span>
          <span className="text-ink-600">→</span>
        </>
      )}
      <span className="font-medium text-amber-400">{String(change.to)}</span>
    </span>
  );
}

export default function MomentPrompt({ prompt, onDismiss }: MomentPromptProps) {
  const [note, setNote] = useState<string>('');
  const [extraType, setExtraType] = useState<'target' | 'definition' | null>(
    null
  );
  const [extraValue, setExtraValue] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();

    if (saving || (!note.trim() && !extraValue.trim())) return;

    setSaving(true);
    try {
      const saves: Promise<unknown | void>[] = [];

      if (note.trim()) {
        saves.push(
          momentsApi.attachNoteToLatestChange(prompt.entityRef, note.trim())
        );
      }

      if (extraType && extraValue.trim()) {
        const insertPromise = (async () => {
          const { error } = await supabase.from('moments').insert({
            ...prompt.entityRef,
            moment_type: extraType,
            value: extraType === 'target' ? extraValue : null,
            moment_note: extraType === 'definition' ? extraValue.trim() : null,
          });

          if (error) throw error;
        })();

        saves.push(insertPromise);
      }

      await Promise.all(saves);
      onDismiss();
    } catch (error) {
      console.error('Erro ao guardar o momento:', error);
    } finally {
      setSaving(false);
    }
  }

  const activeMeta = EXTRA_MOMENT_TYPES.find((m) => m.type === extraType);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-ink-800 bg-ink-950 text-ink-50 fixed right-4 bottom-4 z-50 w-80 rounded-xl border p-1 shadow-2xl"
    >
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="text-copper-400 h-4 w-4" />
          <span className="text-xs font-medium tracking-tight">
            Add context to {prompt.entityName || 'change'}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-ink-500 hover:text-ink-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 px-3.5 pb-2.5">
        {prompt.changes.map((change) => (
          <ChangeChip key={change.label} change={change} />
        ))}
      </div>

      <div className="px-2">
        <input
          type="text"
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why did this change? (Optional)"
          disabled={saving}
          className="border-ink-800 bg-ink-900 text-ink-100 placeholder:text-ink-600 focus:border-copper-500 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1 p-2">
        {EXTRA_MOMENT_TYPES.map((meta) => {
          const Icon = meta.icon;
          const isSelected = extraType === meta.type;
          return (
            <button
              key={meta.type}
              type="button"
              onClick={() => setExtraType(isSelected ? null : meta.type)}
              className={clsx(
                'hover:bg-ink-800 flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
                isSelected ? 'bg-ink-800 text-copper-400' : 'text-ink-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {activeMeta && (
        <div className="border-ink-900 bg-ink-900/50 border-t p-3">
          <p className="text-ink-400 mb-2 text-[11px] leading-relaxed">
            {activeMeta.description}
          </p>
          <input
            type={activeMeta.inputType === 'date' ? 'date' : 'text'}
            autoFocus
            value={extraValue}
            onChange={(e) => setExtraValue(e.target.value)}
            placeholder={activeMeta.placeholder || undefined}
            className="border-ink-600 bg-ink-900 text-ink-100 placeholder:text-ink-600 focus:border-copper-400 w-full rounded border px-2.5 py-2 text-sm focus:outline-none"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 px-3.5 py-3">
        <button
          type="button"
          onClick={onDismiss}
          className="text-ink-500 hover:text-ink-300 text-xs"
        >
          Skip
        </button>
        <button
          type="submit"
          disabled={saving || (!note.trim() && !extraValue.trim())}
          className="bg-copper-500 text-ink-950 hover:bg-copper-400 disabled:bg-ink-800 disabled:text-ink-600 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
