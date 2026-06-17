export interface ColorInfo {
  number: number;
  hex: string;
  name: string;
}

export interface PuzzleTemplate {
  id: string;
  name: string;
  category: "all" | "cats" | "cozy food" | "plants & buds" | "toys" | "magic" | "custom";
  width: number;
  height: number;
  rows: string[];
  colors: ColorInfo[];
  difficulty: "Easy" | "Medium" | "Expert";
  yarnReward: number;
  description: string;
}

export const COLOR_PALETTES = {
  softCharcoal: "#2F2E36",
  creamyBody: "#FFF4E0",
  orangeGinger: "#FFAC5E",
  berryRed: "#FF5277",
  pinkCheeks: "#FF8A80",
  leafGreen: "#4CE091",
  toastCrust: "#B56F3F",
  creamBread: "#FFF7D6",
  dustyGray: "#BEC2CB",
  boxBrown: "#C59B6D",
  soilBrown: "#8D6E63",
  mushCap: "#FF4E50",
  whiteSpot: "#FFFBEB",
  violetPotion: "#8E24AA",
  pinkGlaze: "#FF80AB",
  chocolate: "#3E2723",
  mintCream: "#69F0AE",
};

export const PUZZLE_TEMPLATES: PuzzleTemplate[] = [
  {
    id: "siamese_cat",
    name: "Siamese Sweetie 💙",
    category: "cats",
    width: 16,
    height: 16,
    rows: [
      "................",
      ".....11....11...",
      "....1331..1331..",
      "...132231132231.",
      "..13222233222231",
      "..12224422442221",
      ".122645466454621",
      ".122244422444221",
      "1222222444422221",
      "1222222222222221",
      "1222223333222211",
      "132222222222231.",
      ".1322222222231..",
      "..11222222221...",
      "...112211221....",
      ".....11..11....."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Soft Charcoal Outline" },
      { number: 2, hex: "#FFF8E7", name: "Warm Ivory Cream" },
      { number: 3, hex: "#7D5A44", name: "Cocoa Ears & Tail" },
      { number: 4, hex: "#4E342E", name: "Chocolate Brown Mask" },
      { number: 5, hex: "#42A5F5", name: "Shiny Sapphire Eyes" },
      { number: 6, hex: "#FF8A80", name: "Rosy Suede Blush" }
    ],
    difficulty: "Expert",
    yarnReward: 110,
    description: "A gorgeous Siamese kitten with a soft cocoa face mask and deep blue sapphire eyes."
  },
  {
    id: "ginger_munchkin",
    name: "Ginger Munchkin 🧡",
    category: "cats",
    width: 16,
    height: 16,
    rows: [
      "................",
      "....11......11..",
      "...1311....1131.",
      "..13431111113431",
      ".134433333333441",
      ".133334334333331",
      "1332233333322331",
      "1351333333331531",
      "1343333333333431",
      ".13333322333331.",
      "..134333333431..",
      "...1333333331...",
      "....11333311....",
      ".....133331.....",
      ".....11..11.....",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Deep Charcoal" },
      { number: 2, hex: "#FF8A80", name: "Peach Blossom Cheeks" },
      { number: 3, hex: "#FFA726", name: "Bright Tangerine" },
      { number: 4, hex: "#E65100", name: "Burnt Orange Stripes" },
      { number: 5, hex: "#1E1F22", name: "Tiny Button Eyes" }
    ],
    difficulty: "Medium",
    yarnReward: 95,
    description: "An energetic little ginger cat with playful stripes and adorable puffy cheeks."
  },
  {
    id: "royal_white_cat",
    name: "Princess Fluff 👑",
    category: "cats",
    width: 16,
    height: 16,
    rows: [
      "......3333......",
      ".....334433.....",
      "....13344331....",
      "...1133333311...",
      "...1211111121...",
      "..122155551221..",
      ".12222111122221.",
      ".12552222225521.",
      "1221122222211221",
      "1222222222222221",
      "1222612222162221",
      ".12222222222221.",
      "..112222222211..",
      "...1122112211...",
      "....1111..1111..",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Midnight Charcoal" },
      { number: 2, hex: "#FFFFFF", name: "Pristine White Fur" },
      { number: 3, hex: "#FFC107", name: "Golden Royal Crown" },
      { number: 4, hex: "#FF4081", name: "Imperial Ruby Gem" },
      { number: 5, hex: "#FF8A80", name: "Pink Inner Ears" },
      { number: 6, hex: "#00E676", name: "Gleaming Emerald Eyes" }
    ],
    difficulty: "Expert",
    yarnReward: 120,
    description: "A regal white Persian princess cat wearing her favourite golden crown and showing off mesmerizing emerald eyes."
  },
  {
    id: "calico_cat",
    name: "Calico Neko 🐾",
    category: "cats",
    width: 16,
    height: 16,
    rows: [
      "................",
      "..111........111",
      ".1441.......1331",
      "1444111111113331",
      "1442222222222331",
      "1422222222222231",
      "1222222222222221",
      "1211222222221121",
      "1222111221112221",
      "1252212222122521",
      ".12222222222221.",
      "..122222222221..",
      "...1122211221...",
      "....1111..111...",
      ".....1......1...",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Charcoal Outline" },
      { number: 2, hex: "#FFF4E0", name: "Vanilla Milk" },
      { number: 3, hex: "#FFAC5E", name: "Ginger Caramel" },
      { number: 4, hex: "#5A5A66", name: "Slate Grey Patch" },
      { number: 5, hex: "#FF8A80", name: "Cherry Blush" }
    ],
    difficulty: "Medium",
    yarnReward: 90,
    description: "A super soft and curious Calico kitten with ginger and charcoal ears."
  },
  {
    id: "box_cat",
    name: "Peek-A-Box 📦",
    category: "cats",
    width: 16,
    height: 16,
    rows: [
      "................",
      ".....11....11...",
      "....1221..1221..",
      "...122221122221.",
      "..12222222222221",
      ".122122222212221",
      ".125161221615221",
      "1122211111222211",
      "1333333333333331",
      "1343777777773431",
      "1343717777173431",
      "1333777777773331",
      "1133333333333111",
      "..11333333311...",
      "....11111111....",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Cozy Charcoal" },
      { number: 2, hex: "#D6D9E0", name: "Dusty Pewter" },
      { number: 3, hex: "#C59B6D", name: "Cardboard Brown" },
      { number: 4, hex: "#9A724B", name: "Deep Wood Shadow" },
      { number: 5, hex: "#FF8A80", name: "Cute Cheeks" },
      { number: 6, hex: "#1E1F22", name: "Button Eyes" },
      { number: 7, hex: "#FFFFFF", name: "Pure White Fluff" }
    ],
    difficulty: "Expert",
    yarnReward: 115,
    description: "If it fits, I sits! This cute kitty found the absolute perfect box."
  },
  {
    id: "cute_strawberry",
    name: "Sweet Berry 🍓",
    category: "plants & buds",
    width: 12,
    height: 12,
    rows: [
      "....444.....",
      "...44444....",
      "..1441441...",
      ".122222221..",
      "12225225221.",
      "12522222221.",
      "12222522521.",
      "13222222221.",
      ".122522521..",
      "..1222221...",
      "...13331....",
      "....111....."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Dark Indigo" },
      { number: 2, hex: "#FF5277", name: "Strawberry Red" },
      { number: 3, hex: "#FFA6C9", name: "Blush Highlight" },
      { number: 4, hex: "#4CE091", name: "Spring leaf" },
      { number: 5, hex: "#FFFBEB", name: "Creamy Seeds" }
    ],
    difficulty: "Easy",
    yarnReward: 40,
    description: "A cute little strawberry with small blushing cheeks and fresh green leaves."
  },
  {
    id: "glazed_donut",
    name: "Kitty Glazed Ring 🍩",
    category: "cozy food",
    width: 12,
    height: 12,
    rows: [
      "....1111....",
      "..11333311..",
      ".1334335331.",
      "136333333331",
      "133311113331",
      "13531..13431",
      "123311113321",
      "122336333221",
      ".1222333221.",
      "..12222221..",
      "...111111...",
      "............"
    ],
    colors: [
      { number: 1, hex: "#3E2723", name: "Rich Cocoa Paint" },
      { number: 2, hex: "#FFE082", name: "Warm Dough Nut" },
      { number: 3, hex: "#FF80AB", name: "Pink Berry Frosting" },
      { number: 4, hex: "#FFFFFF", name: "Sugar Frosting" },
      { number: 5, hex: "#69F0AE", name: "Pistachio Crumb" },
      { number: 6, hex: "#E040FB", name: "Ube Purple Sprinkles" }
    ],
    difficulty: "Medium",
    yarnReward: 60,
    description: "A soft fluffy doughnut with strawberry pink frosting and colorful pixel sprinkles."
  },
  {
    id: "cute_mushroom",
    name: "Tiny Shroom 🍄",
    category: "plants & buds",
    width: 12,
    height: 12,
    rows: [
      "....1111....",
      "..11222211..",
      ".1232232221.",
      "122222223221",
      "132232222231",
      "111111111111",
      "...144441...",
      "...141141...",
      "...144441...",
      "..15144151..",
      ".1555115551.",
      "..11111111.."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Outliner Charcoal" },
      { number: 2, hex: "#FF4E50", name: "Amanita Red" },
      { number: 3, hex: "#FFFBEB", name: "Shroom Spots" },
      { number: 4, hex: "#FFF3E0", name: "Woodland Stem" },
      { number: 5, hex: "#81C784", name: "Spring Moss" }
    ],
    difficulty: "Easy",
    yarnReward: 45,
    description: "A baby forest mushroom cozying up on fresh green grass."
  },
  {
    id: "kitty_toast",
    name: "Kuten Toast 🍞",
    category: "cozy food",
    width: 14,
    height: 14,
    rows: [
      "..............",
      "...11111111...",
      "..1222222211..",
      ".122333333221.",
      "12233333333211",
      "12334433443321",
      "12334433443321",
      "12333333333321",
      "12331331333321",
      "12353313353321",
      "12333333333321",
      ".122333333221.",
      "..1122222211..",
      "....111111...."
    ],
    colors: [
      { number: 1, hex: "#4A2711", name: "Dark Rye" },
      { number: 2, hex: "#B56F3F", name: "Oat Toast Crust" },
      { number: 3, hex: "#FFF7D6", name: "Creamy Brioche" },
      { number: 4, hex: "#FF5277", name: "Berry Jam Spots" },
      { number: 5, hex: "#FF8A80", name: "Blush Hue" }
    ],
    difficulty: "Medium",
    yarnReward: 75,
    description: "Freshly toasted bread cut in the shape of a happy, blushing kitty."
  },
  {
    id: "happy_cactus",
    name: "Spiky Pot 🌵",
    category: "plants & buds",
    width: 12,
    height: 12,
    rows: [
      ".....161....",
      "....16661...",
      "...1133311..",
      "..121333121.",
      ".12213331221",
      ".12213331221",
      "..111333111.",
      "....1551....",
      "...144441...",
      "...144441...",
      "..14444441..",
      "...111111..."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Outliner Charcoal" },
      { number: 2, hex: "#4CAF50", name: "Forest Cacti" },
      { number: 3, hex: "#81C784", name: "Sage Light Green" },
      { number: 4, hex: "#FF7043", name: "Terracotta Pot" },
      { number: 5, hex: "#8D6E63", name: "Organic Dirt" },
      { number: 6, hex: "#FF4081", name: "Cactus Flower Pink" }
    ],
    difficulty: "Medium",
    yarnReward: 70,
    description: "A spiky but extremely happy little cactus pot with a tiny blossoming pink flower."
  },
  {
    id: "sleepy_chubby",
    name: "Loafing Kuro 🐈‍⬛",
    category: "cats",
    width: 16,
    height: 16,
    rows: [
      "................",
      ".....11....11...",
      "....1221..1221..",
      "...123321123321.",
      "..12333322333321",
      "..12333333333321",
      ".123443333334431",
      ".123151322315131",
      "1233311111111331",
      "1233333555533331",
      "1233335555553331",
      "1233335555553331",
      ".123333555533321",
      "..111222222211..",
      "....11111111....",
      "................"
    ],
    colors: [
      { number: 1, hex: "#1A1A1A", name: "Onyx Outline" },
      { number: 2, hex: "#2C2C2C", name: "Midnight Obsidian Coat" },
      { number: 3, hex: "#424242", name: "Dusky Slate Grey" },
      { number: 4, hex: "#FF8A80", name: "Peach Blossom Cheeks" },
      { number: 5, hex: "#FFFFFF", name: "Snow White Paws & Snoot" }
    ],
    difficulty: "Expert",
    yarnReward: 110,
    description: "A gorgeous premium Kuro cat styled as a cozy loaf with a midnight obsidian coat and soft white socks."
  },
  {
    id: "bubble_tea",
    name: "Neko Boba Cup 🧋",
    category: "cozy food",
    width: 14,
    height: 13,
    rows: [
      "....55........",
      "....151.......",
      "...11511......",
      "..1333331.....",
      "..1444441.....",
      "..1333331.....",
      "..1333331.....",
      "..1222221.....",
      "..1222221.....",
      "..1262621.....",
      "..1262621.....",
      "...12221......",
      "....111......."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Boba Ink" },
      { number: 2, hex: "#D7CCC8", name: "Brown Sugar Milk" },
      { number: 3, hex: "#FFE0B2", name: "Classic Boba Tea" },
      { number: 4, hex: "#FFFFFF", name: "Thick Cold Foam" },
      { number: 5, hex: "#FF7043", name: "Red Cat Straw" },
      { number: 6, hex: "#4E342E", name: "Tapioca Pearls" }
    ],
    difficulty: "Medium",
    yarnReward: 90,
    description: "Delicious brown sugar bubble milk tea complete with tapioca pearls."
  },
  {
    id: "cat_bento_box",
    name: "Cat Bento Box 🍱",
    category: "cozy food",
    width: 16,
    height: 16,
    rows: [
      "1111111111111111",
      "1777777777777771",
      "1711111111111171",
      "1712222112222171",
      "1712262112332171",
      "1712222113333171",
      "1711111111111171",
      "1714444111555171",
      "1714444115585171",
      "1714114111555171",
      "1711111111111171",
      "1712211221122171",
      "1712211221122171",
      "1711111111111171",
      "1777777777777771",
      "1111111111111111"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Charcoal Box & Outlines" },
      { number: 2, hex: "#FFFFFF", name: "Onigiri Cat Rice" },
      { number: 3, hex: "#FFC107", name: "Tamagoyaki Omelette" },
      { number: 4, hex: "#FF5722", name: "Octopus Sausage" },
      { number: 5, hex: "#81C784", name: "Fresh Broccoli" },
      { number: 6, hex: "#E91E63", name: "Plum Pickle Core" },
      { number: 7, hex: "#FFE082", name: "Cozy Wood Tray Border" },
      { number: 8, hex: "#FFE0B2", name: "Cream Highlights" }
    ],
    difficulty: "Expert",
    yarnReward: 120,
    description: "An incredibly detailed and complex Japanese-style bento box featuring cat-shaped rice onigiri, fresh broccoli, and cute octopus sausages!"
  },
  {
    id: "succulent_terrarium",
    name: "Glass Succulent 🌿",
    category: "plants & buds",
    width: 16,
    height: 16,
    rows: [
      "......1111......",
      "....11777711....",
      "...1777777771...",
      "..177331133771..",
      ".17733313333771.",
      ".17353313353371.",
      "1733331113333371",
      "1711112222111171",
      "1722222222222271",
      "1722662222662271",
      "1726666226666271",
      "1722662222662271",
      ".17222222222271.",
      "..177777777711..",
      "...1111111111...",
      "................"
    ],
    colors: [
      { number: 1, hex: "#3E2723", name: "Terrarium Mahogany Stand" },
      { number: 2, hex: "#8D6E63", name: "Organic Coarse Soil" },
      { number: 3, hex: "#26A69A", name: "Mint Succulent Petals" },
      { number: 5, hex: "#FF8A80", name: "Blushing Succulent Tips" },
      { number: 6, hex: "#4CAF50", name: "Woodland Floor Moss" },
      { number: 7, hex: "#E0F7FA", name: "Pristine Glass Flares" }
    ],
    difficulty: "Expert",
    yarnReward: 110,
    description: "A gorgeous, intricate glass terrarium jar housing blooming mint-pink succulents resting on layers of organic fertile soil and forest moss."
  },
  {
    id: "pancake_tower",
    name: "Super Pancake Tower 🥞",
    category: "cozy food",
    width: 16,
    height: 16,
    rows: [
      "................",
      ".....555555.....",
      "....56666665....",
      "....11111111....",
      "...1333333331...",
      ".11144444444111.",
      "1222222222222221",
      "1333322223333331",
      ".11144444444111.",
      "1222222222222221",
      "1333333333333331",
      ".11111111111111.",
      "1777777777777771",
      "1788888888888871",
      ".11111111111111.",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Outline syrup brown" },
      { number: 2, hex: "#FFD54F", name: "Melting Sweet Butter" },
      { number: 3, hex: "#FFE082", name: "Warm Golden Pancake Fluff" },
      { number: 4, hex: "#FFB74D", name: "Maple Syrup Glaze" },
      { number: 5, hex: "#FF4081", name: "Spiced Cherry Topping" },
      { number: 6, hex: "#E91E63", name: "Raspberry Jam" },
      { number: 7, hex: "#CFD8DC", name: "Porcelain Plate" },
      { number: 8, hex: "#B0BEC5", name: "Plate Soft Shadow" }
    ],
    difficulty: "Expert",
    yarnReward: 130,
    description: "An elegant and complex stack of pancakes with sweet honey syrup, fresh berries, raspberry jam, and a melting slice of butter."
  },
  {
    id: "cat_ramen",
    name: "Cozy Cat Ramen 🍜",
    category: "cozy food",
    width: 16,
    height: 16,
    rows: [
      "................",
      "...11......11...",
      "..122111111221..",
      "..12144144121...",
      "..11444444411...",
      ".1533355333551..",
      "155355555355551.",
      "155555555555551.",
      "1222222222222211",
      "1266226622662211",
      ".1666666666611..",
      "..1111111111....",
      "....133331......",
      "....133331......",
      ".....1111.......",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Charcoal Bowl/Details" },
      { number: 2, hex: "#FAFAFA", name: "Pristine egg-white" },
      { number: 3, hex: "#FFB300", name: "Tasty Golden Noodles" },
      { number: 4, hex: "#FFA726", name: "Tasty Pork/Naruto" },
      { number: 5, hex: "#4CAF50", name: "Fresh Green Scallions" },
      { number: 6, hex: "#E53935", name: "Red Bowl Accent" }
    ],
    difficulty: "Expert",
    yarnReward: 125,
    description: "A delightful, complex bowl of hot cat ramen complete with juicy sliced pork, fresh scallions, broth, and hand-pulled noodles."
  },
  {
    id: "giant_monstera",
    name: "Giant Monstera 🌿",
    category: "plants & buds",
    width: 16,
    height: 16,
    rows: [
      "......22........",
      "....222222......",
      "...22332232.....",
      "..2233322332....",
      ".223333233332...",
      "123333323333321.",
      "122332222233221.",
      "111221111122111.",
      "...144444441....",
      "...144454441....",
      "...145555541....",
      "...144555441....",
      "...144444441....",
      "....1444441.....",
      ".....11111......",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Midnight pot outline" },
      { number: 2, hex: "#2E7D32", name: "Deep Forest Green Monstera" },
      { number: 3, hex: "#81C784", name: "Light Green Leaf Veins" },
      { number: 4, hex: "#D84315", name: "Terracotta Baked Earth" },
      { number: 5, hex: "#FF8A65", name: "Clay highlights" }
    ],
    difficulty: "Expert",
    yarnReward: 120,
    description: "A beautiful, detailed split-leaf monstera plant in a classic warm clay pot."
  },
  {
    id: "cherry_blossom_branch",
    name: "Cherry Blossom Pot 🌸",
    category: "plants & buds",
    width: 16,
    height: 16,
    rows: [
      "................",
      "......11........",
      ".....1331...11..",
      "....134431.131..",
      "....1344311341..",
      ".....123113441..",
      "......12134431..",
      "...11..121331...",
      "..1331122111....",
      ".134431221......",
      "13454311........",
      ".134431.........",
      "..1331..........",
      "...11...........",
      "................",
      "................"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Soft Charcoal branches" },
      { number: 2, hex: "#5D4037", name: "Muted Wood Brown" },
      { number: 3, hex: "#F06292", name: "Cherry Blossom Pink" },
      { number: 4, hex: "#FF8A80", name: "Melon blush petals" },
      { number: 5, hex: "#FFEE58", name: "Golden pollen stamen" }
    ],
    difficulty: "Expert",
    yarnReward: 115,
    description: "A beautiful, detailed branch of blooming cherry blossom buds sprouting elegantly in a bonsai style pot."
  },
  {
    id: "toy_yarn_ball",
    name: "Cozy Yarn Ball 🧶",
    category: "toys",
    width: 12,
    height: 12,
    rows: [
      "....1111....",
      "..11222211..",
      ".1223223221.",
      "123223223221",
      "122322322321",
      "123223223221",
      "122322322321",
      "123223223221",
      ".1223223221.",
      "..11222211..",
      "....1111.41.",
      "........4..."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Charcoal Outline" },
      { number: 2, hex: "#E91E63", name: "Vibrant Cherry Yarn" },
      { number: 3, hex: "#FF6090", name: "Magenta Highlights" },
      { number: 4, hex: "#FF8A80", name: "Stray Soft Thread" }
    ],
    difficulty: "Easy",
    yarnReward: 50,
    description: "A soft ball of high-quality woolly yarn with a stray thread perfect for cats to swat and play with."
  },
  {
    id: "squeaky_mouse",
    name: "Squeaky Mouse 🐭",
    category: "toys",
    width: 12,
    height: 12,
    rows: [
      "............",
      "..11....11..",
      ".1331..1331.",
      "132231132231",
      "122222222221",
      "121122221121",
      "122222222221",
      ".1224422441.",
      "..12222221..",
      "...112211.55",
      ".....11..5..",
      "............"
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Midnight Outline" },
      { number: 2, hex: "#BEC2CB", name: "Cozy Grey Velvet" },
      { number: 3, hex: "#FF8A80", name: "Sweet Pink Inner Ears" },
      { number: 4, hex: "#1E1F22", name: "Shiny Oval Beads" },
      { number: 5, hex: "#FFB300", name: "Catnip String Tail" }
    ],
    difficulty: "Medium",
    yarnReward: 65,
    description: "An adorable plush cat toy in the shape of a tiny mouse, stuffed with pure premium catnip!"
  },
  {
    id: "witch_hat_kitty",
    name: "Witch Hat Kitty 🧙",
    category: "magic",
    width: 14,
    height: 14,
    rows: [
      "......22......",
      ".....2222.....",
      "....222222....",
      "....213312....",
      "...21333312...",
      "..1111111111..",
      ".122222222221.",
      "11111111111111",
      ".144111111441.",
      "14554111145541",
      "14444444444441",
      "14411444411441",
      ".144444444441.",
      "..1111111111.."
    ],
    colors: [
      { number: 1, hex: "#1A1A1A", name: "Midnight Charcoal" },
      { number: 2, hex: "#5E35B1", name: "Deep Royal Felt" },
      { number: 3, hex: "#FFD54F", name: "Gleaming Gold Brass" },
      { number: 4, hex: "#ECEFF1", name: "Pristine Snow Fur" },
      { number: 5, hex: "#00E676", name: "Glow Green Magic Eyes" }
    ],
    difficulty: "Expert",
    yarnReward: 100,
    description: "An elite wizard kitten wearing a pointed purple sorcery hat with glowing emerald eyes."
  },
  {
    id: "crystal_fortune",
    name: "Fortune Crystal 🔮",
    category: "magic",
    width: 12,
    height: 12,
    rows: [
      "....1111....",
      "..11333311..",
      ".1334334331.",
      "133443344331",
      "133333333331",
      "134333333431",
      ".1333333331.",
      "..11111111..",
      "...122221...",
      "..12211221..",
      ".1222222221.",
      "..11111111.."
    ],
    colors: [
      { number: 1, hex: "#2F2E36", name: "Dark Outlines" },
      { number: 2, hex: "#8D6E63", name: "Deep Mahogany Stand" },
      { number: 3, hex: "#E040FB", name: "Glowing Violet Mist" },
      { number: 4, hex: "#FFFFFF", name: "Polarized Flares" }
    ],
    difficulty: "Medium",
    yarnReward: 75,
    description: "A mysterious crystal fortune sphere filled with cosmic purple mist to predict cozy destinies."
  }
];

// Returns empty coloring state grid for canvas based on puzzle size (width x height)
// State is an array of size width * height. Stores:
// { colorId?: number, filled: boolean, correct: boolean }
export interface CellProgress {
  number: number; // target color index represented in the raw grid row
  colorHex: string | null;
  filled: boolean;
  correct: boolean;
}

export function createInitialProgress(puzzle: PuzzleTemplate): CellProgress[] {
  const cells: CellProgress[] = [];
  for (let r = 0; r < puzzle.height; r++) {
    const rowStr = puzzle.rows[r];
    for (let c = 0; c < puzzle.width; c++) {
      const char = rowStr[c];
      const numVal = char === "." || char === " " ? 0 : parseInt(char, 10);
      
      cells.push({
        number: numVal,
        colorHex: null,
        filled: false,
        correct: false,
      });
    }
  }
  return cells;
}
