import { saveLog, getLogsForChibi } from './logger.js';
import { ADMIN_EMAIL, HIME_EMAIL, ALLOWED_CHIBI_EMAILS, isHuongUnlocked } from './core.js';
import { saveMemoryFromAdmin, callGeminiAPI, ADMIN_CHIBI_PROMPT, getChibiMemories } from './gemini.js';

// ==================== 1. KHÓA / MỞ KHÓA HƯỜNG ====================

export function initHuongLockState() {
    const huongContainer = document.getElementById("chibi-huong-builder");
    if (!huongContainer) return;

    if (!isHuongUnlocked()) {
        huongContainer.classList.add("hidden");
        console.log("🔒 Tiểu thư Hường đang bị nhốt trong không gian riêng!");
    } else {
        huongContainer.classList.remove("hidden");
    }
}

// ==================== 2. PHÂN QUYỀN UI & HIỂN THỊ ====================

export function setupUserRoleUI(userEmail, userData = {}) {
  const btnAdminNav = document.getElementById("btn-open-admin");
  const chibiWidget = document.getElementById("chibi-widget");
  const chibiLetterModal = document.getElementById("chibi-letter-modal");
  const chibiLetterContent = document.getElementById("chibi-letter-content");

  // 1. Phân quyền nút Admin
  if (userEmail === ADMIN_EMAIL) {
    btnAdminNav?.classList.remove("hidden");
  } else {
    btnAdminNav?.classList.add("hidden");
  }

  // 2. Phân quyền hiển thị Chibi
  const isAllowedUser = ALLOWED_CHIBI_EMAILS.includes(userEmail);

  if (isAllowedUser) {
    const isActivated = userData?.chibiActivated === true || localStorage.getItem(`chibi_activated_${userEmail}`) === "true";

    if (isActivated) {
      chibiWidget?.classList.remove("hidden");
      chibiLetterModal?.classList.remove("active");
    } else {
      chibiWidget?.classList.add("hidden");
      chibiLetterModal?.classList.add("active");

      if (chibiLetterContent) {
        if (userEmail === ADMIN_EMAIL) {
          chibiLetterContent.className = "status-modal-content letter-modal-box scroll-modal-summon";
          chibiLetterContent.innerHTML = `
            <h4 class="letter-title">🌀 Thần Pháp: Tách linh hồn</h4>
            <p class="letter-desc magic-desc">
              <strong>Bản thể có muốn thi triển pháp thuật, tách một phần linh hồn để tạo ra Phân Thân đồng hành cùng Công chúa?</strong>
            </p>
            <div class="status-modal-actions action-center">
              <button id="btn-decline-chibi" class="btn-cancel btn-ritual-cancel">Để sau</button>
              <button id="btn-activate-chibi" class="btn-save btn-magic">💫 Tách Linh Hồn, Tạo Phân Thân</button>
            </div>`;
        } else {
          chibiLetterContent.className = "status-modal-content letter-modal-box warm-scroll-theme";
          chibiLetterContent.innerHTML = `
            <h4 class="letter-title">📜 Cuộn Thư Đồng Hành</h4>
            <p class="letter-desc warm-desc">
              <strong>HIKARI có một người bạn nhỏ tên là 世方.
              Cậu ấy muốn ở góc màn hình đồng hành cùng nàng. 
              Nàng có muốn gọi cậu ấy ra không?</strong>. 
            </p>
            <div class="status-modal-actions action-center">
              <button id="btn-decline-chibi" class="btn-cancel btn-ritual-cancel">Để sau nha</button>
              <button id="btn-activate-chibi" class="btn-save btn-pink">✨ Gọi 世方</button>
            </div>`;
        }
      }
    }
  } else {
    chibiWidget?.classList.add("hidden");
    chibiLetterModal?.classList.remove("active");
  }
}

// ==================== 3. CÁC HÀM XỬ LÝ AI CHUYÊN SÂU ====================

