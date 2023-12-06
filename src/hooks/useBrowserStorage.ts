export function useBrowserStorage(key: string, session = false) {
  const storageInterface = session ? sessionStorage : localStorage;

  function get() {
    const item = storageInterface.getItem(key);
    if (item === null) {
      return null;
    }
    try {
      return JSON.parse(item);
    } catch (err) {
      return item;
    }
  }

  function set(item: any) {
    if (typeof item === "string") {
      storageInterface.setItem(key, item);
    } else {
      const itemStr = JSON.stringify(item);
      storageInterface.setItem(key, itemStr);
    }
  }

  function remove() {
    storageInterface.removeItem(key);
  }

  function clear() {
    // Clear both session and browser storage
    localStorage.clear();
    sessionStorage.clear();
  }

  return { get, set, remove, clear };
}
