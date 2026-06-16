import React, { useState } from "react";
import { PuzzleTemplate } from "../data/puzzles";
import SOUNDS from "../utils/sound";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, HelpCircle, Shuffle, Award, Flame, Star, Compass, Gift } from "lucide-react";

interface DailyOracleProps {
  puzzleTemplates: PuzzleTemplate[];
  onSelectPuzzle: (puzzle: PuzzleTemplate) => void;
}

const CAT_FORTUNES = [
  "Сегодня звезды сулят тебе идеальную теплую коробку! Будет время расслабиться. 📦✨",
  "Твой уровень ночного ТЫГЫДЫКа сегодня возрастет на 150%! Твоя энергия бьет ключом! 🐎💨",
  "Тебя ждет внезапная встреча со вкусной виртуальной рыбкой или тортиком! 🐟🍰",
  "Кошачьи боги благословляют твой следующий рисунок! Ты раскрасишь его без единой ошибки! 🎨🐱",
  "Сегодня отличный день, чтобы подрать невидимые обои и залезть повыше. Дерзай! 🪜🐾",
  "Кто-то думает о тебе прямо сейчас с теплом... Скорее всего, это соседский котик. 🥰🐾",
  "Внимание! Ожидается сильный прилив ласки. Будь готов мурчать весь вечер напролет! 🧸❤️",
  "Звезды советуют вздремнуть лишние 40 минут прямо посреди важных дел. Мы никому не расскажем! 😴💤",
  "Магический Клубок предсказывает: твой внутренний котя сегодня на вершине блаженства! 🔮☀️",
  "Сегодня идеальный день, чтобы поохотиться за красной точкой лазера. Цель близка! 🕹️🔴",
];

const CAT_LUCKY_COLORS = [
  { name: "Клубнично-Розовый 🍓", hex: "#FF5277" },
  { name: "Мятный Зефир 🌿", hex: "#69F0AE" },
  { name: "Солнечный Карамельный ☀️", hex: "#FFAC5E" },
  { name: "Уютный Шоколадный 🍫", hex: "#3E2723" },
  { name: "Снежное Молочко 🥛", hex: "#FFF4E0" },
  { name: "Звездный Фиолетовый 🔮", hex: "#E040FB" },
];

