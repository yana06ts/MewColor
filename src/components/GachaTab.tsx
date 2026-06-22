import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { PuzzleTemplate, GACHA_EXCLUSIVE_PUZZLES } from "../data/puzzles";

// Simple Sound proxy matching our utility sound.ts
const playSound = (type: "pop" | "meow" | "error" | "complete" | "successColor") => {
  try {
    const isMuted = localStorage.getItem("meowcolor_sound_on") === "false";
    if (isMuted) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "meow") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.32);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "complete" || type === "successColor") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn("WebAudio context not initialized", e);
  }
};

interface GachaTabProps {
  yarnCount: number;
  updateYarn: (val: number) => void;
  goldYarnCount: number;
  updateGoldYarn: (val: number) => void;
  gachaTickets: number;
  updateGachaTickets: (val: number) => void;
  catLevels: Record<string, number>;
  updateCatLevels: (val: Record<string, number>) => void;
  puzzleTemplates: PuzzleTemplate[];
  completedPuzzles: string[];
  setCompletedPuzzles: React.Dispatch<React.SetStateAction<string[]>>;
  gachaUnlockedCats: string[];
  updateGachaUnlockedCats: (val: string[]) => void;
  catDuplicates: Record<string, number>;
  updateCatDuplicates: (val: Record<string, number>) => void;
  unlockedGachaPuzzleIds: string[];
  updateUnlockedGachaPuzzleIds: (val: string[]) => void;
}

