import React, { useState, useEffect } from "react";
import { COLOR_PALETTES, PUZZLE_TEMPLATES, createInitialProgress, PuzzleTemplate, CellProgress } from "./data/puzzles";
import { PixelGrid } from "./components/PixelGrid";
import { CatRoom } from "./components/CatRoom";
import SOUNDS from "./utils/sound";
import {
  Sparkles,
  Cat,
  Heart,
  Palette,
  Volume2,
  VolumeX,
  PlusCircle,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Flame,
  Star,
  Award,
  Trash2,
  Lock,
  Gift,
  ShoppingBag,
  Grid,
  MapPin,
  Pencil,
  Settings
} from "lucide-react";

export default function App() {
  // 1. Core user states
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);
  const [yarnCount, setYarnCount] = useState<number>(150); // standard initial points
  const [powerups, setPowerups] = useState({ wand: 3, bomb: 3, magnifier: 3 });
  const [customPuzzles, setCustomPuzzles] = useState<PuzzleTemplate[]>([]);

  // 2. Navigation states
  const [activeTab, setActiveTab] = useState<"puzzles" | "room">("puzzles");
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleTemplate | null>(null);
  const [currentProgress, setCurrentProgress] = useState<CellProgress[]>([]);
  const [selectedColorNumber, setSelectedColorNumber] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "cats" | "cozy food" | "plants & buds" | "toys" | "magic">("all");

  // 3. Audio & UI options
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [levelCompleteModal, setLevelCompleteModal] = useState<{ active: boolean; yarnEarned: number } | null>(null);
  const [showPromoWidget, setShowPromoWidget] = useState<boolean>(() => localStorage.getItem("meowcolor_show_promo") !== "false");

  // 4. Sandbox state (create a custom 10x10 puzzle!)
  const [sandboxGrid, setSandboxGrid] = useState<number[]>(Array(100).fill(0));
  const [sandboxColors, setSandboxColors] = useState<string[]>([
    "#2F2E36", // Outline standard
    "#FFAC5E", // Ginger
    "#FFF4E0", // Vanilla Milk
    "#FF8A80", // Peach Blush
    "#4CE091", // Sage leaf
    "#FF5277", // Red
  ]);
  const [selectedSandboxColorIndex, setSelectedSandboxColorIndex] = useState<number>(1);
  const [sandboxName, setSandboxName] = useState<string>("");

  // Load state on mount
  useEffect(() => {
    // completed puzzles
    const savedCompleted = localStorage.getItem("meowcolor_completed");
    if (savedCompleted) {
      try {
        setCompletedPuzzles(JSON.parse(savedCompleted));
      } catch (e) {
        console.error(e);
      }
    }

    // Yarn points
    const savedYarn = localStorage.getItem("meowcolor_yarn");
    if (savedYarn) {
      setYarnCount(parseInt(savedYarn, 10));
    }

    // Powerups Count
    const savedPowerups = localStorage.getItem("meowcolor_powerups");
    if (savedPowerups) {
      try {
        setPowerups(JSON.parse(savedPowerups));
      } catch (e) {
        console.error(e);
      }
    }

    // Custom creations puzzles
    const savedCustom = localStorage.getItem("meowcolor_custom_puzzles");
    if (savedCustom) {
      try {
        setCustomPuzzles(JSON.parse(savedCustom));
      } catch (e) {
        console.error(e);
      }
    }

    // Sound prefer
    const savedSound = localStorage.getItem("meowcolor_sound_on");
    if (savedSound !== null) {
      const isSound = savedSound === "true";
      setSoundOn(isSound);
      SOUNDS.toggle(isSound);
    }
  }, []);

  // Save updates helper
  const updateYarn = (newVal: number) => {
    setYarnCount(newVal);
    localStorage.setItem("meowcolor_yarn", newVal.toString());
  };

  const updatePowerupsVal = (newPowerups: typeof powerups) => {
    setPowerups(newPowerups);
    localStorage.setItem("meowcolor_powerups", JSON.stringify(newPowerups));
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SOUNDS.toggle(next);
    localStorage.setItem("meowcolor_sound_on", next.toString());
    SOUNDS.playPop(1.2);
  };

  // Select puzzle and resume progress or start fresh
  const handleSelectPuzzle = (puzzle: PuzzleTemplate) => {
    setSelectedPuzzle(puzzle);
    
    // Check if we have partial progress saved
    const savedProgress = localStorage.getItem(`meowcolor_progress_${puzzle.id}`);
    if (savedProgress) {
      try {
        setCurrentProgress(JSON.parse(savedProgress));
      } catch (e) {
        setCurrentProgress(createInitialProgress(puzzle));
      }
    } else {
      setCurrentProgress(createInitialProgress(puzzle));
    }

    // Select the first valid non-empty color option listed in the puzzle colors info
    if (puzzle.colors.length > 0) {
      setSelectedColorNumber(puzzle.colors[0].number);
    }
    SOUNDS.playPop(1.1);
  };

  // Pixel grid callback when pixel(s) colored successfully
  const handlePixelColored = (index: number | number[]) => {
    const updated = [...currentProgress];
    const indices = Array.isArray(index) ? index : [index];
    indices.forEach((idx) => {
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], filled: true, correct: true };
      }
    });
    setCurrentProgress(updated);

    // Save temporary progress
    localStorage.setItem(`meowcolor_progress_${selectedPuzzle!.id}`, JSON.stringify(updated));

    // Check if entire puzzle solved (ignoring spacing zeros)
    const isPuzzleFinished = updated.every(
      (cell) => cell.number === 0 || cell.filled
    );

    if (isPuzzleFinished) {
      // Complete!
      const puzzleId = selectedPuzzle!.id;
      const isFirstTime = !completedPuzzles.includes(puzzleId);
      
      const newCompleted = isFirstTime ? [...completedPuzzles, puzzleId] : completedPuzzles;
      if (isFirstTime) {
        setCompletedPuzzles(newCompleted);
        localStorage.setItem("meowcolor_completed", JSON.stringify(newCompleted));
      }

      // Add yarn rewards
      const reward = selectedPuzzle!.yarnReward;
      updateYarn(yarnCount + (isFirstTime ? reward : Math.floor(reward * 0.2)));

      // Clear partial progress state storage
      localStorage.removeItem(`meowcolor_progress_${puzzleId}`);

      // Synthesize level completeness sound
      setTimeout(() => {
        SOUNDS.playCompleteLevel();
      }, 300);

      // Open reward visual dialog
      setLevelCompleteModal({
        active: true,
        yarnEarned: isFirstTime ? reward : Math.floor(reward * 0.2),
      });
    }
  };

  // Exit puzzle active mode
  const handleExitPuzzle = () => {
    setSelectedPuzzle(null);
    setCurrentProgress([]);
    SOUNDS.playPop(0.85);
  };

  // Buy powerup skills from Store Shop
  const handleBuyPowerup = (type: "wand" | "bomb" | "magnifier", price: number) => {
    if (yarnCount < price) {
      SOUNDS.playError();
      return;
    }
    updateYarn(yarnCount - price);
    const updated = { ...powerups, [type]: powerups[type] + 1 };
    updatePowerupsVal(updated);
    SOUNDS.playSuccessColor();
  };

  // Use powerup deduction inside PixelGrid
  const handleUsePowerupDeduction = (type: "wand" | "bomb" | "magnifier") => {
    if (powerups[type] > 0) {
      updatePowerupsVal({ ...powerups, [type]: powerups[type] - 1 });
    }
  };

  // Clear completion progress to replay the game
  const handleResetApplicationData = () => {
    if (confirm("Вы уверены, что хотите сбросить прогресс? Это очистит ваших котиков и раскраски.")) {
      localStorage.clear();
      setCompletedPuzzles([]);
      setYarnCount(150);
      setPowerups({ wand: 3, bomb: 3, magnifier: 3 });
      setCustomPuzzles([]);
      setSelectedPuzzle(null);
      setActiveTab("puzzles");
      SOUNDS.playPop(0.5);
    }
  };

  // Generate Custom Puzzle inside Sandbox Creator
  const handlePublishSandboxPuzzle = () => {
    if (!sandboxName.trim()) {
      alert("Пожалуйста, введите имя для вашего творения!");
      return;
    }

    // Convert flat array of 100 values to 10 rows strings of size 10
    const rows: string[] = [];
    for (let r = 0; r < 10; r++) {
      let rowStr = "";
      for (let c = 0; c < 10; c++) {
        const val = sandboxGrid[r * 10 + c];
        rowStr += val === 0 ? "." : val.toString();
      }
      rows.push(rowStr);
    }

    // Find custom unique colors defined inside sandboxColors
    const finalColors = sandboxColors.map((hex, index) => ({
      number: index + 1,
      hex: hex,
      name: `Цвет #${index + 1}`,
    }));

    const newPuzzle: PuzzleTemplate = {
      id: `custom_${Date.now()}`,
      name: `🎨 ${sandboxName}`,
      category: "custom",
      width: 10,
      height: 10,
      rows: rows,
      colors: finalColors,
      difficulty: "Medium",
      yarnReward: 60,
      description: "Милое творение, нарисованное своими руками в пиксельной песочнице!"
    };

    const updated = [newPuzzle, ...customPuzzles];
    setCustomPuzzles(updated);
    localStorage.setItem("meowcolor_custom_puzzles", JSON.stringify(updated));

    // Reward for publishing
    updateYarn(yarnCount + 30);
    SOUNDS.playSuccessColor();

    // Reset editor
    setSandboxName("");
    setSandboxGrid(Array(100).fill(0));
    setCategoryFilter("custom");
    setActiveTab("puzzles");
    
    alert(`Твой пиксель-арт «${sandboxName}» опубликован! Ты получил +30 моточков пряжи! 🎉 Собирай и крась его теперь во вкладке «Пазлы».`);
  };

  const handleSandboxCellClick = (idx: number) => {
    const updated = [...sandboxGrid];
    // Cycle tool selection: if already set to current selected color, toggle off to transparent (0), else set to selected
    if (updated[idx] === selectedSandboxColorIndex) {
      updated[idx] = 0;
    } else {
      updated[idx] = selectedSandboxColorIndex;
    }
    setSandboxGrid(updated);
    SOUNDS.playPop(1.1 + selectedSandboxColorIndex * 0.1);
  };

  // Combine puzzle templates loaded from system data and current custom creations
  const allAvailablePuzzles = [...customPuzzles, ...PUZZLE_TEMPLATES];

  // Filter puzzles based on selected tabs/category
  const filteredPuzzles = allAvailablePuzzles.filter((p) => {
    if (categoryFilter === "all") return true;
    return p.category === categoryFilter;
  });

  return (
    <div className="h-[100dvh] w-screen bg-[#F0E6D2] font-sans antialiased text-slate-800 flex justify-center items-center overflow-hidden">
      {/* Phone visual Mockup frame container for flawless mobile presentation */}
      <div className="w-full h-full max-w-md bg-white shadow-2xl flex flex-col relative overflow-hidden border-rose-300/40 md:h-[94vh] md:max-h-[850px] md:rounded-[36px] md:border-8">
        
        {/* 1. Header Area with Cozy design cues */}
        <header className="bg-rose-400 text-white px-4 py-3 shrink-0 flex flex-col shadow-xs select-none">
          <div className="flex justify-between items-center">
            
            {/* Title / Brand */}
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedPuzzle(null)}>
              <div className="bg-white p-1 rounded-lg">
                <Cat className="w-5 h-5 text-rose-500 animate-bounce" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-pixel tracking-wider scale-90 origin-left">МЯУ-ДОКУ</span>
                <span className="text-[10px] font-medium text-rose-100 uppercase mt-0.5">Кошачья Раскраска</span>
              </div>
            </div>

            {/* Yarn Stash and Stats & Store link */}
            <div className="flex items-center gap-2">
              {/* Settings Toggle */}
              <button
                id="header-settings-btn"
                onClick={() => {
                  setShowSettingsModal(true);
                  SOUNDS.playPop(1.1);
                }}
                className="p-1 px-1.5 hover:bg-rose-500 text-rose-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Настройки ⚙️"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Yarn score bubble */}
              <button
                id="header-shop-trigger"
                onClick={() => {
                  setShowShopModal(true);
                  SOUNDS.playPop(1.1);
                }}
                className="flex items-center gap-1 bg-amber-400 border border-amber-500 px-2.5 py-1 rounded-full text-xs font-pixel shadow-xs hover:bg-amber-300 scale-90 duration-150 cursor-pointer text-slate-950"
              >
                <span>🧶</span>
                <span>{yarnCount}</span>
              </button>
            </div>
          </div>
        </header>

        {/* 2. MAIN ACTIVE VIEWER VIEWPORT */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
          
          {/* Active drawing stage overlay if selectedPuzzle exists */}
          {selectedPuzzle ? (
            <div className="absolute inset-0 z-40 bg-white flex flex-col">
              {/* Back Header panel */}
              <div className="flex items-center justify-between px-3 py-2 bg-rose-50 border-b border-rose-100">
                <button
                  id="canvas-back-btn"
                  onClick={handleExitPuzzle}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад в Галерею
                </button>
                <div className="text-right">
                  <h3 className="text-xs font-pixel text-slate-800 scale-90 truncate max-w-[140px]">
                    {selectedPuzzle.name}
                  </h3>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">
                    +{selectedPuzzle.yarnReward} 🧶
                  </span>
                </div>
              </div>

              {/* Active Drawing canvas engine wrapper */}
              <div className="flex-1 overflow-hidden">
                <PixelGrid
                  puzzle={selectedPuzzle}
                  progress={currentProgress}
                  selectedColorNumber={selectedColorNumber}
                  onPixelColored={handlePixelColored}
                  onUsePowerup={handleUsePowerupDeduction}
                  powerupCounts={powerups}
                />
              </div>

              {/* Dynamic Footer color selection palette picker */}
              <div className="bg-white border-t border-rose-100 p-3 flex flex-col gap-2 shrink-0 select-none">
                <span className="text-[10px] font-pixel text-slate-400 text-center">
                  ВЫБЕРИ ЦВЕТ И КЛИКАЙ НА ПОДХОДЯЩИЕ ЦИФРЫ:
                </span>
                
                <div className="flex gap-2.5 overflow-x-auto pb-1 px-1 justify-center no-scrollbar">
                  {selectedPuzzle.colors.map((color) => {
                    const isSelected = color.number === selectedColorNumber;
                    
                    // Count how many pixels of this color are NOT colored yet
                    const totalTarget = currentProgress.filter((c) => c.number === color.number).length;
                    const filledCount = currentProgress.filter((c) => c.number === color.number && c.filled).length;
                    const remainder = totalTarget - filledCount;
                    const isDone = remainder === 0;

                    return (
                      <button
                        key={color.number}
                        id={`palette-color-btn-${color.number}`}
                        onClick={() => {
                          if (!isDone) {
                            setSelectedColorNumber(color.number);
                            SOUNDS.playPop(1.0 + color.number * 0.1);
                          }
                        }}
                        className={`relative w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all ${
                          isSelected ? "scale-115 ring-4 ring-rose-400 ring-offset-1" : "hover:scale-105"
                        } ${isDone ? "opacity-35 cursor-not-allowed scale-90" : "cursor-pointer"}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {/* Number Indicator code */}
                        {!isDone ? (
                          <span
                            className="font-pixel text-[10px] font-bold drop-shadow-md text-white"
                            style={{
                              color: ["#FFFFFF", "#FFF4E0", "#FFF7D6"].includes(color.hex.toUpperCase())
                                ? "#333333"
                                : "#FFFFFF",
                            }}
                          >
                            {color.number}
                          </span>
                        ) : (
                          <span className="text-white drop-shadow-md text-xs font-bold">✓</span>
                        )}

                        {/* Remainder small floating badge */}
                        {!isDone && (
                          <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[7px] font-pixel px-1.5 rounded-full min-w-4 text-center line-clamp-1 border border-white">
                            {remainder}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* Regular Tabs drawing layout */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {activeTab === "puzzles" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Visual Category Pill selectors */}
                <div className="flex gap-1 px-3 py-2 bg-rose-50 border-b border-rose-100 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0 select-none">
                  {([
                    { key: "all", name: "🐾 Всё" },
                    { key: "cats", name: "🐱 Котики" },
                    { key: "cozy food", name: "🍩 Вкусняшки" },
                    { key: "plants & buds", name: "🌱 Растения" },
                    { key: "toys", name: "🧸 Игрушки" },
                    { key: "magic", name: "🔮 Магия" },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      id={`cat-filter-btn-${tab.key}`}
                      onClick={() => {
                        setCategoryFilter(tab.key);
                        SOUNDS.playPop(1.1);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                        categoryFilter === tab.key
                          ? "bg-rose-400 text-white border-rose-500 shadow-inner"
                          : "bg-white border-rose-200/40 text-slate-600 hover:bg-rose-50"
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>

                {/* Grid list of puzzle cards on shelves */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  
                  {/* Tutorial Promo Widget */}
                  {showPromoWidget && (
                    <div className="bg-[linear-gradient(135deg,#FFF9E6_0%,#FFF5D6_100%)] rounded-2xl p-4.5 border border-amber-200/50 flex gap-3.5 items-center shadow-xs select-none relative animate-fade-in">
                      {/* Quiet close button */}
                      <button
                        id="hide-tutorial-promo-btn"
                        onClick={() => {
                          localStorage.setItem("meowcolor_show_promo", "false");
                          setShowPromoWidget(false);
                          SOUNDS.playPop(0.85);
                        }}
                        className="absolute top-2 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-amber-600 hover:bg-amber-100/40 active:scale-90 cursor-pointer"
                        title="Закрыть"
                      >
                        ✖
                      </button>

                      <span className="text-4xl">🎨</span>
                      <div className="flex-1 pr-4">
                        <h4 className="text-xs font-pixel text-amber-900 leading-tight">Кошачья Магия!</h4>
                        <p className="text-[10px] text-amber-700/80 leading-relaxed mt-1 font-semibold">
                          Раскрашивай картинки по номерам, получай пряжу и покупай классные декорации для пушистых!
                        </p>
                        <button
                          id="tutorial-link-btn"
                          onClick={() => {
                            setShowTutorial(true);
                            SOUNDS.playPop(1.1);
                          }}
                          className="text-[9px] font-pixel text-rose-500 hover:underline mt-2 flex items-center gap-0.5"
                        >
                          Как играть? Простой гайд 📖
                        </button>
                      </div>
                    </div>
                  )}

                  {filteredPuzzles.length === 0 && (
                    <div className="py-12 text-center text-slate-400 select-none">
                      <HelpCircle className="w-10 h-10 mx-auto text-rose-200 animate-bounce mb-3" />
                      <p className="text-xs font-pixel scale-90 mb-2">Здесь пока ничего нет!</p>
                    </div>
                  )}

                  {/* Puzzle lists render */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    {filteredPuzzles.map((p) => {
                      const isDone = completedPuzzles.includes(p.id);
                      
                      // Convert first row representation to render small stylish visual preview container
                      return (
                        <div
                          key={p.id}
                          id={`puzzle-item-card-${p.id}`}
                          onClick={() => handleSelectPuzzle(p)}
                          className="bg-white rounded-2xl p-3 border border-rose-100 hover:border-rose-300 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 active:scale-97 flex flex-col justify-between group"
                        >
                          {/* Pixel mosaic tiny representation preview window */}
                          <div className="aspect-square bg-rose-50/50 rounded-xl mb-2 p-1.5 flex items-center justify-center relative overflow-hidden group-hover:bg-rose-100/40">
                            {/* Complete Stamp overlay badges */}
                            {isDone && (
                              <div className="absolute inset-0 bg-[#f43f5e50] backdrop-blur-xs flex items-center justify-center rotate-[-12deg] z-10">
                                <span className="bg-rose-500 text-white text-[8px] font-pixel px-2 py-1 rounded-sm border border-white shadow-md uppercase">
                                  ГОТОВО!
                                </span>
                              </div>
                            )}

                            {/* Standard pixel matrix loop preview */}
                            <div
                              className="grid gap-[1px]"
                              style={{
                                gridTemplateColumns: `repeat(${p.width}, minmax(0, 1fr))`,
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              {p.rows.flatMap((rowStr) =>
                                rowStr.split("").map((c, i) => {
                                  const num = c === "." ? 0 : parseInt(c, 10);
                                  const color = p.colors.find((col) => col.number === num);
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

                          {/* Text labels descriptor details */}
                          <div className="mt-0.5">
                            <span className="text-[9px] font-pixel text-slate-400 capitalize scale-90 block">
                              {p.category} • {p.width}x{p.height}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 tracking-tight mt-0.5 truncate uppercase">
                              {p.name}
                            </h4>

                            {/* Rewards badge */}
                            <div className="flex justify-end items-center mt-2 pt-1 border-t border-slate-100">
                              <span className="text-[10px] font-pixel text-amber-600 font-extrabold flex items-center gap-0.5">
                                🧶 {p.yarnReward}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tap Lobby 2: Interactive cat room decors */}
            {activeTab === "room" && (
              <div className="flex-1 overflow-hidden">
                <CatRoom completedPuzzles={completedPuzzles} puzzleTemplates={allAvailablePuzzles} />
              </div>
            )}
            
          </div>
        </main>

        {/* 3. COZY FOOTER NAV BAR */}
        {!selectedPuzzle && (
          <footer className="bg-white border-t border-rose-100/60 p-2 py-2.5 shrink-0 select-none z-10 px-4">
            <div className="flex justify-around items-center">
              
              {([
                { key: "puzzles", name: "Пазлы", icon: "🧩" },
                { key: "room", name: "Кото-Дом", icon: "🐈" },
              ] as const).map((tab) => {
                const isCurrent = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    id={`footer-tab-btn-${tab.key}`}
                    onClick={() => {
                      setActiveTab(tab.key);
                      SOUNDS.playPop(1.0);
                    }}
                    className={`flex flex-col items-center justify-center p-1 px-8 rounded-xl transition-all relative cursor-pointer ${
                      isCurrent
                        ? "text-rose-500 bg-rose-50/70 scale-105"
                        : "text-slate-500 hover:text-rose-400 hover:bg-rose-50/20"
                    }`}
                  >
                    <span className="text-lg leading-normal mb-0.5">{tab.icon}</span>
                    <span className="text-[9px] font-pixel tracking-tighter opacity-90 scale-90">
                      {tab.name}
                    </span>
                    {/* Active small dot indicator */}
                    {isCurrent && (
                      <div className="absolute -bottom-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    )}
                  </button>
                );
              })}

            </div>
          </footer>
        )}

        {/* 4. MODALS AND FLOATING PANELS */}

        {/* Level Complete visual Modal */}
        {levelCompleteModal?.active && (
          <div className="absolute inset-0 z-50 bg-[#00000085] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-400 max-w-sm w-full text-center relative select-none">
              {/* Confetti decoration */}
              <div className="absolute top-2 left-6 text-xl animate-pulse">✨</div>
              <div className="absolute top-4 right-8 text-xl animate-ping">🌸</div>
              <div className="absolute bottom-6 left-10 text-xl animate-pulse">👑</div>

              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-300">
                <CheckCircle className="w-9 h-9 text-amber-500" />
              </div>

              <h2 className="text-sm font-pixel text-amber-900 uppercase mb-2">
                Картина Завершена! 🎉
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4 font-semibold">
                Твой чудесный пиксельный котик или вкусняшка сверкает яркими красками!
              </p>

              {/* Reward Block */}
              <div className="bg-amber-50 rounded-2xl p-4.5 border border-amber-200 inline-flex flex-col items-center mb-5 uppercase">
                <span className="text-[10px] font-pixel text-amber-800">Твоя Награда:</span>
                <span className="text-xl font-pixel text-amber-600 font-extrabold mt-1">
                  +{levelCompleteModal.yarnEarned} моточков пряжи 🧶
                </span>
                <span className="text-[8px] text-amber-500 mt-1 font-pixel scale-85">
                  (Потрать их в Магазинчике!)
                </span>
              </div>

              {/* Close Button */}
              <button
                id="claim-reward-modal-btn"
                onClick={() => {
                  setLevelCompleteModal(null);
                  setSelectedPuzzle(null);
                  SOUNDS.playPop(1.1);
                }}
                className="w-full bg-amber-400 border-2 border-amber-500 p-3 font-pixel text-xs text-slate-950 rounded-2xl shadow-sm hover:bg-amber-300 active:scale-95 duration-100 cursor-pointer uppercase font-extrabold"
              >
                ЗАБРАТЬ И ИДТИ ДАЛЬШЕ 🐾
              </button>
            </div>
          </div>
        )}

        {/* Booster Shop Modal (Buy Powerups) */}
        {showShopModal && (
          <div className="absolute inset-0 z-50 bg-[#00000075] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-100 max-w-sm w-full relative select-none">
              
              {/* Back close button */}
              <button
                id="shop-close-btn"
                onClick={() => {
                  setShowShopModal(false);
                  SOUNDS.playPop(0.9);
                }}
                className="absolute top-4 right-4 text-xs font-pixel text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✖
              </button>

              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                <h3 className="text-xs font-pixel text-rose-700 uppercase">
                  Лавка Бустеров 🧶
                </h3>
              </div>

              <div className="space-y-3">
                {/* Wand details */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-rose-100/20">
                  <div className="flex-1">
                    <span className="text-xs font-pixel text-indigo-700">🪄 Палочка</span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Красит всю соприкасающуюся область одного цвета сразу!
                    </p>
                  </div>
                  <button
                    id="shop-buy-wand-btn"
                    onClick={() => handleBuyPowerup("wand", 50)}
                    disabled={yarnCount < 50}
                    className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-xs transition-transform transform active:scale-95 cursor-pointer ${
                      yarnCount >= 50
                        ? "bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    50 🧶
                  </button>
                </div>

                {/* Bomb details */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-rose-100/20">
                  <div className="flex-1">
                    <span className="text-xs font-pixel text-amber-700">💣 Бомбочка</span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Взрывает и убирает область 3х3 выбранного вами цвета!
                    </p>
                  </div>
                  <button
                    id="shop-buy-bomb-btn"
                    onClick={() => handleBuyPowerup("bomb", 45)}
                    disabled={yarnCount < 45}
                    className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-xs transition-transform transform active:scale-95 cursor-pointer ${
                      yarnCount >= 45
                        ? "bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    45 🧶
                  </button>
                </div>
              </div>

              {/* Footer details */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Твой текущий баланс: {yarnCount} мотков пряжи 🧶
                  </span>
                </div>
                <button
                  id="shop-done-close-btn"
                  onClick={() => {
                    setShowShopModal(false);
                    SOUNDS.playPop(1.1);
                  }}
                  className="w-full mt-2 bg-rose-400 text-white font-pixel text-xs p-2.5 rounded-2xl hover:bg-rose-500 shadow-sm transition-colors cursor-pointer uppercase font-bold text-center"
                >
                  Куплено! 🐾
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Simple Interactive How-To-Play Tutorial overlay modal */}
        {showTutorial && (
          <div className="absolute inset-0 z-50 bg-[#00000085] backdrop-blur-xs flex items-center justify-center p-4 select-none">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-rose-100 max-w-sm w-full relative">
              <h3 className="text-xs font-pixel text-rose-500 uppercase border-b pb-2 mb-3">
                📖 Гайд: Как играть?
              </h3>
              
              <ul className="space-y-3.5 text-xs text-slate-700">
                <li className="flex gap-2">
                  <span className="text-base">1️⃣</span>
                  <p className="leading-tight">
                    Перейди во вкладку <strong>«Пазлы»</strong> и выбери любого милого пиксельного персонажа.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="text-base">2️⃣</span>
                  <p className="leading-tight">
                    Выбери нужную цифру цвета внизу и раскрашивай соответствующие пиксели с таким же номером в сетке!
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="text-base">3️⃣</span>
                  <p className="leading-tight">
                    Ты можешь <strong>аккуратно проводить и водить пальцем по экрану</strong>, зажав его, чтобы красить за секунду! Попробуй это!
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="text-base">4️⃣</span>
                  <p className="leading-tight">
                    Используй волшебные инструменты: 🪄 палочка красит все соседние зоны одного цвета, 💣 бомбочка вычищает мелкие места, 🔍 лупа мгновенно находит спрятанный пиксель.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="text-base">5️⃣</span>
                  <p className="leading-tight">
                    Завершай рисунки котиков, чтобы запустить их жить в твой <strong>Кото-Дом</strong>! Гладь их там, корми и меняй дизайн комнаты.
                  </p>
                </li>
              </ul>

              <button
                id="close-tutorial-modal-btn"
                onClick={() => {
                  setShowTutorial(false);
                  SOUNDS.playPop(1.1);
                }}
                className="w-full mt-5 bg-rose-400 text-white font-pixel text-xs p-3 rounded-2xl hover:bg-rose-500 shadow-sm transition-colors cursor-pointer uppercase font-bold"
              >
                ВСЁ ПОНЯТНО, ИГРАЕМ! 🐾
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal (Cozy & Highly polished) */}
        {showSettingsModal && (
          <div className="absolute inset-0 z-50 bg-[#00000075] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-100 max-w-sm w-full relative select-none animate-fade-in">
              
              {/* Reset progress action / Close button */}
              <button
                id="settings-close-btn"
                onClick={() => {
                  setShowSettingsModal(false);
                  SOUNDS.playPop(0.9);
                }}
                className="absolute top-4 right-4 text-xs font-pixel text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✖
              </button>

              <div className="flex items-center gap-1.5 border-b border-rose-100 pb-3 mb-4">
                <Settings className="w-5 h-5 text-rose-500" />
                <h3 className="text-xs font-pixel text-rose-700 uppercase">
                  Настройки Игры ⚙️
                </h3>
              </div>

              <div className="space-y-4">
                {/* 1. Cozy Interactive Audio Slider and Control */}
                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                        {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">Звуковые эффекты</span>
                      </div>
                    </div>
                    {/* Fluffy Pink/Orange Toggle slider switch */}
                    <button
                      id="toggle-sound-settings-switch"
                      onClick={() => {
                        handleToggleSound();
                      }}
                      className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden relative cursor-pointer ${
                        soundOn ? "bg-rose-400" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform duration-200 flex items-center justify-center text-[10px] ${
                          soundOn ? "translate-x-5.5" : "translate-x-0"
                        }`}
                      >
                        🐱
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Launch Tutorial Button */}
                <button
                  id="settings-tutorial-btn"
                  onClick={() => {
                    setShowTutorial(true);
                    setShowSettingsModal(false);
                    SOUNDS.playPop(1.1);
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-rose-50/20 border border-slate-100 rounded-2xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base flex items-center justify-center">📖</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700">Как играть в Мяу-Доку?</span>
                      <span className="text-[9px] text-slate-400">Интерактивный простой гайд по раскраскам</span>
                    </div>
                  </div>
                  <span className="text-xs text-rose-400 group-hover:translate-x-1 duration-150 font-bold">→</span>
                </button>

                {/* 3. Reset application button */}
                <div className="pt-2">
                  <span className="text-[9px] font-pixel text-rose-400/80 uppercase block tracking-wider mb-1.5 ml-1">
                    Сброс Данных
                  </span>
                  <button
                    id="settings-reset-data-btn"
                    onClick={() => {
                      handleResetApplicationData();
                      setShowSettingsModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 hover:bg-red-100/50 text-red-500 border border-red-200/50 rounded-2xl text-[10px] font-pixel cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Очистить Прогресс и Сбросить Игру
                  </button>
                </div>
              </div>



              {/* Close Bottom Button */}
              <button
                id="settings-save-button"
                onClick={() => {
                  setShowSettingsModal(false);
                  SOUNDS.playPop(1.1);
                }}
                className="w-full mt-4 bg-rose-400 text-white font-pixel text-xs p-3 rounded-2xl hover:bg-rose-500 shadow-sm transition-colors cursor-pointer uppercase font-bold"
              >
                ГОТОВО! 🐾
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
