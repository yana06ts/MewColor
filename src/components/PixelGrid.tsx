import React, { useState, useRef, useEffect } from "react";
import { PuzzleTemplate, CellProgress } from "../data/puzzles";
import SOUNDS from "../utils/sound";
import { ZoomIn, ZoomOut, RotateCcw, Paintbrush, Hand, Sparkles, AlertCircle, Bomb, Sparkle } from "lucide-react";

interface PixelGridProps {
  puzzle: PuzzleTemplate;
  progress: CellProgress[];
  selectedColorNumber: number;
  onPixelColored: (index: number | number[]) => void;
  onUsePowerup: (powerupType: "wand" | "bomb" | "magnifier") => void;
  powerupCounts: { wand: number; bomb: number; magnifier: number };
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
  life: number;
}

export function PixelGrid({
  puzzle,
  progress,
  selectedColorNumber,
  onPixelColored,
  onUsePowerup,
  powerupCounts,
}: PixelGridProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<"draw" | "pan">("draw");
  const [activeSpecialTool, setActiveSpecialTool] = useState<"pencil" | "wand" | "bomb">("pencil");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [errorCell, setErrorCell] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);

  // Trigger temporary red flash for error feedback
  const triggerErrorFlash = (index: number) => {
    setErrorCell(index);
    SOUNDS.playError();
    setTimeout(() => {
      setErrorCell((curr) => (curr === index ? null : curr));
    }, 400);
  };

  // Create cute visual sparks (particles)
  const spawnParticles = (row: number, col: number, colorHex: string) => {
    // Coordinate relative to block
    const numParticles = 8;
    const newParticles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: Math.random() + i,
        x: col * 100 + 50, // Center of 100px block virtual grid
        y: row * 100 + 50,
        color: colorHex,
        angle: (i * 2 * Math.PI) / numParticles + Math.random() * 0.4 - 0.2,
        speed: 8 + Math.random() * 8,
        life: 1.0,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Particle updates
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed,
            life: p.life - 0.08,
          }))
          .filter((p) => p.life > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [particles]);

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 250));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  // Handle core cell coloring logic when user draws on a cell
  const handleCellAction = (index: number, row: number, col: number) => {
    const cell = progress[index];
    if (cell.filled) return; // already done

    if (cell.number === 0) return; // transparent spacer

    const targetColor = puzzle.colors.find((c) => c.number === cell.number);
    const selectedColorHex = puzzle.colors.find((c) => c.number === selectedColorNumber)?.hex || "#333";

    // 1. Wand Powerup Active?
    if (activeSpecialTool === "wand") {
      if (powerupCounts.wand <= 0) {
        SOUNDS.playError();
        return;
      }
      // Deduct wand powerup
      onUsePowerup("wand");
      SOUNDS.playSuccessColor();
      
      // Flood fill identical adjacent numbers
      const targetNum = cell.number;
      const visited = new Set<number>();
      const queue = [index];
      const indicesToColor: number[] = [];

      while (queue.length > 0) {
        const currIdx = queue.shift()!;
        if (visited.has(currIdx)) continue;
        visited.add(currIdx);

        const currCell = progress[currIdx];
        if (currCell && !currCell.filled && currCell.number === targetNum) {
          indicesToColor.push(currIdx);
          const r = Math.floor(currIdx / puzzle.width);
          const c = Math.floor(currIdx % puzzle.width);
          spawnParticles(r, c, targetColor?.hex || selectedColorHex);
          
          // Get neighbors
          const neighbors = [];
          if (r > 0) neighbors.push(currIdx - puzzle.width);
          if (r < puzzle.height - 1) neighbors.push(currIdx + puzzle.width);
          if (c > 0) neighbors.push(currIdx - 1);
          if (c < puzzle.width - 1) neighbors.push(currIdx + 1);

          neighbors.forEach((n) => {
            if (!progress[n].filled && progress[n].number === targetNum) {
              queue.push(n);
            }
          });
        }
      }
      if (indicesToColor.length > 0) {
        onPixelColored(indicesToColor);
      }
      setActiveSpecialTool("pencil");
      return;
    }

    // 2. Bomb Powerup Active?
    if (activeSpecialTool === "bomb") {
      if (powerupCounts.bomb <= 0) {
        SOUNDS.playError();
        return;
      }
      onUsePowerup("bomb");
      SOUNDS.playSuccessColor();

      // Explode a 3x3 grid centered at row, col. Color all matching cells
      const centerR = row;
      const centerC = col;
      const indicesToColor: number[] = [];
      
      for (let r = centerR - 1; r <= centerR + 1; r++) {
        for (let c = centerC - 1; c <= centerC + 1; c++) {
          if (r >= 0 && r < puzzle.height && c >= 0 && c < puzzle.width) {
            const tempIdx = r * puzzle.width + c;
            const tempCell = progress[tempIdx];
            // Color if matching current selected number and empty
            if (tempCell && !tempCell.filled && tempCell.number === selectedColorNumber) {
              indicesToColor.push(tempIdx);
              spawnParticles(r, c, selectedColorHex);
            }
          }
        }
      }

      if (indicesToColor.length > 0) {
        onPixelColored(indicesToColor);
      }
      setActiveSpecialTool("pencil");
      return;
    }

    // 3. Normal drawing
    if (cell.number === selectedColorNumber) {
      // Play pop pitch modulated slightly by the row to synthesize musical play
      const pitch = 0.8 + (1.2 * (puzzle.height - row)) / puzzle.height;
      SOUNDS.playPop(pitch);
      
      // Color cell
      onPixelColored(index);
      spawnParticles(row, col, targetColor?.hex || selectedColorHex);
    } else {
      // Mistake flash
      triggerErrorFlash(index);
    }
  };

  // Drag and Pan handlers (Desktop mouse events)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    isMouseDown.current = true;
    lastPanPoint.current = { x: e.clientX, y: e.clientY };

    if (toolMode === "pan") {
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;

    if (toolMode === "pan") {
      const dx = e.clientX - lastPanPoint.current.x;
      const dy = e.clientY - lastPanPoint.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  // Continuous Swipe coloring over matching pixels using elementFromPoint touch technique
  const handleTouchMoveSwipe = (e: React.TouchEvent) => {
    if (toolMode === "draw" && e.touches.length === 1) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element) {
        const idAttr = element.getAttribute("data-pixel-index");
        if (idAttr) {
          const index = parseInt(idAttr, 10);
          const cell = progress[index];
          if (cell && !cell.filled && cell.number === selectedColorNumber) {
            const r = Math.floor(index / puzzle.width);
            const c = Math.floor(index % puzzle.width);
            handleCellAction(index, r, c);
          }
        }
      }
    } else if (toolMode === "pan" && e.touches.length === 1) {
      // 1-finger panning
      const touch = e.touches[0];
      const dx = touch.clientX - lastPanPoint.current.x;
      const dy = touch.clientY - lastPanPoint.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      // 2-finger zoom (pinch-to-zoom)
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      
      if (lastTouchDistance.current !== null) {
        const delta = dist - lastTouchDistance.current;
        setZoom((z) => Math.max(50, Math.min(250, z + delta * 0.5)));
      }
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
      lastTouchDistance.current = null;
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  // Mouse Wheel zooming inside canvas viewport
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY < 0 ? 10 : -10;
    setZoom((z) => Math.max(50, Math.min(250, z + scaleFactor)));
  };

  return (
    <div className="flex flex-col h-full bg-creamPuff select-none">
      
      {/* 1. Zoom and Pan Controls */}
      <div className="flex justify-between items-center px-4 py-2 bg-white/40 border-b border-rose/10 backdrop-blur-xs">
        {/* Navigation Mode */}
        <div className="flex bg-rose-100/50 rounded-full p-0.5 gap-0.5 shadow-inner">
          <button
            id="tool-draw-btn"
            onClick={() => {
              setToolMode("draw");
              setActiveSpecialTool("pencil");
            }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-250 ${
              toolMode === "draw" && activeSpecialTool === "pencil"
                ? "bg-rose-400 text-white shadow-xs"
                : "text-rose-600 hover:bg-rose-200/40"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Рисовать
          </button>
          <button
            id="tool-pan-btn"
            onClick={() => setToolMode("pan")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-250 ${
              toolMode === "pan"
                ? "bg-rose-400 text-white shadow-xs"
                : "text-rose-600 hover:bg-rose-200/40"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            Двигать
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex gap-1 items-center bg-white/80 rounded-full p-1 shadow-xs border border-rose-200/35">
          <button
            id="zoom-out-btn"
            onClick={handleZoomOut}
            className="p-1 px-2 text-rose-500 hover:bg-rose-100 rounded-full cursor-pointer text-xs font-bold"
            title="Уменьшить"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-pixel text-rose-700 w-10 text-center select-none scale-85">
            {Math.floor(zoom)}%
          </span>
          <button
            id="zoom-in-btn"
            onClick={handleZoomIn}
            className="p-1 px-2 text-rose-500 hover:bg-rose-100 rounded-full cursor-pointer text-xs font-bold"
            title="Увеличить"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="zoom-reset-btn"
            onClick={handleReset}
            className="p-1 text-rose-400 hover:bg-rose-100 rounded-full cursor-pointer"
            title="Сбросить вид"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Power-up Boosters selection bar */}
      <div className="flex justify-center items-center gap-2.5 px-4 py-2 bg-rose-50/70 border-b border-rose-100 z-10 shrink-0 select-none">
        <span className="text-[10px] font-pixel text-rose-700 uppercase tracking-wide font-extrabold">
          Бустеры:
        </span>
        
        {/* Wand Booster */}
        <button
          id="booster-wand-btn"
          disabled={powerupCounts.wand <= 0}
          onClick={() => {
            setToolMode("draw");
            setActiveSpecialTool(activeSpecialTool === "wand" ? "pencil" : "wand");
            SOUNDS.playPop(1.1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
            activeSpecialTool === "wand"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-md scale-102"
              : powerupCounts.wand > 0
              ? "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50/50"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
          }`}
          title="🪄 Волшебная палочка (Закрасить область одного цвета)"
        >
          <span>🪄 Палочка</span>
          <span className="bg-indigo-200/50 text-[9px] px-1.5 py-0.2 rounded-full font-pixel">
            {powerupCounts.wand}
          </span>
        </button>

        {/* Bomb Booster */}
        <button
          id="booster-bomb-btn"
          disabled={powerupCounts.bomb <= 0}
          onClick={() => {
            setToolMode("draw");
            setActiveSpecialTool(activeSpecialTool === "bomb" ? "pencil" : "bomb");
            SOUNDS.playPop(1.1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
            activeSpecialTool === "bomb"
              ? "bg-amber-600 text-white border-amber-700 shadow-md scale-102"
              : powerupCounts.bomb > 0
              ? "bg-white text-amber-700 border-amber-200 hover:bg-amber-50/50"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
          }`}
          title="💣 Бомбочка (Красит область 3х3 выбранного цвета)"
        >
          <span>💣 Бомбочка</span>
          <span className="bg-amber-200/50 text-[9px] px-1.5 py-0.2 rounded-full font-pixel">
            {powerupCounts.bomb}
          </span>
        </button>

        {/* Info/Notice when active */}
        {activeSpecialTool !== "pencil" && (
          <span className="text-[9px] font-pixel text-rose-500 animate-pulse ml-2 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-150">
            кликни пиксель! 🎯
          </span>
        )}
      </div>

      {/* 3. Main Virtual Drawing Board Frame */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-dotPattern cursor-grab active:cursor-grabbing p-4 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMoveSwipe}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          cursor: toolMode === "pan" ? "grab" : "crosshair",
        }}
      >
        <div
          ref={gridRef}
          className="relative transition-transform duration-75 select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        >
          {/* Virtual Sparkle Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: `${(p.x / (puzzle.width * 100)) * 100}%`,
                top: `${(p.y / (puzzle.height * 100)) * 100}%`,
                width: `${4 + p.life * 6}px`,
                height: `${4 + p.life * 6}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 4px ${p.color}`,
                transform: "translate(-50%, -50%)",
                opacity: p.life,
                zIndex: 400,
              }}
            />
          ))}

          {/* Grid Layout Container */}
          <div
            id="pixel-grid-workspace"
            className="grid bg-[#ffffff50] p-1.5 rounded-2xl shadow-xl border-4 border-rose-300 relative select-none"
            style={{
              gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`,
              width: `${Math.max(260, puzzle.width * 25)}px`,
              height: `${Math.max(260, puzzle.height * 25)}px`,
            }}
          >
            {progress.map((cell, idx) => {
              const r = Math.floor(idx / puzzle.width);
              const c = Math.floor(idx % puzzle.width);
              const targetColor = puzzle.colors.find((color) => color.number === cell.number);
              
              // Spacing/Transparent block
              if (cell.number === 0) {
                return (
                  <div
                    key={idx}
                    className="aspect-square bg-transparent border border-dotted border-rose-100/10 pointer-events-none"
                  />
                );
              }

              const isMatch = cell.number === selectedColorNumber;
              const isCellColoredVal = cell.filled;
              const hasError = errorCell === idx;

              return (
                <div
                  key={idx}
                  id={`pixel-cell-${idx}`}
                  data-pixel-index={idx}
                  onClick={() => {
                    if (toolMode === "draw") {
                      handleCellAction(idx, r, c);
                    }
                  }}
                  onMouseEnter={() => {
                    // Holding dragging paints the coordinates immediately
                    if (toolMode === "draw" && isMouseDown.current) {
                      handleCellAction(idx, r, c);
                    }
                  }}
                  className={`relative aspect-square border-[0.5px] select-none flex items-center justify-center transition-all duration-150 cursor-pointer text-center ${
                    isCellColoredVal
                      ? "border-transparent"
                      : isMatch
                      ? "border-[#ff8fa350] bg-rose-100/70 hover:bg-rose-200/80 animate-pulse ring-1 ring-inset ring-rose-300"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  } ${hasError ? "bg-red-400 border-red-500 scale-108 animate-bounce z-10" : ""}`}
                  style={{
                    backgroundColor: isCellColoredVal ? targetColor?.hex : undefined,
                  }}
                >
                  {/* If coloring completed, no numbers displayed. For uncolored cells, show cute retro grey numbers */}
                  {!isCellColoredVal && (
                    <span
                      data-pixel-index={idx}
                      className={`font-pixel text-[8px] sm:text-[9px] pointer-events-none ${
                        isMatch
                          ? "text-rose-600 font-extrabold text-[10px] scale-110 drop-shadow-xs"
                          : "text-slate-400 opacity-60"
                      }`}
                    >
                      {cell.number}
                    </span>
                  )}

                  {/* Highlighter glow if uncolored matching number and error highlight */}
                  {hasError && (
                    <div className="absolute inset-0 bg-red-500/20 rounded-xs border-2 border-red-600 pointer-events-none animate-ping duration-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