export function GachaTab({
  yarnCount,
  updateYarn,
  goldYarnCount,
  updateGoldYarn,
  gachaTickets,
  updateGachaTickets,
  catLevels,
  updateCatLevels,
  puzzleTemplates,
  completedPuzzles,
  setCompletedPuzzles,
  gachaUnlockedCats,
  updateGachaUnlockedCats,
  catDuplicates,
  updateCatDuplicates,
  unlockedGachaPuzzleIds,
  updateUnlockedGachaPuzzleIds,
}: GachaTabProps) {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [activeDrawResult, setActiveDrawResult] = useState<any[] | null>(null);

  // List of possible cats for summoning / duplicate level merges
  const poolCats = puzzleTemplates.filter((p) => p.category === "cats");

  // Spin rates: 35% Regular Yarn, 20% Crystals 💎, 45% Cat Summon / Duplicates 🎁
  const triggerDrawGacha = (costType: "ticket" | "yarn") => {
    if (costType === "ticket" && gachaTickets < 1) {
      playSound("error");
      alert("У тебя нет купонов! Собери их в Кошачьем доме🧺 или накопи обычную пряжу 🧶.");
      return;
    }
    if (costType === "yarn" && yarnCount < 100) {
      playSound("error");
      alert("Недостаточно пряжи! Нужно 100 🧶.");
      return;
    }

    // Deduct cost
    if (costType === "ticket") {
      updateGachaTickets(gachaTickets - 1);
    } else {
      updateYarn(yarnCount - 100);
    }

    playSound("pop");
    setIsDrawing(true);

    // Simulate epic 1.2s cardboard shake sequence
    setTimeout(() => {
      const rolledResults = [];
      const rng = Math.random();

      if (rng < 0.25) {
        // Roll standard Yarn Prize (balanced consolation refund)
        const rngYarn = Math.random() > 0.5 ? 45 : 25;
        updateYarn((costType === "yarn" ? yarnCount - 100 : yarnCount) + rngYarn);
        rolledResults.push({
          type: "yarn",
          amount: rngYarn,
          title: `Обычная Пряжа (+${rngYarn} 🧶)`,
          emoji: "🧶",
          desc: "Утешительный приз: мягкие ниточки для обустройства комнаты!",
        });
      } else if (rng < 0.45) {
        // Roll highly coveted Crystals Prize!
        const rngCrystal = Math.random() > 0.6 ? 10 : 5;
        updateGoldYarn(goldYarnCount + rngCrystal);
        rolledResults.push({
          type: "crystals",
          amount: rngCrystal,
          title: `Кристаллы (+${rngCrystal} 💎)`,
          emoji: "💎",
          desc: "Редкие сияющие кристаллы! Используй их для покупки красивых костюмов и шляпок.",
        });
      } else if (rng < 0.65) {
        // Roll Gacha-exclusive coloring pages!
        const lockedExclusivePuzzles = GACHA_EXCLUSIVE_PUZZLES.filter(p => !unlockedGachaPuzzleIds.includes(p.id));
        if (lockedExclusivePuzzles.length > 0) {
          const chosenPuzzle = lockedExclusivePuzzles[Math.floor(Math.random() * lockedExclusivePuzzles.length)];
          const nextSaved = [...unlockedGachaPuzzleIds, chosenPuzzle.id];
          updateUnlockedGachaPuzzleIds(nextSaved);

          rolledResults.push({
            type: "puzzle_unlock",
            puzzleId: chosenPuzzle.id,
            title: `Новая Раскраска: ${chosenPuzzle.name.split(" ")[0] || ""} ${chosenPuzzle.name}`,
            emoji: "🎨✨",
            desc: `Ура! Вы выиграли секретную раскраску: "${chosenPuzzle.name}"! Она уже ждет вас во вкладке «Раскраски» для закрашивания!`,
          });
        } else {
          // If all already unlocked, give a big consolation bonus of Crystals!
          const rngCrystal = Math.random() > 0.5 ? 12 : 8;
          updateGoldYarn(goldYarnCount + rngCrystal);
          rolledResults.push({
            type: "crystals_consolation",
            amount: rngCrystal,
            title: `Кристаллы (+${rngCrystal} 💎)`,
            emoji: "💎✨",
            desc: "Вы уже открыли все эксклюзивные раскраски автомата! Взамен вы получаете весомую горсть кристаллов!",
          });
        }
      } else {
        // Roll a cat summon/duplicate
        const chosenCat = poolCats[Math.floor(Math.random() * poolCats.length)];
        const isUnlocked = completedPuzzles.includes(chosenCat.id) || gachaUnlockedCats.includes(chosenCat.id);

        if (!isUnlocked) {
          // Add to gacha unlocked list (so it remains locked in catalog but is unlocked inside the shelter!)
          const nextSaves = [...gachaUnlockedCats, chosenCat.id];
          updateGachaUnlockedCats(nextSaves);

          rolledResults.push({
            type: "cat_unlock",
            catId: chosenCat.id,
            title: `Новый Кот: ${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()}`,
            emoji: "🐱✨",
            desc: "Ура! Ты открыл нового пушистого друга для комнаты! Зайди во вкладку «Дом», чтобы разместить его.",
          });
        } else {
          // If already owned, give duplicates token for manual level ups!
          const duplicateCount = catDuplicates[chosenCat.id] || 0;
          updateCatDuplicates({ ...catDuplicates, [chosenCat.id]: duplicateCount + 1 });

          rolledResults.push({
            type: "cat_duplicate",
            catId: chosenCat.id,
            title: `Дубликат: ${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()}`,
            emoji: "🎁",
            desc: "У вас уже есть этот котик! Вы получили +1 Дубликат. Используйте его в Кото-доме🧺 для ручной прокачки.",
          });
        }
      }

      setActiveDrawResult(rolledResults);
      setIsDrawing(false);
      playSound("complete");
    }, 1200);
  };

  // Roll 5x mega pack!
  const triggerMegaDraw = () => {
    if (yarnCount < 450) {
      playSound("error");
      alert("Недостаточно пряжи! Нужно 450 🧶 (скидка 50 🧶!).");
      return;
    }

    // Deduct cost
    const startYarn = yarnCount - 450;
    updateYarn(startYarn);
    playSound("pop");
    setIsDrawing(true);

    setTimeout(() => {
      const rolledResults: any[] = [];
      let tempYarn = startYarn;
      let tempCrystals = goldYarnCount;
      const tempGachaUnlocked = [...gachaUnlockedCats];
      const tempDuplicates = { ...catDuplicates };
      let tempGachaPuzzles = [...unlockedGachaPuzzleIds];

      for (let i = 0; i < 5; i++) {
        const rng = Math.random();

        if (rng < 0.25) {
          const rngYarn = Math.random() > 0.5 ? 40 : 20;
          tempYarn += rngYarn;
          rolledResults.push({
            type: "yarn",
            amount: rngYarn,
            title: `Обычная Пряжа (+${rngYarn} 🧶)`,
            emoji: "🧶",
            desc: "Утешительный приз: нити для покупок!",
          });
        } else if (rng < 0.45) {
          const rngCrystal = Math.random() > 0.6 ? 8 : 4;
          tempCrystals += rngCrystal;
          rolledResults.push({
            type: "crystals",
            amount: rngCrystal,
            title: `Кристаллы (+${rngCrystal} 💎)`,
            emoji: "💎",
            desc: "Сияющие драгоценные камни!",
          });
        } else if (rng < 0.65) {
          // Gacha-exclusive coloring pages!
          const lockedExclusivePuzzles = GACHA_EXCLUSIVE_PUZZLES.filter(p => !tempGachaPuzzles.includes(p.id));
          if (lockedExclusivePuzzles.length > 0) {
            const chosenPuzzle = lockedExclusivePuzzles[Math.floor(Math.random() * lockedExclusivePuzzles.length)];
            tempGachaPuzzles.push(chosenPuzzle.id);

            rolledResults.push({
              type: "puzzle_unlock",
              puzzleId: chosenPuzzle.id,
              title: `Раскраска: ${chosenPuzzle.name}`,
              emoji: "🎨✨",
              desc: `Вы выиграли эксклюзивную раскраску: "${chosenPuzzle.name}"! Ищи её в главном меню.`,
            });
          } else {
            const rngCrystal = Math.random() > 0.5 ? 10 : 6;
            tempCrystals += rngCrystal;
            rolledResults.push({
              type: "crystals_consolation",
              amount: rngCrystal,
              title: `Кристаллы (+${rngCrystal} 💎)`,
              emoji: "💎✨",
              desc: "Все эксклюзивные раскраски уже получены! Начислена компенсация в кристаллах.",
            });
          }
        } else {
          const chosenCat = poolCats[Math.floor(Math.random() * poolCats.length)];
          const isUnlocked = completedPuzzles.includes(chosenCat.id) || tempGachaUnlocked.includes(chosenCat.id);

          if (!isUnlocked) {
            tempGachaUnlocked.push(chosenCat.id);
            rolledResults.push({
              type: "cat_unlock",
              catId: chosenCat.id,
              title: `Новый Кот: ${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()}`,
              emoji: "🐱✨",
              desc: "Ура! Ты разблокировал котика для своей Кото-Комнаты!",
            });
          } else {
            const currentDupCount = tempDuplicates[chosenCat.id] || 0;
            tempDuplicates[chosenCat.id] = currentDupCount + 1;
            rolledResults.push({
              type: "cat_duplicate",
              catId: chosenCat.id,
              title: `Дубликат: ${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()}`,
              emoji: "🎁",
              desc: "Получен +1 Дубликат для прокачки в Кошачьем доме!",
            });
          }
        }
      }

      // Bulk write
      updateYarn(tempYarn);
      updateGoldYarn(tempCrystals);
      updateGachaUnlockedCats(tempGachaUnlocked);
      updateCatDuplicates(tempDuplicates);
      updateUnlockedGachaPuzzleIds(tempGachaPuzzles);

      setActiveDrawResult(rolledResults);
      setIsDrawing(false);
      playSound("successColor");
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcf8f2] select-none text-slate-800 p-4 space-y-4 pb-20 overflow-y-auto">
      
      {/* Header Title Area */}
      <div className="text-center space-y-1 animate-fade-in">
        <h2 className="text-lg font-extrabold text-rose-700 tracking-tight flex items-center justify-center gap-1.5 font-sans uppercase">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          Автомат Коробка Удачи
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        </h2>
        <p className="text-[10px] text-slate-500 font-medium font-pixel leading-relaxed">
          Испытай удачу! Тяни мотки пряжи, новые раскраски или прокачивай котиков в Кошачьем доме! 📦🍀
        </p>
      </div>

      {/* Main Box Interactive Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 relative">
        <AnimatePresence mode="wait">
          {isDrawing ? (
            <motion.div
              key="box-shaking"
              animate={{
                rotate: [-6, 6, -6, 6, -3, 3, -1, 1, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-center cursor-not-allowed"
            >
              <div className="text-8xl drop-shadow-2xl filter saturate-110 select-none">📦✨</div>
              <p className="text-xs font-pixel text-rose-500 animate-pulse font-extrabold mt-4">
                КОРОБКА ОТКРЫВАЕТСЯ...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="box-idle"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => triggerDrawGacha(gachaTickets > 0 ? "ticket" : "yarn")}
              className="text-center cursor-pointer flex flex-col items-center animate-fade-in"
            >
              <div className="relative">
                <div className="text-8.5xl drop-shadow-xl select-none">📦</div>
                {/* Floating shine bubbles */}
                <div className="absolute -top-1 -right-2 text-2xl animate-bounce" style={{ animationDuration: "2s" }}>✨</div>
                <div className="absolute -bottom-1 -left-1 text-xl animate-bounce" style={{ animationDuration: "3s" }}>🧶</div>
              </div>
              
              <div className="bg-[#9c6644] text-white text-[8px] font-pixel font-bold px-3 py-1 rounded-full shadow-md mt-4 uppercase tracking-wider animate-pulse hover:bg-[#7f5539]">
                Коробка Удачи 🍀 Нажми для открытия
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Balances Panel */}
      <div className="bg-[#e6ccb2]/40 rounded-3xl p-3 border border-[#ddb892]/50 grid grid-cols-3 gap-2.5 text-center text-xs">
        <div className="flex flex-col items-center p-1.5 bg-white/50 rounded-xl">
          <span className="text-[8px] font-pixel text-slate-400 font-bold whitespace-nowrap">У ТЕБЯ КУПОНОВ</span>
          <span className="text-xs font-extrabold text-[#e05780] mt-1 flex items-center gap-0.5">
            🎟️ {gachaTickets}
          </span>
        </div>
        <div className="flex flex-col items-center p-1.5 bg-white/50 rounded-xl">
          <span className="text-[8px] font-pixel text-slate-400 font-bold whitespace-nowrap">ОБЫЧНАЯ ПРЯЖА</span>
          <span className="text-xs font-extrabold text-amber-600 mt-1 flex items-center gap-0.5 font-mono">
            🧶 {yarnCount}
          </span>
        </div>
        <div className="flex flex-col items-center p-1.5 bg-white/50 rounded-xl">
          <span className="text-[8px] font-pixel text-slate-400 font-bold whitespace-nowrap">КРИСТАЛЛЫ</span>
          <span className="text-xs font-extrabold text-sky-600 mt-1 flex items-center gap-0.5 font-mono">
            💎 {goldYarnCount}
          </span>
        </div>
      </div>

      {/* Drawing Actions Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* Draw via Coupon */}
        <button
          onClick={() => triggerDrawGacha("ticket")}
          disabled={isDrawing}
          className="flex flex-col items-center justify-between p-2.5 bg-white border border-rose-100 hover:border-rose-300 hover:bg-rose-50/20 active:scale-95 rounded-2xl cursor-pointer disabled:opacity-50 transition-all shadow-sm"
        >
          <span className="text-[8px] font-pixel text-slate-400 font-black">ОТКРЫТЬ ЗА КУПОН</span>
          <span className="text-xl my-1">🎟️</span>
          <span className="text-[9px] bg-rose-500 text-white rounded-full font-bold px-2 py-0.5">
            1 Купон
          </span>
        </button>

        {/* Draw via Yarn */}
        <button
          onClick={() => triggerDrawGacha("yarn")}
          disabled={isDrawing || yarnCount < 100}
          className="flex flex-col items-center justify-between p-2.5 bg-white border border-amber-100 hover:border-amber-300 hover:bg-amber-50/20 active:scale-95 rounded-2xl cursor-pointer disabled:opacity-50 transition-all shadow-sm"
        >
          <span className="text-[8px] font-pixel text-slate-400 font-black font-semibold">ОТКРЫТЬ ЗА ПРЯЖУ</span>
          <span className="text-xl my-1 font-semibold">🧶</span>
          <span className="text-[9px] bg-amber-600 text-white rounded-full font-bold px-2 py-0.5">
            100 🧶
          </span>
        </button>

        {/* Megapack Draw via Yarn (discount!) */}
        <button
          onClick={triggerMegaDraw}
          disabled={isDrawing || yarnCount < 450}
          className="flex flex-col items-center justify-between p-2.5 bg-amber-50/40 border border-amber-300 hover:border-amber-400 hover:bg-amber-100/30 active:scale-95 rounded-2xl cursor-pointer disabled:opacity-50 transition-all shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[6px] font-pixel px-1 rounded-bl-md uppercase font-semibold">
            Скидка!
          </div>
          <span className="text-[8px] font-pixel text-amber-700 font-black">МЕГА-ПАК x5</span>
          <span className="text-xl my-0.5">💎📦</span>
          <span className="text-[9px] bg-amber-700 text-white rounded-full font-black px-1.5 py-0.5 transition-colors">
            450 🧶
          </span>
        </button>

      </div>

      {/* Rewards Probability Information Block */}
      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex gap-2.5 items-start text-xs text-slate-500 leading-normal">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-slate-700 font-pixel text-[9px] uppercase">Шансы получения предметов в коробке:</p>
          <ul className="text-[8px] list-disc pl-3 font-medium text-slate-500 space-y-0.5">
            <li><strong className="text-slate-650">Обычная Пряжа (25% вероятность)</strong> — выпадает от 20 до 45 мотков.</li>
            <li><strong className="text-slate-650">Кристаллы (20% вероятность)</strong> — выпадает до 10 ценнейших кристаллов 💎.</li>
            <li><strong className="text-slate-650">Секретные раскраски (20% вероятность)</strong> — выигрывай новые эксклюзивные раскраски 🎨 («Космический котик», «Драконий фрукт» и др.) и раскрашивай их с нуля!</li>
            <li><strong className="text-slate-650">Кошачий призыв (35% вероятность)</strong> — шанс открыть нового котика в комнате 🐱! Если он уже открыт, ты получишь ценный дубликат 🎁 для прокачки уровней.</li>
          </ul>
        </div>
      </div>

      {/* DRAW RESULT ANIMATED POPUP DIALOG */}
      <AnimatePresence>
        {activeDrawResult && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-100 max-w-sm w-full text-center relative pointer-events-auto"
            >
              <h3 className="text-sm font-extrabold text-rose-700 uppercase flex items-center justify-center gap-1">
                🎉 ТВОЙ ВЫИГРЫШ! 🎉
              </h3>
              
              <div className="my-4 space-y-4 max-h-[290px] overflow-y-auto pr-1 no-scrollbar animate-fade-in">
                {activeDrawResult.map((res, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col items-center text-center space-y-1.5"
                  >
                    <span className="text-4xl drop-shadow-md select-none">{res.emoji}</span>
                    <h4 className="text-xs font-pixel font-bold text-rose-950 uppercase">{res.title}</h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">{res.desc}</p>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveDrawResult(null);
                  playSound("pop");
                }}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-2 rounded-2xl text-[10px] font-pixel transition-colors cursor-pointer shadow-sm uppercase tracking-wide"
              >
                Отлично! Забрать в багаж 🎒🐾
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
