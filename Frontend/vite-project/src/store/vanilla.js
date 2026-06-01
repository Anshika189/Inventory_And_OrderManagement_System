import { useSyncExternalStore } from "react";

/**
 * Tiny, dependency-free store with the same ergonomics as zustand.
 * Supports both getState() and React subscriptions via useSyncExternalStore.
 */
export function create(initializer) {
  let state;
  const listeners = new Set();

  const setState = (partial) => {
    const next = typeof partial === "function" ? partial(state) : partial;
    if (!next) return;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = initializer(setState, getState);

  function useStore(selector = (s) => s) {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    );
  }

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;
  return useStore;
}
