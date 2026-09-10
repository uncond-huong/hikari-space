//1. JavaScript code to update the clock every second

function updateClock() {
    const now = new Date();
    const vnTimeStr = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const jpTimeStr = now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById('vn-time').innerText = vnTimeStr;
    document.getElementById('jp-time').innerText = jpTimeStr;
}   

setInterval(updateClock, 1000);
updateClock(); // Initial call to display the time immediately

//2. JavaScript code progress bar

function updateProgressBar() {
    const startDate = new Date(2026, 8, 9).getTime();
    const endDate = new Date(2026, 11, 31).getTime();
    const now = new Date().getTime();

    const totalDuration = endDate - startDate;
    const elapsedDuration = now - startDate;

    let percentage = (elapsedDuration / totalDuration) * 100;
    
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    const formattedPercent = percentage.toFixed(2) + '%';
    
    const progressBarFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (progressBarFill) progressBarFill.style.width = formattedPercent;
    if (progressText) progressText.innerText = formattedPercent;
}

updateProgressBar();

//3. Popup & Feed

const modal = document.getElementById('post-modal'); //Tìm giá trị trong HTML
const btnCloseModal = document.getElementById('btn-close-modal'); //Tìm giá trị trong HTML
const btnSubmitPost = document.getElementById('btn-submit-post'); //Tìm giá trị trong HTML
const fileInput = document.getElementById('post-input-file'); //Tìm giá trị trong HTML
const previewBox = document.getElementById('image-preview'); //Tìm giá trị trong HTML
const textInput = document.getElementById('post-input-text'); //Tìm giá trị trong HTML
const feedContainer = document.querySelector('.feed-container'); //Tìm giá trị trong CSS
let selectedImageBase64 = ''; //Biến tạm chứa dữ liệu ảnh
//3.1 Mở Modal đăng bài
function openPostModal() {
    if(modal) modal.classList.add('active');
}
//3.2 Đóng Modal đăng bài và dọn dẹp
function closePostModal() {
    if(modal) modal.classList.remove('active');
    textInput.value = '';
    fileInput.value = '';
    previewBox.innerHTML = '';
    selectedImageBase64 = '';
}
//3.3 Bắt sự kiện bấm nút ❌ để đóng popup
if(btnCloseModal) btnCloseModal.addEventListener('click', closePostModal);
// Gán sự kiện mở popup cho nút Camera/Nút đăng bài ở Menu đáy
const addBtn = document.querySelector('.add-btn');
if(addBtn) addBtn.addEventListener('click', openPostModal);
//3.4 Đọc và hiển thị ảnh xem trước ngay khi vừa chọn file
if(fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                selectedImageBase64 = event.target.result;
                previewBox.innerHTML = `<img src="{selectedImageBase64}" alt="Preview"`;             
                previewBox.innerHTML = `<img src="{selectedImageBase64}" alt="Preview">`;             
            };
            reader.readAsDataURL(file);
        }
    });
}
//3.5 Xử lý khi bấm nút "Đăng bài"
if(btnSubmitPost) {
    btnSubmitPost.addEventListener('click', function() {
        const content = textInput.value.trim();
        if (!content && !selectedImageBase64) {
            alert('Phương ơi, hãy gõ nội dung hoặc chọn một tấm ảnh nhé!');
            return;
        }
        //3.5.1 Khung chứa ảnh (nếu người dùng có chọn ảnh)
        const imageHTML = selectedImageBase64
        ? '<div class="post-img-box" style="margin-top:10px;"><img src="${selectedImageBase64}" style="width:100%; border-radius:12px;"></div>'
        : '';
        //3.5.2 Đúc thẻ bài đăng mới
        const newPostCard = document.createElement('div');
        newPostCard.className = 'post-card';
        newPostCard.innerHTML = `
            <div class="post-user"
                <div class="user-avatar">🙍‍♂️</div>
                <div class="user-meta">
                    <span class="user-name">Ouji</span>
                    <span class="post-time">2 giờ trước</span>
                </div>
            </div>
            <div class="post-body">
                <p style="margin:0; line-height:1.4;">${content}</p>
                ${imageHTML}
            </div>
            <div class="post-footer" style="margin-top:12px; display: flex; gap:8px;">
                <button style="border:none; background: #FDE9EE; padding: 4px 10px; border-radius:8px; font-size: 0.8rem;">❤️ 0</button>
                <button style="border:none; background: #E8F3E6; padding: 4px 10px; border-radius:8px; font-size: 0.8rem;">💬 0</button>
            </div>
        `;
        //3.5.3 Đẩy bài viết mới lên ĐẦU danh sách Bảng tin
        const firstPost = feedContainer.querySelector('.post-card');
        if (firstPost) {
            feedContainer.insertBefore(newPostCard, firstPost);
        } else {
            feedContainer.appendChild(newPostCard);
        }
        //3.5.4 Đóng popup
        closePostModal();
    })
}

//4. Xử lý chuyển tab & cập nhật trạng thái footer

const navItems = document.querySelectorAll('.bottom-nav .nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        //Nếu là nút Đăng bài (mở Popup) thì không đổi Tab active
        if (this.id === 'btn-open-post') return;
        //Bỏ class 'active' của tất cả nút
        navItems.forEach(nav => nav.classList.remove('active'));
        //Thêm class 'active vào đúng nút vừa thao tác
        this.classList.add('active');
        //Lấy tên khu vực cần hiển thị từ data-target
        const targetSectionId = this.getAttribute('data-target')
        //Tăng số lượng trang thì dùng targetSectionId để ẩn/hiện trang tương ứng
        console.log("Đã chuyển sang tab:", targetSectionId);
    });
});