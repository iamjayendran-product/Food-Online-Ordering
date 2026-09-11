import { test, expect } from "@playwright/test";
import { basketReducer, parseStoredBasket, EMPTY_BASKET, MAX_QTY, type NewBasketItem } from "../../src/lib/basket";

const item: NewBasketItem = {
  restaurantSlug: "r1",
  restaurantName: "R1",
  itemId: "i1",
  name: "Item 1",
  unitPricePaise: 10000,
};

test("TC-4.2 adding the same item twice results in one line with quantity 2", () => {
  let state = basketReducer(EMPTY_BASKET, { type: "add", item });
  state = basketReducer(state, { type: "add", item });
  expect(state.lines).toHaveLength(1);
  expect(state.lines[0].quantity).toBe(2);
});

test("TC-4.3 quantity increases and decreases; decreasing from 1 removes the line", () => {
  let state = basketReducer(EMPTY_BASKET, { type: "add", item });
  state = basketReducer(state, { type: "increment", itemId: "i1" });
  expect(state.lines[0].quantity).toBe(2);

  state = basketReducer(state, { type: "decrement", itemId: "i1" });
  expect(state.lines[0].quantity).toBe(1);

  state = basketReducer(state, { type: "decrement", itemId: "i1" });
  expect(state.lines).toHaveLength(0);
  expect(state.restaurantSlug).toBeNull();
});

test("TC-4.4 quantity cannot exceed MAX_QTY", () => {
  let state = basketReducer(EMPTY_BASKET, { type: "add", item });
  for (let i = 0; i < 15; i++) {
    state = basketReducer(state, { type: "increment", itemId: "i1" });
  }
  expect(state.lines[0].quantity).toBe(MAX_QTY);
});

test("TC-4.5 removing the last line empties the basket", () => {
  let state = basketReducer(EMPTY_BASKET, { type: "add", item });
  state = basketReducer(state, { type: "remove", itemId: "i1" });
  expect(state.lines).toHaveLength(0);
  expect(state.restaurantSlug).toBeNull();
});

test("TC-4.9 a corrupted saved basket parses to empty without throwing", () => {
  expect(parseStoredBasket("not json")).toEqual(EMPTY_BASKET);
  expect(parseStoredBasket('{"restaurantSlug":"r1","restaurantName":null,"lines":[]}')).toEqual(EMPTY_BASKET);
  expect(parseStoredBasket('{"restaurantSlug":null,"restaurantName":null,"lines":[{"itemId":"i1","name":"x","unitPricePaise":100,"quantity":99}]}')).toEqual(EMPTY_BASKET);
  expect(parseStoredBasket(null)).toEqual(EMPTY_BASKET);
});
