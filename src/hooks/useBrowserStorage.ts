import { useCallback, useMemo } from "react";

export function useBrowserStorage(key: string, session = false) {
  const getStorage = useCallback(
    () => (session ? sessionStorage : localStorage),
    [session],
  );

  const get = useCallback(() => {
    const storageInterface = getStorage();
    const item = storageInterface.getItem(key);
    if (item === null) {
      return null;
    }
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  }, [getStorage, key]);

  const set = useCallback((item: unknown) => {
    const storageInterface = getStorage();
    if (item === undefined) {
      storageInterface.removeItem(key);
      return;
    }
    if (typeof item === "string") {
      storageInterface.setItem(key, item);
    } else {
      const itemStr = JSON.stringify(item);
      storageInterface.setItem(key, itemStr);
    }
  }, [getStorage, key]);

  const remove = useCallback(() => {
    const storageInterface = getStorage();
    storageInterface.removeItem(key);
  }, [getStorage, key]);

  const clear = useCallback(() => {
    // Clear both session and browser storage
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  return useMemo(
    () => ({ get, set, remove, clear }),
    [clear, get, remove, set],
  );
}
