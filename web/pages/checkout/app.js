(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const fmt = (amount, currency = 'VND', locale = 'vi-VN') => {
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount); }
    catch { return amount.toLocaleString('vi-VN') + '₫'; }
  };

  const params = new URLSearchParams(location.search);
  const itemName = params.get('name') || 'Gói NeuralNova Premium';
  const price = Number(params.get('price') || 199000);
  const qty = Math.max(1, Number(params.get('qty') || 1));
  const currency = (params.get('currency') || 'VND').toUpperCase();
  const presetVoucher = (params.get('voucher') || '').trim();

  // State
  const state = {
    discount: 0,
    voucher: null,
  };

  // Fill summary
  $('#itemName').textContent = itemName;
  $('#itemPrice').textContent = fmt(price, currency);
  $('#itemQty').textContent = String(qty);

  const recalc = () => {
    const subtotal = price * qty;
    const discount = state.discount;
    const total = Math.max(0, subtotal - discount);
    $('#discount').textContent = (discount > 0 ? '- ' : '') + fmt(discount, currency);
    $('#grandTotal').textContent = fmt(total, currency);
    return { subtotal, discount, total };
  };
  recalc();

  // Tabs switching
  const tabs = $$('.tab');
  const cardForm = $('#card-form');
  const walletForm = $('#wallet-form');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    const isCard = tab === 'card';
    const isWallet = tab === 'wallet';
    cardForm.classList.toggle('form--active', isCard);
    cardForm.hidden = !isCard;
    walletForm.hidden = !isWallet;
  }));

  // Helpers
  const showErr = (id, msg) => { const el = document.querySelector(`.err[data-for="${id}"]`); if (el) el.textContent = msg || ''; };
  const luhn = (num) => {
    const s = (num || '').replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(s)) return false;
    let sum = 0, dbl = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  };
  const validExpiry = (v) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return false;
    const [mm, yy] = v.split('/').map(x => parseInt(x, 10));
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;
    return yy > curYY || (yy === curYY && mm >= curMM);
  };

  // Formatting inputs
  const cardInput = $('#cardNumber');
  cardInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/[^\d]/g, '').slice(0, 19);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = v;
  });
  const expiryInput = $('#expiry');
  expiryInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    e.target.value = v;
  });
  const cvcInput = $('#cvc');
  cvcInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0,4);
  });

  // Voucher
  const applyVoucher = (code) => {
    const c = (code || '').toUpperCase();
    state.voucher = null; state.discount = 0;
    if (!c) return recalc();
    // Demo rules
    if (c === 'NOVANEW') { state.voucher = c; state.discount = 20000; toast('Áp dụng voucher -20.000₫'); }
    else if (c === 'NN50K') { state.voucher = c; state.discount = 50000; toast('Áp dụng voucher -50.000₫'); }
    else if (c === 'NN10') { state.voucher = c; state.discount = Math.round(price * qty * 0.1); toast('Áp dụng voucher -10%'); }
    else { toast('Mã giảm giá không hợp lệ', true); }
    recalc();
  };
  $('#applyVoucher').addEventListener('click', () => applyVoucher($('#voucher').value));
  if (presetVoucher) { $('#voucher').value = presetVoucher; applyVoucher(presetVoucher); }

  // Bank transfer removed; bank is integrated under Wallet top-up

  // Wallet payment
  const walletBalanceEl = $('#walletBalance');
  const getWalletBal = () => Number(localStorage.getItem('nn_wallet_balance') || 0);
  const setWalletUI = () => { try { walletBalanceEl.textContent = new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(getWalletBal()); } catch { walletBalanceEl.textContent = (getWalletBal()).toLocaleString('vi-VN') + '₫'; } };
  setWalletUI();
  // Wallet sub-tabs: top-up and history
  const walletTabs = $$('.wallet-tab');
  const sectionTopup = $('#walletTopup');
  const sectionHistory = $('#walletHistory');
  const activateSubTab = (key) => {
    walletTabs.forEach(b => b.classList.toggle('active', b.dataset.subtab === key));
    sectionTopup.hidden = key !== 'topup';
    sectionHistory.hidden = key !== 'history';
    if (key === 'history') loadHistory();
  };
  walletTabs.forEach(b => b.addEventListener('click', () => activateSubTab(b.dataset.subtab)));

  // Inline top-up logic (demo)
  let topupAmount = 100000;
  let topupProvider = 'momo';
  const amountInput = $('#topupAmount');
  const noteInput = $('#topupNote');
  const providerBtns = $$('.provider-btn');
  const payloadEl = $('#topupPayload');
  const qrTopup = $('#qrTopup');
  amountInput.addEventListener('input', (e) => { const v = Number(String(e.target.value).replace(/[^\d]/g,''))||0; e.target.value = v?String(v):''; topupAmount=v; });
  const detailLink = $('#providerDetailLink');
  providerBtns.forEach(p => p.addEventListener('click', () => {
    providerBtns.forEach(b=>b.classList.remove('active'));
    p.classList.add('active');
    topupProvider = p.dataset.provider;
    if (detailLink) detailLink.href = 'method.html?provider=' + encodeURIComponent(topupProvider) + '&return=' + encodeURIComponent('index.html#wallet');
  }));
  if (detailLink) detailLink.href = 'method.html?provider=' + encodeURIComponent(topupProvider) + '&return=' + encodeURIComponent('index.html#wallet');

  const buildTopupPayload = (prov, amt) => {
    const orderId = 'TOPUP_' + Date.now();
    const info = encodeURIComponent('Nap vi NeuralNova');
    if (prov === 'momo') return `momo://app?action=payWithApp&partnerCode=NNDEMO&amount=${amt}&orderId=${orderId}&orderInfo=${info}`;
    if (prov === 'vnpay') return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${amt*100}&vnp_TxnRef=${orderId}&vnp_OrderInfo=${info}`;
    if (prov === 'alipay') { const q = `https://pay.neuralnova.local/topup?oid=${orderId}&amt=${amt}`; return `alipayqr://platformapi/startapp?saId=10000007&qrcode=${encodeURIComponent(q)}`; }
    if (prov === 'paypal') return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=demo@neuralnova.local&amount=${amt}&currency_code=USD&item_name=Topup%20Wallet&invoice=${orderId}`;
    if (prov === 'bank') return `bank://transfer?account=NN_DEMO_0123456789&amount=${amt}&desc=${info}`;
    return `nnwallet:${orderId}?amount=${amt}`;
  };
  const renderTopupQR = (text) => {
    // Placeholder only (no QR lib embedded here)
    qrTopup.textContent = text ? 'QR đã sẵn sàng (demo)' : 'QR sẽ hiển thị tại đây';
  };
  $('#genTopupBtn').addEventListener('click', () => {
    if (!topupAmount || topupAmount < 1000) { toast('Số tiền tối thiểu 1.000₫', true); return; }
    const payload = buildTopupPayload(topupProvider, topupAmount) + (noteInput.value? `&note=${encodeURIComponent(noteInput.value)}`: '');
    payloadEl.value = payload;
    renderTopupQR(payload);
    toast('Đã tạo mã thanh toán');
  });
  $('#copyTopupBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(payloadEl.value || ''); toast('Đã sao chép'); } catch { toast('Không thể sao chép', true); }
  });
  $('#confirmTopupBtn').addEventListener('click', () => {
    if (!topupAmount || topupAmount < 1000) { toast('Số tiền tối thiểu 1.000₫', true); return; }
    const current = Number(localStorage.getItem('nn_wallet_balance') || 0);
    const after = current + topupAmount;
    try { localStorage.setItem('nn_wallet_balance', String(after)); } catch {}
    // Log tx
    try { const key = 'nn_wallet_tx'; const cur = JSON.parse(localStorage.getItem(key) || '[]'); cur.push({id:'TX_'+Date.now(),type:'TOPUP',provider:topupProvider,amount:topupAmount,at:new Date().toISOString(), note: noteInput.value||''}); localStorage.setItem(key, JSON.stringify(cur)); } catch {}
    setWalletUI();
    toast('Nạp tiền thành công vào Ví');
    loadHistory();
  });

  // History rendering
  const historyList = $('#historyList');
  function loadHistory() {
    if (!historyList) return;
    let items = [];
    try { items = JSON.parse(localStorage.getItem('nn_wallet_tx') || '[]'); } catch {}
    items = items.filter(x => x.type === 'TOPUP').reverse();
    historyList.innerHTML = items.map(x => {
      const time = new Date(x.at).toLocaleString('vi-VN');
      const amt = fmt(x.amount);
      const prov = (x.provider||'').toUpperCase();
      return `<div class="history-row"><div>${time}</div><div>${prov}</div><div>${amt}</div><div class="badge-ok">Thành công</div></div>`;
    }).join('') || '<div class="history-row"><div>—</div><div>—</div><div>—</div><div>Chưa có giao dịch</div></div>';
  }
  // Initialize topup tab as default
  activateSubTab('topup');
  $('#payByWallet').addEventListener('click', () => {
    const { total } = recalc();
    const bal = getWalletBal();
    if (bal < total) { alert('Số dư ví không đủ. Vui lòng nạp thêm.'); return; }
    try { localStorage.setItem('nn_wallet_balance', String(bal - total)); } catch {}
    savePayment({ method: 'WALLET', masked: null, total });
    location.href = 'success.html?method=WALLET&total=' + encodeURIComponent(total) + '&name=' + encodeURIComponent(itemName);
  });

  // Toast
  const toastEl = $('#toast');
  let toastTimer = null;
  const toast = (msg, danger = false) => {
    toastEl.textContent = msg;
    toastEl.style.borderColor = danger ? 'rgba(239,68,68,.5)' : 'var(--border)';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  // Save mock payment
  const savePayment = ({ method, masked, total }) => {
    const payload = {
      id: 'PAY_' + Date.now(),
      item: itemName, price, qty, currency,
      total, method, masked,
      voucher: state.voucher,
      at: new Date().toISOString(),
    };
    try {
      const key = 'nn_payments';
      const cur = JSON.parse(localStorage.getItem(key) || '[]');
      cur.push(payload);
      localStorage.setItem(key, JSON.stringify(cur));
    } catch {}
  };

  // Submit credit card
  $('#card-form').addEventListener('submit', (e) => {
    e.preventDefault();
    ['name','email','cardNumber','expiry','cvc'].forEach(id => showErr(id, ''));
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const number = $('#cardNumber').value.replace(/\s+/g,'');
    const expiry = $('#expiry').value.trim();
    const cvc = $('#cvc').value.trim();
    let ok = true;
    if (name.length < 2) { showErr('name', 'Vui lòng nhập họ tên hợp lệ'); ok = false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showErr('email','Email không hợp lệ'); ok = false; }
    if (!luhn(number)) { showErr('cardNumber','Số thẻ không hợp lệ'); ok = false; }
    if (!validExpiry(expiry)) { showErr('expiry','Ngày hết hạn không hợp lệ'); ok = false; }
    if (!/^\d{3,4}$/.test(cvc)) { showErr('cvc','CVC không hợp lệ'); ok = false; }
    if (!ok) return;

    const btn = $('#payBtn');
    btn.classList.add('loading');
    btn.disabled = true;
    setTimeout(() => {
      const last4 = number.slice(-4);
      const { total } = recalc();
      savePayment({ method: 'CARD', masked: '**** **** **** ' + last4, total });
      location.href = 'success.html?method=CARD&last4=' + last4 + '&total=' + encodeURIComponent(total) + '&name=' + encodeURIComponent(itemName);
    }, 1200);
  });

  // Start icons
  document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide && lucide.createIcons) lucide.createIcons();
  });
})();
