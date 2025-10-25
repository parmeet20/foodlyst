import { z } from "zod";

// Enums
export enum Role {
  USER = "USER",
  OWNER = "OWNER",
}

export enum FoodType {
  VEG = "VEG",
  NON_VEG = "NON_VEG",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "USER" | "OWNER";
}

// User
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  walletAddress: string;
  walletConnected: boolean;
  balance: number;
}

// Restaurant
export interface Restaurant {
  id: number;
  name: string;
  email: string;
  imageUrl: string;
  walletAddress: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  rating: number;
  ownerId: number;
}

// Food Offer Request Schema
export const FoodOfferRequestSchema = z.object({
  id: z.coerce.number().int().optional(),
  foodName: z.string().min(1, "Food name is required"),
  type: z.nativeEnum(FoodType).default(FoodType.VEG),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
  imageUrl: z.union([z.string(), z.null()]).optional(), // Allow string or null
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive"),
  remainingQty: z.coerce
    .number()
    .int("Remaining quantity must be an integer")
    .nonnegative("Remaining quantity must be >= 0")
    .optional(),
  maxPerPerson: z.coerce
    .number()
    .int("Max per person must be an integer")
    .positive("Max per person must be positive"),
  perQtyPrice: z.coerce
    .number()
    .nonnegative("Price per quantity must be >= 0")
    .optional(),
  isActive: z.boolean().optional(),
  availableFrom: z
    .string()
    .datetime("Available from must be a valid ISO datetime")
    .optional(),
  availableTo: z
    .string()
    .datetime("Available to must be a valid ISO datetime")
    .optional(),
  restaurantId: z.coerce.number().int("Restaurant ID must be an integer"),
});

export type FoodOfferRequest = z.infer<typeof FoodOfferRequestSchema>;

// Grab Offer
export interface GrabOffer {
  id: number;
  foodName: string;
  rating: number;
  qtyTaken: number;
  foodOfferRequestId: number;
  restaurantId: number;
  userId: number;
}

// Food Order
export interface FoodOrder {
  id: number;
  userId: number;
  restaurantId: number;
  foodOfferRequestId: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  token: string;
  paymentId: string;
}

// Transaction
export interface Transaction {
  id: number;
  fromUserId: number;
  toUserId: number;
  amountPaid: number;
  txSignature: string;
  orderId?: number;
  createdAt: string;
}

// Notification
export interface Notification {
  id: number;
  userId: number;
  orderId: number;
  message: string;
  qty: number;
  createdAt: string;
}