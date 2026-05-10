import { apiUrl } from "./api";

const TOKEN_KEY = "tvwandem_token";
export const ADMIN_SHORTCUT_KEY = "tvwandem_admin_shortcut";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdminShortcutVisible(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_SHORTCUT_KEY) === "1";
}

export function setAdminShortcutVisible(visible: boolean) {
  localStorage.setItem(ADMIN_SHORTCUT_KEY, visible ? "1" : "0");
  window.dispatchEvent(new Event("tvwandem-admin-shortcut-change"));
}

export async function authFetch(path: string, init?: RequestInit) {
  const token = getToken();
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

export async function authUpload(file: File) {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  return fetch(apiUrl("/upload"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
}
