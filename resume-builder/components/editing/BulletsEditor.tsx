'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BulletItemProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}

function BulletItem({ id, value, onChange, onRemove }: BulletItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') setIsEditing(false);
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-1.5 group">
      <button
        {...attributes}
        {...listeners}
        className="mt-1 flex-shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14zm0-12a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 2z" />
        </svg>
      </button>

      <div className="flex-1">
        {isEditing ? (
          <textarea
            value={value}
            onChange={(e) => { onChange(e.target.value); autoResize(e.target); }}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            rows={2}
            autoFocus
            className="w-full text-xs text-gray-700 leading-relaxed border border-[#1E3A5F]/30 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]/40 bg-blue-50/20"
          />
        ) : (
          <p
            className="text-xs text-gray-700 leading-relaxed cursor-text py-0.5 hover:text-gray-900"
            onClick={() => setIsEditing(true)}
          >
            • {value}
          </p>
        )}
      </div>

      <button
        onClick={onRemove}
        className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
        aria-label="Remove bullet"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface BulletsEditorProps {
  bullets: string[];
  onChange: (b: string[]) => void;
  onDone: () => void;
}

export function BulletsEditor({ bullets, onChange, onDone }: BulletsEditorProps) {
  const ids = bullets.map((_, i) => `bullet-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    onChange(arrayMove(bullets, oldIdx, newIdx));
  }

  function updateBullet(idx: number, val: string) {
    const updated = [...bullets];
    updated[idx] = val;
    onChange(updated);
  }

  function removeBullet(idx: number) {
    onChange(bullets.filter((_, i) => i !== idx));
  }

  function addBullet() {
    onChange([...bullets, '']);
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-1">
        <button
          onClick={onDone}
          className="text-xs font-medium text-[#1E3A5F] hover:text-[#162d4a] border border-[#1E3A5F]/30 rounded px-2 py-0.5 hover:bg-[#1E3A5F]/5 transition-colors"
        >
          Done
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {bullets.map((bullet, i) => (
              <BulletItem
                key={ids[i]}
                id={ids[i]}
                value={bullet}
                onChange={(v) => updateBullet(i, v)}
                onRemove={() => removeBullet(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={addBullet}
        className="text-xs text-[#1E3A5F] hover:text-[#162d4a] font-medium mt-1 flex items-center gap-1"
      >
        <span>+</span> Add bullet
      </button>
    </div>
  );
}
