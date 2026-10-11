// Cấu hình Email phân quyền
export const ADMIN_EMAIL = "phuong@hikari.com";
export const HIME_EMAIL = "huongsoft@hikari.com";
export const ALLOWED_CHIBI_EMAILS = [ADMIN_EMAIL, HIME_EMAIL, "phuong.sandbox@hikari.com", "huong.test@hikari.com"];

// Kiểm tra tài khoản Sandbox/Test toàn cục
export function isSandboxAccount(email) {
    if(!email) return false;
    return email.includes("test") || email.includes("sandbox");
}

// core.js

// 1. Kiểm tra xem Hường đã mở khóa chưa
export function isHuongUnlocked() {
    return localStorage.getItem("huong_unlocked") === "true";
}

// 2. Mở khóa Hường
export function unlockHuong() {
    localStorage.setItem("huong_unlocked", "true");
}

// 3. Khóa Hường lại
export function lockHuong() {
    localStorage.setItem("huong_unlocked", "false");
}

// Trạng thái đồ đang mặc hiện tại
export const activeEquippedState = {
  phuong: { top: null, bottom: null, shoes: null, head: null, arms: null, legs: null, acc: null, pets: null, habitat: null },
  huong: { top: null, bottom: null, shoes: null, head: null, arms: null, legs: null, acc: null, pets: null, habitat: null }
};