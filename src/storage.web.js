// Web: usa localStorage
export const getItem = async (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

export const setItem = async (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
