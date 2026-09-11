import { z } from "zod";

export const MAX_QTY = 10;

export type BasketLine = {
  itemId: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
};

export type Basket = {
  restaurantSlug: string | null;
  restaurantName: string | null;
  lines: BasketLine[];
};

export type NewBasketItem = {
  restaurantSlug: string;
  restaurantName: string;
  itemId: string;
  name: string;
  unitPricePaise: number;
};

export const EMPTY_BASKET: Basket = { restaurantSlug: null, restaurantName: null, lines: [] };

export type BasketAction =
  | { type: "add"; item: NewBasketItem }
  | { type: "increment"; itemId: string }
  | { type: "decrement"; itemId: string }
  | { type: "remove"; itemId: string }
  | { type: "replaceWith"; item: NewBasketItem }
  | { type: "clear" }
  | { type: "applyServerRefresh"; basket: Basket };

export function basketReducer(state: Basket, action: BasketAction): Basket {
  switch (action.type) {
    case "add": {
      const { restaurantSlug, restaurantName, itemId, name, unitPricePaise } = action.item;
      const existing = state.lines.find((line) => line.itemId === itemId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.itemId === itemId ? { ...line, quantity: Math.min(MAX_QTY, line.quantity + 1) } : line,
          ),
        };
      }
      return {
        restaurantSlug,
        restaurantName,
        lines: [...state.lines, { itemId, name, unitPricePaise, quantity: 1 }],
      };
    }

    case "increment": {
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.itemId === action.itemId ? { ...line, quantity: Math.min(MAX_QTY, line.quantity + 1) } : line,
        ),
      };
    }

    case "decrement": {
      const nextLines = state.lines
        .map((line) => (line.itemId === action.itemId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0);
      return nextLines.length === 0 ? EMPTY_BASKET : { ...state, lines: nextLines };
    }

    case "remove": {
      const nextLines = state.lines.filter((line) => line.itemId !== action.itemId);
      return nextLines.length === 0 ? EMPTY_BASKET : { ...state, lines: nextLines };
    }

    case "replaceWith": {
      const { restaurantSlug, restaurantName, itemId, name, unitPricePaise } = action.item;
      return {
        restaurantSlug,
        restaurantName,
        lines: [{ itemId, name, unitPricePaise, quantity: 1 }],
      };
    }

    case "clear":
      return EMPTY_BASKET;

    case "applyServerRefresh":
      return action.basket;

    default:
      return state;
  }
}

const basketLineSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  unitPricePaise: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(MAX_QTY),
});

const basketSchema = z
  .object({
    restaurantSlug: z.string().nullable(),
    restaurantName: z.string().nullable(),
    lines: z.array(basketLineSchema),
  })
  .refine(
    (basket) => (basket.restaurantSlug === null) === (basket.lines.length === 0),
    "restaurantSlug and lines must agree on whether the basket is empty",
  );

// Falls back to an empty basket for anything that doesn't parse — a missing
// key, a corrupted quantity, a hand-edited or stale localStorage value.
export function parseStoredBasket(raw: string | null): Basket {
  if (!raw) return EMPTY_BASKET;
  try {
    const parsed = basketSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_BASKET;
  } catch {
    return EMPTY_BASKET;
  }
}
