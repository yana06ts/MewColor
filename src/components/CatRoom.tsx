import React, { useState, useEffect } from "react";
import { PuzzleTemplate } from "../data/puzzles";
import SOUNDS from "../utils/sound";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Sun, Moon, Flame, Palette, Volume2, Cat, Smile, HelpCircle, Heart } from "lucide-react";

interface CatRoomProps {
  completedPuzzles: string[]; // ids of completed puzzles
  puzzleTemplates: PuzzleTemplate[];
}

interface PlacedCat {
  id: string;
  puzzleId: string;
  name: string;
  x: number; // percentage coordinate 10-90
  y: number; // percentage coordinate 35-75 (floor level)
  isSleeping: boolean;
  flipped: boolean;
}

const CAT_MEOWS_TEXT = [
  "Мяу! 🐾",
  "Муррр~ 💕",
  "Ня! ✨",
  "Погладь меня! 🥰",
  "Кусь! 😼",
  "Хочу рыбку 🐟",
  "Где коробка? 📦",
  "Ты лучший человек! ❤️",
  "Хррр-миии...",
  "Тыгыдык? 🐎",
  "Мякиш! 🥯",
];

export function CatRoom({ completedPuzzles, puzzleTemplates }: CatRoomProps) {
  // Try to load placed cats from local storage, or spawn first completed cat by default
  const [placedCats, setPlacedCats] = useState<PlacedCat[]>([]);
  const [isDay, setIsDay] = useState<boolean>(true);
  const [fireplaceActive, setFireplaceActive] = useState<boolean>(true);
  const [rugTheme, setRugTheme] = useState<"pink" | "blue" | "boho">("pink");
  const [wallpaper, setWallpaper] = useState<"stripes" | "stars" | "green">("stripes");
  const [activeSpeech, setActiveSpeech] = useState<{ [id: string]: string }>({});
  const [activeHeart, setActiveHeart] = useState<{ [id: string]: boolean }>({});

  const unlockedCats = puzzleTemplates.filter(
    (p) => p.category === "cats" && completedPuzzles.includes(p.id)
  );

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem("meowcolor_placed_cats");
    if (saved) {
      try {
        setPlacedCats(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else if (unlockedCats.length > 0) {
      // Auto place first unlocked cat in the coordinates
      const defaultCat: PlacedCat = {
        id: `placed_${unlockedCats[0].id}`,
        puzzleId: unlockedCats[0].id,
        name: unlockedCats[0].name.replace("🐾", ""),
        x: 45,
        y: 65,
        isSleeping: false,
        flipped: false,
      };
      setPlacedCats([defaultCat]);
    }
  }, [completedPuzzles]);

  // Save changes
  const savePlacedCats = (cats: PlacedCat[]) => {
    setPlacedCats(cats);
    localStorage.setItem("meowcolor_placed_cats", JSON.stringify(cats));
  };

  // Add cat to room
  const handlePlaceCat = (puzzleId: string) => {
    const template = puzzleTemplates.find((p) => p.id === puzzleId);
    if (!template) return;

    // Avoid duplicating, only 1 cat of each species is allowed in the room
    const existingCount = placedCats.filter((c) => c.puzzleId === puzzleId).length;
    if (existingCount >= 1) {
      SOUNDS.playError();
      return;
    }

    const newCat: PlacedCat = {
      id: `placed_${puzzleId}_${Date.now()}`,
      puzzleId,
      name: template.name.replace(/[🐾🐈‍⬛📦]/g, "").trim(),
      x: 20 + Math.random() * 50, // position around rug center
      y: 55 + Math.random() * 15,
      isSleeping: false,
      flipped: Math.random() > 0.5,
    };

    const updated = [...placedCats, newCat];
    savePlacedCats(updated);
    SOUNDS.playMeow();
  };

  // Remove cat
  const handleRemoveCat = (id: string) => {
    const updated = placedCats.filter((c) => c.id !== id);
    savePlacedCats(updated);
    SOUNDS.playPop(0.8);
  };

  // Trigger Meow speech & heart bubble on tap!
  const handleTapCat = (cat: PlacedCat) => {
    // 1. Play synthesized feline meow!
    SOUNDS.playMeow();

    // 2. Select random cute phrase
    const randomSpeech = CAT_MEOWS_TEXT[Math.floor(Math.random() * CAT_MEOWS_TEXT.length)];
    setActiveSpeech((prev) => ({ ...prev, [cat.id]: randomSpeech }));

    // 3. Spawn floating heart
    setActiveHeart((prev) => ({ ...prev, [cat.id]: true }));

    // Auto clear bubbles after 2.5s
    setTimeout(() => {
      setActiveSpeech((prev) => {
        const copy = { ...prev };
        delete copy[cat.id];
        return copy;
      });
    }, 2500);

    setTimeout(() => {
      setActiveHeart((prev) => ({ ...prev, [cat.id]: false }));
    }, 1200);

    // Randomize sleeping/flipping state slightly on click
    const updated = placedCats.map((c) => {
      if (c.id === cat.id) {
        return {
          ...c,
          flipped: !c.flipped,
          isSleeping: Math.random() > 0.75 ? !c.isSleeping : c.isSleeping,
        };
      }
      return c;
    });
    savePlacedCats(updated);
  };

  // Drag simulation (tap repositioning is reliable on both mouse and touch frames)
  const handleReposition = (catId: string, direction: "left" | "right" | "up" | "down") => {
    const updated = placedCats.map((c) => {
      if (c.id === catId) {
        let { x, y } = c;
        if (direction === "left") x = Math.max(12, x - 8);
        if (direction === "right") x = Math.min(88, x + 8);
        if (direction === "up") y = Math.max(45, y - 8);
        if (direction === "down") y = Math.min(78, y + 8);
        return { ...c, x, y };
      }
      return c;
    });
    savePlacedCats(updated);
    SOUNDS.playPop(1.1);
  };

  // Render cat silhouette as pixel SVG
  const getCatPixelIcon = (puzzleId: string) => {
    const template = puzzleTemplates.find((p) => p.id === puzzleId);
    if (!template) return null;

    // Draw a small preview representation of the pixel mosaic!
    return (
      <div
        className="grid shadow-md p-1 bg-white/20 rounded-lg backdrop-blur-xs border border-white/30"
        style={{
          gridTemplateColumns: `repeat(${template.width}, minmax(0, 1fr))`,
          width: "56px",
          height: "56px",
        }}
      >
        {template.rows.flatMap((row, r) =>
          row.split("").map((char, c) => {
            const num = char === "." ? 0 : parseInt(char, 10);
            const color = template.colors.find((colorInfo) => colorInfo.number === num);
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  backgroundColor: num === 0 ? "transparent" : color?.hex || "#999",
                }}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#fceee3]">
      
      {/* Lobby Top Controls */}
      <div className="flex justify-between items-center px-4 py-3 bg-white/95 border-b border-rose-100 shadow-xs z-10">
        <div className="flex items-center gap-1">
          <Cat className="w-5 h-5 text-rose-500" />
          <h2 className="text-sm font-pixel text-rose-700 uppercase tracking-wide">
            Кото-Комната 🐈
          </h2>
        </div>
        
        {/* Decorate Actions */}
        <div className="flex gap-1">
          <button
            id="toggle-time-btn"
            onClick={() => {
              setIsDay(!isDay);
              SOUNDS.playPop(1.5);
            }}
            className={`p-1.5 rounded-full border border-rose-100 shadow-xs transition-colors cursor-pointer ${
              isDay ? "bg-amber-100 text-amber-600" : "bg-indigo-900 text-indigo-200"
            }`}
            title="Сменить день/ночь"
          >
            {isDay ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            id="toggle-fire-btn"
            onClick={() => {
              setFireplaceActive(!fireplaceActive);
              SOUNDS.playPop(1.3);
            }}
            className={`p-1.5 rounded-full border border-rose-100 shadow-xs transition-colors cursor-pointer ${
              fireplaceActive ? "bg-orange-100 text-orange-600" : "bg-neutral-100 text-neutral-400"
            }`}
            title="Камин"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            id="toggle-rug-btn"
            onClick={() => {
              const rugs: Array<"pink" | "blue" | "boho"> = ["pink", "blue", "boho"];
              const next = rugs[(rugs.indexOf(rugTheme) + 1) % rugs.length];
              setRugTheme(next);
              SOUNDS.playPop(1.2);
            }}
            className="p-1.5 rounded-full border border-rose-100 bg-white text-rose-500 shadow-xs hover:bg-rose-50 cursor-pointer"
            title="Поменять коврик"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main living space container */}
      <div
        id="cozy-cat-room-stage"
        className={`flex-1 relative overflow-hidden transition-all duration-750 ease-in-out border-b-8 border-rose-950/20 ${
          isDay
            ? wallpaper === "stripes"
              ? "bg-[linear-gradient(180deg,#FFF3E0_0%,#FFE4C4_100%)]"
              : "bg-[#FFF9C4]"
            : "bg-[linear-gradient(180deg,#1A1B35_0%,#2C2F4D_100%)]"
        }`}
      >
        {/* Wallpaper stripes overlay */}
        <div className="absolute inset-0 bg-stripesPattern opacity-5 pointer-events-none" />

        {/* Dynamic Night Window Star field */}
        {!isDay && (
          <div className="absolute top-10 left-10 w-28 h-20 bg-[#0c0d1e] rounded-xl border-4 border-slate-700/60 flex items-center justify-center overflow-hidden z-0">
            <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping" />
            <div className="absolute top-8 right-6 w-1 h-1 bg-white rounded-full" />
            <div className="absolute top-12 left-10 w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="absolute top-2 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full" />
          </div>
        )}

        {/* Dynamic Day window showing a tiny tree */}
        {isDay && (
          <div className="absolute top-10 left-10 w-28 h-20 bg-sky-200 rounded-xl border-4 border-amber-900/40 flex items-end justify-center overflow-hidden z-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-full -mb-2 shadow-inner" />
            <div className="w-6 h-6 bg-emerald-400 rounded-full -mb-3 shadow-inner" />
            <div className="absolute top-2 right-4 w-4 h-4 bg-yellow-100/80 rounded-full" />
          </div>
        )}

        {/* Wall Frame Painting with completed stats */}
        <div className="absolute top-8 right-10 p-1 bg-amber-950 rounded-lg shadow-md border-2 border-amber-900 overflow-hidden select-none">
          <div className="bg-slate-100 text-slate-800 text-[8px] font-pixel p-1.5 leading-tight rounded-sm max-w-[120px]">
            <span className="text-rose-500 font-bold block mb-1">ГРУППА CATS</span>
            Готово котиков: <span className="font-extrabold text-amber-900">{unlockedCats.length}</span>
          </div>
        </div>

        {/* Cozy Brick Fireplace */}
        <div className="absolute bottom-[28%] left-4 flex flex-col items-center">
          <div className="w-24 h-16 bg-red-800 rounded-t-xl border-t-4 border-x-4 border-red-950 relative flex items-end justify-center">
            {fireplaceActive && (
              <div className="w-10 h-8 bg-amber-500/15 rounded-full absolute bottom-0 flex items-end justify-center">
                <div className="w-6 h-6 bg-amber-500 rounded-full animate-bounce" />
                <div className="w-4 h-4 bg-orange-600 rounded-full animate-ping absolute" />
                <div className="w-2 h-4 bg-amber-300 rounded-full animate-pulse" />
              </div>
            )}
            {/* Fireplace mantel */}
            <div className="absolute -top-1 w-28 h-2 bg-amber-900 rounded-full shadow-inner" />
          </div>
          {/* Bricks footer */}
          <div className="w-26 h-3 bg-red-900 border-b border-red-950" />
        </div>

        {/* Warm Cat Scratching post */}
        <div className="absolute bottom-[24%] right-6 flex flex-col items-center">
          <div className="w-2 h-14 bg-amber-700 rounded-full border border-amber-950 relative">
            <div className="w-4 h-1 bg-amber-800 absolute top-4 left-0" />
            <div className="w-4 h-1 bg-amber-800 absolute top-8 left-0" />
          </div>
          <div className="w-12 h-2.5 bg-amber-900 rounded-full border border-amber-950" />
        </div>

        {/* Giant Cozy Rug (Floor center) */}
        <div className="absolute bottom-1 w-[80%] left-[10%] h-[26%] flex items-center justify-center">
          <div
            className={`w-full h-full rounded-full transition-colors border-4 duration-500 shadow-md transform rotate-x-12 flex items-center justify-center ${
              rugTheme === "pink"
                ? "bg-rose-200 border-rose-300 shadow-rose-200/50"
                : rugTheme === "blue"
                ? "bg-sky-200 border-sky-300 shadow-sky-200/50"
                : "bg-[#E6C280] border-[#D4AE6A]"
            }`}
          >
            {/* Decorative fringe pattern / lines on the rug */}
            <div className="w-[88%] h-[78%] rounded-full border-2 border-dashed border-white/60" />
            {unlockedCats.length === 0 && (
              <div className="absolute text-center px-4">
                <span className="text-[10px] text-rose-800/80 font-pixel font-bold drop-shadow-xs max-w-[190px] block leading-tight">
                  Раскрась кота, чтобы позвать его на этот коврик! 🐾
                </span>
              </div>
            )}
          </div>
        </div>

        {/* FLOOR BACKGROUND COLOR */}
        <div
          className={`absolute bottom-0 w-full h-[28%] z-[-1] transition-colors duration-500 ${
            isDay ? "bg-amber-950/20" : "bg-slate-900/50"
          }`}
          style={{
            backgroundImage: "radial-gradient(#00000010 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />

        {/* Empty placeholder warning */}
        {placedCats.length === 0 && unlockedCats.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
            <div className="bg-white/90 rounded-2xl p-4 shadow-lg border border-rose-100 text-center max-w-[240px]">
              <HelpCircle className="w-6 h-6 text-rose-400 mx-auto mb-1 animate-bounce" />
              <p className="text-[10px] font-pixel text-slate-600 leading-relaxed">
                Твоя комнатка пуста! Нажми на любого котика внизу, чтобы запустить его играть!
              </p>
            </div>
          </div>
        )}

        {/* PLACED CATS GRID LAYOUTS & INTERACTIONS */}
        {placedCats.map((cat) => {
          const speech = activeSpeech[cat.id];
          const hasHeart = activeHeart[cat.id];

          return (
            <motion.div
              key={cat.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute z-10 group"
              style={{
                left: `${cat.x}%`,
                top: `${cat.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Dialogue / Speech Bubble Popup above cat */}
              <AnimatePresence>
                {speech && (
                  <motion.div
                    key="speech"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: -45 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white text-slate-800 text-[10px] font-bold p-1.5 px-2.5 rounded-xl border border-rose-200 shadow-md whitespace-nowrap z-50 text-center"
                  >
                    {speech}
                    {/* Tiny bubble arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Heart Effect */}
              <AnimatePresence>
                {hasHeart && (
                  <motion.div
                    key="heart"
                    initial={{ opacity: 1, y: -20, scale: 0.8 }}
                    animate={{ opacity: 0, y: -80, scale: 1.5 }}
                    className="absolute left-1/2 -translate-x-1/2 text-red-500 z-50"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cat Reposition D-PAD Overlay when hovering or tapping on it */}
              <div className="absolute -top-10 -left-6 hidden group-hover:flex gap-0.5 bg-slate-900/80 p-0.5 rounded-md shadow-lg z-50 select-none">
                <button
                  onClick={() => handleReposition(cat.id, "left")}
                  className="px-1 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  ←
                </button>
                <button
                  onClick={() => handleReposition(cat.id, "right")}
                  className="px-1 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  →
                </button>
                <button
                  onClick={() => handleReposition(cat.id, "up")}
                  className="px-1 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleReposition(cat.id, "down")}
                  className="px-1 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemoveCat(cat.id)}
                  className="px-1 text-[8px] font-pixel text-red-400 hover:bg-red-500/20 rounded-sm cursor-pointer ml-1"
                  title="Убрать"
                >
                  ✖
                </button>
              </div>

              {/* The actual Pixel Cat graphics, rendered as absolute gorgeous interactive component */}
              <div
                onClick={() => handleTapCat(cat)}
                className={`relative cursor-pointer transition-transform duration-200 transform ${
                  cat.flipped ? "scale-x-[-1]" : ""
                } ${cat.isSleeping ? "opacity-90 saturate-75 shadow-inner" : "hover:scale-115"}`}
              >
                {getCatPixelIcon(cat.puzzleId)}

                {/* Zzz floating letters if cat is Sleeping */}
                {cat.isSleeping && (
                  <div className="absolute -top-2 -right-2 text-[9px] font-pixel text-sky-400 animate-bounce">
                    Zzz..
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tray of unlocked cats at the bottom, clicking a cat spawns it in the room */}
      <div className="bg-white/95 border-t border-rose-100 p-4 shrink-0 flex flex-col gap-2 shadow-inner">
        <label className="text-[10px] font-pixel text-rose-500 uppercase tracking-wide flex items-center gap-1">
          <Smile className="w-3.5 h-3.5 text-rose-400" />
          Доступные Котики ({unlockedCats.length}):
        </label>

        {unlockedCats.length === 0 ? (
          <div className="py-2.5 text-center text-xs text-slate-400 font-semibold border border-dashed border-rose-100 rounded-xl bg-rose-50/20">
            Здесь будет твой прайд, раскрашивай котиков в каталоге! ⭐
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar select-none pt-1">
            {unlockedCats.map((template) => {
              const activeCount = placedCats.filter((c) => c.puzzleId === template.id).length;
              return (
                <button
                  key={template.id}
                  id={`shelf-cat-btn-${template.id}`}
                  onClick={() => handlePlaceCat(template.id)}
                  disabled={activeCount >= 1}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border shrink-0 ${
                    activeCount >= 1
                      ? "opacity-60 bg-slate-100 border-slate-200 cursor-not-allowed scale-95"
                      : "bg-rose-50/50 border-rose-100 hover:bg-rose-100/60 active:scale-95 cursor-pointer"
                  }`}
                >
                  <div className="scale-75 origin-center">{getCatPixelIcon(template.id)}</div>
                  <span className="text-[9px] font-pixel text-rose-800 truncate max-w-[70px]">
                    {template.name.replace(/[🐾🐈‍⬛📦]/g, "").trim()}
                  </span>
                  
                  {/* Active count badge */}
                  {activeCount > 0 ? (
                    <span className="text-[8px] bg-emerald-500 text-white rounded-full px-1.5 font-pixel leading-normal scale-85">
                      Дома 🏠
                    </span>
                  ) : (
                    <span className="text-[8px] bg-rose-400 text-white rounded-full px-1.5 font-pixel leading-normal scale-85 animate-pulse">
                      Призвать 🐾
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