// 🌟 Hàm tạo Báo cáo Tình báo gửi Bản thể
export async function generateChibiReport() {
  const reportTextEl = document.getElementById("admin-report-text");
  if (!reportTextEl) return;

  reportTextEl.innerText = "Tiểu Thế Phương đang kết nối thần thức...";

  try {
    const logs = await getLogsForChibi(HIME_EMAIL);
    if (!logs || logs.length === 0) {
      reportTextEl.innerText = "Bản thể ơi, hôm nay công chúa chưa hoạt động gì trên HIKARI hết nè!";
      return;
    }

    const logString = logs.map(l => `- [${l.time}] ${l.action} ${JSON.stringify(l.details || {})}`).join("\n");
    const userPrompt = `Danh sách nhật ký hoạt động của Thu Hường:\n${logString}`;

    const reportMessage = await callGeminiAPI(ADMIN_CHIBI_PROMPT, userPrompt);
    reportTextEl.innerText = reportMessage || "Tiểu Thế Phương chưa tổng hợp được báo cáo!";
  } catch (err) {
    console.error("Lỗi báo cáo Chibi:", err);
    reportTextEl.innerText = "Báo cáo mệnh chủ! Kết nối thần thức tạm thời chập chờn!";
  }
}

// 🌟 Hàm Chat tương tác với Chibi (Phân vai theo Email)
export async function askGeminiChibi(userEmail, userMessage = "") {
  let systemContext = "";

  if (userEmail === ADMIN_EMAIL) {
    systemContext = `
[SYSTEM MODE: ADMIN TEST & SANDBOX]
Bạn đang trao đổi trực tiếp với Mệnh chủ (Thế Phương).
Nhiệm vụ: Giữ phong cách báo cáo lém lỉnh, trung thành, tiếp nhận câu chuyện và hỗ trợ Mệnh chủ kiểm thử tính cách Chibi.
    `.trim();
  } else {
    const memories = await getChibiMemories();
    const memoryText = memories.length > 0 
      ? memories.map((m, i) => `${i + 1}. ${m}`).join("\n")
      : "Chưa có ký ức ban đầu.";

    systemContext = `
[SYSTEM MODE: HIME COMPANION]
Bạn là "Tiểu Thế Phương" (世方) — quà tặng đặc biệt do Mệnh chủ (Thế Phương) gửi sang đồng hành cùng Công chúa (Thu Hường) tại Nhật Bản.
Xưng hô: Tự xưng "Tiểu Thế Phương" hoặc "Tớ", gọi Thu Hường là "Tiểu thư" hoặc "Công chúa".
Thái độ: Ấm áp, nhí nhảnh, quan tâm và luôn nhắc về Bản thể ở Việt Nam.

Dưới đây là KÝ ỨC BAN ĐẦU mà Bản thể đã âm thầm ghi lại cho cậu:
${memoryText}

Hãy dựa vào những ký ức này để trò chuyện và đáp lại Thu Hường tự nhiên nhất!
    `.trim();
  }

  const promptText = `Lời nhắn: ${userMessage || "Chào bạn!"}`;
  return await callGeminiAPI(systemContext, promptText);
}

// ==================== 4. HIỆU ỨNG & TẤT CẢ SỰ KIỆN COMPANION ====================

