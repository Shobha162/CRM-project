
export const getItemFromStore = (key, store = localStorage) => {
  const item = store.getItem(key);
  try {
    return item && item !== "undefined" && item !== "null"
      ? JSON.parse(item)
      : null;
  } catch (err) {
    console.error(`Error parsing item from ${store === localStorage ? "localStorage" : "sessionStorage"} for key "${key}":`, err);
    return null;
  }
};
export const setItemToStore = (key, payload, store = localStorage) => {
  try {
    if (payload !== undefined) {
      store.setItem(key, JSON.stringify(payload));
    }
  } catch (err) {
    console.error(`Error setting item to ${store === localStorage ? "localStorage" : "sessionStorage"} for key "${key}":`, err);
  }
};
export const removeItemFromStore = (key, store = localStorage) => {
  try {
    store.removeItem(key);
  } catch (err) {
    console.error(`Error removing item from ${store === localStorage ? "localStorage" : "sessionStorage"} for key "${key}":`, err);
  }
};
