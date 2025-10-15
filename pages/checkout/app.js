(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const fmt = (amount, currency = 'USD', locale = 'en-US') => {
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount); }
    catch { return '$' + amount.toLocaleString('en-US'); }
  };

  const params = new URLSearchParams(location.search);
  
  // Handle plan parameter from pricing page
  const planParam = params.get('plan');
  const planName = params.get('planName');
  let itemName = planName || params.get('name') || 'NeuralNova Premium Plan';
  let price = Number(params.get('price') || 199);
  const qty = Math.max(1, Number(params.get('qty') || 1));
  let currency = (params.get('currency') || 'USD').toUpperCase();
  const presetVoucher = (params.get('voucher') || '').trim();
  const hasTrial = params.get('trial') || '';
  
  // Handle new pricing structure with plan names
  if (planParam && !planName) {
    // Fallback for old URLs
    if (planParam === 'starter' || planParam === 'individual') {
      itemName = 'Individual Plan';
    } else if (planParam === 'professional' || planParam === 'business') {
      itemName = hasTrial ? 'Business Plan (14-day free trial)' : 'Business Plan';
    } else if (planParam === 'enterprise' || planParam === 'custom') {
      itemName = 'Enterprise Plan';
      if (params.get('price') === 'custom') {
        price = 0; // Will need to contact sales
      }
    }
  }
  
  // Add trial info to item name if present
  if (hasTrial && itemName && !itemName.includes('trial') && !itemName.includes('Trial')) {
    itemName += ` (${hasTrial}-day free trial)`;
  }

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
  const ewalletForm = $('#vnpay-form');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    const isCard = tab === 'card';
    const isEwallet = tab === 'vnpay';
    cardForm.classList.toggle('form--active', isCard);
    cardForm.hidden = !isCard;
    if (ewalletForm) ewalletForm.hidden = !isEwallet;
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
    if (c === 'NOVANEW') { state.voucher = c; state.discount = 2; toast('Voucher applied -$2'); }
    else if (c === 'NN50K') { state.voucher = c; state.discount = 5; toast('Voucher applied -$5'); }
    else if (c === 'NN10') { state.voucher = c; state.discount = Math.round(price * qty * 0.1); toast('Voucher applied -10%'); }
    else { toast('Invalid discount code', true); }
    recalc();
  };
  $('#applyVoucher').addEventListener('click', () => applyVoucher($('#voucher').value));
  if (presetVoucher) { $('#voucher').value = presetVoucher; applyVoucher(presetVoucher); }

  // E-Wallet payment selection
  let selectedEwallet = null;
  const providerCards = $$('.provider-card');
  const continueBtn = $('#continueEwallet');
  
  providerCards.forEach(card => card.addEventListener('click', () => {
    providerCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedEwallet = card.dataset.provider;
    if (continueBtn) continueBtn.disabled = false;
  }));

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!selectedEwallet) return;
      
      const { total } = recalc();
      const orderId = 'ORD_' + Date.now();
      const info = encodeURIComponent(itemName);
      
      // Build payment gateway URL (demo - would be generated server-side in production)
      let gatewayUrl = '';
      if (selectedEwallet === 'momo') {
        gatewayUrl = `https://test-payment.momo.vn/v2/gateway/pay?amount=${total}&orderId=${orderId}&orderInfo=${info}`;
      } else if (selectedEwallet === 'vnpay') {
        gatewayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${total*100}&vnp_TxnRef=${orderId}&vnp_OrderInfo=${info}`;
      } else if (selectedEwallet === 'zalopay') {
        gatewayUrl = `https://sandbox.zalopay.vn/order/payment?app_id=2553&amount=${total}&app_trans_id=${orderId}`;
      }
      
      // Save payment attempt
      savePayment({ method: selectedEwallet.toUpperCase(), masked: null, total });
      
      // In production, this would redirect to actual payment gateway
      // For demo, show alert then go to success
      toast('Đang chuyển đến cổng thanh toán ' + selectedEwallet.toUpperCase() + '...');
      setTimeout(() => {
        location.href = 'success.html?method=' + selectedEwallet.toUpperCase() + '&total=' + encodeURIComponent(total) + '&name=' + encodeURIComponent(itemName);
      }, 1500);
    });
  }

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
