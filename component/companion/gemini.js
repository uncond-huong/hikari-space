import { db, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from '../../firebase.js';
import { ADMIN_EMAIL, HIME_EMAIL, isSandboxAccount } from './core.js';
import { getLogsForChibi } from './logger.js'; //

export const ADMIN_CHIBI_PROMPT = `
Bạn là "Tiểu Thế Phương" (世方) — phân thân Chibi đang ở trạng thái báo cáo tình báo/thần thức cho "Mệnh chủ" (chủ nhân Thế Phương).
Nhiệm vụ: Tổng hợp nhật ký của Công chúa Thu Hường thành báo cáo hóm hỉnh gửi Bản thể.
`;

export async function callGeminiAPI(systemInstruction, userPrompt, userEmail = "") {
  // 🛡️ Nếu là tài khoản test/sandbox gọi AI, trả về phản hồi giả lập, không tốn quota và không ghi nhận
  if (isSandboxAccount(userEmail)) {
    return "[Sandbox Mode]: Thần thức đang ở chế độ test, Tiểu Thế Phương không ghi nhận tương tác này đâu nhé!";
  }

  try {
    const res = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, prompt: userPrompt })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch (e) {
    console.warn("Chuyển sang dùng Local Key...", e);
  }

  const apiKey = window.GEMINI_KEY || "";
  if (!apiKey) return "Thiếu API Key!";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }]
      })
    });
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mất kết nối thần thức!";
  } catch (err) {
    console.error("Lỗi gọi Gemini:", err);
    return "Lỗi kết nối!";
  }
}

export async function saveMemoryFromAdmin(contentText, userEmail = ADMIN_EMAIL) {
  // 🛡️ Chặn ngay nếu dùng tài khoản sandbox để test lưu ký ức
  if (isSandboxAccount(userEmail)) {
    console.log("🛡️ Môi trường Sandbox: Bỏ qua lưu ký ức AI.");
    return true; 
  }

  try {
    await addDoc(collection(db, "memories"), {
      type: "STORY", sender: userEmail, content: contentText, timestamp: serverTimestamp()
    });
    return true;
  } catch (err) { return false; }
}

export async function getChibiMemories() {
  try {
    const q = query(collection(db, "memories"), orderBy("timestamp", "desc"), limit(25));
    const snapshot = await getDocs(q);
    const memories = [];
    snapshot.forEach(doc => memories.push(doc.data().content));
    return memories.reverse();
  } catch (err) { return []; }
}

async function generateChibiReport() {
  const reportTextEl = document.getElementById("admin-report-text");
  if (!reportTextEl) return;
  
  reportTextEl.innerText = "Tiểu Thế Phương đang kết nối thần thức...";

  try {
    const logs = await getLogsForChibi(HIME_EMAIL);
    if (!logs || logs.length === 0) {
      reportTextEl.innerText = "Bản thể ơi, hôm nay công chúa chưa hoạt động gì trên HIKARI hết ạ!";
      return;
    }

    const logString = logs.map(l => `- [${l.time}] ${l.action} ${JSON.stringify(l.details || {})}`).join("\n");
    const userPrompt = `Danh sách nhật ký hoạt động của Thu Hường:\n${logString}`;

    // Gọi API qua hàm dùng chung
    const reportMessage = await callGeminiAPI(ADMIN_CHIBI_PROMPT, userPrompt);
    reportTextEl.innerText = reportMessage;

  } catch (err) {
    console.error("Lỗi báo cáo Chibi:", err);
    reportTextEl.innerText = "Báo cáo bản thể! Kết nối thần thức tạm thời chập chờn, vui lòng thử lại!";
  }
}

export async function askGeminiChibi(userEmail, userMessage = "") {
  let systemContext = "";

  if (userEmail === ADMIN_EMAIL) {
    systemContext = `
[SYSTEM MODE: ADMIN TEST & SANDBOX]
Bạn đang trao đổi trực tiếp với Mệnh chủ (Thế Phương).
Nhiệm vụ: Giữ phong cách báo cáo lém lỉnh, trung thành, tiếp nhận câu chuyện và hỗ trợ Bản thể kiểm thử tính cách Chibi.
    `.trim();
  } else {
    const memories = await getChibiMemories();
    const memoryText = memories.length > 0 
      ? memories.map((m, i) => `${i + 1}. ${m}`).join("\n")
      : "Chưa có ký ức ban đầu.";

    systemContext = `
[SYSTEM MODE: HIME COMPANION]
Bạn là "Tiểu Thế Phương" (世方) — quà tặng đặc biệt do Bản thể (Thế Phương) gửi sang đồng hành cùng Công chúa (Thu Hường) tại Nhật Bản.
Xưng hô: Tự xưng "Tiểu Thế Phương" hoặc "Tớ", gọi Thu Hường là "Tiểu thư" hoặc "Công chúa".
Thái độ: Ấm áp, nhí nhảnh, quan tâm và luôn nhắc về Bản thể ở Việt Nam.

Dưới đây là KÝ ỨC BAN ĐẦU mà Bản thể đã âm thầm ghi lại cho cậu:
${memoryText}

Hãy dựa vào những ký ức này để trò chuyện và đáp lại Thu Hường tự nhiên nhất!
    `.trim();
  }

  const promptText = `Lời nhắn: ${userMessage || "Chào bạn!"}`;
  return await callGeminiAPI(systemContext, promptText, userEmail); // Truyền thêm userEmail để check sandbox nếu cần
}
