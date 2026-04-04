/***********************
 * 1. دالة تحويل الأرقام إلى هندية
 ***********************/
function toHindiNumbers(str) {
    if (str === null || str === undefined) return "";
    const hindiNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return str.toString().replace(/[0-9]/g, d => hindiNumbers[+d]);
}

/***********************
 * 2. طلب إذن إشعارات الويب
 ***********************/
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

/***********************
 * 3. إدارة الشاشات والتنقل
 ***********************/
const screens = {
    s1: document.getElementById('screen-1'),
    s2: document.getElementById('screen-2'),
    s3: document.getElementById('screen-3'),
    s4: document.getElementById('screen-4'),
    s5: document.getElementById('screen-5'),
    s6: document.getElementById('screen-6'),
    s7: document.getElementById('screen-7'),
    s8: document.getElementById('screen-8'),
    s9: document.getElementById('screen-9'),
    s10: document.getElementById('screen-10'),
    notif: document.getElementById('screen-notifications')
};

let loadingTimeout;

function showScreen(targetKey) {
    if (loadingTimeout) clearTimeout(loadingTimeout);

    Object.keys(screens).forEach(key => {
        if (screens[key]) screens[key].style.display = 'none';
    });

    if (screens[targetKey]) {
        const targetScreen = screens[targetKey];
        const blockScreens = ['s1', 's4', 's6', 'notif'];
        targetScreen.style.display = blockScreens.includes(targetKey) ? 'block' : 'flex';

        if (targetKey === 's1' || targetKey === 'notif') {
            document.body.style.overflow = 'auto';
            document.body.style.position = 'static';
        } else {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }

        const screensWithLoading = ['s2', 's3', 's4', 's5', 's6', 's7']; 
        const contentDiv = targetScreen.querySelector('.main-content');

        if (contentDiv) contentDiv.style.display = 'block';

        if (screensWithLoading.includes(targetKey)) {
            const oldLoader = targetScreen.querySelector('.custom-loader');
            if (oldLoader) oldLoader.remove();

            const loader = document.createElement('div');
            loader.className = 'custom-loader';
            targetScreen.appendChild(loader);

            const delay = Math.floor(Math.random() * 2001) + 4000;
            loadingTimeout = setTimeout(() => {
                loader.remove();
            }, delay);
        }
    }
}

// أزرار التنقل
document.getElementById('to-s2')?.addEventListener('click', () => showScreen('s2'));
document.getElementById('to-s3')?.addEventListener('click', () => showScreen('s3'));
document.querySelector('.fab-btn-bright-purple')?.addEventListener('click', () => showScreen('s4'));
document.getElementById('back-to-s3')?.addEventListener('click', () => showScreen('s3'));
document.getElementById('back-to-s1')?.addEventListener('click', () => showScreen('s1'));
document.getElementById('back-to-s2')?.addEventListener('click', () => showScreen('s2'));
document.getElementById('back-to-s4')?.addEventListener('click', () => showScreen('s4'));
document.getElementById('back-from-notifications')?.addEventListener('click', () => showScreen('s1'));
document.getElementById('finish-button')?.addEventListener('click', () => showScreen('s1'));
document.getElementById('to-s7')?.addEventListener('click', () => showScreen('s7'));
document.getElementById('back-to-s1-from-s7')?.addEventListener('click', () => showScreen('s1'));
document.querySelector('#screen-7 .payment-card img[src*="J3zaJSU.png"]')?.parentElement.addEventListener('click', () => showScreen('s8'));
document.getElementById('back-to-s7')?.addEventListener('click', () => showScreen('s7'));
document.getElementById('back-to-s7-from-s8')?.addEventListener('click', function() { showScreen('s7');});
document.querySelector('#screen-8 button')?.addEventListener('click', function() { showScreen('s9');});
document.getElementById('btn-pay-s8')?.addEventListener('click', function() { showScreen('s9');});
if (document.getElementById("back-to-s8")) {
    document.getElementById("back-to-s8").onclick = () => showScreen("s8");
}
document.getElementById('back-from-s10')?.addEventListener('click', () => showScreen('s1'));
document.getElementById('finish-merchant-payment')?.addEventListener('click', () => showScreen('s1'));