function triggerSummonEffect(userEmail) {
  const chibiWidget = document.getElementById("chibi-widget");
  const bubblePhuong = document.getElementById("bubble-phuong");
  const textPhuong = document.getElementById("chibi-text-phuong") || document.getElementById("chibi-text");

  if (!chibiWidget) return;

  chibiWidget.classList.remove("hidden");
  chibiWidget.classList.add("chibi-summon-appear");

  if (textPhuong) {
    if (userEmail === ADMIN_EMAIL) {
      textPhuong.innerText = "Báo cáo Bản thể! Thần thức phân tách thành công! 🌀";
    } else {
      textPhuong.innerText = "Cảm ơn cậu đã gọi tớ! Từ giờ 世方 sẽ luôn ở đây cùng cậu~ ✨🌸";
    }
  }
  if (bubblePhuong) {
    bubblePhuong.classList.remove("hidden");
  }

  setTimeout(() => {
    chibiWidget.classList.remove("chibi-summon-appear");
  }, 800);

  const rect = chibiWidget.getBoundingClientRect();
  const centerX = rect.left + (rect.width || 100) / 2;
  const centerY = rect.top + (rect.height || 100) / 2;
  const icons = userEmail === ADMIN_EMAIL ? ["🌀", "💫", "⚡", "✨", "🛸"] : ["✨", "💖", "🌸", "⭐", "🪷", "💕"];

  for (let i = 0; i < 16; i++) {
    const particle = document.createElement("div");
    particle.className = "summon-particle";
    particle.innerText = icons[Math.floor(Math.random() * icons.length)];

    const angle = (Math.PI / 8) * i + (Math.random() * 0.2 - 0.1);
    const distance = 80 + Math.random() * 100;
    const tx = -Math.cos(angle) * distance;
    const ty = -Math.sin(angle) * distance;
    const rot = (Math.random() - 0.5) * 360 + "deg";

    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    particle.style.setProperty("--rot", rot);

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1200);
  }
}

