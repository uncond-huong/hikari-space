import { isHuongUnlocked } from '../companion/core.js';
// Hàm render riêng cho Hường
export function renderChibiHuongOutfit(newOutfitState) {
    // 🔒 KHÓA NGAY NẾU CHƯA ĐẠT ĐIỀU KIỆN
    if (!isHuongUnlocked()) {
        const huongContainer = document.getElementById("chibi-huong-builder");
        if (huongContainer) {
            huongContainer.classList.add("hidden"); // Hoặc thêm class khóa
        }
        return; 
    }

    // Nếu đã mở khóa thì cho phép hiện container và chạy logic render bình thường y hệt của Phương...
    const container = document.getElementById("chibi-huong-builder");
    if (container) container.classList.remove("hidden");

    // ... (logic thay đổi layer, base-body, full-set của Hường tương tự Phương)
}

// ==========================================
// 1. KHAI BÁO ITEMS & ĐIỀU KIỆN KEY ITEM
// ==========================================
export const CLOSET_ITEMS = {
    head: {
        DEFAULT: "./assets/phuong/head/base-head.png",
        SHOUYUE: "./assets/phuong/head/long.png",
        TWINTAIL: "./assets/phuong/head/short.png"
    },
    top: {
        DEFAULT: "./assets/phuong/top/default.png",
        SHOUYUE_COAT: "./assets/phuong/top/shouyue_coat.png",
        HOODIE: "./assets/phuong/top/hoodie.png"
    },
    bottom: {
        DEFAULT: "./assets/phuong/bottom/default.png",
        JEANS: "./assets/phuong/bottom/jeans.png"
    },
    shoes: {
        DEFAULT: "./assets/phuong/shoes/default.png",
        SNEAKERS: "./assets/phuong/shoes/sneakers.png"
    },
    acc: {
        DEFAULT: "./assets/phuong/acc/bear.png",
        SNIPER: "./assets/phuong/acc/sniper.png", // Món Key Item súng
        NONE: ""
    },
    head: { DEFAULT: "" },
    leftArm: { DEFAULT: "" },
    rightArm: { DEFAULT: "" },
    leftLeg: { DEFAULT: "" },
    rightLeg: { DEFAULT: "" },
    tail: { 
        DEFAULT: "", 
        TAIL_LEOPARD: "./assets/phuong/tail/tail_leopard.png"
    },
    pets: { 
        DEFAULT: "",
        SNOW_LEOPARD: "./assets/phuong/pets/snow_leopard.png"
    },
    habitat: {
        DEFAULT: "",
        ICE_PLATFORM: "./assets/phuong/habitat/ice_platform.png" 
    }
};

// Cấu hình điều kiện tiên quyết cho các món Key Item
export const ITEM_RULES = {
    "SNIPER": {
        requires: ["SHOUYUE", "SHOUYUE_COAT", "JEANS", "SNEAKERS"], // Ví dụ kiểm tra các slot: hair, top, bottom, shoes
        lockNotice: "Tiểu thư ơi! Phải mặc đủ bộ trang phục Báo Tuyết thì mới nhấc nổi cây súng này nha! ❄️"
    },
    "SNOW_LEOPARD": {
        requires: ["SHOUYUE", "SHOUYUE_COAT", "JEANS", "SNEAKERS", "TAIL_LEOPARD"],
        lockNotice: "Bé báo tuyết chỉ đi theo khi cậu mặc đúng bộ đồ Báo Tuyết thui đó nghen! 🐾"
    }
};

// 2. ĐỒ ĐANG MẶC (Lưu dạng key của CLOSET_ITEMS)
let currentOutfit = {
    head: "DEFAULT",
    top: "DEFAULT",
    bottom: "DEFAULT",
    shoes: "DEFAULT",
    acc: "DEFAULT",
    head: "DEFAULT",
    leftArm: "DEFAULT",
    rightArm: "DEFAULT",
    leftLeg: "DEFAULT",
    rightLeg: "DEFAULT",
    tail: "DEFAULT",
    pets: "DEFAULT",
    habitat: "DEFAULT"
};

// 3. FULL SET CONDITION (Đủ bộ sẽ kích hoạt pose nằm ngắm bắn hoành tráng)
const FULL_SETS = {
    "shouyue_sniper_set": {
        // Điều kiện: Phải gom đủ Tóc, Áo, Súng, Pet con báo và Địa hình băng giá!
        condition: (outfit) => 
            outfit.head === "SHOUYUE" && 
            outfit.top === "SHOUYUE_COAT" && 
            outfit.bottom === "JEANS" &&
            outfit.shoes === "SNEAKERS" &&
            outfit.acc === "SNIPER" &&
            outfit.tail === "TAIL_LEOPARD" &&
            outfit.pets === "SNOW_LEOPARD" &&
            outfit.habitat === "ICE_PLATFORM",
        
        // Ảnh Full Set chứa trọn gói: Chibi + Súng + Báo + Bệ băng
        poseImage: "./assets/phuong/pose/shouyue_full_set_pose.png"
    }
};

