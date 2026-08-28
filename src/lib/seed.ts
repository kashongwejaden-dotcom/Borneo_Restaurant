import type { Category, ModifierGroup, Order, Promotion, Reservation } from "./types";
import { uid } from "./utils";

/* ------------------------------------------------------------------ */
/*  Restaurant profile — Borneo Indonesian Restaurant, Kigali          */
/* ------------------------------------------------------------------ */

export const RESTAURANT = {
  name: "Borneo",
  fullName: "Borneo Indonesian Restaurant",
  tagline: "Masakan Indonesia, made with fire & patience",
  address: "18 KG 4 Ave, Kigali, Rwanda",
  phone: "+250 787 296 667",
  rating: 4.6,
  reviews: 312,
  hours: "Every day · 11:00 – 20:30",
  currency: "FRw",
};

export const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/34d7bccb-0d1c-4e15-b1b4-9a63a0ec768e/_result.png",
  interior: "https://image.qwenlm.ai/generated-images/17bc3a8e-7333-443e-a89e-daf5eb486e3b/_result.png",
  rendang: "https://image.qwenlm.ai/generated-images/fea5df48-6580-4a6d-b6cb-395c0a893b65/_result.png",
  nasigoreng: "https://image.qwenlm.ai/generated-images/0be95b75-d8cb-4e5b-b5de-929d1ab7fffd/_result.png",
  sate: "https://image.qwenlm.ai/generated-images/f9265817-c38a-4aae-a14a-314b9af028d6/_result.png",
  ikan: "https://image.qwenlm.ai/generated-images/4eac9f69-7cd7-446f-94d5-ccf1c41c6aa7/_result.png",
  lumpia: "https://image.qwenlm.ai/generated-images/d1a1a2eb-3f63-494e-818e-a989adca336d/_result.png",
  cendol: "https://image.qwenlm.ai/generated-images/f5c11e43-be4c-4987-afcf-a7cfb573247a/_result.png",
  chef: "https://image.qwenlm.ai/generated-images/f09068e3-bf37-4c1d-95b3-19a5190e6dc3/_result.png",
  sambal: "https://image.qwenlm.ai/generated-images/f0b00b89-2af5-4d80-b6c5-c2b062c80c66/_result.png",
};

/** Real-world links for the Visit section */
export const LINKS = {
  maps: "https://maps.app.goo.gl/YbasqT2mNm1Cx7dM7",
  phone: "+250787296667",
  whatsapp: "https://wa.me/250787296667",
};

/** Default storefront announcement — editable from the dashboard */
export const SEED_ANNOUNCEMENT =
  "Sambal matah is back — ground fresh every morning before ten.";

