(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n, cur = 'VND') => {
    try { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: cur }).format(n); } catch { return `${(n||0).toLocaleString('vi-VN')}₫`; }
  };

  const keyBal = 'nn_wallet_balance';
  const keyTx = 'nn_wallet_tx';
  const getBal = () => Number(localStorage.getItem(keyBal) || 0);
  const setBal = (v) => localStorage.setItem(keyBal, String(v));
  const pushTx = (tx) => {
    try {
      const cur = JSON.parse(localStorage.getItem(keyTx) || '[]');
      cur.push(tx);
      localStorage.setItem(keyTx, JSON.stringify(cur));
    } catch {}
  };

  const toastEl = $('#toast'); let tTimer;
  const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tTimer); tTimer = setTimeout(()=> toastEl.classList.remove('show'), 2200); };

  const balEl = $('#balance');
  const setBalanceUI = () => { balEl.textContent = fmt(getBal()); };
  setBalanceUI();

  // Display selected plan info from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  const planName = urlParams.get('planName');
  const planPrice = urlParams.get('price');
  const planTrial = urlParams.get('trial');

  if (planId && planName && planPrice) {
    const planInfoEl = $('#planInfo');
    const planNameEl = $('#planName');
    const planPriceEl = $('#planPrice');
    const planTrialEl = $('#planTrial');
    const trialInfoEl = $('#trialInfo');

    planInfoEl.style.display = 'block';
    planNameEl.textContent = planName;
    
    if (planPrice === 'custom') {
      planPriceEl.textContent = 'Liên hệ báo giá';
    } else {
      planPriceEl.textContent = `$${planPrice}/tháng`;
    }

    if (planTrial) {
      trialInfoEl.style.display = 'flex';
      planTrialEl.textContent = `${planTrial} ngày miễn phí`;
    }

    console.log('📦 Plan Info:', { planId, planName, planPrice, planTrial });
  }

  // Amount selection
  let amount = 100000; // default
  const chips = $$('.chip');
  const custom = $('#customAmount');
  const setActiveChip = (val) => {
    chips.forEach(c=> c.classList.toggle('active', Number(c.dataset.amount) === val));
  };
  chips.forEach(ch => ch.addEventListener('click', () => {
    amount = Number(ch.dataset.amount);
    custom.value = '';
    setActiveChip(amount);
  }));
  custom.addEventListener('input', (e) => {
    const v = Number(String(e.target.value).replace(/[^\d]/g, '')) || 0;
    e.target.value = v ? String(v) : '';
    amount = v;
    setActiveChip(-1);
  });

  // Providers
  let provider = 'momo';
  const providers = $$('.provider');
  providers.forEach(p => p.addEventListener('click', () => {
    providers.forEach(b => b.classList.remove('active'));
    p.classList.add('active');
    provider = p.dataset.provider;
  }));

  const qrBox = $('#qr');
  const qrFallback = $('#qrFallback');
  const payloadEl = $('#payload');

  const buildPayload = (prov, amt) => {
    const orderId = 'TOPUP_' + Date.now();
    const info = encodeURIComponent('Nap vi NeuralNova');
    // DEMO-only payloads (real gateways require signed URLs created server-side)
    if (prov === 'momo') {
      return `momo://app?action=payWithApp&partnerCode=NNDEMO&amount=${amt}&orderId=${orderId}&orderInfo=${info}`;
    }
    if (prov === 'vnpay') {
      return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${amt*100}&vnp_TxnRef=${orderId}&vnp_OrderInfo=${info}`;
    }
    if (prov === 'alipay') {
      const q = `https://pay.neuralnova.local/topup?oid=${orderId}&amt=${amt}`;
      return `alipayqr://platformapi/startapp?saId=10000007&qrcode=${encodeURIComponent(q)}`;
    }
    return `nnwallet:${orderId}?amount=${amt}`;
  };

  const renderQR = (text) => {
    // Try QRCode.js if available
    qrBox.innerHTML = '';
    if (window.QRCode) {
      try {
        new QRCode(qrBox, { text, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
        qrFallback.hidden = true; return;
      } catch {}
    }
    // Fallback placeholder
    qrFallback.hidden = false;
  };

  $('#genBtn').addEventListener('click', () => {
    if (!amount || amount < 1000) { toast('Số tiền tối thiểu 1.000₫'); return; }
    const payload = buildPayload(provider, amount);
    payloadEl.value = payload;
    renderQR(payload);
    toast('Đã tạo mã thanh toán');
  });

  $('#copyBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(payloadEl.value || ''); toast('Đã sao chép'); } catch { toast('Không thể sao chép'); }
  });

  // Confirm top-up (demo): credit balance immediately
  $('#confirmBtn').addEventListener('click', () => {
    if (!amount || amount < 1000) { toast('Số tiền tối thiểu 1.000₫'); return; }
    const before = getBal();
    const after = before + amount;
    setBal(after);
    pushTx({ id: 'TX_'+Date.now(), type:'TOPUP', provider, amount, at: new Date().toISOString() });
    setBalanceUI();
    toast('Nạp tiền thành công vào Ví');
    const p = new URLSearchParams(location.search);
    const ret = p.get('return');
    if (ret) setTimeout(()=> location.href = ret, 600);
  });
})();