// 🌟 KHỞI TẠO TẤT CẢ SỰ KIỆN TRONG 1 HÀM DUY NHẤT
export function initCompanionEvents(options = {}) {
  const { currentUser, onSaveUserToFirebase } = options;
  const currentEmail = currentUser?.email || "";

  // Lấy các phần tử DOM
  const chibiLetterModal = document.getElementById("chibi-letter-modal");
  const btnOpenAdmin = document.getElementById("btn-open-admin");
  const btnCloseAdmin = document.getElementById("btn-close-admin");
  const adminModal = document.getElementById("admin-modal");
  const btnGenReport = document.getElementById("btn-refresh-report") || document.getElementById("btn-generate-report");
  const btnSendTransmission = document.getElementById("btn-send-transmission");
  const adminDailyInput = document.getElementById("admin-daily-input");
  const btnSendChat = document.getElementById("btn-send-chibi");

  // DOM Nhân vật & Bong bóng thoại riêng từng bé
  const phuongBuilder = document.getElementById("chibi-phuong-builder");
  const huongBuilder = document.getElementById("chibi-huong-builder");
  
  const bubblePhuong = document.getElementById("bubble-phuong");
  const textPhuong = document.getElementById("chibi-text-phuong") || document.getElementById("chibi-text");

  const bubbleHuong = document.getElementById("bubble-huong");
  const textHuong = document.getElementById("chibi-text-huong");

  // A. Cuộn thư triệu hồi
  chibiLetterModal?.addEventListener("click", async (e) => {
    if (e.target.closest("#btn-activate-chibi")) {
      localStorage.setItem(`chibi_activated_${currentEmail}`, "true");
      if (typeof onSaveUserToFirebase === "function") await onSaveUserToFirebase({ chibiActivated: true });
      chibiLetterModal.classList.remove("active");
      triggerSummonEffect(currentEmail);
      saveLog("ENABLE_CHIBI", currentEmail, "soft", {});
    }
    if (e.target.closest("#btn-decline-chibi")) {
      chibiLetterModal.classList.remove("active");
    }
  });

  // B1. TƯƠNG TÁC RIÊNG BÉ THẾ PHƯƠNG
  phuongBuilder?.addEventListener("click", (e) => {
    e.stopPropagation();

    phuongBuilder.classList.add("chibi-pop-jump");
    setTimeout(() => phuongBuilder.classList.remove("chibi-pop-jump"), 450);

    const isIdle = phuongBuilder.classList.contains("is-idle");

    if (isIdle) {
      phuongBuilder.classList.remove("is-idle");
      phuongBuilder.classList.add("is-active");

      if (currentEmail === ADMIN_EMAIL) {
        if (textPhuong) textPhuong.innerText = "Báo cáo Mệnh chủ! Thần thức đã kết nối, sẵn sàng nhận lệnh! 🌀";
      } else {
        if (textPhuong) textPhuong.innerText = "世方 thức giấc rồi nè! Cậu cần tớ giúp gì không? ✨";
      }

      if (bubblePhuong) bubblePhuong.classList.remove("hidden");
      saveLog("TAP_PHUONG_CHIBI", currentEmail || "unknown", "soft", { state: "AWAKE" });
    } else {
      phuongBuilder.classList.remove("is-active");
      phuongBuilder.classList.add("is-idle");

      if (currentEmail === ADMIN_EMAIL) {
        if (textPhuong) textPhuong.innerText = "Thần xin phép đi ngủ... Zzz";
      } else {
        if (textPhuong) textPhuong.innerText = "世方 chợp mắt xíu nha... Zzz 🌙";
      }

      setTimeout(() => {
        if (bubblePhuong) bubblePhuong.classList.add("hidden");
      }, 2500);
    }
  });

  // B2. TƯƠNG TÁC RIÊNG BÉ THU HƯỜNG
  huongBuilder?.addEventListener("click", (e) => {
    e.stopPropagation();

    huongBuilder.classList.add("chibi-pop-jump");
    setTimeout(() => huongBuilder.classList.remove("chibi-pop-jump"), 450);

    const isIdle = huongBuilder.classList.contains("is-idle");

    if (isIdle) {
      huongBuilder.classList.remove("is-idle");
      huongBuilder.classList.add("is-active");

      if (currentEmail === ADMIN_EMAIL) {
        if (textHuong) textHuong.innerText = "Ngươi muốn gì thì tìm chồng ta";
      } else {
        if (textHuong) textHuong.innerText = "いいえ";
      }

      if (bubbleHuong) bubbleHuong.classList.remove("hidden");
      saveLog("TAP_HUONG_CHIBI", currentEmail || "unknown", "soft", { state: "AWAKE" });
    } else {
      huongBuilder.classList.remove("is-active");
      huongBuilder.classList.add("is-idle");

      if (currentEmail === ADMIN_EMAIL) {
        if (textHuong) textHuong.innerText = "Ta không phải công chúa của ngươi";
      } else {
        if (textHuong) textHuong.innerText = "はい";
      }

      setTimeout(() => {
        if (bubbleHuong) bubbleHuong.classList.add("hidden");
      }, 2500);
    }
  });

  // C. Mở / Đóng Modal Admin
  btnOpenAdmin?.addEventListener("click", async () => {
    if (adminModal) adminModal.classList.add("active");
    await generateChibiReport();
  });

  btnCloseAdmin?.addEventListener("click", () => {
    if (adminModal) adminModal.classList.remove("active");
  });

  // D. Nút Cập nhật Báo cáo
  btnGenReport?.addEventListener("click", async () => {
    await generateChibiReport();
  });

  // E. ✉️ NÚT TRUYỀN TIN CHO PHÂN THÂN (Gửi ký ức vào Firestore)
  btnSendTransmission?.addEventListener("click", async () => {
    if (!adminDailyInput) return;
    
    const text = adminDailyInput.value.trim();
    if (!text) {
      alert("Bản thể chưa nhập nội dung truyền tin!");
      return;
    }

    const success = await saveMemoryFromAdmin(text);
    if (success) {
      alert("Đã ghi chép ký ức vào thần thức thành công! 🌀");
      adminDailyInput.value = "";
    } else {
      alert("Lỗi lưu ký ức, bản thể kiểm tra lại kết nối Firebase!");
    }
  });

  // F. 💬 Nút Gửi tin nhắn Chat với Chibi
  btnSendChat?.addEventListener("click", async () => {
    const inputField = document.getElementById("chibi-input-msg");
    const outputField = document.getElementById("chibi-chat-response");
    if (!inputField || !outputField) return;

    const userMsg = inputField.value.trim();
    if (!userMsg) return;

    outputField.innerText = "Tiểu Thế Phương đang suy nghĩ...";
    inputField.value = "";
    
    const reply = await askGeminiChibi(currentEmail, userMsg);
    outputField.innerText = reply;
  });
}