/* Shared modifier groups (Prisma: ModifierGroup / ModifierOption) */
const spice: ModifierGroup = {
  id: "spice",
  name: "Spice level",
  type: "single",
  options: [
    { id: "mild", name: "Mild", price: 0 },
    { id: "medium", name: "Medium", price: 0 },
    { id: "pedas", name: "Pedas — extra hot", price: 0 },
  ],
};
const addons: ModifierGroup = {
  id: "addons",
  name: "Add-ons",
  type: "multi",
  options: [
    { id: "egg", name: "Crispy fried egg", price: 1500 },
    { id: "rice", name: "Extra jasmine rice", price: 1000 },
    { id: "sambal", name: "Extra sambal", price: 500 },
    { id: "krupuk", name: "Krupuk prawn crackers", price: 1000 },
  ],
};
const combo: ModifierGroup = {
  id: "combo",
  name: "Make it a combo",
  type: "single",
  options: [
    { id: "solo", name: "Just the dish", price: 0 },
    { id: "combo", name: "+ Es Teh Manis & krupuk", price: 2500 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Menu — mirrors Prisma Category / MenuItem                          */
/* ------------------------------------------------------------------ */

export const SEED_CATEGORIES: Category[] = [
  {
    id: "pembuka",
    name: "Pembuka",
    note: "Small plates to begin",
    items: [
      { id: "lumpia", name: "Lumpia Semarang", desc: "Golden spring rolls, chicken & bamboo shoot, sweet chili dip", price: 5500, img: IMG.lumpia, tags: ["V"], available: true, stock: 24, modifiers: [] },
      { id: "gado", name: "Gado-Gado Borneo", desc: "Warm peanut sauce over blanched vegetables, lontong, crispy shallots", price: 6500, img: IMG.lumpia, tags: ["VG", "GF"], available: true, stock: 18, popular: true, modifiers: [spice] },
      { id: "sate", name: "Sate Ayam", desc: "Charcoal chicken skewers, house peanut sauce, kecap manis glaze", price: 7000, img: IMG.sate, tags: ["GF"], available: true, stock: 32, popular: true, modifiers: [spice] },
      { id: "perkedel-j", name: "Perkedel Jagung", desc: "Sweet corn fritters, kaffir lime aioli", price: 5000, img: IMG.lumpia, tags: ["V"], available: true, stock: 20, modifiers: [] },
    ],
  },
  {
    id: "utama",
    name: "Utama",
    note: "Signature mains from the wok & the fire",
    items: [
      { id: "rendang", name: "Rendang Sapi", desc: "48-hour beef rendang in coconut & spice, jasmine rice", price: 14500, img: IMG.rendang, tags: ["GF", "SPICY"], available: true, stock: 7, popular: true, modifiers: [spice, addons, combo] },
      { id: "penyet", name: "Ayam Penyet", desc: "Smashed crispy fried chicken, sambal terasi, lalapan vegetables", price: 12000, img: IMG.rendang, tags: ["SPICY"], available: true, stock: 15, popular: true, modifiers: [spice, addons, combo] },
      { id: "ikan", name: "Ikan Bakar", desc: "Whole grilled tilapia, dabu-dabu salsa, charred lime", price: 15500, img: IMG.ikan, tags: ["GF", "SPICY"], available: true, stock: 6, modifiers: [spice] },
      { id: "gudeg", name: "Gudeg Jogja", desc: "Slow young-jackfruit stew, tofu, egg, palm sugar sweetness", price: 10500, img: IMG.rendang, tags: ["VG"], available: true, stock: 14, modifiers: [addons] },
      { id: "nasgor", name: "Nasi Goreng Borneo", desc: "Signature fried rice, chicken & prawn, fried egg, krupuk", price: 11500, img: IMG.nasigoreng, tags: ["SPICY"], available: true, stock: 40, popular: true, modifiers: [spice, addons] },
    ],
  },
  {
    id: "pendamping",
    name: "Pendamping",
    note: "Sides & sambal",
    items: [
      { id: "kangkung", name: "Tumis Kangkung", desc: "Water spinach flash-fried with garlic & chili", price: 4500, img: IMG.nasigoreng, tags: ["VG", "GF"], available: true, stock: 9, modifiers: [spice] },
      { id: "perkedel-k", name: "Perkedel Kentang", desc: "Silky potato fritters with celery & nutmeg", price: 3500, img: IMG.lumpia, tags: ["V"], available: true, stock: 26, modifiers: [] },
      { id: "sambal-trio", name: "Sambal Trio Board", desc: "Terasi, matah & ijo — ground fresh every morning", price: 3000, img: IMG.hero, tags: ["VG", "GF", "SPICY"], available: true, stock: 30, modifiers: [] },
      { id: "kerupuk", name: "Kerupuk Basket", desc: "Prawn crackers, shrimp chips", price: 2000, img: IMG.lumpia, tags: ["VG"], available: true, stock: 45, modifiers: [] },
    ],
  },
  {
    id: "manis",
    name: "Manis",
    note: "Something sweet to finish",
    items: [
      { id: "cendol", name: "Es Cendol", desc: "Pandan jelly, iced coconut milk, palm sugar", price: 4000, img: IMG.cendol, tags: ["V", "GF"], available: true, stock: 22, popular: true, modifiers: [] },
      { id: "pisang", name: "Pisang Goreng", desc: "Fried banana fritters, palm sugar dust, peanut crunch", price: 4500, img: IMG.cendol, tags: ["V"], available: true, stock: 19, modifiers: [] },
      { id: "dadar", name: "Dadar Gulung", desc: "Pandan crepes rolled with sweet coconut", price: 4000, img: IMG.cendol, tags: ["V"], available: true, stock: 4, modifiers: [] },
    ],
  },
  {
    id: "minuman",
    name: "Minuman",
    note: "Drinks",
    items: [
      { id: "esteh", name: "Es Teh Manis", desc: "Sweet iced jasmine tea", price: 2000, img: IMG.cendol, tags: ["V", "GF"], available: true, stock: 60, modifiers: [] },
      { id: "kopi", name: "Kopi Tubruk", desc: "Rwandan single-origin, brewed thick in the glass", price: 2500, img: IMG.cendol, tags: ["V"], available: true, stock: 50, modifiers: [] },
      { id: "alpukat", name: "Jus Alpukat", desc: "Avocado juice, chocolate drizzle", price: 3500, img: IMG.cendol, tags: ["V", "GF"], available: true, stock: 8, modifiers: [] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Seed orders / reservations / promotions                            */
/* ------------------------------------------------------------------ */

const min = 60_000;

export const SEED_ORDERS: Order[] = [
  {
    id: uid("ord"), code: "BR-1047", status: "new", placedAt: Date.now() - 1 * min, eta: Date.now() + 24 * min,
    customer: { name: "Keza Umutesi", phone: "+250 788 301 220" }, channel: "pickup", payment: "applepay",
    items: [
      { name: "Nasi Goreng Borneo", qty: 1, price: 11500, modifiers: [{ name: "Pedas — extra hot", price: 0 }] },
      { name: "Sate Ayam", qty: 2, price: 7000, modifiers: [] },
      { name: "Es Cendol", qty: 1, price: 4000, modifiers: [] },
    ],
    subtotal: 29500, discount: 0, platformFee: 0, deliveryFee: 0, tip: 3000, total: 32500,
  },
  {
    id: uid("ord"), code: "BR-1046", status: "preparing", placedAt: Date.now() - 7 * min, eta: Date.now() + 13 * min,
    customer: { name: "Eric Niyonzima", phone: "+250 722 514 909" }, channel: "delivery", payment: "card",
    address: "Kacyiru, KG 201 St, House 14",
    items: [
      { name: "Rendang Sapi", qty: 2, price: 14500, modifiers: [{ name: "+ Extra jasmine rice", price: 1000 }] },
      { name: "Tumis Kangkung", qty: 1, price: 4500, modifiers: [] },
    ],
    subtotal: 34500, discount: 0, platformFee: 0, deliveryFee: 2000, tip: 0, total: 36500,
  },
  {
    id: uid("ord"), code: "BR-1045", status: "preparing", placedAt: Date.now() - 12 * min, eta: Date.now() + 6 * min,
    customer: { name: "Nadia Fitriani", phone: "+250 733 887 451" }, channel: "pickup", payment: "googlepay",
    items: [
      { name: "Ayam Penyet", qty: 1, price: 12000, modifiers: [{ name: "Pedas — extra hot", price: 0 }, { name: "+ Crispy fried egg", price: 1500 }] },
      { name: "Es Teh Manis", qty: 2, price: 2000, modifiers: [] },
    ],
    subtotal: 17500, discount: 0, platformFee: 0, deliveryFee: 0, tip: 2000, total: 19500, promoName: undefined,
  },
  {
    id: uid("ord"), code: "BR-1044", status: "ready", placedAt: Date.now() - 22 * min, eta: Date.now() - 2 * min,
    customer: { name: "Olivier Habimana", phone: "+250 788 604 118" }, channel: "pickup", payment: "card",
    items: [
      { name: "Ikan Bakar", qty: 1, price: 15500, modifiers: [] },
      { name: "Sambal Trio Board", qty: 1, price: 3000, modifiers: [] },
    ],
    subtotal: 18500, discount: 0, platformFee: 0, deliveryFee: 0, tip: 1500, total: 20000,
  },
  {
    id: uid("ord"), code: "BR-1043", status: "completed", placedAt: Date.now() - 55 * min, eta: Date.now() - 30 * min,
    customer: { name: "Claudine Mukamana", phone: "+250 722 909 332" }, channel: "delivery", payment: "applepay",
    address: "Nyarutarama, KG 541 St, Apt 3B",
    items: [
      { name: "Gado-Gado Borneo", qty: 2, price: 6500, modifiers: [] },
      { name: "Lumpia Semarang", qty: 1, price: 5500, modifiers: [] },
    ],
    subtotal: 18500, discount: 1850, platformFee: 0, deliveryFee: 2000, tip: 0, total: 18650, promoName: "Early Bird Lunch",
  },
  {
    id: uid("ord"), code: "BR-1042", status: "completed", placedAt: Date.now() - 95 * min, eta: Date.now() - 70 * min,
    customer: { name: "Jean Bosco", phone: "+250 788 118 743" }, channel: "pickup", payment: "googlepay",
    items: [
      { name: "Nasi Goreng Borneo", qty: 2, price: 11500, modifiers: [{ name: "+ Crispy fried egg", price: 1500 }] },
      { name: "Pisang Goreng", qty: 1, price: 4500, modifiers: [] },
    ],
    subtotal: 30500, discount: 0, platformFee: 0, deliveryFee: 0, tip: 4000, total: 34500,
  },
];

export const SEED_RESERVATIONS: Reservation[] = [
  { id: uid("res"), name: "Diane Ingabire", phone: "+250 788 442 091", party: 4, date: isoDaysFromNow(0), time: "12:30", requests: "Window table if possible", status: "seated", createdAt: Date.now() - 26 * 60 * min },
  { id: uid("res"), name: "Keza Umutesi", phone: "+250 788 301 220", party: 2, date: isoDaysFromNow(0), time: "18:00", requests: "", status: "upcoming", createdAt: Date.now() - 8 * 60 * min },
  { id: uid("res"), name: "Aline Uwase", phone: "+250 733 210 556", party: 6, date: isoDaysFromNow(0), time: "19:30", requests: "Birthday — small cake?", status: "upcoming", createdAt: Date.now() - 5 * 60 * min },
  { id: uid("res"), name: "Putu Ayu", phone: "+250 722 615 778", party: 3, date: isoDaysFromNow(1), time: "13:00", requests: "", status: "upcoming", createdAt: Date.now() - 3 * 60 * min },
  { id: uid("res"), name: "Sarah Mutesi", phone: "+250 788 903 417", party: 8, date: isoDaysFromNow(2), time: "18:30", requests: "Two high chairs", status: "upcoming", createdAt: Date.now() - 2 * 60 * min },
  { id: uid("res"), name: "Eric Niyonzima", phone: "+250 722 514 909", party: 2, date: isoDaysFromNow(4), time: "19:00", requests: "Anniversary", status: "upcoming", createdAt: Date.now() - 60 * min },
];

function isoDaysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function todayAt(h: number, m = 0) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export const SEED_PROMOS: Promotion[] = [
  { id: uid("pr"), name: "Grand Opening Week", percent: 15, start: Date.now() - 24 * 60 * min, end: Date.now() + 5 * 24 * 60 * min, active: true },
  { id: uid("pr"), name: "Happy Hour", percent: 20, start: todayAt(15), end: todayAt(17), active: true },
  { id: uid("pr"), name: "Early Bird Lunch", percent: 10, start: todayAt(11), end: todayAt(13), active: true },
];

/* ------------------------------------------------------------------ */
/*  Analytics seeds (Overview page)                                    */
/* ------------------------------------------------------------------ */

export const HOURLY_REVENUE = [
  { hour: "11a", revenue: 42000, orders: 6 },
  { hour: "12p", revenue: 96000, orders: 13 },
  { hour: "1p", revenue: 84000, orders: 11 },
  { hour: "2p", revenue: 51000, orders: 7 },
  { hour: "3p", revenue: 38000, orders: 5 },
  { hour: "4p", revenue: 47000, orders: 6 },
  { hour: "5p", revenue: 92000, orders: 12 },
  { hour: "6p", revenue: 134000, orders: 17 },
  { hour: "7p", revenue: 121000, orders: 15 },
  { hour: "8p", revenue: 76000, orders: 9 },
];

export const CHANNEL_SPLIT = [
  { name: "Pickup", value: 58, color: "#f97316" },
  { name: "Delivery", value: 27, color: "#ea580c" },
  { name: "Walk-in", value: 15, color: "#78716c" },
];

export const POPULAR_ITEMS = [
  { name: "Rendang Sapi", count: 41 },
  { name: "Nasi Goreng Borneo", count: 38 },
  { name: "Sate Ayam", count: 33 },
  { name: "Ayam Penyet", count: 27 },
  { name: "Es Cendol", count: 24 },
];

/* Random order factory — used by the live feed simulation */
const CUSTOMERS = [
  { name: "Keza Umutesi", phone: "+250 788 301 220" },
  { name: "Olivier Habimana", phone: "+250 788 604 118" },
  { name: "Aline Uwase", phone: "+250 733 210 556" },
  { name: "Jean Bosco", phone: "+250 788 118 743" },
  { name: "Nadia Fitriani", phone: "+250 733 887 451" },
  { name: "Sarah Mutesi", phone: "+250 788 903 417" },
  { name: "Eric Niyonzima", phone: "+250 722 514 909" },
];

export function makeRandomOrder(): Order {
  const pool = SEED_CATEGORIES.flatMap((c) => c.items).filter((i) => i.available);
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
  const items = picks.map((p) => ({ name: p.name, qty: 1 + (Math.random() > 0.7 ? 1 : 0), price: p.price, modifiers: [] as { name: string; price: number }[] }));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const channel: "pickup" | "delivery" = Math.random() > 0.35 ? "pickup" : "delivery";
  const tip = Math.random() > 0.5 ? Math.round(subtotal * 0.1 / 500) * 500 : 0;
  const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  return {
    id: uid("ord"),
    code: "BR-" + (1048 + Math.floor(Math.random() * 500)),
    customer,
    channel,
    address: channel === "delivery" ? "Kacyiru, KG 201 St" : undefined,
    items,
    subtotal,
    discount: 0,
    platformFee: 0,
    deliveryFee: channel === "delivery" ? 2000 : 0,
    tip,
    total: subtotal + (channel === "delivery" ? 2000 : 0) + tip,
    status: "new",
    placedAt: Date.now(),
    eta: Date.now() + 25 * min,
    payment: (["card", "applepay", "googlepay"] as const)[Math.floor(Math.random() * 3)],
  };
}
