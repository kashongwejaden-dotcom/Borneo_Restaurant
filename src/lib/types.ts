/**
 * Domain types for EatLocal OS — these mirror the Prisma models 1:1
 * (see /prisma/schema.prisma) so swapping the local store for a real
 * PostgreSQL backend is a drop-in change.
 */

export type DietaryTag = "V" | "VG" | "GF" | "SPICY";

export interface ModifierOption {
  id: string;
  name: string;
  price: number; // RWF, 0 for free choices (e.g. spice level)
}

export interface ModifierGroup {
  id: string;
  name: string;
  type: "single" | "multi"; // radio vs checkbox
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number; // RWF
  img: string;
  tags: DietaryTag[];
  available: boolean;
  stock: number; // inventory units
  popular?: boolean;
  modifiers: ModifierGroup[];
}

export interface Category {
  id: string;
  name: string; // Indonesian + english
  note?: string;
  items: MenuItem[];
}

export type OrderStatus = "new" | "preparing" | "ready" | "completed";
export type OrderChannel = "pickup" | "delivery";

export interface OrderLine {
  name: string;
  qty: number;
  price: number; // unit base price
  modifiers: { name: string; price: number }[];
}

export interface Order {
  id: string;
  code: string; // e.g. BR-1042 — printed on the kitchen ticket
  customer: { name: string; phone: string; email?: string };
  channel: OrderChannel;
  address?: string;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  platformFee: number; // always 0 — that's the point
  deliveryFee: number;
  tip: number;
  total: number;
  status: OrderStatus;
  placedAt: number; // epoch ms
  eta: number; // epoch ms
  promoName?: string;
  notes?: string;
  payment: "card" | "applepay" | "googlepay";
}

export type ReservationStatus = "upcoming" | "seated" | "cancelled";

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  party: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  requests?: string;
  status: ReservationStatus;
  createdAt: number;
}

export interface Promotion {
  id: string;
  name: string;
  percent: number; // 10 = 10% off
  start: number; // epoch ms
  end: number; // epoch ms
  active: boolean;
}

export interface User {
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export interface CartLine {
  key: string; // itemId + modifiers signature
  itemId: string;
  name: string;
  unitPrice: number; // base + modifiers
  qty: number;
  modifiers: { name: string; price: number }[];
  notes?: string;
}

export interface Toast {
  id: number;
  msg: string;
  tone: "success" | "error" | "info";
}
