"use client";

import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import {
  basketReducer,
  parseStoredBasket,
  EMPTY_BASKET,
  type Basket,
  type NewBasketItem,
} from "@/lib/basket";

const STORAGE_KEY = "tnagar-basket";

type BasketContextValue = {
  basket: Basket;
  itemCount: number;
  addItem: (item: NewBasketItem) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [basket, dispatch] = useReducer(basketReducer, EMPTY_BASKET);
  const [pendingItem, setPendingItem] = useState<NewBasketItem | null>(null);
  const isFirstRender = useRef(true);

  // Read the persisted basket once on mount (localStorage isn't available
  // during SSR, and reading it during the initial client render would cause
  // a hydration mismatch against the server-rendered EMPTY_BASKET markup).
  useEffect(() => {
    dispatch({
      type: "applyServerRefresh",
      basket: parseStoredBasket(window.localStorage.getItem(STORAGE_KEY)),
    });
  }, []);

  // Skip the very first run: it fires before the hydration dispatch above
  // has taken effect, and would otherwise overwrite localStorage with the
  // still-empty initial state.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  }, [basket]);

  function addItem(item: NewBasketItem) {
    if (basket.restaurantSlug && basket.restaurantSlug !== item.restaurantSlug) {
      setPendingItem(item);
      return;
    }
    dispatch({ type: "add", item });
  }

  function confirmSwitch() {
    if (pendingItem) {
      dispatch({ type: "replaceWith", item: pendingItem });
      setPendingItem(null);
    }
  }

  function cancelSwitch() {
    setPendingItem(null);
  }

  const itemCount = basket.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <BasketContext.Provider
      value={{
        basket,
        itemCount,
        addItem,
        increment: (itemId) => dispatch({ type: "increment", itemId }),
        decrement: (itemId) => dispatch({ type: "decrement", itemId }),
        remove: (itemId) => dispatch({ type: "remove", itemId }),
        clear: () => dispatch({ type: "clear" }),
      }}
    >
      {children}
      {pendingItem && (
        <div
          role="alertdialog"
          aria-label="Start a new basket?"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-4 dark:bg-zinc-900">
            <p className="font-medium">Start a new basket?</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your basket has items from {basket.restaurantName}. Adding from{" "}
              {pendingItem.restaurantName} will clear it and start a new basket.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelSwitch}
                className="rounded px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within a BasketProvider");
  return ctx;
}
