const tokenStorageKey = "flowforge.authToken";

export const getAuthToken = () => window.sessionStorage.getItem(tokenStorageKey);

export const setAuthToken = (token) =>
  window.sessionStorage.setItem(tokenStorageKey, token);

export const clearAuthToken = () =>
  window.sessionStorage.removeItem(tokenStorageKey);
