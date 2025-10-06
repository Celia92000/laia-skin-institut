"use client";

import { useState, useEffect } from "react";

interface ModernImageEditorProps {
  imageUrl: string;
  objectFit: 'cover' | 'contain' | 'fill';
  position: { x: number; y: number };
  zoom: number;
  onObjectFitChange: (fit: 'cover' | 'contain' | 'fill') => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
}

export default function ModernImageEditor({
  imageUrl,
  objectFit,
  position,
  zoom,
  onObjectFitChange,
  onPositionChange,
  onZoomChange
}: ModernImageEditorProps) {
  return (
    <div className="mt-6 bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Éditeur d'image moderne
        </h3>
        <p className="text-purple-100 text-sm mt-1">🖱️ Drag & drop • 🔍 Molette pour zoomer • Contrôles tactiles</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Preview Section */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
            <div className="grid grid-cols-3 grid-rows-3 h-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/30"></div>
              ))}
            </div>
          </div>

          {/* Interactive Image */}
          <div
            className="relative h-80 cursor-move select-none"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;
              const startPosX = position.x;
              const startPosY = position.y;
              const rect = e.currentTarget.getBoundingClientRect();

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
                const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;
                onPositionChange({
                  x: Math.max(0, Math.min(100, startPosX + deltaX)),
                  y: Math.max(0, Math.min(100, startPosY + deltaY))
                });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -5 : 5;
              onZoomChange(Math.max(50, Math.min(200, zoom + delta)));
            }}
          >
            <img
              src={imageUrl}
              alt="Aperçu"
              className="w-full h-full transition-transform duration-100"
              style={{
                objectFit,
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${zoom / 100})`
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
              }}
              draggable={false}
            />
            {/* Position indicator */}
            <div
              className="absolute w-4 h-4 bg-purple-500 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            />
          </div>

          {/* Quick info overlay */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-3">
            <span>📍 {position.x}%, {position.y}%</span>
            <span className="text-purple-300">|</span>
            <span>🔍 {zoom}%</span>
          </div>
        </div>

        {/* Compact Toolbar */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
          {/* Mode buttons */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { mode: 'cover' as const, icon: '⬜', tooltip: 'Remplir' },
              { mode: 'contain' as const, icon: '🔲', tooltip: 'Contenir' },
              { mode: 'fill' as const, icon: '↔️', tooltip: 'Étirer' }
            ].map(({ mode, icon, tooltip }) => (
              <button
                key={mode}
                type="button"
                title={tooltip}
                onClick={() => onObjectFitChange(mode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  objectFit === mode
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Quick positions */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { x: 0, y: 0, icon: '↖' }, { x: 50, y: 0, icon: '↑' }, { x: 100, y: 0, icon: '↗' },
              { x: 0, y: 50, icon: '←' }, { x: 50, y: 50, icon: '·' }, { x: 100, y: 50, icon: '→' },
              { x: 0, y: 100, icon: '↙' }, { x: 50, y: 100, icon: '↓' }, { x: 100, y: 100, icon: '↘' }
            ].map(({ x, y, icon }) => (
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onPositionChange({ x, y });
                }}
                className={`w-7 h-7 text-xs rounded transition-all ${
                  position.x === x && position.y === y
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              className="w-7 h-7 text-gray-600 hover:text-gray-900 font-bold"
            >
              −
            </button>
            <span className="text-xs font-mono font-bold text-purple-600 min-w-[40px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="w-7 h-7 text-gray-600 hover:text-gray-900 font-bold"
            >
              +
            </button>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              onObjectFitChange('cover');
              onPositionChange({ x: 50, y: 50 });
              onZoomChange(100);
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs"
            title="Réinitialiser"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}