/***********************
 * 4. نظام الإشعارات
 ***********************/
function updateNotificationBadge() {
    const notifBadge = document.getElementById('notif-badge');
    const list = JSON.parse(localStorage.getItem('bank_notifications')) || [];
    if (notifBadge) {
        const isRead = localStorage.getItem('notifications_read') === 'true';
        notifBadge.style.display = 'flex';
        notifBadge.innerText = (isRead || list.length === 0) ? "0" : list.length.toString();
    }
}

function renderNotificationsPage() {
    const container = document.getElementById('notifications-list');
    const list = JSON.parse(localStorage.getItem('bank_notifications')) || [];
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:50px; color:#888;">لا توجد إشعارات حالية</p>';
        return;
    }
    container.innerHTML = list.map(item => `
        <div class="notification-card" style="padding: 15px 20px; border-bottom: 1px solid #eee; background: white; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: #3b5998; font-weight: bold; font-size: 15px; margin-bottom: 4px;">
                <span>${item.title}</span>
                <span style="font-family: 'Cairo', sans-serif; font-weight: normal; font-size: 13px;">${toHindiNumbers(item.date)}</span>
            </div>
            <div style="text-align: right; font-size: 14px; color: #333; line-height: 1.4;">
                تحويل دفع لصديق: ${item.name}، بمبلغ <b>${item.amount}</b>
            </div>
        </div>`).join('');
}

if (document.getElementById('open-notifications')) {
    document.getElementById('open-notifications').onclick = () => {
        localStorage.setItem('notifications_read', 'true'); 
        updateNotificationBadge(); 
        showScreen('notif'); 
        renderNotificationsPage(); 
    };
}

/***********************
 * 5. العمليات المالية (لصديق)
 ***********************/
const balanceEl = document.querySelector('.amount-number-system');
let currentBalance = parseFloat(localStorage.getItem('user_balance')) || 44.91;

const amountInput = document.querySelector('.amount-input');
const recipientNameEl = document.getElementById('recipientName');
const recipientPhoneEl = document.getElementById('recipientPhone');
const recipientIcon = document.getElementById('recipientIcon');

amountInput?.addEventListener('input', () => {
    const val = parseFloat(amountInput.value) || 0;
    const comm = val * 0.01;
    document.getElementById('amount-s5').textContent = val.toFixed(2) + ' ILS';
    document.getElementById('commission-s5').textContent = comm.toFixed(2) + ' ILS';
    document.getElementById('total-s5').textContent = (val + comm).toFixed(2) + ' ILS';
});

document.getElementById('confirmBtn')?.addEventListener('click', function() {
    const val = parseFloat(amountInput.value) || 0;
    const total = val + (val * 0.01);
    if (total > currentBalance) return alert('الرصيد غير كافٍ');

    currentBalance -= total;
    localStorage.setItem('user_balance', currentBalance.toFixed(2));
    if(balanceEl) balanceEl.textContent = currentBalance.toFixed(2);

    const newNotif = {
        title: "الدفع لصديق",
        date: new Date().toLocaleDateString('en-GB'),
        name: recipientNameEl.textContent,
        amount: total.toFixed(2) + " ILS"
    };
    
    const list = JSON.parse(localStorage.getItem('bank_notifications')) || [];
    list.unshift(newNotif);
    localStorage.setItem('bank_notifications', JSON.stringify(list));
    localStorage.setItem('notifications_read', 'false');

    document.getElementById('display-name').textContent = recipientNameEl.textContent;
    document.getElementById('display-phone').textContent = recipientPhoneEl.textContent || '---';
    document.getElementById('display-amount').textContent = total.toFixed(2) + ' ILS';
    document.getElementById('display-code').textContent = Math.floor(1000 + Math.random() * 9000);

    showScreen('s6');
    updateNotificationBadge();
});

/***********************
 * 6. اختيار البنك (والتحقق من المستلم)
 ***********************/
const bottomSheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('overlay');
const phoneInput = document.querySelector('#screen-4 .input-field');

