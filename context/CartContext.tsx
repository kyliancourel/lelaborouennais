"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  selectedColor?: string;
  selectedColors?: Record<string, string>;
  customText?: string;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeOne: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;

  total: number;
  cartCount: number;

  pointsUsed: number;
  setPointsUsed: (value: number) => void;

  selectedRewardId: string | null;
  setSelectedRewardId: (value: string | null) => void;

  earnedPointsPreview: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "cart-storage";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [pointsUsed, setPointsUsed] = useState<number>(0);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch { }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.id === item.id &&
          i.selectedColor === item.selectedColor &&
          i.customText === item.customText
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id &&
            i.selectedColor === item.selectedColor &&
            i.customText === item.customText
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeOne = useCallback((id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const remove = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
    setPointsUsed(0);
    setSelectedRewardId(null);
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Points théoriquement gagnés APRÈS paiement.
  // Ce n'est PAS un solde utilisable immédiatement.
  const earnedPointsPreview = useMemo(() => Math.floor(total), [total]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeOne,
        remove,
        clear,
        total,
        cartCount,
        pointsUsed,
        setPointsUsed,
        selectedRewardId,
        setSelectedRewardId,
        earnedPointsPreview,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return ctx;
}