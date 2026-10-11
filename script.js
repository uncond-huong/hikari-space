// ==========================================
// FILE CHÍNH KHỞI CHẠY HIKARI SPACE
// ==========================================

// script.js
import { buildClockTicks, updateClockWidget } from './component/clock/clock.js';
import { updateProgressBar } from './component/utils/helpers.js';
import { initAuth, setupProfileEvents } from './component/auth/auth.js';
import { setupStatusModalEvents, setupAvatarEvents, setupChangePasswordEvents } from './component/avatar/profile.js';
import { 
    setupCreatePostEvents, 
    setupCommentEvents, 
    listenToAllUsersRealtime, 
    listenToMomentsRealtime, 
    setupMomentUploadListener,
    listenToPostsRealtime
} from './component/post/post.js';

// 🌟 Import Logger
import { saveLog } from './component/companion/logger.js';

// 🌟 Import các module con của Chibi Companion
import { setupUserRoleUI, initCompanionEvents, initHuongLockState } from './component/companion/events.js';
import { equipItem } from './component/companion/wardrobe.js';
import { renderChibiOutfit } from './component/clone_chibi/chibi-builder.js';

// 1. Khởi tạo Đồng hồ Kép
function initClocks() {
    buildClockTicks('clock-face-vn');
    buildClockTicks('clock-face-jp');
    const tick = () => {
        updateClockWidget('vn', 'Asia/Ho_Chi_Minh');
        updateClockWidget('jp', 'Asia/Tokyo');
    };
    tick();
    setInterval(tick, 1000);
}

// 2. Chuyển Tab Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.id === 'btn-open-post') return;
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 3. Đồng bộ Outfit Chibi từ Firebase
export function syncChibiFromFirebase(data) {
    if (data && data.outfit) {
        renderChibiOutfit(data.outfit);
    }
}

// 🌟 4. Hàm toàn cục hỗ trợ mặc đồ từ giao diện tủ đồ
window.handleEquipItem = function(characterId, slot, itemImgUrl, itemId) {
    equipItem(characterId, slot, itemImgUrl, itemId);
};

// 5. Khởi chạy toàn bộ ứng dụng
document.addEventListener("DOMContentLoaded", () => {
    // A. Chạy UI cơ bản
    initClocks();
    updateProgressBar();
    setupNavigation();
    setupProfileEvents();

    // 🌟 Kích hoạt trạng thái khóa/mở của Hường ngay khi tải trang
    initHuongLockState();

    // B. Sự kiện đổi trạng thái, avatar & mật khẩu
    setupStatusModalEvents();     
    setupAvatarEvents();         
    setupChangePasswordEvents();  

    // C. Sự kiện Đăng bài & Bình luận
    setupCreatePostEvents();
    setupCommentEvents();
    setupMomentUploadListener();

    // D. Kích hoạt Xác thực hệ thống (Firebase Auth)
    initAuth((user, userData) => {
        console.log("Đã xác thực thành công:", user?.email);
        
        if (user && user.email) {
            // 🌟 1. Lưu Nhật ký Đăng nhập vào Firestore
            try {
                saveLog("LOGIN", user.email, "system", { note: "Đã truy cập HIKARI Space" });
            } catch (logErr) {
                console.warn("Chưa lưu được log nhưng vẫn duy trì phiên đăng nhập:", logErr);
            }

            // 🌟 2. Phân quyền UI (ẩn/hiện nút Admin 🌀 và Chibi theo Email)
            setupUserRoleUI(user.email, userData);

            // 🌟 3. Khởi tạo sự kiện Chibi & Admin Modal từ module events.js
            initCompanionEvents({
                currentUser: user,
                onSaveUserToFirebase: async (dataToUpdate) => {
                    // Cập nhật dữ liệu Firestore user document ở đây nếu cần
                }
            });
        }

        // 🌟 4. Sau khi xác thực thành công mới tải dữ liệu Realtime
        listenToAllUsersRealtime();
        listenToMomentsRealtime();
        listenToPostsRealtime();
    });

    // 🌟 Đã sửa: Cập nhật thời gian bài viết mỗi 60 giây (60000ms)
    setInterval(() => {
        listenToPostsRealtime();
    }, 60000);

    // E. PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log("HIKARI PWA sẵn sàng!"))
            .catch(err => console.warn("Lỗi PWA:", err));
    }
});