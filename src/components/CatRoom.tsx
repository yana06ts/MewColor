import React, { useState, useEffect, useRef } from "react";
import { PuzzleTemplate } from "../data/puzzles";
import SOUNDS from "../utils/sound";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Sun, Moon, Flame, Palette, Volume2, Cat, Smile, HelpCircle, Heart, Star, Sparkle, ShoppingBag } from "lucide-react";

// Favorite toys mapping for cute synergies
export const CAT_FAVORITE_TOYS: Record<string, { id: string; name: string; emoji: string }> = {
  siamese_cat: { id: "toy_yarn_ball", name: "Качественный Клубок", emoji: "🧶" },
  ginger_munchkin: { id: "toy_feather", name: "Удочка-дразнилка", emoji: "🪶" },
  royal_white_cat: { id: "toy_fish", name: "Рыбка с мятой", emoji: "🐟" },
  calico_cat: { id: "squeaky_mouse", name: "Игрушка-Мышка", emoji: "🐭" },
  box_cat: { id: "toy_scratch", name: "Кошачья когтеточка", emoji: "🪵" },
  samurai_cat: { id: "toy_bell_ball", name: "Мячик с бубенчиком", emoji: "🔔" },
};

// Cute buyable skins for golden yarn
export const AVAILABLE_SKINS = [
  { id: "bow", name: "Розовый Облик", emoji: "🎀", price: 3, desc: "+30% к пассивной пряже котика!" },
  { id: "galaxy", name: "Космический Облик", emoji: "🌌", price: 5, desc: "+60% к пассивной пряже котика!" },
  { id: "crown", name: "Принцессный Облик", emoji: "👑", price: 8, desc: "+80% к пассивной пряже котика!" },
  { id: "gold", name: "Золотой Облик", emoji: "✨", price: 12, desc: "+120% к пассивной пряже котика!" },
];

