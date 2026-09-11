// Presentational only for now — basket state and click behavior arrive in F4.
export function AddToBasketButton({ isAvailable }: { isAvailable: boolean }) {
  return (
    <button
      type="button"
      disabled={!isAvailable}
      className="shrink-0 rounded bg-black px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
    >
      Add
    </button>
  );
}