document.getElementById('openSheetBtn')?.addEventListener('click', () => {
    bottomSheet.style.bottom = "0";
    overlay.style.display = "block";
});

const closeSheet = () => {
    bottomSheet.style.bottom = "-100%";
    overlay.style.display = "none";
};

document.querySelector('.close-text')?.addEventListener('click', closeSheet);
overlay?.addEventListener('click', closeSheet);

document.querySelectorAll('.bank-item').forEach(item => {
    item.addEventListener('click', () => {
        closeSheet();
        const bankType = item.dataset.target;
        if (recipientIcon) {
            if (bankType === 'palpay') {
                recipientIcon.innerHTML = `<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsBGlRu3lHxzkgUR-nnflMv6GdZCm3UooakEJDQAXXAnIy2cNjCbc6h1Qo&s=10" width="48">`;
            } else if (bankType === 'palpay-wallet') {
                recipientIcon.innerHTML = `<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo-2NOar_qcerlGh166EDRRqtax-y9FOS0Kc3sIEkBk078sxawPAvRbAV7&s=10" width="48">`;
            }
        }

        const phoneVal = phoneInput.value.trim();
        const savedPhone = localStorage.getItem('recipient_phone') || "0599267682";
        const savedName = localStorage.getItem('recipient_name') || "طلعت محمد موسى الفقيعاوي";

        if (phoneVal === savedPhone || phoneVal === "") {
            recipientNameEl.textContent = savedName;
            recipientPhoneEl.textContent = savedPhone;
            showScreen('s5');
        } else {
            document.getElementById('verifyModal').style.display = 'flex';
        }
    });
});

document.getElementById('verifyOkBtn')?.addEventListener('click', () => {
    document.getElementById('verifyModal').style.display = 'none';
});

/***********************
 * 7. نظام السحب المتطور والحفظ التلقائي
 ***********************/
let startX = 0;
let lastSwipeTime = 0;
let autoSaveTimer;

function checkMainScreen() {
    const s1 = document.getElementById('screen-1');
    return s1 && s1.style.display !== 'none';
}

document.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].screenX;
}, {passive: true});

document.addEventListener('touchend', e => {
    if (!checkMainScreen()) return;
    const diff = e.changedTouches[0].screenX - startX;
    const now = Date.now();

    if (diff > 60) {
        if (now - lastSwipeTime < 500) openPanel('hidden-right');
        lastSwipeTime = now;
    }
    if (diff < -60) {
        if (now - lastSwipeTime < 500) openPanel('hidden-left');
        lastSwipeTime = now;
    }
}, {passive: true});

function openPanel(id) {
    const p = document.getElementById(id);
    if (!p) return;

    if (id === 'hidden-right') {
        document.getElementById('edit-name').value = localStorage.getItem('user_name') || "";
        document.getElementById('edit-balance').value = localStorage.getItem('user_balance') || "";
        p.style.right = "0px";
    } else {
        document.getElementById('merchant-name-input').value = localStorage.getItem('merchant_name') || "";
        document.getElementById('merchant-phone-input-edit').value = localStorage.getItem('merchant_phone') || "";
        document.getElementById('recipient-name-input').value = localStorage.getItem('recipient_name') || "";
        document.getElementById('recipient-phone-input').value = localStorage.getItem('recipient_phone') || "";
        p.style.left = "0px";

        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => saveLeftData(true), 20000);
    }
}

document.getElementById('save-right').onclick = function() {
    const name = document.getElementById('edit-name').value;
    const bal = document.getElementById('edit-balance').value;
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_balance', bal);
    
    const s1Name = document.querySelector('.welcome-text');
    if(s1Name) s1Name.innerHTML = `مرحباً، ${name}`;
    if(balanceEl) balanceEl.textContent = parseFloat(bal).toFixed(2);
    
    document.getElementById('hidden-right').style.right = "-320px";
};