interface CatRoomProps {
  completedPuzzles: string[]; // ids of completed puzzles
  puzzleTemplates: PuzzleTemplate[];
  yarnCount: number;
  updateYarn: (newCount: number) => void;
  goldYarnCount: number;
  updateGoldYarn: (newCount: number) => void;
  gachaTickets: number;
  updateGachaTickets: (newCount: number) => void;
  catLevels: Record<string, number>;
  updateCatLevels: (levels: Record<string, number>) => void;
  equippedSkins: Record<string, string>;
  updateEquippedSkins: (skins: Record<string, string>) => void;
  unlockedSkins: string[];
  updateUnlockedSkins: (skins: string[]) => void;
  gachaUnlockedCats: string[];
  updateGachaUnlockedCats: (newCount: string[]) => void;
  catDuplicates: Record<string, number>;
  updateCatDuplicates: (newDuplicates: Record<string, number>) => void;
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

export function CatRoom({
  completedPuzzles,
  puzzleTemplates,
  yarnCount,
  updateYarn,
  goldYarnCount,
  updateGoldYarn,
  gachaTickets,
  updateGachaTickets,
  catLevels,
  updateCatLevels,
  equippedSkins,
  updateEquippedSkins,
  unlockedSkins,
  updateUnlockedSkins,
  gachaUnlockedCats,
  updateGachaUnlockedCats,
  catDuplicates,
  updateCatDuplicates,
}: CatRoomProps) {
  const roomRef = useRef<HTMLDivElement>(null);
  
  // Try to load placed objects from local storage, or spawn first completed cat by default
  const [placedCats, setPlacedCats] = useState<PlacedCat[]>(() => {
    const saved = localStorage.getItem("meowcolor_placed_cats");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [isDay, setIsDay] = useState<boolean>(true);
  const [fireplaceActive, setFireplaceActive] = useState<boolean>(true);
  
  // Custom design states synced with Decorations / Shop Equips
  const [rugTheme, setRugTheme] = useState<string>(() => {
    return localStorage.getItem("meowcolor_equipped_rug") || "pink";
  });
  const [wallpaper, setWallpaper] = useState<string>(() => {
    return localStorage.getItem("meowcolor_equipped_wallpaper") || "stripes";
  });
  const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
    const savedPurchases = localStorage.getItem("meowcolor_purchased_items");
    if (savedPurchases) {
      try {
        return JSON.parse(savedPurchases);
      } catch (e) {}
    }
    return [];
  });
  
  const [activeSpeech, setActiveSpeech] = useState<{ [id: string]: string }>({});
  const [activeHeart, setActiveHeart] = useState<{ [id: string]: boolean }>({});
  const [activeYarnReward, setActiveYarnReward] = useState<{ [id: string]: number }>({});

  // Passive income collection states
  const [accruedYarn, setAccruedYarn] = useState<number>(0);
  const [accruedTickets, setAccruedTickets] = useState<number>(0);
  const [lastClaimTime, setLastClaimTime] = useState<number>(() => {
    const saved = localStorage.getItem("meowcolor_last_claim");
    if (saved) {
      return parseInt(saved, 10);
    } else {
      const now = Date.now();
      localStorage.setItem("meowcolor_last_claim", now.toString());
      return now;
    }
  });

  // Modal detail card state
  const [selectedDetailCat, setSelectedDetailCat] = useState<PlacedCat | null>(null);
  const [isBasketOpen, setIsBasketOpen] = useState<boolean>(false);
  const [isShelterOpen, setIsShelterOpen] = useState<boolean>(false);

  // Dynamic calculations for total passive income rate (yarn per second)
  const currentRate = React.useMemo(() => {
    let rate = 0;
    
    // Filter down to draggable cats currently placed in the room
    const placedCatsFiltered = placedCats.filter((cat) => {
      const template = cat.puzzleId ? puzzleTemplates.find(p => p.id === cat.puzzleId) : null;
      return !cat.shopId && (!template || template.category === "cats");
    });

    placedCatsFiltered.forEach((cat) => {
      if (!cat.puzzleId) return;

      const level = catLevels[cat.puzzleId] || 1;
      const baseYield = 0.10; // 0.10 yarn per second per cat = 6 yarn/minute base

      // Level multiplier: Lvl 1 = 1.0, Lvl 2 = 1.25, Lvl 3 = 1.5, etc.
      const lvlMult = 1 + (level - 1) * 0.25;

      // Toy Synergy check: check if fav toy is also placed in the room
      const favToy = CAT_FAVORITE_TOYS[cat.puzzleId];
      const hasSynergy = favToy && placedCats.some((item) => item.puzzleId === favToy.id);
      const synergyAdd = hasSynergy ? 0.5 : 0; // +50% bonus yield

      // Skin check with dynamic multipliers based on accessory
      const activeSkin = equippedSkins[cat.puzzleId];
      let skinAdd = 0;
      if (activeSkin === "bow") skinAdd = 0.30;       // +30%
      else if (activeSkin === "galaxy") skinAdd = 0.60; // +60%
      else if (activeSkin === "crown") skinAdd = 0.80;  // +80%
      else if (activeSkin === "gold") skinAdd = 1.20;   // +120%

      rate += baseYield * (lvlMult + synergyAdd + skinAdd);
    });

    // Shop item furniture multipliers (applied globally to total cat production rate!)
    let furnitureMult = 1.0;
    const placedShopIds = placedCats.filter(item => item.shopId).map(item => item.shopId);

    if (placedShopIds.includes("cushion")) furnitureMult += 0.25;       // Sofa gives +25%
    if (placedShopIds.includes("golden_fish")) furnitureMult += 0.15;   // Bowl gives +15%
    if (placedShopIds.includes("tunnel")) furnitureMult += 0.15;        // Box gives +15%
    if (placedShopIds.includes("luxury_tower")) furnitureMult += 0.45;  // Tower gives +45%
    if (placedShopIds.includes("cactus_scratch")) furnitureMult += 0.50;// Cactus gives +50%
    if (placedShopIds.includes("aquarium")) furnitureMult += 0.30;      // Aquarium gives +30%

    return rate * furnitureMult;
  }, [placedCats, catLevels, equippedSkins, puzzleTemplates]);

  // Dynamic furniture multipliers stats for display
  const furnitureBonusStats = React.useMemo(() => {
    const placedShopIds = placedCats.filter(item => item.shopId).map(item => item.shopId);
    
    const items = [
      { id: "cushion", name: "Королевский диван 🛋️", pct: 25 },
      { id: "golden_fish", name: "Миска с карасями 🥣", pct: 15 },
      { id: "tunnel", name: "Коробка мечты 📦", pct: 15 },
      { id: "luxury_tower", name: "Кото-Небоскрёб 🏰", pct: 45 },
      { id: "cactus_scratch", name: "Когтеточка-кактус 🌵", pct: 50 },
      { id: "aquarium", name: "Аквариум с рыбками 🐠", pct: 30 },
    ];

    const activeItems = items.filter(it => placedShopIds.includes(it.id));
    const totalBonus = activeItems.reduce((acc, it) => acc + it.pct, 0);

    return {
      activeItems,
      totalBonus
    };
  }, [placedCats]);

  // Active Cat + Toy synergies calculations for display
  const activeSynergiesInfo = React.useMemo(() => {
    return Object.entries(CAT_FAVORITE_TOYS).map(([catId, toyConfig]) => {
      const catTemplate = puzzleTemplates.find(p => p.id === catId);
      const isCatPlaced = placedCats.some(c => !c.shopId && c.puzzleId === catId);
      const isToyPlaced = placedCats.some(c => c.type === "toy" ? c.puzzleId === toyConfig.id : c.puzzleId === toyConfig.id && puzzleTemplates.find(p => p.id === c.puzzleId)?.category === "toys");
      const isSynergyActive = isCatPlaced && isToyPlaced;

      return {
        catId,
        catName: catTemplate?.name.replace(/[🐾🐈‍⬛📦]/g, "").trim() || "Котик",
        toyId: toyConfig.id,
        toyName: toyConfig.name,
        toyEmoji: toyConfig.emoji,
        isCatPlaced,
        isToyPlaced,
        isActive: isSynergyActive
      };
    });
  }, [placedCats, puzzleTemplates]);

  // live timer to accumulate passive yarn / tickets (with 10-mins favorite toys combos!)
  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - lastClaimTime) / 1000);
      const elapsedConstrained = Math.min(elapsed, 43200); // 12 Hours Cap

      const rawAccumulated = elapsedConstrained * currentRate;
      const calculatedYarn = Math.floor(rawAccumulated);
      
      // Award 1 free spin coupon for every 200 regular yarn generated
      const normalTickets = Math.floor(calculatedYarn / 200);

      // Award 1 extra ticket/coupon every 10 minutes (600s) for each active cat + favored toy pair in the shelter!
      let activeSynergiesCount = 0;
      const placedCatsFiltered = placedCats.filter((cat) => {
        const template = cat.puzzleId ? puzzleTemplates.find(p => p.id === cat.puzzleId) : null;
        return !cat.shopId && (!template || template.category === "cats");
      });
      
      placedCatsFiltered.forEach((cat) => {
        if (!cat.puzzleId) return;
        const favToy = CAT_FAVORITE_TOYS[cat.puzzleId];
        const hasSynergy = favToy && placedCats.some((item) => item.puzzleId === favToy.id);
        if (hasSynergy) {
          activeSynergiesCount++;
        }
      });

      const synergyTickets = Math.floor((elapsedConstrained / 600) * activeSynergiesCount);
      const calculatedTickets = normalTickets + synergyTickets;
      
      setAccruedYarn(calculatedYarn);
      setAccruedTickets(calculatedTickets);
    };

    // Run tick immediately on render/mount so it starts instantly without showing 0 or resetting
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTime, currentRate, placedCats]);

  // Claim click handler
  const handleClaimIncome = () => {
    if (accruedYarn <= 0 && accruedTickets <= 0) {
      SOUNDS.playError();
      return;
    }

    updateYarn(yarnCount + accruedYarn);
    updateGachaTickets(gachaTickets + accruedTickets);
    SOUNDS.playCompleteLevel();

    const now = Date.now();
    setLastClaimTime(now);
    localStorage.setItem("meowcolor_last_claim", now.toString());

    setAccruedYarn(0);
    setAccruedTickets(0);
    if (isBasketOpen) {
      setIsBasketOpen(false);
    }
  };

  const placedCatsRef = useRef<PlacedCat[]>([]);
  useEffect(() => {
    placedCatsRef.current = placedCats;
  }, [placedCats]);

  // Filters cats completed by user OR unlocked through gacha box!
  const unlockedCats = puzzleTemplates.filter(
    (p) => p.category === "cats" && (completedPuzzles.includes(p.id) || gachaUnlockedCats.includes(p.id))
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

    // Active instant petting reward in yarn based on cat level!
    const lvl = catLevels[cat.puzzleId || ""] || 1;
    const reward = lvl * 2;
    updateYarn(yarnCount + reward);
    setActiveYarnReward((prev) => ({ ...prev, [cat.id]: reward }));

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

    setTimeout(() => {
      setActiveYarnReward((prev) => {
        const copy = { ...prev };
        delete copy[cat.id];
        return copy;
      });
    }, 1500);

    // Randomize sleeping/flipping state slightly on click
    const updated = placedCats.map((c) => {
      if (c.id === cat.id) {
        return {
          ...c,
          flipped: !c.flipped,
          isSleeping: Math.random() > 0.85 ? !c.isSleeping : c.isSleeping,
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
      case "luxury_tower":
        return <div className="text-5xl filter drop-shadow-md hover:scale-105 duration-200 select-none">🏰</div>;
      case "golden_fish":
        return <div className="text-3xl filter drop-shadow animate-bounce select-none font-pixel">🥣</div>;
      case "tunnel":
        return <div className="text-4xl filter drop-shadow hover:scale-105 duration-200 select-none font-pixel">📦</div>;
      case "cactus_scratch":
        return <div className="text-5xl filter drop-shadow hover:scale-105 duration-200 select-none">🌵</div>;
      case "aquarium":
        return <div className="text-4xl filter drop-shadow hover:scale-105 duration-200 select-none">🐠</div>;
      default:
        return <div className="text-3xl filter drop-shadow select-none">🎁</div>;
    }
  };

  // Render cat silhouette as pixel SVG
  const getCatPixelIcon = (puzzleId: string) => {
    const template = puzzleTemplates.find((p) => p.id === puzzleId);
    if (!template) return null;

    const activeSkin = equippedSkins[puzzleId];

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
            
            let finalColor = num === 0 ? "transparent" : color?.hex || "#999";
            
            if (num !== 0 && color && activeSkin) {
              const colorName = color.name || "";
              const isOutline = num === 1 || colorName.toLowerCase().includes("контур") || colorName.toLowerCase().includes("outline");
              const isEyes = colorName.toLowerCase().includes("глаз") || colorName.toLowerCase().includes("бусинк") || colorName.toLowerCase().includes("eye");
              const isCheeks = colorName.toLowerCase().includes("щёч") || colorName.toLowerCase().includes("щеч") || colorName.toLowerCase().includes("ноc") || colorName.toLowerCase().includes("нос") || colorName.toLowerCase().includes("cheek") || colorName.toLowerCase().includes("nose");

              const originalColor = color?.hex || "#999";

              if (activeSkin === "galaxy") {
                if (isOutline) {
                  finalColor = "#120b29"; // Dark cosmic violet outline
                } else if (isEyes) {
                  finalColor = "#22d3ee"; // Radiant space cyan eyes
                } else if (isCheeks) {
                  finalColor = "#f43f5e"; // Glowing pink cheeks
                } else {
                  // Maintain original color as the base, but weave sparkling stardust elements!
                  const patternVal = (r * 7 + c * 13) % 4;
                  if (patternVal === 0) {
                    finalColor = "#a855f7"; // Twinkling purple stardust
                  } else if (patternVal === 1) {
                    finalColor = "#6366f1"; // Twinkling indigo stardust
                  } else if (patternVal === 2) {
                    finalColor = "#ec4899"; // Cosmic magenta dust
                  } else {
                    finalColor = originalColor; // Keep original cat pattern base
                  }
                }
              } else if (activeSkin === "gold") {
                if (isOutline) {
                  finalColor = "#3d2203"; // Rich dark chocolate/gold bronze contour
                } else if (isEyes) {
                  finalColor = "#10b981"; // Precious emerald jewel eyes
                } else if (isCheeks) {
                  finalColor = "#fb923c"; // Sparkling amber nose/lips
                } else {
                  // Keep original layout, but blend pure glittering gold spots!
                  const patternVal = (r * 11 + c * 3) % 4;
                  if (patternVal === 0) {
                    finalColor = "#fbbf24"; // Bright gold highlight
                  } else if (patternVal === 1) {
                    finalColor = "#f59e0b"; // Warm gold highlight
                  } else if (patternVal === 2) {
                    finalColor = "#fffbeb"; // Glitter spark white-gold
                  } else {
                    finalColor = originalColor; // Keep original cat color
                  }
                }
              }
            }

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  backgroundColor: finalColor,
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
      case "neon_wallpaper":
        return "bg-[linear-gradient(180deg,#2e1065_0%,#3b0764_100%)]";
      case "mint_clouds":
        return "bg-[linear-gradient(180deg,#ccfbf1_0%,#f0fdf4_100%)]";
      case "golden_damask":
        return "bg-[linear-gradient(180deg,#fef3c7_0,#fde68a_100%)]";
      case "strawberry_milk":
        return "bg-[linear-gradient(180deg,#ffe4e6_0%,#fff1f2_100%)]";
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
            Кото-Комната
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
              {isDay ? "День" : "Ночь 🌙"}
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

          <button
            id="shelter-control-btn"
            onClick={() => {
              setIsShelterOpen(true);
              SOUNDS.playPop(1.4);
            }}
            className="p-1.5 rounded-lg border text-xs font-pixel flex items-center justify-center gap-1 cursor-pointer transition-colors bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200"
            title="Мой Питомник / Клуб Котиков"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
            <span className="text-[9px] uppercase font-bold scale-85">Питомник</span>
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

        {/* Mint Clouds Wallpaper decoration */}
        {wallpaper === "mint_clouds" && (
          <div className="absolute inset-x-0 top-0 bottom-[35%] pointer-events-none z-0 opacity-80">
            <div className="absolute top-4 left-4 text-sm font-pixel">☁️</div>
            <div className="absolute top-10 left-[25%] text-lg font-pixel">☁️</div>
            <div className="absolute top-6 left-[50%] text-base font-pixel">☁️</div>
            <div className="absolute top-12 left-[75%] text-sm font-pixel">☁️</div>
            <div className="absolute top-5 right-6 text-base font-pixel">☁️</div>
          </div>
        )}

        {/* Golden Damask Wallpaper decoration */}
        {wallpaper === "golden_damask" && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-80">
            <div className="absolute top-4 left-6 text-xs text-yellow-600">⚜️</div>
            <div className="absolute top-12 left-24 text-sm text-yellow-600">⚜️</div>
            <div className="absolute top-6 left-[50%] text-xs text-yellow-600">⚜️</div>
            <div className="absolute top-14 left-[80%] text-xs text-yellow-600">⚜️</div>
            <div className="absolute top-20 left-12 text-xs text-yellow-600">⚜️</div>
            <div className="absolute top-24 left-[60%] text-xs text-yellow-600">⚜️</div>
          </div>
        )}

        {/* Strawberry Milk Wallpaper decoration */}
        {wallpaper === "strawberry_milk" && (
          <div className="absolute inset-x-0 top-0 bottom-[35%] pointer-events-none z-0 opacity-90">
            <div className="absolute top-3 left-4 text-xs">🍓</div>
            <div className="absolute top-10 left-16 text-xs">🍓</div>
            <div className="absolute top-14 left-24 text-xs">🍓</div>
            <div className="absolute top-4 left-[36%] text-xs">🍓</div>
            <div className="absolute top-12 left-[48%] text-xs">🍓</div>
            <div className="absolute top-6 left-[62%] text-xs">🍓</div>
            <div className="absolute top-11 left-[76%] text-xs">🍓</div>
            <div className="absolute top-4 right-14 text-xs">🍓</div>
            <div className="absolute top-10 right-4 text-xs">🍓</div>
          </div>
        )}

        {/* Cosmic Neon Wallpaper decoration */}
        {wallpaper === "neon_wallpaper" && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-95">
            <div className="absolute top-4 left-10 text-xs text-purple-300">👾</div>
            <div className="absolute top-12 left-[30%] text-xs text-purple-300">🛸</div>
            <div className="absolute top-6 left-[65%] text-xs text-fuchsia-300">👾</div>
            <div className="absolute top-14 left-[88%] text-xs text-purple-300">🛸</div>
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
          {/* Detailed glass aquarium on top of the fireplace mantel */}
          {purchasedItems.includes("aquarium") && placedCats.some((placed) => placed.shopId === "aquarium") && (
            <div className="w-16 h-11 bg-cyan-200/40 border-2 border-cyan-400 rounded-lg relative overflow-hidden backdrop-blur-[1px] flex items-center justify-center shadow-md mb-0.5 animate-pulse z-10">
              {/* Sandy bottom */}
              <div className="w-full h-1.5 bg-amber-100/80 absolute bottom-0 left-0" />
              {/* Seaweed left */}
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full absolute bottom-1 left-2 origin-bottom animate-bounce" style={{ animationDelay: "0.2s" }} />
              {/* Seaweed right */}
              <div className="w-1 h-5 bg-emerald-400 rounded-full absolute bottom-1 right-2 origin-bottom animate-bounce" />
              {/* Water line */}
              <div className="w-full h-[80%] bg-cyan-300/35 absolute bottom-0 left-0" />
              {/* Little bubbles rising */}
              <div className="w-0.5 h-0.5 bg-white/70 rounded-full absolute bottom-2 left-6 animate-ping" />
              <div className="w-0.5 h-0.5 bg-white/60 rounded-full absolute bottom-4 right-5 animate-ping" style={{ animationDelay: "0.5s" }} />
              {/* Swimming Goldfish */}
              <div className="text-[11px] select-none z-10 animate-bounce duration-700">🐠</div>
            </div>
          )}

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
                : rugTheme === "space_rug"
                ? "bg-indigo-900 border-indigo-700 shadow-indigo-900/50"
                : rugTheme === "rainbow_rug"
                ? "bg-fuchsia-300 border-fuchsia-400 shadow-fuchsia-300/50"
                : rugTheme === "golden_royal"
                ? "bg-yellow-500 border-yellow-600 shadow-yellow-500/50"
                : rugTheme === "checkered_cyber"
                ? "bg-slate-900 border-slate-950 shadow-slate-900/50"
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
          { id: "cushion", left: "50%", top: "48%", graphic: <div className="text-8xl md:text-[8.5rem] select-none drop-shadow-2xl transform hover:scale-105 transition-transform duration-300">🛋️</div> },
          { id: "golden_fish", left: "10%", top: "84%", graphic: <div className="text-3xl select-none drop-shadow-sm">🥣</div> },
          { id: "tunnel", left: "26%", top: "82%", graphic: <div className="text-4xl md:text-5xl select-none drop-shadow-md">📦</div> },
          { id: "cactus_scratch", left: "75%", top: "74%", graphic: <div className="text-6xl md:text-7xl select-none drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300">🌵</div> },
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
          { id: "toy_scratch", left: "46%", top: "74%" },
        ].map((toy) => {
          if (!completedPuzzles.includes(toy.id)) return null;
          // Only show if present/active in placedCats list and represents a toy
          const isPlaced = placedCats.some((placed) => placed.puzzleId === toy.id && (placed.type === "toy" || puzzleTemplates.find(p => p.id === placed.puzzleId)?.category === "toys"));
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

        {/* HARVEST YARN BASKET WIDGET (Accrued income) */}
        <div className="absolute right-4 top-4 z-40 select-none">
          <button
            onClick={() => {
              setIsBasketOpen(true);
              SOUNDS.playPop(1.1);
            }}
            className="w-11 h-11 bg-white/95 rounded-full border border-rose-200 shadow-md cursor-pointer flex items-center justify-center relative hover:bg-rose-50/50"
            title="Корзина накоплений 🧺"
          >
            {/* Basket Emoji */}
            <span className="text-xl">🧺</span>

            {/* Notification Dot */}
            {(accruedYarn > 0 || accruedTickets > 0) && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-550 text-[6px] font-pixel text-white items-center justify-center font-bold shadow-xs">
                  !
                </span>
              </span>
            )}
          </button>
        </div>

        {/* BASKET DETAILED ACCRUAL OVERLAY DIALOG */}
        <AnimatePresence>
          {isBasketOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              {/* Back close trigger */}
              <div className="absolute inset-0" onClick={() => setIsBasketOpen(false)} />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-100 max-w-lg w-full h-[90%] sm:h-auto max-h-[92%] flex flex-col relative z-50 text-slate-800"
              >
                <button
                  onClick={() => setIsBasketOpen(false)}
                  className="absolute top-3 right-3 w-6 h-6 bg-slate-100 text-slate-450 font-bold rounded-full flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
                >
                  ✕
                </button>

                <h3 className="text-xs font-pixel font-black text-rose-700 uppercase flex items-center justify-center gap-1.5 mt-1 shrink-0">
                  🧺 КОРЗИНА НАКОПЛЕНИЙ 🧺
                </h3>
                
                <p className="text-[8px] text-slate-500 mt-1 font-semibold leading-relaxed shrink-0">
                  Кошачья комната пассивно генерирует обычную пряжу и купоны, пока вы занимаетесь своими делами!
                </p>

                {/* SCROLLABLE INNER PARTS */}
                <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3.5 scrollbar-thin">
                  {/* Accumulations */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex flex-col items-center">
                      <span className="text-[7.5px] font-pixel text-slate-405 font-bold">НАКОПЛЕНО ПРЯЖИ</span>
                      <span className="text-xs font-black text-amber-600 mt-1">🧶 {accruedYarn}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-slate-200">
                      <span className="text-[7.5px] font-pixel text-slate-405 font-bold">НАКОПЛЕНО КУПОНОВ</span>
                      <span className="text-xs font-black text-rose-500 mt-1">🎟️ +{accruedTickets}</span>
                    </div>
                  </div>

                  {/* ACTIVE SPEED MULTIPLIERS (Request 7) */}
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-2.5 text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[7.5px] font-pixel text-amber-800 font-bold uppercase tracking-wide">
                        ⚡ Скорость мебели (+{furnitureBonusStats.totalBonus}%):
                      </span>
                    </div>

                    {furnitureBonusStats.activeItems.length > 0 ? (
                      <div className="space-y-0.5">
                        {furnitureBonusStats.activeItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-[7px] font-semibold text-slate-650">
                            <span>• {item.name}</span>
                            <span className="text-amber-600 font-bold">+{item.pct}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[7px] text-slate-450 leading-relaxed font-semibold">
                        Готовая мебель не выставлена в комнате. Купите её во вкладке «Украшения», чтобы увеличить скорость сбора пряжи до <strong className="text-amber-700">+100%</strong>!
                      </p>
                    )}
                  </div>

                  {/* CAT + TOY ACTIVE SYNERGIES (Request 8) */}
                  <div className="bg-rose-50/40 border border-rose-100/60 rounded-xl p-2.5 text-left space-y-1.5">
                    <div>
                      <span className="text-[7.5px] font-pixel text-rose-800 font-bold uppercase tracking-wide">
                        🤝 Пары Котик + Игрушка:
                      </span>
                      <p className="text-[6.5px] text-slate-500 mt-0.5 font-semibold leading-relaxed">
                        Каждая активная пара (котик и его игрушка выставлены в комнате) приносит <strong className="text-rose-600">+1 купон каждые 10 минут</strong>!
                      </p>
                    </div>

                    <div className="space-y-1.5 max-h-[280px] sm:max-h-[180px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {activeSynergiesInfo.map((syn) => (
                        <div
                          key={syn.catId}
                          className={`p-2.5 rounded-xl border text-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                            syn.isActive
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-3xs"
                              : "bg-slate-50 border-slate-200 text-slate-500"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-extrabold font-pixel text-slate-850">
                              <span className="text-xs">🐾</span> 
                              <span>{syn.catName} + {syn.toyEmoji} {syn.toyName}</span>
                            </div>
                            
                            {/* Detailed checks */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[7px] font-semibold text-slate-500 font-pixel">
                              <span className="flex items-center gap-0.5">
                                🐈 Котик: {syn.isCatPlaced ? (
                                  <strong className="text-emerald-700 font-bold bg-emerald-100/80 px-1 py-0.2 rounded">В доме 🏠</strong>
                                ) : (
                                  <strong className="text-slate-400 font-bold bg-slate-100 px-1 py-0.2 rounded">Вне дома 💤</strong>
                                )}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                {syn.toyEmoji} Игрушка: {syn.isToyPlaced ? (
                                  <strong className="text-emerald-700 font-bold bg-emerald-100/80 px-1 py-0.2 rounded">В доме 🏠</strong>
                                ) : (
                                  <strong className="text-slate-400 font-bold bg-slate-100 px-1 py-0.2 rounded">Вне дома 💤</strong>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {/* Synergy status badge */}
                          <div className="shrink-0 flex items-center">
                            {syn.isActive ? (
                              <div className="bg-emerald-550 text-white font-pixel font-bold text-[6.5px] px-1.5 py-1 rounded-md shadow-3xs animate-pulse uppercase tracking-wide">
                                🔥 Активно (+1🎟️/10м)
                              </div>
                            ) : (
                              <div className="bg-slate-200 text-slate-400 border border-slate-250/20 font-pixel font-semibold text-[6.5px] px-1.5 py-0.8 rounded-md uppercase">
                                ✕ Не активна
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="shrink-0 pt-2 border-t border-rose-100">
                  {accruedYarn > 0 || accruedTickets > 0 ? (
                    <button
                      onClick={handleClaimIncome}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-2 rounded-xl text-[9px] font-pixel transition-colors cursor-pointer shadow-sm uppercase tracking-wide"
                    >
                      Забрать ресурсы 🎒🐾
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-extrabold py-1.5 rounded-xl text-[9px] font-pixel pointer-events-none uppercase tracking-wide"
                    >
                      Корзина Пока Пуста! 💤
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
        {placedCats.filter((cat) => {
          const template = cat.puzzleId ? puzzleTemplates.find(p => p.id === cat.puzzleId) : null;
          const isCat = !cat.shopId && (!template || template.category === "cats");
          return isCat;
        }).map((cat) => {
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

              {/* Floating Yarn Reward Effect */}
              <AnimatePresence>
                {activeYarnReward[cat.id] && (
                  <motion.div
                    key="yarn-reward"
                    initial={{ opacity: 1, y: -10, x: 10, scale: 0.8 }}
                    animate={{ opacity: 0, y: -70, x: 25, scale: 1.3 }}
                    className="absolute left-1/2 -translate-x-1/2 text-amber-800 font-pixel font-black text-[9px] bg-amber-100/95 border border-amber-300 rounded-full px-1.5 py-0.5 whitespace-nowrap z-50 pointer-events-none shadow-2xs"
                  >
                    +{activeYarnReward[cat.id]} 🧶
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
                {/* Dynamic equipped hat/costume skin overlay */}
                {cat.puzzleId && equippedSkins[cat.puzzleId] && (
                  <div className="absolute -top-4.5 left-4.5 text-xl z-30 pointer-events-none select-none drop-shadow-md animate-bounce" style={{ animationDuration: "3s" }}>
                    {equippedSkins[cat.puzzleId] === "crown" && "👑"}
                    {equippedSkins[cat.puzzleId] === "galaxy" && "🌌"}
                    {equippedSkins[cat.puzzleId] === "gold" && "✨"}
                    {equippedSkins[cat.puzzleId] === "bow" && "🎀"}
                  </div>
                )}

                {/* Favorite Toy Synergy indicator decoration */}
                {(() => {
                  if (!cat.puzzleId) return null;
                  const favToy = CAT_FAVORITE_TOYS[cat.puzzleId];
                  const hasSynergy = favToy && placedCats.some((item) => item.puzzleId === favToy.id);
                  if (!hasSynergy) return null;
                  return (
                    <div className="absolute -top-1.5 -left-1.5 text-[10px] text-pink-500 animate-pulse pointer-events-none z-20" title="Синергия активна! 💕">
                      💖
                    </div>
                  );
                })()}

                {/* Level badge label */}
                {cat.puzzleId && (
                  <div className="absolute -bottom-2 -center-x bg-rose-500 text-white min-w-[20px] text-[7.5px] font-pixel px-1 py-0.5 rounded-full border border-rose-300 pointer-events-none z-20 scale-85 text-center shadow-xs">
                    ★{catLevels[cat.puzzleId] || 1}
                  </div>
                )}

                {cat.shopId ? (
                  getShopItemGraphic(cat.shopId)
                ) : (
                  getCatPixelIcon(cat.puzzleId || "")
                )}

                {/* Zzz floating letters if cat is Sleeping */}
                {cat.isSleeping && (
                  <div className="absolute -top-22 -right-2 text-[9px] font-pixel text-sky-400 animate-bounce">
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

      {/* 4. COZY INTERACTIVE CAT DETAILS MODAL (Change Skins / Level stats) */}
      <AnimatePresence>
        {selectedDetailCat && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            {/* Modal backdrop closer click block */}
            <div className="absolute inset-0" onClick={() => setSelectedDetailCat(null)} />
            
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-sm rounded-[28px] p-4.5 shadow-2xl relative z-50 flex flex-col gap-3 border-2 border-rose-100 text-slate-800 max-h-[85%] select-none"
            >
              {/* Close pin */}
              <button
                onClick={() => setSelectedDetailCat(null)}
                className="absolute top-4 right-4 w-7 h-7 bg-slate-100 text-slate-500 font-extrabold rounded-full flex items-center justify-center hover:bg-slate-200 cursor-pointer active:scale-90 transition-transform"
              >
                ✕
              </button>

              {/* Title & Level Header stats */}
              <div className="flex items-center gap-3 pb-2 border-b border-rose-50 pr-8">
                <div className="p-1.5 bg-rose-50 rounded-xl shrink-0 border border-rose-100">
                  {getCatPixelIcon(selectedDetailCat.puzzleId || "")}
                </div>
                <div>
                  <h3 className="text-xs font-pixel font-bold text-slate-800 uppercase flex items-center gap-1">
                    {selectedDetailCat.name}
                    <span className="text-[8px] font-pixel bg-rose-500 text-white px-2 py-0.5 rounded-full ml-1">
                      Lvl {catLevels[selectedDetailCat.puzzleId || ""] || 1}
                    </span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-normal">
                    {selectedDetailCat.puzzleId === "siamese_cat" ? "Очаровательный породистый котик с тёмной мордочкой" :
                     selectedDetailCat.puzzleId === "ginger_munchkin" ? "Рыженький пушистик на коротких лапках" :
                     selectedDetailCat.puzzleId === "royal_white_cat" ? "Пушистая белая принцесса с королевским взглядом" :
                     selectedDetailCat.puzzleId === "calico_cat" ? "Трёхцветное пятнистое кошачье чудо с пушистым хвостиком" :
                     selectedDetailCat.puzzleId === "samurai_cat" ? "Сонный ветеран с непревзойдённой кошачьей харизмой" :
                     "Твой лохматый пиксельный компаньон"}
                  </p>
                </div>
              </div>

              {/* Scrollable inner area */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1.5 scrollbar-thin">

              {/* Stats & Earnings list */}
              <div className="bg-rose-50/50 rounded-2xl p-3 border border-rose-100 grid grid-cols-2 gap-2 text-xs select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-pixel">АКТИВНАЯ НАГРАДА:</span>
                  <span className="font-extrabold text-[#9c6644] flex items-center gap-1 font-mono text-xs">
                    🧶 +{(() => {
                      const level = catLevels[selectedDetailCat.puzzleId || ""] || 1;
                      const activeSkin = equippedSkins[selectedDetailCat.puzzleId || ""];
                      const favToy = CAT_FAVORITE_TOYS[selectedDetailCat.puzzleId || ""];
                      const hasSynergy = favToy && placedCats.some(c => c.puzzleId === favToy.id);
                      
                      const base = 0.10;
                      const lvlMult = 1 + (level - 1) * 0.25;
                      const synergyAdd = hasSynergy ? 0.5 : 0;
                      
                      let skinAdd = 0;
                      if (activeSkin === "bow") skinAdd = 0.30;
                      else if (activeSkin === "galaxy") skinAdd = 0.60;
                      else if (activeSkin === "crown") skinAdd = 0.80;
                      else if (activeSkin === "gold") skinAdd = 1.20;
                      
                      return (base * (lvlMult + synergyAdd + skinAdd) * 60).toFixed(1);
                    })()} / мин
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 border-l border-rose-100/40 pl-3">
                  <span className="text-[9px] text-slate-400 font-pixel font-bold">ЛЮБИМАЯ ИГРУШКА:</span>
                  <span className="font-bold text-slate-800 text-[10px] truncate flex items-center gap-1 mt-0.5">
                    {(() => {
                      const favToy = CAT_FAVORITE_TOYS[selectedDetailCat.puzzleId || ""];
                      if (!favToy) return "Дразнилка";
                      const isPlaced = placedCats.some(c => c.puzzleId === favToy.id);
                      return (
                        <span className="flex items-center gap-1">
                          {favToy.emoji} {favToy.name}
                          <span className={isPlaced ? "text-emerald-500 text-[8px] font-pixel" : "text-slate-400 text-[8px] font-pixel"}>
                            {isPlaced ? "(+50% 💖)" : "(нет дома)"}
                          </span>
                        </span>
                      );
                    })()}
                  </span>
                </div>
              </div>

              {/* LEVEL UP MANUAL UPGRADE SYSTEM */}
              {(() => {
                const catId = selectedDetailCat.puzzleId || "";
                const currentLevel = catLevels[catId] || 1;
                const duplicateCount = catDuplicates[catId] || 0;

                return (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-3 border border-amber-200 text-xs flex flex-col gap-2 select-none">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-pixel text-amber-700 font-bold uppercase">ПРОКАЧКА КОТИКА:</span>
                      <span className="text-[8.5px] font-pixel bg-white border border-rose-250 px-2 py-0.5 rounded-full text-rose-500 font-extrabold flex items-center gap-0.5 shadow-2xs">
                        Карточек: {duplicateCount} 🎁
                      </span>
                    </div>

                    {currentLevel >= 5 ? (
                      <div className="text-center py-1 text-emerald-600 font-extrabold text-[9px] font-pixel">
                        👑 ДОСТИГНУТ МАКСИМУМ (Lvl 5)!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {duplicateCount >= 1 ? (
                          <button
                            onClick={() => {
                              const nextLevels = { ...catLevels, [catId]: currentLevel + 1 };
                              updateCatLevels(nextLevels);

                              const nextDuplicates = { ...catDuplicates, [catId]: duplicateCount - 1 };
                              updateCatDuplicates(nextDuplicates);

                              SOUNDS.playSuccessColor();
                              SOUNDS.playMeow();
                              setSelectedDetailCat({ ...selectedDetailCat });
                            }}
                            className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-1.5 rounded-xl text-[8.5px] font-pixel cursor-pointer uppercase transition-colors shadow-2xs"
                          >
                            ⚡ Повысить уровень за 1 Карточку (Lvl {currentLevel} → {currentLevel + 1}) ⚡
                          </button>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              disabled={yarnCount < currentLevel * 150}
                              onClick={() => {
                                updateYarn(yarnCount - currentLevel * 150);
                                const nextLevels = { ...catLevels, [catId]: currentLevel + 1 };
                                updateCatLevels(nextLevels);

                                SOUNDS.playSuccessColor();
                                SOUNDS.playMeow();
                                setSelectedDetailCat({ ...selectedDetailCat });
                              }}
                              className="w-full text-center bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-extrabold py-1.5 rounded-xl text-[8.5px] font-pixel cursor-pointer uppercase transition-colors"
                            >
                              Купить Lvl {currentLevel + 1} за {currentLevel * 150} 🧶
                            </button>
                            <p className="text-[7.5px] text-center text-slate-400 leading-normal font-semibold">
                              * Находите дубликаты котиков в Коробке Удачи, чтобы прокачивать их бесплатно! 🎁
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* COZY COUPONS DUO SYNERGY FORMULA */}
              {(() => {
                const catId = selectedDetailCat.puzzleId || "";
                const favToy = CAT_FAVORITE_TOYS[catId];
                if (!favToy) return null;

                const isCatPlaced = placedCats.some(c => c.puzzleId === catId);
                const isToyPlaced = placedCats.some(c => c.puzzleId === favToy.id);
                const bothPlaced = isCatPlaced && isToyPlaced;

                return (
                  <div className="bg-sky-50/50 rounded-2xl p-3 border border-sky-100/80 space-y-1 text-xs select-none">
                    <span className="text-[9px] font-pixel text-sky-700 font-black uppercase flex items-center gap-1">
                      🎟️ Купонная Синергия Дуэта:
                    </span>
                    <p className="text-[8px] text-slate-500 leading-normal font-semibold">
                      Разместите котика и его любимую игрушку одновременно в комнате, чтобы они приносили дополнительные купоны!
                    </p>
                    
                    <div className="flex items-center justify-between pt-1.5 border-t border-sky-100/60 mt-1">
                      <div className="flex items-center gap-1 text-base">
                        <span>🐱</span>
                        <span className="text-slate-400 text-xs text-semibold">+</span>
                        <span>{favToy.emoji}</span>
                      </div>
                      
                      <div className="text-[8px] text-right font-pixel">
                        <span className="text-slate-700 font-semibold">{selectedDetailCat.name} + {favToy.name}</span>
                        <div className={`font-bold mt-0.5 ${bothPlaced ? "text-emerald-600" : "text-amber-600 animate-pulse"}`}>
                          {bothPlaced ? "✓ Активно (+1 Купон каждые 10 мин)" : "✕ Не активно (нужно разместить обоих)"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SKIN / COSTUMES COLLECTION & ACQUISITION */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-pixel text-slate-400 flex items-center gap-1 uppercase select-none">
                  <ShoppingBag className="w-3.5 h-3.5 text-rose-450" />
                  УЛУЧШЕНИЯ И КОСТЮМЫ НА КОТА (за Кристаллы):
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SKINS.map((skin, index) => {
                    const skinKey = `${selectedDetailCat.puzzleId || ""}_${skin.id}`;
                    const isUnlocked = unlockedSkins.includes(skinKey);
                    const isEquipped = equippedSkins[selectedDetailCat.puzzleId || ""] === skin.id;

                    // Order verification: must unlock previous skins first
                    let isLockedByOrder = false;
                    let previousSkinName = "";
                    if (index > 0 && !isUnlocked) {
                      const prevSkin = AVAILABLE_SKINS[index - 1];
                      const prevSkinKey = `${selectedDetailCat.puzzleId || ""}_${prevSkin.id}`;
                      if (!unlockedSkins.includes(prevSkinKey)) {
                        isLockedByOrder = true;
                        previousSkinName = prevSkin.name;
                      }
                    }

                    return (
                      <div
                        key={skin.id}
                        className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isEquipped
                            ? "border-rose-400 bg-rose-50/20"
                            : isLockedByOrder
                            ? "border-slate-100 bg-slate-200/40 opacity-75"
                            : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xl drop-shadow-sm mb-1">
                          {isLockedByOrder ? "🔒" : skin.emoji}
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-850 line-clamp-1">
                          {skin.name}
                        </span>
                        <span className="text-[8px] text-amber-600 font-pixel font-bold">
                          {skin.desc}
                        </span>

                        {isLockedByOrder && (
                          <span className="text-[7.5px] text-rose-500 font-sans font-semibold mt-1 leading-tight">
                            Нужен: {previousSkinName}
                          </span>
                        )}

                        <div className="w-full mt-2">
                          {isEquipped ? (
                            <button
                              onClick={() => {
                                const updated = { ...equippedSkins };
                                delete updated[selectedDetailCat.puzzleId || ""];
                                updateEquippedSkins(updated);
                                SOUNDS.playPop(1.0);
                              }}
                              className="w-full text-center bg-red-400 hover:bg-red-500 text-white text-[8px] font-pixel py-1 rounded-md cursor-pointer uppercase"
                            >
                              Снять ✖
                            </button>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => {
                                const updated = { ...equippedSkins, [selectedDetailCat.puzzleId || ""]: skin.id };
                                updateEquippedSkins(updated);
                                SOUNDS.playPop(1.2);
                              }}
                              className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-pixel py-1 rounded-md cursor-pointer uppercase font-bold"
                            >
                              Надеть 👕
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (isLockedByOrder) {
                                  SOUNDS.playError();
                                  alert(`Этот облик заблокирован! Сначала необходимо купить предыдущий костюм: "${previousSkinName}".`);
                                  return;
                                }
                                if (goldYarnCount < skin.price) {
                                  SOUNDS.playError();
                                  alert("Не хватает кристаллов! Попробуй выполнить достижения или открыть Коробку Удачи.");
                                  return;
                                }
                                updateGoldYarn(goldYarnCount - skin.price);
                                updateUnlockedSkins([...unlockedSkins, skinKey]);
                                SOUNDS.playSuccessColor();
                              }}
                              className={`w-full text-center text-[8px] font-pixel font-extrabold py-1.5 rounded-md cursor-pointer shadow-xs uppercase tracking-tight ${
                                isLockedByOrder
                                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                  : "bg-sky-500 hover:bg-sky-600 text-white"
                              }`}
                            >
                              {isLockedByOrder ? "🔒 Закрыто" : `Купить за ${skin.price} 💎`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              </div> {/* End scrollable inner area */}
            </motion.div>
          </div>
        )}

        {/* SHELTER CONTROL/BOARDING HOUSE DETAILED OVERLAY DIALOG */}
        {isShelterOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setIsShelterOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-4 shadow-2xl border-2 border-rose-100 max-w-xs w-full max-h-[85%] flex flex-col relative z-50 text-slate-800"
            >
              <button
                onClick={() => setIsShelterOpen(false)}
                className="absolute top-3 right-3 w-6 h-6 bg-slate-100 text-slate-500 font-bold rounded-full flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
              >
                ✕
              </button>

              <div className="text-center pb-1.5 border-b border-rose-100 shrink-0">
                <h3 className="text-xs font-pixel font-black text-rose-700 uppercase flex items-center justify-center gap-1 pt-1">
                  🐾 Питомник 🐾
                </h3>
              </div>

              {/* Scrollable list of cats */}
              <div className="flex-1 overflow-y-auto py-2.5 space-y-2 max-h-[350px] pr-0.5 scrollbar-thin">
                {unlockedCats.map((template) => {
                  const catId = template.id;
                  const currentLevel = catLevels[catId] || 1;
                  const duplicateCount = catDuplicates[catId] || 0;
                  const placedCat = placedCats.find((c) => c.puzzleId === catId);
                  const isPlaced = !!placedCat;

                  return (
                    <div
                      key={catId}
                      className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center gap-2 transition-all hover:bg-rose-50/10"
                    >
                      {/* Left: Pixel Representation Preview */}
                      <div className="shrink-0 scale-75 bg-white/60 p-1 rounded-lg border border-slate-200 shadow-3xs">
                        {getCatPixelIcon(catId)}
                      </div>

                      {/* Center: Info & Levelling */}
                      <div className="flex-1 text-left min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <h4 className="text-[9px] font-pixel font-bold text-slate-800 truncate">
                            {template.name.replace(/[🐾🐈‍⬛📦]/g, "").trim()}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-[7px] text-slate-500 font-semibold font-pixel">
                          <span>Lvl {currentLevel}</span>
                          <span>•</span>
                          <span>🎁 {duplicateCount} шт</span>
                        </div>

                        {/* Level Up interface */}
                        {currentLevel >= 5 ? (
                          <div className="text-[6.5px] font-pixel text-emerald-600 font-extrabold text-left">
                            👑 MAX LVL
                          </div>
                        ) : (
                          <div className="pt-0.5">
                            {duplicateCount >= 1 ? (
                              <button
                                onClick={() => {
                                  const nextLevels = { ...catLevels, [catId]: currentLevel + 1 };
                                  updateCatLevels(nextLevels);

                                  const nextDuplicates = { ...catDuplicates, [catId]: duplicateCount - 1 };
                                  updateCatDuplicates(nextDuplicates);

                                  SOUNDS.playSuccessColor();
                                  SOUNDS.playMeow();
                                }}
                                className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-0.5 px-1 rounded-sm text-[6.5px] font-pixel cursor-pointer uppercase transition-colors"
                              >
                                Повысить (+1🎁)
                              </button>
                            ) : (
                              <button
                                disabled={yarnCount < currentLevel * 150}
                                onClick={() => {
                                  updateYarn(yarnCount - currentLevel * 150);
                                  const nextLevels = { ...catLevels, [catId]: currentLevel + 1 };
                                  updateCatLevels(nextLevels);

                                  SOUNDS.playSuccessColor();
                                  SOUNDS.playMeow();
                                }}
                                className="w-full text-center bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-bold py-0.5 px-1 rounded-sm text-[6.5px] font-pixel cursor-pointer uppercase transition-colors"
                              >
                                {currentLevel * 150}🧶
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Detailed Info Trigger */}
                      <div className="shrink-0 flex items-center justify-center border-l border-slate-200 pl-1.5">
                        <button
                          onClick={() => {
                            const activeCat = placedCats.find((c) => c.puzzleId === catId);
                            const tName = template.name.replace(/[🐾🐈‍⬛📦]/g, "").trim();
                            const targetCat: PlacedCat = activeCat || {
                              id: `temp_${catId}`,
                              type: "cat",
                              puzzleId: catId,
                              name: tName,
                              x: 50,
                              y: 55,
                              isSleeping: false,
                              flipped: false,
                            };
                            setSelectedDetailCat(targetCat);
                            setIsShelterOpen(false);
                            SOUNDS.playPop(1.1);
                          }}
                          className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-[7.5px] font-pixel py-1.5 px-2.5 rounded-lg cursor-pointer font-bold uppercase transition-all shadow-3xs"
                        >
                          Подробнее ℹ️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-rose-100 shrink-0">
                <button
                  onClick={() => setIsShelterOpen(false)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-1.5 rounded-xl text-[8.5px] font-pixel transition-colors cursor-pointer uppercase tracking-wide"
                >
                  Закрыть Питомник 🐾🐈
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
