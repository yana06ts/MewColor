import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { PuzzleTemplate } from "../data/puzzles";

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
}: GachaTabProps) {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [activeDrawResult, setActiveDrawResult] = useState<any[] | null>(null);

  // List of possible cats for summoning / duplicate level merges
  const poolCats = puzzleTemplates.filter((p) => p.category === "cats");
  const poolToys = puzzleTemplates.filter((p) => p.category === "toys");

  // Spin rates: 40% Regular Yarn, 20% Gold Yarn, 30% Draggable Cats progress/merge, 10% Secret coloring pages!
  const triggerDrawGacha = (costType: "ticket" | "yarn") => {
    if (costType === "ticket" && gachaTickets < 1) {
      playSound("error");
      alert("У тебя нет билетов! Собери их в Кошачьем доме🧺 или накопи обычную пряжу 🧶.");
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

    // Simulate epic 1.5s cardboard shake sequence
    setTimeout(() => {
      const rolledResults = [];
      // Let's roll a single high-quality outcome
      const rng = Math.random();

      if (rng < 0.35) {
        // Roll standard Yarn Prize
        const rngYarn = Math.random() > 0.5 ? 150 : 250;
        updateYarn(yarnCount - (costType === "yarn" ? 100 : 0) + rngYarn);
        rolledResults.push({
          type: "yarn",
          amount: rngYarn,
          title: "Обычная Пряжа",
          emoji: "🧶",
          desc: "Целый ворох мягких разноцветных ниточек для обустройства комнаты!",
        });
      } else if (rng < 0.55) {
        // Roll highly coveted GOLD YARN Prize!
        const rngGold = Math.random() > 0.6 ? 10 : 5;
        updateGoldYarn(goldYarnCount + rngGold);
        rolledResults.push({
          type: "gold_yarn",
          amount: rngGold,
          title: "Золотая Пряжа",
          emoji: "🌟",
          desc: "Редкие сияющие нити! Используй их для покупки красивых костюмов и шляпок.",
        });
      } else {
        // Roll a cat summon/level upgrade
        const chosenCat = poolCats[Math.floor(Math.random() * poolCats.length)];
        const curLevel = catLevels[chosenCat.id] || 1;
        const isAlreadyComplete = completedPuzzles.includes(chosenCat.id);

        if (!isAlreadyComplete) {
          // If coloring page is locked, give them the recipe & auto-unlock coloring page!
          const newCompletedList = [...completedPuzzles, chosenCat.id];
          setCompletedPuzzles(newCompletedList);
          localStorage.setItem("meowcolor_completed", JSON.stringify(newCompletedList));

          rolledResults.push({
            type: "cat_unlock",
            catId: chosenCat.id,
            title: `Новая Раскраска: ${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()}`,
            emoji: "🎨🐈",
            desc: "Ура! Ты открыл новую уникальную раскраску в каталоге! Иди раскрась котика.",
          });
        } else {
          // If already completed, MERGE & LEVEL UP!
          const newLvl = Math.min(5, curLevel + 1);
          const isMaxed = curLevel >= 5;

          if (isMaxed) {
            // Give refund of 5 Gold yarn
            updateGoldYarn(goldYarnCount + 5);
            rolledResults.push({
              type: "cat_refund",
              catId: chosenCat.id,
              title: `${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()} (Максимум)`,
              emoji: "👑",
              desc: "Этот котик уже достиг максимального 5 уровня! Взамен начислено +5 Золотой Пряжи 🌟.",
            });
          } else {
            const nextLevels = { ...catLevels, [chosenCat.id]: newLvl };
            updateCatLevels(nextLevels);

            rolledResults.push({
              type: "cat_level_up",
              catId: chosenCat.id,
              level: newLvl,
              title: `${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()} ★ Lvl ${newLvl}`,
              emoji: "⚡😸",
              desc: `Успешное слияние! Пассивный доход этого котика увеличен на +25% (всего +${(newLvl - 1) * 25}% bonus!).`,
            });
          }
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
    updateYarn(yarnCount - 450);
    playSound("pop");
    setIsDrawing(true);

    setTimeout(() => {
      const rolledResults: any[] = [];
      let tempYarn = yarnCount - 450;
      let tempGold = goldYarnCount;
      const tempLevels = { ...catLevels };

      for (let i = 0; i < 5; i++) {
        const rng = Math.random();

        if (rng < 0.35) {
          const rngYarn = Math.random() > 0.5 ? 120 : 200;
          tempYarn += rngYarn;
          rolledResults.push({
            type: "yarn",
            amount: rngYarn,
            title: "Обычная Пряжа",
            emoji: "🧶",
            desc: "Нити для покупок красок!",
          });
        } else if (rng < 0.55) {
          const rngGold = Math.random() > 0.6 ? 8 : 4;
          tempGold += rngGold;
          rolledResults.push({
            type: "gold_yarn",
            amount: rngGold,
            title: "Золотая Пряжа",
            emoji: "🌟",
            desc: "Сияющие золотые мотки!",
          });
        } else {
          const chosenCat = poolCats[Math.floor(Math.random() * poolCats.length)];
          const curLevel = tempLevels[chosenCat.id] || 1;
          const isAlreadyComplete = completedPuzzles.includes(chosenCat.id);

          if (!isAlreadyComplete) {
            // Auto unlock
            completedPuzzles.push(chosenCat.id);
            setCompletedPuzzles([...completedPuzzles]);
            localStorage.setItem("meowcolor_completed", JSON.stringify(completedPuzzles));

            rolledResults.push({
              type: "cat_unlock",
              catId: chosenCat.id,
              title: `Новая Раскраска: ${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()}`,
              emoji: "🎨🐈",
              desc: "Разблокирована раскраска в каталоге!",
            });
          } else {
            const newLvl = Math.min(5, curLevel + 1);
            if (curLevel >= 5) {
              tempGold += 5;
              rolledResults.push({
                type: "cat_refund",
                catId: chosenCat.id,
                title: `${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()} (Cap)`,
                emoji: "👑",
                desc: "Взамен начислено +5 Золотой Пряжи 🌟.",
              });
            } else {
              tempLevels[chosenCat.id] = newLvl;
              rolledResults.push({
                type: "cat_level_up",
                catId: chosenCat.id,
                level: newLvl,
                title: `${chosenCat.name.replace(/[🐾🐈‍⬛]/g, "").trim()} ★ Lvl ${newLvl}`,
                emoji: "⚡😸",
                desc: `Пассивная генерация повышена до Lvl ${newLvl}!`,
              });
            }
          }
        }
      }

      // Bulk write
      updateYarn(tempYarn);
      updateGoldYarn(tempGold);
      updateCatLevels(tempLevels);

      setActiveDrawResult(rolledResults);
      setIsDrawing(false);
      playSound("successColor");
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcf8f2] select-none text-slate-800 p-4 space-y-4 pb-20 overflow-y-auto">
      
      {/* Header Title Area */}
      <div className="text-center space-y-1">
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
                y: [0, -8, 0, -8, -4, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{
                duration: 1.1,
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
              className="text-center cursor-pointer flex flex-col items-center"
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
          <span className="text-xs font-extrabold text-rose-600 mt-1 flex items-center gap-0.5">
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
          <span className="text-[8px] font-pixel text-slate-400 font-bold whitespace-nowrap">ЗОЛОТАЯ ПРЯЖА</span>
          <span className="text-xs font-extrabold text-[#d4a373] mt-1 flex items-center gap-0.5 font-mono">
            🌟 {goldYarnCount}
          </span>
        </div>
      </div>

      {/* Drawing Actions Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* Draw via Ticket */}
        <button
          onClick={() => triggerDrawGacha("ticket")}
          disabled={isDrawing}
          className="flex flex-col items-center justify-between p-2.5 bg-white border border-rose-100 hover:border-rose-300 hover:bg-rose-50/20 active:scale-95 rounded-2xl cursor-pointer disabled:opacity-50 transition-all shadow-sm"
        >
          <span className="text-[8px] font-pixel text-slate-400 font-black">ОТКРЫТЬ КРУТКОЙ</span>
          <span className="text-xl my-1">🎟️</span>
          <span className="text-[9px] bg-rose-500 text-white rounded-full font-bold px-2 py-0.5">
            1 Крутка
          </span>
        </button>

        {/* Draw via Yarn */}
        <button
          onClick={() => triggerDrawGacha("yarn")}
          disabled={isDrawing || yarnCount < 100}
          className="flex flex-col items-center justify-between p-2.5 bg-white border border-amber-100 hover:border-amber-300 hover:bg-amber-50/20 active:scale-95 rounded-2xl cursor-pointer disabled:opacity-50 transition-all shadow-sm"
        >
          <span className="text-[8px] font-pixel text-slate-400 font-black">ОТКРЫТЬ ЗА ПРЯЖУ</span>
          <span className="text-xl my-1">🧶</span>
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
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[6px] font-pixel px-1 rounded-bl-md uppercase">
            Скидка!
          </div>
          <span className="text-[8px] font-pixel text-amber-700 font-black">МЕГА-ПАК x5</span>
          <span className="text-xl my-0.5">🌟📦</span>
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
            <li><strong className="text-slate-650">Обычная Пряжа (35% вероятность)</strong> — выпадает от 150 до 250 мотков.</li>
            <li><strong className="text-slate-650">Золотая Пряжа (20% вероятность)</strong> — от 4 до 10 золотых сияющих мотков.</li>
            <li><strong className="text-slate-650">Кошачий призыв (45% вероятность)</strong> — при выпадении котика, которого у вас ещё нет, его раскраска auto-разблокируется бесплатно! Если котик уже разблокирован, его уровень повышается на +1 (макс Lvl 5, даёт +25% доход!), а при достижении лимита выдаётся +5 Золотой Пряжи.</li>
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
              
              <div className="my-4 space-y-4 max-h-[290px] overflow-y-auto pr-1 no-scrollbar">
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