function saveLeftData(isAuto = false) {
    const mName = document.getElementById('merchant-name-input').value;
    const mPhone = document.getElementById('merchant-phone-input-edit').value;
    const rName = document.getElementById('recipient-name-input').value;
    const rPhone = document.getElementById('recipient-phone-input').value;
    
    localStorage.setItem('merchant_name', mName);
    localStorage.setItem('merchant_phone', mPhone);
    if(rName) localStorage.setItem('recipient_name', rName);
    if(rPhone) localStorage.setItem('recipient_phone', rPhone);

    const s8Input = document.getElementById('merchant-phone-input');
    if(s8Input) s8Input.value = mPhone;

    const s9NameInput = document.getElementById('merchant-name-s9') || document.querySelector('#screen-9 input[value*="اسم التاجر"]');
    if(s9NameInput) s9NameInput.value = "اسم التاجر: " + mName;

    document.getElementById('hidden-left').style.left = "-320px";
    clearTimeout(autoSaveTimer);
    if(!isAuto) alert("تم الحفظ بنجاح");
}

if(document.getElementById('save-left')) {
    document.getElementById('save-left').onclick = () => saveLeftData(false);
}

document.querySelectorAll('.hidden-panel-custom').forEach(panel => {
    panel.onclick = (e) => e.stopPropagation();
});

/***********************
 * 8. الـ QR Scanner
 ***********************/
let html5QrCode;
const readerContainer = document.getElementById('reader-container');
const flashBtn = document.getElementById('flash-toggle-btn');
const closeBtnText = document.getElementById('close-scanner-text');
const scanImageBtn = document.getElementById('scan-image-btn');
const fileInput = document.getElementById('qr-input-file');

// تشغيل الكاميرا عند النقر على الأيقونة المحددة
document.querySelectorAll('.qr-trigger').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', startScanner);
});

scanImageBtn?.addEventListener('click', () => { fileInput.click(); });

fileInput?.addEventListener('change', async (e) => {
    if (e.target.files.length === 0) return;
    const imageFile = e.target.files[0];
    try {
        if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
        if (html5QrCode.isScanning) await html5QrCode.stop();
        const decodedText = await html5QrCode.scanFile(imageFile, true);
        stopScanner();
        showScreen('s9'); // انتقال صامت ومباشر للشاشة 9
    } catch (err) {
        alert("لم يتم العثور على QR واضح في الصورة");
        console.error(err);
    }
});

function startScanner() {
    readerContainer.style.display = 'block';
    if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            stopScanner();
            showScreen('s9'); // انتقال صامت ومباشر
        }
    ).catch(err => console.error("فشل الكاميرا:", err));
}

function stopScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => { readerContainer.style.display = 'none'; });
    } else {
        readerContainer.style.display = 'none';
    }
}

document.getElementById('open-scanner-btn')?.addEventListener('click', startScanner);
closeBtnText?.addEventListener('click', stopScanner);

/***********************
 * 9. تهيئة عند التحميل
 ***********************/
window.onload = () => {
    updateNotificationBadge();
    const savedBal = localStorage.getItem('user_balance');
    if(savedBal && balanceEl) balanceEl.textContent = parseFloat(savedBal).toFixed(2);

    const savedName = localStorage.getItem('user_name');
    const s1Name = document.querySelector('.welcome-text');
    if(savedName && s1Name) s1Name.innerHTML = `مرحباً، ${savedName}`;
    
    const grid = document.getElementById('services-grid');
    if(grid) {
        Array.from(grid.children).forEach((item, i) => item.style.display = i < 4 ? 'flex' : 'none');
    }
};

document.getElementById('toggle-services')?.addEventListener('click', function() {
    const grid = document.getElementById('services-grid');
    const items = Array.from(grid.children);
    const isShowingMore = this.innerText.includes("أقل");
    items.forEach((item, i) => { if (i >= 4) item.style.display = isShowingMore ? 'none' : 'flex'; });
    this.innerText = isShowingMore ? `عرض الكل (${items.length})` : "عرض أقل";
});

/***********************
 * 10. العمليات الديناميكية لشاشة 9 و 10 والمودال 
 ***********************/
