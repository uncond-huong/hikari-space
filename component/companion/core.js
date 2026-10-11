// Cấu hình Email phân quyền
export const ADMIN_EMAIL = "phuong@hikari.com";
export const HIME_EMAIL = "huongsoft@hikari.com";
export const ALLOWED_CHIBI_EMAILS = [ADMIN_EMAIL, HIME_EMAIL, "phuong.sandbox@hikari.com", "huong.test@hikari.com"];

// Kiểm tra tài khoản Sandbox/Test toàn cục
export function isSandboxAccount(email) {
    if(!email) return false;
    return email.includes("test") || email.includes("sandbox");
}

// Kiểm tra xem Tiểu thư Hường đã được mở khóa chưa
export function isHuongUnlocked() {
    // Có thể check localStorage hoặc điều kiện đặc biệt nào đó (ví dụ: hoàn thành nhiệm vụ, nhập mật mã, v.v.)
    // return localStorage.getItem("huong_unlocked") === "true";
    return true;
}

// Hàm mở khóa Hường (gọi khi đạt điều kiện)
export function unlockHuong() {
    localStorage.setItem("huong_unlocked", "true");
}

// Trạng thái đồ đang mặc hiện tại
export const activeEquippedState = {
  phuong: { top: null, bottom: null, shoes: null, head: null, arms: null, legs: null, acc: null, pets: null, habitat: null },
  huong: { top: null, bottom: null, shoes: null, head: null, arms: null, legs: null, acc: null, pets: null, habitat: null }
};