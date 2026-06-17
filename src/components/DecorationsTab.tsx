import React, { useState, useEffect } from "react";
import { PuzzleTemplate } from "../data/puzzles";
import SOUNDS from "../utils/sound";
import { ShoppingBag, Palette, Sparkles, Smile, Star, Check, Lock, Heart, Gift } from "lucide-react";

interface DecorationsTabProps {
  yarnCount: number;
  updateYarn: (newCount: number) => void;
  completedPuzzles: string[]; // ids of completed puzzles
  puzzleTemplates: PuzzleTemplate[];
  onSelectPuzzle: (puzzle: PuzzleTemplate) => void;
}

interface PlacedItem {
  id: string;
  type: "cat" | "toy" | "shop";
  puzzleId?: string;
  shopId?: string;
  name: string;
  x: number;
  y: number;
  isSleeping?: boolean;
  flipped?: boolean;
}

export function DecorationsTab({
  yarnCount,
  updateYarn,
  completedPuzzles,
  puzzleTemplates,
  onSelectPuzzle,
}: DecorationsTabProps) {
  // 1. Direct buy items config
  const SHOP_ITEMS = [
    { id: "cushion", name: "Мягкая подушечка 🛋️", price: 30, description: "Невероятно мягкая пуховая лежанка для ленивого сна" },
    { id: "luxury_tree", name: "Игровой комплекс 🌳", price: 65, description: "Многоярусное элитное дерево для лазания и прыжков кувырком" },
    { id: "golden_fish", name: "Миска с карасями 🥣", price: 25, description: "Полная миска свежих карасей для сытого кошачьего мурчания" },
    { id: "tunnel", name: "Шуршащая труба 🌀", price: 40, description: "Специальный шуршащий тоннель с забавными лазейками" },
    { id: "luxury_tower", name: "Кото-Небоскрёб 🏰", price: 80, description: "Огромная пятиэтажная башня-лежанка с мягкими гамаками и когтеточками" },
  ];

  // 2. Rug designs config
  const RUG_THEMES = [
    { id: "pink", name: "Розовое облако 🌸", price: 0, color: "bg-rose-200" },
    { id: "blue", name: "Морская волна 💙", price: 35, color: "bg-sky-200" },
    { id: "green", name: "Сочная травка 💚", price: 35, color: "bg-emerald-200" },
    { id: "boho", name: "Горчичный пирог 💛", price: 35, color: "bg-amber-200" },
  ];

  // 3. Wallpapers config
  const WALLPAPER_THEMES = [
    { id: "stripes", name: "Уютная доска 🪵", price: 0, preview: "bg-orange-100" },
    { id: "stars", name: "Звёздное небо 🌌", price: 45, preview: "bg-indigo-950" },
    { id: "sakura", name: "Цветущая сакура 🌸", preview: "bg-pink-100", price: 45 },
  ];

  // State loaded from localStorage
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [purchasedRugs, setPurchasedRugs] = useState<string[]>(["pink"]);
  const [purchasedWallpapers, setPurchasedWallpapers] = useState<string[]>(["stripes"]);
  const [equippedRug, setEquippedRug] = useState<string>("pink");
  const [equippedWallpaper, setEquippedWallpaper] = useState<string>("stripes");
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);

  // Selected sub-category inside decorations tab
  const [activeSection, setActiveSection] = useState<"toys" | "shop" | "themes">("toys");

  // Load state on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("meowcolor_purchased_items");
    if (savedItems) {
      try { setPurchasedItems(JSON.parse(savedItems)); } catch (e) {}
    }

    const savedRugs = localStorage.getItem("meowcolor_purchased_rugs");
    if (savedRugs) {
      try { setPurchasedRugs(JSON.parse(savedRugs)); } catch (e) {}
    } else {
      localStorage.setItem("meowcolor_purchased_rugs", JSON.stringify(["pink"]));
    }

    const savedWalls = localStorage.getItem("meowcolor_purchased_wallpapers");
    if (savedWalls) {
      try { setPurchasedWallpapers(JSON.parse(savedWalls)); } catch (e) {}
    } else {
      localStorage.setItem("meowcolor_purchased_wallpapers", JSON.stringify(["stripes"]));
    }

    const savedEquippedRug = localStorage.getItem("meowcolor_equipped_rug");
    if (savedEquippedRug) {
      setEquippedRug(savedEquippedRug);
    } else {
      localStorage.setItem("meowcolor_equipped_rug", "pink");
    }

    const savedEquippedWall = localStorage.getItem("meowcolor_equipped_wallpaper");
    if (savedEquippedWall) {
      setEquippedWallpaper(savedEquippedWall);
    } else {
      localStorage.setItem("meowcolor_equipped_wallpaper", "stripes");
    }

    const savedPlaced = localStorage.getItem("meowcolor_placed_cats");
    if (savedPlaced) {
      try { setPlacedItems(JSON.parse(savedPlaced)); } catch (e) {}
    }
  }, []);

  const savePlacedItemsToRoom = (newItems: PlacedItem[]) => {
    setPlacedItems(newItems);
    localStorage.setItem("meowcolor_placed_cats", JSON.stringify(newItems));
  };

  // Helper trigger placing item
  const handleTogglePlaceItem = (type: "toy" | "shop", id: string, name: string) => {
    const isPlaced = placedItems.some(
      (item) => (type === "toy" ? item.puzzleId === id : item.shopId === id)
    );

    if (isPlaced) {
      // Remove from room
      const filtered = placedItems.filter(
        (item) => (type === "toy" ? item.puzzleId !== id : item.shopId !== id)
      );
      savePlacedItemsToRoom(filtered);
      SOUNDS.playPop(0.85);
    } else {
      // Place in room
      const newItem: PlacedItem = {
        id: `placed_${type === "toy" ? id : id}_${Date.now()}`,
        type,
        puzzleId: type === "toy" ? id : undefined,
        shopId: type === "shop" ? id : undefined,
        name: name.replace(/[🧸🐚🛋️🌳🥣🌀🐱🐾🌸🪵🌌]/g, "").trim(),
        x: 25 + Math.random() * 50,
        y: 45 + Math.random() * 20,
        isSleeping: false,
        flipped: Math.random() > 0.5,
      };
      
      const updated = [...placedItems, newItem];
      savePlacedItemsToRoom(updated);
      SOUNDS.playPop(1.15);
    }
  };

  // Direct Purchase Shop item
  const handleBuyShopItem = (id: string, name: string, price: number) => {
    if (yarnCount < price) {
      SOUNDS.playError();
      alert("Недостаточно мотков пряжи! Раскрашивай картинки во вкладке «Пазлы», чтобы заработать больше пряжи! 🧶");
      return;
    }
    const nextYarn = yarnCount - price;
    updateYarn(nextYarn);

    const nextPurchased = [...purchasedItems, id];
    setPurchasedItems(nextPurchased);
    localStorage.setItem("meowcolor_purchased_items", JSON.stringify(nextPurchased));
    SOUNDS.playSuccessColor();
  };

  // Direct Purchase Rug
  const handleBuyRug = (id: string, price: number) => {
    if (yarnCount < price) {
      SOUNDS.playError();
      return;
    }
    const nextYarn = yarnCount - price;
    updateYarn(nextYarn);

    const nextPurchased = [...purchasedRugs, id];
    setPurchasedRugs(nextPurchased);
    localStorage.setItem("meowcolor_purchased_rugs", JSON.stringify(nextPurchased));

    // Equip it automatically
    setEquippedRug(id);
    localStorage.setItem("meowcolor_equipped_rug", id);
    SOUNDS.playSuccessColor();
  };

  // Direct Purchase Wallpaper
  const handleBuyWallpaper = (id: string, price: number) => {
    if (yarnCount < price) {
      SOUNDS.playError();
      return;
    }
    const nextYarn = yarnCount - price;
    updateYarn(nextYarn);

    const nextPurchased = [...purchasedWallpapers, id];
    setPurchasedWallpapers(nextPurchased);
    localStorage.setItem("meowcolor_purchased_wallpapers", JSON.stringify(nextPurchased));

    // Equip it automatically
    setEquippedWallpaper(id);
    localStorage.setItem("meowcolor_equipped_wallpaper", id);
    SOUNDS.playSuccessColor();
  };

  // Equip already owned Rug
  const handleEquipRug = (id: string) => {
    setEquippedRug(id);
    localStorage.setItem("meowcolor_equipped_rug", id);
    SOUNDS.playPop(1.1);
  };

  // Equip already owned Wallpaper
  const handleEquipWallpaper = (id: string) => {
    setEquippedWallpaper(id);
    localStorage.setItem("meowcolor_equipped_wallpaper", id);
    SOUNDS.playPop(1.1);
  };

  // Filter toys from puzzles data
  const toyPuzzles = puzzleTemplates.filter((p) => p.category === "toys");

  return (
    <div className="flex flex-col h-full bg-[#FCF8F2] select-none">
      
      {/* 1. Header with dynamic balance feedback */}
      <div className="bg-rose-50/50 p-3 px-4 border-b border-rose-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-1.5">
          <Palette className="w-5 h-5 text-rose-500" />
          <h2 className="text-sm font-pixel text-rose-700 uppercase tracking-wide">
            Уютные Украшения 🛋️
          </h2>
        </div>
        <span className="text-[10px] bg-amber-100 text-slate-800 border border-amber-300 px-2 py-0.5 rounded-full font-pixel font-bold">
          В наличии: {yarnCount} 🧶
        </span>
      </div>

      {/* 2. Cozy Section Pills */}
      <div className="flex gap-1.5 p-3 px-4 bg-white border-b border-rose-100 shrink-0">
        <button
          onClick={() => { setActiveSection("toys"); SOUNDS.playPop(1.0); }}
          className={`flex-1 text-[10px] font-pixel py-2 rounded-xl border transition-all cursor-pointer text-center ${
            activeSection === "toys"
              ? "bg-rose-400 text-white border-rose-500 scale-102 font-bold"
              : "bg-slate-50 border-rose-100/50 text-slate-500 hover:bg-rose-50/30"
          }`}
        >
          🧩 Раскрась Игрушки
        </button>
        <button
          onClick={() => { setActiveSection("shop"); SOUNDS.playPop(1.0); }}
          className={`flex-1 text-[10px] font-pixel py-2 rounded-xl border transition-all cursor-pointer text-center ${
            activeSection === "shop"
              ? "bg-rose-400 text-white border-rose-500 scale-102 font-bold"
              : "bg-slate-50 border-rose-100/50 text-slate-500 hover:bg-rose-50/30"
          }`}
        >
          🛍️ Готовая Мебель
        </button>
        <button
          onClick={() => { setActiveSection("themes"); SOUNDS.playPop(1.0); }}
          className={`flex-1 text-[10px] font-pixel py-2 rounded-xl border transition-all cursor-pointer text-center ${
            activeSection === "themes"
              ? "bg-rose-400 text-white border-rose-500 scale-102 font-bold"
              : "bg-slate-50 border-rose-100/50 text-slate-500 hover:bg-rose-50/30"
          }`}
        >
          🎨 Пол и Стены
        </button>
      </div>

      {/* 3. Section specific list rendering */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {/* SECTION A: TOYS CATALOGUE */}
        {activeSection === "toys" && (
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/50 leading-tight">
              <span className="text-[10px] font-pixel text-amber-800 font-bold block mb-1">
                🎨 ИГРУШКИ ПО НОМЕРАМ:
              </span>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Раскрась новые игрушки, чтобы они открылись! Готовые игрушки сразу автоматически ложатся на свои постоянные места в комнате котиков.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {toyPuzzles.map((toy) => {
                const isDone = completedPuzzles.includes(toy.id);

                return (
                  <div
                    key={toy.id}
                    className="bg-white rounded-2xl p-3.5 border border-rose-100 flex items-center gap-3 shadow-xs"
                  >
                    {/* Compact preview representation */}
                    <div className="w-16 h-16 bg-rose-50/50 rounded-xl p-1 flex items-center justify-center shrink-0 border border-rose-100/30">
                      <div
                        className="grid gap-[1px]"
                        style={{
                          gridTemplateColumns: `repeat(${toy.width}, minmax(0, 1fr))`,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {toy.rows.flatMap((rowStr) =>
                          rowStr.split("").map((char, i) => {
                            const num = char === "." ? 0 : parseInt(char, 10);
                            const color = toy.colors.find((col) => col.number === num);
                            return (
                              <div
                                key={i}
                                className="rounded-xs"
                                style={{
                                  backgroundColor: num === 0 ? "transparent" : (isDone ? color?.hex : "#cbd5e1"),
                                }}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 uppercase truncate">
                        {toy.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                        {toy.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                        {isDone ? (
                          <span className="px-2.5 py-1 text-[9px] font-pixel font-bold text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">
                            🏠 красуется дома
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelectPuzzle(toy)}
                            className="bg-rose-400 text-white hover:bg-rose-500 px-3 py-1.5 rounded-xl text-[9px] font-pixel font-bold cursor-pointer transition-all flex items-center gap-1"
                          >
                            <span>🎨 Раскрасить</span>
                            <span className="text-amber-200 font-bold">+{toy.yarnReward}🧶</span>
                          </button>
                        )}
                        
                        <span className="text-[9px] font-pixel text-slate-400">
                          {isDone ? "✓ Раскрашено" : `${toy.width}x${toy.height}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION B: GO TO DIRECT SHOP */}
        {activeSection === "shop" && (
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/50 leading-tight">
              <span className="text-[10px] font-pixel text-amber-800 font-bold block mb-1">
                🛍 🌟 УЮТНАЯ МЕБЕЛЬ ДЛЯ ДОМА:
              </span>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Эти классные аксессуары не требуют раскрашивания! Покупай их за собранные мотки шерсти, и они сразу же встанут на свои постоянные места в комнате котиков.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {SHOP_ITEMS.map((item) => {
                const isBought = purchasedItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3.5 border border-rose-100 flex items-center gap-3.5 shadow-xs"
                  >
                    {/* Visual icon badge placeholder */}
                    <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-4xl shadow-inner shrink-0 border border-rose-100">
                      {item.id === "cushion" ? "🛋️" : item.id === "luxury_tree" ? "🌳" : item.id === "golden_fish" ? "🥣" : item.id === "tunnel" ? "🌀" : "🏰"}
                    </div>

                    {/* Metadata controls details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase truncate">
                          {item.name}
                        </h4>
                        {!isBought && (
                          <span className="text-[10px] font-pixel text-amber-600 font-extrabold shrink-0">
                            🧶 {item.price}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">
                        {item.description}
                      </p>

                      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50">
                        {isBought ? (
                          <span className="text-center py-1.5 rounded-xl text-[9px] font-pixel font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 w-full">
                            🏠 куплено и добавлено
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyShopItem(item.id, item.name, item.price)}
                            className="flex-1 text-center bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 py-1.5 rounded-xl text-[9px] font-pixel font-extrabold cursor-pointer transition-all shadow-xs"
                          >
                            Купить за {item.price} 🧶
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION C: ROOM STYLES & INTERIORS */}
        {activeSection === "themes" && (
          <div className="space-y-4">
            
            {/* RUG THEMES SHOP & COLOR SELECTIONS */}
            <div className="bg-white rounded-2xl p-4 border border-rose-100 space-y-3 shadow-xs">
              <h3 className="text-xs font-pixel text-rose-500 uppercase flex items-center gap-1 border-b pb-2">
                🏠 Цвета Коврика:
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {RUG_THEMES.map((theme) => {
                  const isBought = theme.price === 0 || purchasedRugs.includes(theme.id);
                  const isEquipped = equippedRug === theme.id;

                  return (
                    <div
                      key={theme.id}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isEquipped ? "border-rose-400 bg-rose-50/20" : "border-slate-100 bg-slate-50/50"
                      }`}
                    >
                      {/* Color Preview frame */}
                      <div className={`w-12 h-6.5 rounded-full border border-black/10 shadow-xs mb-2 ${theme.color}`} />
                      <span className="text-[10px] font-bold text-slate-700 block line-clamp-1">{theme.name}</span>
                      
                      <div className="w-full mt-2">
                        {isEquipped ? (
                          <span className="text-[8px] bg-rose-400 text-white font-pixel px-2 py-0.5 rounded-md block uppercase">
                            Стелится ✨
                          </span>
                        ) : isBought ? (
                          <button
                            onClick={() => handleEquipRug(theme.id)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 w-full text-[8px] font-pixel py-1.5 rounded-md cursor-pointer uppercase font-bold"
                          >
                            Расстелить 🌟
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyRug(theme.id, theme.price)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 w-full text-[8px] font-pixel py-1.5 rounded-md cursor-pointer font-extrabold shadow-xs"
                          >
                            {theme.price} 🧶
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WALLPAPER THEMES SHOP & DESIGN OPTIONS */}
            <div className="bg-white rounded-2xl p-4 border border-rose-100 space-y-3 shadow-xs">
              <h3 className="text-xs font-pixel text-rose-500 uppercase flex items-center gap-1 border-b pb-2">
                🪵 Обои для Комнаты:
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPER_THEMES.map((wall) => {
                  const isBought = wall.price === 0 || purchasedWallpapers.includes(wall.id);
                  const isEquipped = equippedWallpaper === wall.id;

                  return (
                    <div
                      key={wall.id}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isEquipped ? "border-rose-400 bg-rose-50/20" : "border-slate-100 bg-slate-50/50"
                      }`}
                    >
                      {/* wallpaper preview box */}
                      <div className={`w-12 h-6.5 rounded-md border border-black/10 shadow-xs mb-2 relative overflow-hidden ${wall.preview}`}>
                        {wall.id === "stripes" && (
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#00000005,#00000005_4px,transparent_4px,transparent_8px)]" />
                        )}
                        {wall.id === "stars" && (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px]">✨</div>
                        )}
                        {wall.id === "sakura" && (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px]">🌸</div>
                        )}
                      </div>
                      
                      <span className="text-[10px] font-bold text-slate-700 block line-clamp-1">{wall.name}</span>

                      <div className="w-full mt-2">
                        {isEquipped ? (
                          <span className="text-[8px] bg-rose-400 text-white font-pixel px-2 py-0.5 rounded-md block uppercase">
                            Оклеено ✨
                          </span>
                        ) : isBought ? (
                          <button
                            onClick={() => handleEquipWallpaper(wall.id)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 w-full text-[8px] font-pixel py-1.5 rounded-md cursor-pointer uppercase font-bold"
                          >
                            Наклеить 🌟
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyWallpaper(wall.id, wall.price)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 w-full text-[8px] font-pixel py-1.5 rounded-md cursor-pointer font-extrabold shadow-xs"
                          >
                            {wall.price} 🧶
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
