import React, { useState, useEffect, useRef } from "react";
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
  type?: "cat" | "toy" | "shop"; // type indicator
  puzzleId?: string; // set for both completed cats and toys
  shopId?: string; // set for purchased direct buy item IDs
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
  const roomRef = useRef<HTMLDivElement>(null);
  
  // Try to load placed objects from local storage, or spawn first completed cat by default
  const [placedCats, setPlacedCats] = useState<PlacedCat[]>([]);
  const [isDay, setIsDay] = useState<boolean>(true);
  const [fireplaceActive, setFireplaceActive] = useState<boolean>(true);
  
  // Custom design states synced with Decorations / Shop Equips
  const [rugTheme, setRugTheme] = useState<string>("pink");
  const [wallpaper, setWallpaper] = useState<string>("stripes");
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  
  const [activeSpeech, setActiveSpeech] = useState<{ [id: string]: string }>({});
  const [activeHeart, setActiveHeart] = useState<{ [id: string]: boolean }>({});

  const placedCatsRef = useRef<PlacedCat[]>([]);
  useEffect(() => {
    placedCatsRef.current = placedCats;
  }, [placedCats]);

  // Filters cats completed by user
  const unlockedCats = puzzleTemplates.filter(
    (p) => p.category === "cats" && completedPuzzles.includes(p.id)
  );

  const getToyPixelIcon = (puzzleId: string) => {
    const template = puzzleTemplates.find((p) => p.id === puzzleId);
    if (!template) return null;

    return (
      <div
        className="grid select-none pointer-events-none"
        style={{
          gridTemplateColumns: `repeat(${template.width}, minmax(0, 1fr))`,
          width: "36px",
          height: "36px",
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

  // Sync / Load Room Design settings on mount and completedPuzzles changes
  useEffect(() => {
    // 1. Wallpaper themes Loader
    const savedWallpaper = localStorage.getItem("meowcolor_equipped_wallpaper");
    if (savedWallpaper) {
      setWallpaper(savedWallpaper);
    }

    // 2. Rug designs Loader
    const savedRug = localStorage.getItem("meowcolor_equipped_rug");
    if (savedRug) {
      setRugTheme(savedRug);
    }

    // 2b. Purchased Shop Items Loader
    const savedPurchases = localStorage.getItem("meowcolor_purchased_items");
    if (savedPurchases) {
      try {
        setPurchasedItems(JSON.parse(savedPurchases));
      } catch (e) {}
    }

    // 3. Placed objects Loader
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
        type: "cat",
        puzzleId: unlockedCats[0].id,
        name: unlockedCats[0].name.replace(/[🐾🐈‍⬛📦]/g, "").trim(),
        x: 45,
        y: 65,
        isSleeping: false,
        flipped: false,
      };
      setPlacedCats([defaultCat]);
    }
  }, [completedPuzzles]);

  // Save changes helper
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
      type: "cat",
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
    SOUNDS.playMeow();

    // Select random cute phrase
    const randomSpeech = CAT_MEOWS_TEXT[Math.floor(Math.random() * CAT_MEOWS_TEXT.length)];
    setActiveSpeech((prev) => ({ ...prev, [cat.id]: randomSpeech }));

    // Spawn floating heart
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

  // Start dragging an object using native PointerEvents
  const handlePointerDown = (e: React.PointerEvent, catId: string) => {
    e.stopPropagation();
    const container = roomRef.current;
    if (!container) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;
    
    const rect = container.getBoundingClientRect();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (Math.abs(moveEvent.clientX - startX) > 4 || Math.abs(moveEvent.clientY - startY) > 4) {
        hasMoved = true;
      }
      if (!hasMoved) return;

      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      
      const constrainedX = Math.max(12, Math.min(88, x));
      const constrainedY = Math.max(35, Math.min(95, y)); // Allow dragging down into selection area
      
      setPlacedCats((prevCats) =>
        prevCats.map((c) => (c.id === catId ? { ...c, x: constrainedX, y: constrainedY } : c))
      );
    };
    
    const handlePointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      
      if (!hasMoved) {
        // Retrieve cat and trigger standard tap response!
        const cat = placedCatsRef.current.find((c) => c.id === catId);
        if (cat) {
          handleTapCat(cat);
        }
      } else {
        const upRect = container.getBoundingClientRect();
        const upY = ((upEvent.clientY - upRect.top) / upRect.height) * 100;
        
        // If dragged down near or over the shelf (y >= 83 or below stage lower boundary)
        if (upY >= 83 || upEvent.clientY >= upRect.bottom - 15) {
          // Remove from the room!
          setPlacedCats((prevCats) => {
            const updated = prevCats.filter((c) => c.id !== catId);
            localStorage.setItem("meowcolor_placed_cats", JSON.stringify(updated));
            return updated;
          });
          SOUNDS.playPop(0.7);
        } else {
          SOUNDS.playPop(1.0);
          // Persist coordinates
          setPlacedCats((currentCats) => {
            localStorage.setItem("meowcolor_placed_cats", JSON.stringify(currentCats));
            return currentCats;
          });
        }
      }
    };
    
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
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

  // Render direct purchased shop-buy assets
  const getShopItemGraphic = (shopId: string) => {
    switch (shopId) {
      case "cushion":
        return <div className="text-4xl filter drop-shadow hover:scale-105 duration-200 select-none">🛋️</div>;
      case "luxury_tree":
        return <div className="text-5xl filter drop-shadow-md hover:scale-105 duration-200 select-none">🌳</div>;
      case "golden_fish":
        return <div className="text-3xl filter drop-shadow animate-bounce select-none">🥣</div>;
      case "tunnel":
        return <div className="text-4xl filter drop-shadow hover:scale-105 duration-200 select-none">🌀</div>;
      default:
        return <div className="text-3xl filter drop-shadow select-none">🎁</div>;
    }
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

  // Background style helper based on equipped wallpaper
  const getWallpaperBackgroundStyle = () => {
    if (!isDay) {
      return "bg-[linear-gradient(180deg,#090A1A_0%,#1B1D34_100%)]";
    }
    
    switch (wallpaper) {
      case "stars":
        return "bg-[linear-gradient(180deg,#1e1b4b_0%,#312e81_100%)]";
      case "sakura":
        return "bg-[linear-gradient(180deg,#fdf2f8_0%,#fce7f3_100%)]";
      case "stripes":
      default:
        return "bg-[linear-gradient(180deg,#FFF3E0_0%,#FFE4C4_100%)]";
    }
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
            className={`p-1.5 rounded-lg border text-xs font-pixel flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              isDay
                ? "bg-amber-100 border-amber-200 text-amber-800"
                : "bg-indigo-950 border-indigo-900 text-indigo-300"
            }`}
            title="Переключить время суток"
          >
            {isDay ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-[9px] uppercase font-bold scale-85">
              {isDay ? "День ☀️" : "Ночь 🌙"}
            </span>
          </button>

          <button
            id="cozy-fireplace-btn"
            onClick={() => {
              setFireplaceActive(!fireplaceActive);
              SOUNDS.playPop(1.2);
            }}
            className={`p-1.5 rounded-lg border text-xs font-pixel flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              fireplaceActive
                ? "bg-red-100 border-red-200 text-red-600"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
            title="Камин"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase font-bold scale-85">камин</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage drawing view */}
      <div
        ref={roomRef}
        id="cozy-cat-room-stage"
        className={`flex-1 relative overflow-hidden transition-all duration-750 ease-in-out border-b-8 border-rose-950/20 ${getWallpaperBackgroundStyle()}`}
      >
        {/* Striped overlay wallpaper (only if stripes is selected and it is day time) */}
        {isDay && wallpaper === "stripes" && (
          <div className="absolute inset-0 bg-stripesPattern opacity-5 pointer-events-none" />
        )}

        {/* Starry Sky wallpaper stars (gorgeous, dense shimmering stars without wild animations) */}
        {wallpaper === "stars" && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Soft background stars, beautiful colors and microglow effects */}
            <div className="absolute top-4 left-6 text-xs text-yellow-100 opacity-80">★</div>
            <div className="absolute top-12 left-24 text-sm text-yellow-200 opacity-90 drop-shadow-sm font-bold">★</div>
            <div className="absolute top-6 left-48 text-[10px] text-white opacity-70">★</div>
            <div className="absolute top-16 left-[55%] text-xs text-yellow-100 opacity-95">★</div>
            <div className="absolute top-4 left-[75%] text-base text-amber-200 opacity-90 drop-shadow-md">★</div>
            <div className="absolute top-14 left-[90%] text-[10px] text-white opacity-80">★</div>
            <div className="absolute top-28 left-12 text-[10px] text-white opacity-75">★</div>
            <div className="absolute top-24 left-[35%] text-xs text-yellow-100 opacity-80">★</div>
            <div className="absolute top-32 left-[68%] text-sm text-yellow-200 opacity-90 font-bold">★</div>
            <div className="absolute top-22 left-[82%] text-xs text-white opacity-70">★</div>
            <div className="absolute top-6 right-24 text-xs text-amber-200 opacity-85">★</div>
            <div className="absolute top-16 right-4 text-[10px] text-yellow-100 opacity-75">★</div>
          </div>
        )}

        {/* Blooming Sakura wallpaper: static flowers lining the perimeter (non-animated, dense, elegant) */}
        {wallpaper === "sakura" && (
          <div className="absolute inset-x-0 top-0 bottom-[28%] pointer-events-none z-0">
            {/* Top border of sakura flowers */}
            <div className="absolute top-2.5 left-2.5 text-xs">🌸</div>
            <div className="absolute top-3 left-[12%] text-sm">🌸</div>
            <div className="absolute top-1.5 left-[24%] text-base">🌸</div>
            <div className="absolute top-3.5 left-[36%] text-xs">🌸</div>
            <div className="absolute top-2 left-[48%] text-sm">🌸</div>
            <div className="absolute top-1.5 left-[60%] text-base">🌸</div>
            <div className="absolute top-3 left-[72%] text-xs">🌸</div>
            <div className="absolute top-2 left-[84%] text-sm">🌸</div>
            <div className="absolute top-2.5 left-[96%] text-xs">🌸</div>

            {/* Left border of sakura flowers */}
            <div className="absolute top-10 left-2 text-xs">🌸</div>
            <div className="absolute top-20 left-3 text-xs">🌸</div>
            <div className="absolute top-32 left-2 text-xs">🌸</div>
            <div className="absolute top-44 left-3 text-xs">🌸</div>
            <div className="absolute top-56 left-2 text-xs">🌸</div>

            {/* Right border of sakura flowers */}
            <div className="absolute top-10 right-2 text-xs">🌸</div>
            <div className="absolute top-20 right-3 text-xs">🌸</div>
            <div className="absolute top-32 right-2 text-xs">🌸</div>
            <div className="absolute top-44 right-3 text-xs">🌸</div>
            <div className="absolute top-56 right-2 text-xs">🌸</div>
          </div>
        )}

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

        {/* Giant Cozy Rug (Floor center) */}
        <div className="absolute bottom-1 w-[80%] left-[10%] h-[26%] flex items-center justify-center">
          <div
            className={`w-full h-full rounded-full transition-colors border-4 duration-500 shadow-md transform rotate-x-12 flex items-center justify-center ${
              rugTheme === "pink"
                ? "bg-rose-200 border-rose-300 shadow-rose-200/50"
                : rugTheme === "blue"
                ? "bg-sky-200 border-sky-300 shadow-sky-200/50"
                : rugTheme === "green"
                ? "bg-emerald-200 border-emerald-300 shadow-emerald-200/50"
                : "bg-amber-200 border-amber-300 shadow-amber-200/50"
            }`}
          >
            {/* Decorative fringe pattern / lines on the rug */}
            <div className="w-[88%] h-[78%] rounded-full border-2 border-dashed border-white/60" />
            {placedCats.length === 0 && (
              <div className="absolute text-center px-4">
                <span className="text-[10px] text-rose-800/80 font-pixel font-bold drop-shadow-xs max-w-[190px] block leading-tight">
                  Перетащи милого котика из меню на коврик! 🐾
                </span>
              </div>
            )}
          </div>
        </div>

        {/* STATIC BOUGHT FURNITURE LAYER (No animations, fixed positions, non-draggable) */}
        {[
          { id: "cushion", left: "50%", top: "72%", graphic: <div className="text-6xl md:text-7xl select-none drop-shadow-lg transform hover:scale-105 transition-transform duration-300">🛋️</div> },
          { id: "golden_fish", left: "14%", top: "84%", graphic: <div className="text-3xl select-none drop-shadow-sm">🥣</div> },
          { id: "tunnel", left: "32%", top: "82%", graphic: <div className="text-4xl md:text-5xl select-none drop-shadow-md">📦</div> },
          { id: "luxury_tower", left: "84%", top: "44%", graphic: (
            <div className="flex flex-col items-center select-none" style={{ height: "120px" }}>
              {/* Tier top */}
              <div className="bg-amber-100 border border-amber-300 w-12 h-4 rounded-full shadow-sm -mb-0.5" />
              {/* Pillar */}
              <div className="bg-amber-800/80 w-2 h-6" />
              {/* Tier middle */}
              <div className="bg-amber-100 border border-amber-300 w-14 h-4 rounded-full shadow-sm -mb-0.5" />
              {/* Pillar */}
              <div className="bg-amber-800/80 w-2 h-6" />
              {/* Bottom Tier (box cave) */}
              <div className="bg-amber-950 border border-amber-800 w-16 h-12 rounded-lg flex items-center justify-center relative shadow-md">
                <div className="w-8 h-8 rounded-full bg-black/85 flex items-center justify-center">
                  {/* Empty cave opening */}
                </div>
              </div>
            </div>
          ) },
        ].map((item) => {
          if (!purchasedItems.includes(item.id)) return null;
          // Only show if present/active in placedCats list
          const isPlaced = placedCats.some((placed) => placed.shopId === item.id);
          if (!isPlaced) return null;

          return (
            <div
              key={item.id}
              className="absolute z-1 pointer-events-none select-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: item.left, top: item.top }}
            >
              {item.graphic}
            </div>
          );
        })}

        {/* STATIC COMPLETED TOYS LAYER (No animations, fixed positions, non-draggable, colored by custom pixel grid) */}
        {[
          { id: "toy_yarn_ball", left: "68%", top: "73%" },
          { id: "squeaky_mouse", left: "38%", top: "71%" },
          { id: "toy_fish", left: "58%", top: "75%" },
          { id: "toy_feather", left: "26%", top: "68%" },
          { id: "toy_scratch", left: "76%", top: "67%" },
        ].map((toy) => {
          if (!completedPuzzles.includes(toy.id)) return null;
          // Only show if present/active in placedCats list
          const isPlaced = placedCats.some((placed) => placed.puzzleId === toy.id);
          if (!isPlaced) return null;

          return (
            <div
              key={toy.id}
              className="absolute z-1 pointer-events-none select-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: toy.left, top: toy.top }}
            >
              {getToyPixelIcon(toy.id)}
            </div>
          );
        })}

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
            <div className="bg-white/95 rounded-2xl p-4 shadow-lg border border-rose-100 text-center max-w-[240px]">
              <HelpCircle className="w-6 h-6 text-rose-400 mx-auto mb-1 animate-bounce" />
              <p className="text-[10px] font-pixel text-slate-600 leading-relaxed">
                Твоя комнатка пуста! Нажми на котика внизу, чтобы призвать его, или обустрой комнату во вкладке «Украшения»! 🐾
              </p>
            </div>
          </div>
        )}

        {/* SOLID PLACED OBJECTS DRAGGING LAYER */}
        {placedCats.map((cat) => {
          const speech = activeSpeech[cat.id];
          const hasHeart = activeHeart[cat.id];

          return (
            <motion.div
              key={cat.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute z-10 group cursor-grab active:cursor-grabbing touch-none select-none"
              style={{
                left: `${cat.x}%`,
                top: `${cat.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onPointerDown={(e) => handlePointerDown(e, cat.id)}
            >
              {/* Dialogue / Speech Bubble Popup above cat */}
              <AnimatePresence>
                {speech && (
                  <motion.div
                    key="speech"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: -45 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white text-slate-800 text-[10px] font-bold p-1.5 px-2.5 rounded-xl border border-rose-200 shadow-md whitespace-nowrap z-50 text-center pointer-events-none"
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
                    className="absolute left-1/2 -translate-x-1/2 text-red-500 z-50 pointer-events-none"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cat Reposition D-PAD Overlay when hovering or tapping on it */}
              <div className="absolute -top-10 -left-6 hidden group-hover:flex gap-0.5 bg-slate-900/80 p-0.5 rounded-md shadow-lg z-50 select-none">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleReposition(cat.id, "left")}
                  className="px-1.5 py-0.5 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  ←
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleReposition(cat.id, "right")}
                  className="px-1.5 py-0.5 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  →
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleReposition(cat.id, "up")}
                  className="px-1.5 py-0.5 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  ↑
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleReposition(cat.id, "down")}
                  className="px-1.5 py-0.5 text-[8px] font-pixel text-white hover:bg-slate-700 rounded-sm cursor-pointer"
                >
                  ↓
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleRemoveCat(cat.id)}
                  className="px-1.5 py-0.5 text-[8px] font-pixel text-red-400 hover:bg-red-500/20 rounded-sm cursor-pointer ml-1"
                  title="Убрать"
                >
                  ✖
                </button>
              </div>

              {/* Pixel Art / Shop Item Graphic */}
              <div
                className={`relative transition-transform duration-200 transform ${
                  cat.flipped ? "scale-x-[-1]" : ""
                } ${cat.isSleeping ? "opacity-90 saturate-75 shadow-inner" : "hover:scale-115"}`}
              >
                {cat.shopId ? (
                  getShopItemGraphic(cat.shopId)
                ) : (
                  getCatPixelIcon(cat.puzzleId || "")
                )}

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
