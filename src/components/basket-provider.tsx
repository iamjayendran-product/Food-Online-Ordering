"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";
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
  // False until the persisted basket has been read from localStorage. A
  // consumer that redirects when the basket looks empty (checkout) MUST
  // wait for this — child effects run before a parent provider's effects on
  // mount, so without this flag such a redirect fires against the initial
  // empty state before hydration has had a chance to run.
  hydrated: boolean;
  itemCount: number;
  addItem: (item: NewBasketItem) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  refreshBasket: (basket: Basket) => void;
};

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [basket, dispatch] = useReducer(basketReducer, EMPTY_BASKET);
  const [hydrated, setHydrated] = useState(false);
  const [pendingItem, setPendingItem] = useState<NewBasketItem | null>(null);

  // Read the persisted basket once on mount (localStorage isn't available
  // during SSR, and reading it during the initial client render would cause
  // a hydration mismatch against the server-rendered EMPTY_BASKET markup).
  useEffect(() => {
    dispatch({
      type: "applyServerRefresh",
      basket: parseStoredBasket(window.localStorage.getItem(STORAGE_KEY)),
    });
    // Both updates come from this one synchronous localStorage read; hydrated
    // must flip in the same commit as the dispatch above, not a later one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Guarded by `hydrated`, not a "first run" ref: the dispatch above and this
  // write are two renders apart (React commits the reducer update on its own
  // pass), so only gating on render order — rather than on whether hydration
  // has actually landed — would still risk writing the pre-hydration state.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  }, [basket, hydrated]);

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
        hydrated,
        itemCount,
        addItem,
        increment: (itemId) => dispatch({ type: "increment", itemId }),
        decrement: (itemId) => dispatch({ type: "decrement", itemId }),
        remove: (itemId) => dispatch({ type: "remove", itemId }),
        clear: () => dispatch({ type: "clear" }),
        refreshBasket: (nextBasket) => dispatch({ type: "applyServerRefresh", basket: nextBasket }),
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