// Hàm hiển thị bóng thoại thông báo cho Chibi
function showChibiBubbleNotice(text) {
    let chibiBubble = document.getElementById("chibi-bubble");
    let chibiText = document.getElementById("chibi-text");
    
    if (chibiText) chibiText.innerText = text;
    if (chibiBubble) {
        chibiBubble.classList.remove("hidden");
        setTimeout(() => chibiBubble.classList.add("hidden"), 3000);
    }
}

/* 4. HÀM TỰ ĐỘNG XỬ LÝ RENDER VÀ POSE OVERRIDE */
export function renderChibiOutfit(newOutfitState, characterId = 'phuong') {
    if (newOutfitState) {
        // Kiểm tra logic Key Item trước khi cho phép thay đổi state
        for (const slot in newOutfitState) {
            const itemId = newOutfitState[slot];
            if (ITEM_RULES[itemId]) {
                const rule = ITEM_RULES[itemId];
                // Kiểm tra xem đã thỏa mãn các món yêu cầu chưa
                const isSatisfied = rule.requires.every(reqItem => {
                    return Object.values(currentOutfit).includes(reqItem);
                });

                if (!isSatisfied) {
                    showChibiBubbleNotice(rule.lockNotice);
                    return; // Chặn không cho mặc món này!
                }
            }
        }

        // Nếu hợp lệ, tiến hành cập nhật đồ
        currentOutfit = { ...currentOutfit, ...newOutfitState };
    }

    const container = document.getElementById(`chibi-${characterId}-builder`);
    if (!container) return;

    // Kiểm tra xem có kích hoạt Full Set nào không (VD: Nằm ngắm bắn)
    let activeFullPoseImg = null;
    for (const setId in FULL_SETS) {
        if (FULL_SETS[setId].condition(currentOutfit)) {
            activeFullPoseImg = FULL_SETS[setId].poseImage;
            break;
        }
    }

    // Xử lý hiển thị Full Set Pose nếu đủ bộ
    let fullSetLayer = document.getElementById(`${characterId}-full-pose`);
    if (!fullSetLayer) {
        // Nếu trong HTML chưa có thẻ chứa full pose thì tự tạo động đè lên trên cùng
        fullSetLayer = document.createElement("img");
        fullSetLayer.id = `${characterId}-full-pose`;
        fullSetLayer.className = "chibi-layer z-fullset";
        container.appendChild(fullSetLayer);
    }

    if (activeFullPoseImg) {
        // 💥 ĐỦ BỘ FULL SET -> Ẩn hết các layer rời, bật ảnh pose đặc biệt lên
        fullSetLayer.src = activeFullPoseImg;
        fullSetLayer.classList.remove("hidden");

        const allLayers = container.querySelectorAll(".chibi-layer:not([id$='-full-pose'])");
        allLayers.forEach(el => el.classList.add("hidden"));
        return; // Dừng luôn không cần render layer lẻ nữa
    } else {
        // 🔄 CHƯA ĐỦ BỘ -> Ẩn ảnh full set đi, render theo layer lẻ bình thường
        fullSetLayer.classList.add("hidden");
    }

    // Ánh xạ DOM các bộ phận lẻ
    const elements = {
        head: document.getElementById(`${characterId}-hair`),
        top: document.getElementById(`${characterId}-top`),
        bottom: document.getElementById(`${characterId}-bottom`),
        shoes: document.getElementById(`${characterId}-shoes`),
        acc: document.getElementById(`${characterId}-acc`),
        head: document.getElementById(`${characterId}-head`),
        leftArm: document.getElementById(`${characterId}-left-arm`),
        rightArm: document.getElementById(`${characterId}-right-arm`),
        leftLeg: document.getElementById(`${characterId}-left-leg`),
        rightLeg: document.getElementById(`${characterId}-right-leg`),
        tail: document.getElementById(`${characterId}-tail`),
        pets: document.getElementById(`${characterId}-pets`),
        habitat: document.getElementById(`${characterId}-habitat`)
    };

    // Gán src cho từng bộ phận
    Object.keys(elements).forEach(key => {
        const el = elements[key];
        if (el && CLOSET_ITEMS[key] && CLOSET_ITEMS[key][currentOutfit[key]] !== undefined) {
            el.src = CLOSET_ITEMS[key][currentOutfit[key]];
        }
    });

    // Tự động ẩn/hiện Base Body
    const baseBodyImg = document.getElementById(`${characterId}-base`);
    const isWearingCustom = Object.entries(currentOutfit).some(([slot, val]) => {
        if (slot === 'acc' && val === 'NONE') return false;
        return val !== "DEFAULT";
    });

    const componentLayers = container.querySelectorAll(`.chibi-layer:not([id$="-base"]):not([id$="-full-pose"])`);

    if (isWearingCustom) {
        if (baseBodyImg) baseBodyImg.classList.add("hidden");
        componentLayers.forEach(layer => layer.classList.remove("hidden"));
    } else {
        if (baseBodyImg) baseBodyImg.classList.remove("hidden");
        componentLayers.forEach(layer => layer.classList.add("hidden"));
    }
}

/* 5. HÀM ĐỒNG BỘ TỪ FIREBASE */
export function syncChibiFromFirebase(dataFromFirebase) {
    if (dataFromFirebase && dataFromFirebase.outfit) {
        renderChibiOutfit(dataFromFirebase.outfit, 'phuong');
    }
}