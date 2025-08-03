// src/contexts/StoreContext.tsx
"use client";

import { Store } from "@/types/store.types";
import { createContext, useContext } from "react";

export const StoreContext = createContext<Store | null>(null); // แนะนำให้ใส่ type ที่เหมาะสมภายหลัง

export const useStore = () => useContext(StoreContext);