export function DailyOracle({ puzzleTemplates, onSelectPuzzle }: DailyOracleProps) {
  const [fortune, setFortune] = useState<string>("");
  const [luckyColor, setLuckyColor] = useState<{ name: string; hex: string } | null>(null);
  const [luckyPuzzle, setLuckyPuzzle] = useState<PuzzleTemplate | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleConsultOracle = () => {
    if (isShaking) return;
    
    setIsShaking(true);
    SOUNDS.playPop(0.9);
    setTimeout(() => {
      SOUNDS.playPop(1.3);
    }, 200);
    setTimeout(() => {
      SOUNDS.playPop(1.6);
    }, 400);

    // After 1 second shake, reveal prediction
    setTimeout(() => {
      const randomFortune = CAT_FORTUNES[Math.floor(Math.random() * CAT_FORTUNES.length)];
      const randomColor = CAT_LUCKY_COLORS[Math.floor(Math.random() * CAT_LUCKY_COLORS.length)];
      const randomPuzzle = puzzleTemplates[Math.floor(Math.random() * puzzleTemplates.length)];

      setFortune(randomFortune);
      setLuckyColor(randomColor);
      setLuckyPuzzle(randomPuzzle);
      setIsShaking(false);
      SOUNDS.playSuccessColor();
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f2ff] p-4 overflow-y-auto no-scrollbar">
      
      {/* Mystical Header Banner */}
      <div className="bg-[linear-gradient(135deg,#7C4DFF_0%,#448AFF_100%)] rounded-2xl p-4 text-white shadow-md relative overflow-hidden mb-4 select-none">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-2 right-2 flex gap-1">
          <Star className="w-4 h-4 text-amber-200 animate-spin duration-3000" />
          <Star className="w-3 h-3 text-white animate-pulse" />
        </div>
        
        <h2 className="text-sm font-pixel mb-1 flex items-center gap-1.5 uppercase tracking-wide">
          🔮 Кото-Оракул
        </h2>
        <p className="text-[10px] text-indigo-100 font-pixel">
          Клубочек Судьбы знает всё о твоём дне!
        </p>
      </div>

      {/* Main wizard cat character animation */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-indigo-100 flex flex-col items-center text-center relative mb-4 select-none">
        {/* Wizard Cat Graphic */}
        <motion.div
          animate={
            isShaking
              ? {
                  rotate: [0, -12, 12, -12, 12, -12, 0],
                  scale: [1, 1.1, 0.95, 1.1, 0.95, 1],
                  y: [0, -8, 8, -8, 8, 0],
                }
              : {}
          }
          transition={{ duration: 1.0 }}
          className="relative w-36 h-36 flex items-center justify-center cursor-pointer mb-2"
          onClick={handleConsultOracle}
        >
          {/* Neon magic aura around wizard */}
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />

          {/* Wizard hat mockup purely in CSS / shapes */}
          <div className="absolute -top-1 left-[32%] w-12 h-10 border-indigo-600 border-b-[14px] border-l-[20px] border-r-[20px] border-l-transparent border-r-transparent rounded-b-md z-30 drop-shadow-xs transform -rotate-12 pointer-events-none">
            <span className="text-[9px] absolute -bottom-1.5 left-[-5px] text-amber-200 font-bold">★</span>
          </div>

          {/* Pixels cat silhouette inside bubble */}
          <div className="w-24 h-24 bg-indigo-950 rounded-full border-4 border-indigo-400 p-2 overflow-hidden shadow-inner flex items-center justify-center relative">
            {/* Pupil face */}
            <div className="w-16 h-16 bg-slate-800 rounded-full relative flex items-center justify-center">
              {/* Smiling closed eyes */}
              <div className="absolute top-4 left-3 w-4 h-2.5 border-b-2 border-amber-300 rounded-full" />
              <div className="absolute top-4 right-3 w-4 h-2.5 border-b-2 border-amber-300 rounded-full" />
              {/* Magic cat cheek blush */}
              <div className="absolute top-[22px] left-1 w-2.5 h-1.5 bg-rose-500 rounded-full" />
              <div className="absolute top-[22px] right-1 w-2.5 h-1.5 bg-rose-500 rounded-full" />
              {/* Mouth snippet */}
              <div className="absolute bottom-4 left-[42%] w-3 h-1.5 border-b border-indigo-200/60 rounded-full" />
              {/* Mystic wizard beard */}
              <div className="absolute -bottom-2 w-10 h-7 bg-white rounded-full border-t border-slate-200" />
            </div>
            
            {/* Glowing magic ball reflection overlay */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/20 rounded-full blur-xs" />
          </div>

          {/* Magical sparkles indicator */}
          <Sparkles className="w-6 h-6 text-amber-400 absolute bottom-3 right-3 animate-ping" />
        </motion.div>

        {/* Input prompt mock */}
        <div className="w-full max-w-xs mb-4">
          <input
            id="oracle-question-input"
            type="text"
            placeholder="Задай Кошачий Вопрос... (напр. «Будет ли рыбка?»)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full text-center p-2.5 px-4 text-xs font-semibold rounded-xl border-2 border-indigo-100 bg-indigo-50/20 text-indigo-900 focus:outline-hidden focus:border-indigo-400 transition-colors placeholder:text-indigo-400"
          />
        </div>

        {/* Action Button */}
        <button
          id="ask-oracle-btn"
          disabled={isShaking}
          onClick={handleConsultOracle}
          className={`flex items-center gap-1.5 p-3 px-6 rounded-2xl text-xs font-pixel uppercase shadow-sm border transform active:scale-95 transition-all text-white cursor-pointer ${
            isShaking
              ? "bg-slate-400 border-slate-500 cursor-not-allowed"
              : "bg-indigo-500 border-indigo-600 hover:bg-indigo-600 shadow-indigo-200"
          }`}
        >
          <Shuffle className={`w-3.5 h-3.5 ${isShaking ? "animate-spin" : ""}`} />
          ПОТРЯСТИ КЛУБОЧЕК Судьбы 🧶
        </button>
      </div>

      {/* Dynamic Fortunes Reveal Panel */}
      <AnimatePresence>
        {fortune && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Fortune card */}
            <div className="bg-white rounded-2xl p-4.5 shadow-xs border border-indigo-100 leading-relaxed text-slate-700">
              <div className="flex gap-1.5 items-center mb-2.5">
                <Compass className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-[10px] font-pixel text-indigo-700 uppercase">
                  Кошачье Пророчество:
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-50 text-indigo-950">
                {fortune}
              </p>
            </div>

            {/* Lucky properties grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Lucky Color */}
              <div className="bg-white rounded-xl p-3 border border-indigo-100/60 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full shadow-inner mb-1.5 border border-slate-200" style={{ backgroundColor: luckyColor?.hex }} />
                <span className="text-[9px] font-pixel text-indigo-500 uppercase scale-90">Лакки-Цвет:</span>
                <span className="text-[10px] text-slate-800 font-extrabold mt-0.5 truncate max-w-full">
                  {luckyColor?.name}
                </span>
              </div>

              {/* Weekly puzzle challenge recommendation */}
              {luckyPuzzle && (
                <div
                  onClick={() => onSelectPuzzle(luckyPuzzle)}
                  className="bg-white rounded-xl p-3 border border-indigo-100/60 flex flex-col items-center text-center shadow-xs cursor-pointer hover:bg-slate-50 active:scale-97 transition-all"
                >
                  <Gift className="w-6 h-6 text-amber-500 mb-1.5 animate-bounce" />
                  <span className="text-[9px] font-pixel text-indigo-500 uppercase scale-90">Лакки-Пазл:</span>
                  <span className="text-[10px] text-slate-900 font-extrabold mt-0.5 truncate max-w-[120px] block hover:underline">
                    {luckyPuzzle.name}
                  </span>
                </div>
              )}
            </div>
            
            {/* Cozy advisory lines */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-[9px] font-pixel text-amber-800 leading-relaxed font-semibold">
                🐾 Помни: в любой непонятной ситуации котик сначала ложится спать! Мяууу!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