const nextBtnS9 = document.getElementById('next-to-confirm-merchant');
const merchantModal = document.getElementById('merchant-confirm-modal');
const cancelMerchantBtn = document.getElementById('cancel-merchant-btn');
const confirmMerchantBtn = document.getElementById('confirm-merchant-btn');

if (nextBtnS9) {
    nextBtnS9.addEventListener('click', () => {
        const amountField = document.getElementById('amount-s9') || document.querySelector('#screen-9 input[placeholder="المبلغ"]');
        const amount = amountField ? amountField.value : "0";
        const mName = localStorage.getItem('merchant_name') || "سعود بديع فايق ساق الله";

        const modalAmountText = document.getElementById('modal-amount-text') || merchantModal.querySelector('span:nth-child(1)');
        const modalMerchantText = document.getElementById('modal-merchant-text') || merchantModal.querySelector('span:nth-child(2)');
        const modalTotalText = document.getElementById('modal-total-text') || merchantModal.querySelector('span:nth-child(3)');

        if(modalAmountText) modalAmountText.innerText = amount + " شيكل";
        if(modalMerchantText) modalMerchantText.innerText = mName;
        if(modalTotalText) modalTotalText.innerText = parseFloat(amount || 0).toFixed(1) + " ILS";

        merchantModal.style.display = 'flex';
    });
}

if (cancelMerchantBtn) {
    cancelMerchantBtn.addEventListener('click', () => {
        merchantModal.style.display = 'none';
    });
}

if (confirmMerchantBtn) {
    confirmMerchantBtn.addEventListener('click', () => {
        merchantModal.style.display = 'none';
        
        const amountField = document.getElementById('amount-s9') || document.querySelector('#screen-9 input[placeholder="المبلغ"]');
        const amount = amountField ? amountField.value : "0";
        const mName = localStorage.getItem('merchant_name') || "سعود بديع فايق ساق الله";

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letters = chars.charAt(Math.floor(Math.random() * 26)) + chars.charAt(Math.floor(Math.random() * 26));
        const numbers = Math.floor(10000000 + Math.random() * 90000000);
        const refNum = letters + numbers;

        const today = new Date();
        const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

        const s10Vals = document.querySelectorAll('#screen-10 .value-text');
        
        const elMerchant = document.getElementById('s10-merchant-name');
        if(elMerchant) elMerchant.innerText = mName; else if(s10Vals[0]) s10Vals[0].innerText = mName;
        
        const elPos = document.getElementById('s10-pos-name');
        if(elPos) elPos.innerText = mName; else if(s10Vals[1]) s10Vals[1].innerText = mName;
        
        const elAmt = document.getElementById('s10-amount');
        if(elAmt) elAmt.innerText = parseFloat(amount || 0).toFixed(1); else if(s10Vals[2]) s10Vals[2].innerText = parseFloat(amount || 0).toFixed(1);
        
        const elRef = document.getElementById('s10-ref');
        if(elRef) elRef.innerText = refNum; else if(s10Vals[4]) s10Vals[4].innerText = refNum;
        
        const elDate = document.getElementById('s10-date');
        if(elDate) elDate.innerText = dateStr; else if(s10Vals[5]) s10Vals[5].innerText = dateStr;

        showScreen('s10'); 
    });
}

/***********************
 * 11. لقطة الشاشة (الشاشة 10)
 ***********************/
const s10Img = document.getElementById('s10-image') || document.querySelector('#screen-10 .icon-box img');
if(s10Img) {
    s10Img.addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert('يرجى التأكد من إضافة مكتبة html2canvas في ملف index.html لتعمل ميزة تصوير الشاشة.');
            return;
        }

        const screen10 = document.getElementById('screen-10');
        const doneBtn = document.getElementById('finish-merchant-payment');
        
        if(doneBtn) doneBtn.style.display = 'none';

        html2canvas(screen10, { scale: 2 }).then(canvas => {
            if(doneBtn) doneBtn.style.display = 'block';
            
            const link = document.createElement('a');
            link.download = 'Receipt_' + new Date().getTime() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("خطأ في التقاط الشاشة", err);
            if(doneBtn) doneBtn.style.display = 'block';
        });
    });
}
