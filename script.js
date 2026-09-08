// JavaScript code to update the clock every second

function updateClock() {
    const now = new Date();
    const vnTimeStr = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const jpTimeStr = now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById('vn-time').innerText = vnTimeStr;
    document.getElementById('jp-time').innerText = jpTimeStr;
}   

setInterval(updateClock, 1000);
updateClock(); // Initial call to display the time immediately

// JavaScript code progress bar

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