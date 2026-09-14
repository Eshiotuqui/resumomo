import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PostIt } from '../types';

const POSTIT_COLORS = ['#fef08a', '#fed7aa', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fecdd3'];

interface DeskPostItProps {
  postIt: PostIt;
  onUpdate: (updates: Partial<PostIt>) => void;
  onRemove: () => void;
}

export default function DeskPostIt({ postIt, onUpdate, onRemove }: DeskPostItProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [pos, setPos] = useState({ x: postIt.x, y: postIt.y });
  const dragOffset = useRef({ x: 0, y: 0 });
  const elRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(Math.random() * 6 - 3).current;

  useEffect(() => {
    if (!isDragging) {
      setPos({ x: postIt.x, y: postIt.y });
    }
  }, [postIt.x, postIt.y, isDragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).tagName === 'BUTTON') return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const rect = elRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    const clampedX = Math.max(0, Math.min(newX, window.innerWidth - postIt.width));
    const clampedY = Math.max(0, Math.min(newY, window.innerHeight - postIt.height));

    setPos({ x: clampedX, y: clampedY });
  }, [isDragging, postIt.width, postIt.height]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    onUpdate({ x: pos.x, y: pos.y });
  }, [isDragging, pos, onUpdate]);

  return (
    <motion.div
      ref={elRef}
      className="fixed rounded-sm select-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: postIt.width,
        height: postIt.height,
        backgroundColor: postIt.color,
        zIndex: isDragging ? 200 : 60,
        cursor: isDragging ? 'grabbing' : 'grab',
        rotate: isDragging ? 0 : rotation,
        touchAction: 'none',
        boxShadow: isDragging
          ? '6px 10px 25px rgba(0,0,0,0.35)'
          : '3px 3px 10px rgba(0,0,0,0.25)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isDragging ? 1.1 : 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Tape */}
      <div
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm opacity-50"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,200,0.8), rgba(255,255,180,0.4))',
          transform: 'translateX(-50%) rotate(-1deg)',
        }}
      />

      {/* Remove - always visible */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all z-30 shadow-md"
        title="Deletar post-it"
      >
        &times;
      </button>

      {/* Color picker */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }}
        className="absolute top-1 right-1 w-4 h-4 rounded-full border border-gray-400/30 opacity-50 hover:opacity-100 transition-opacity z-30"
        style={{ backgroundColor: postIt.color, filter: 'brightness(0.85)' }}
      />

      <AnimatePresence>
        {showColors && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-9 right-0 flex gap-1 bg-white rounded-lg p-1.5 shadow-lg z-40"
          >
            {POSTIT_COLORS.map((color) => (
              <button
                key={color}
                className="w-5 h-5 rounded-full border-2 hover:scale-125 transition-transform"
                style={{
                  backgroundColor: color,
                  borderColor: postIt.color === color ? '#333' : '#e5e7eb',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ color });
                  setShowColors(false);
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <textarea
        className="w-full h-full p-3 pt-5 bg-transparent resize-none outline-none font-caveat text-sm text-gray-800 leading-tight cursor-text"
        value={postIt.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Anotacao na bancada..."
        style={{ touchAction: 'auto' }}
      />
    </motion.div>
  );
}
