const el = (s) => document.querySelector(s);
const els = (s) => Array.from(document.querySelectorAll(s));
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const toast = (id, msg, type = 'success') => {
  const t = el(id);
  if (!t) return;
  t.className = `toast ${type}`;
  t.textContent = msg;
};

const simulateSend = (email) => new Promise((resolve, reject) => {
  setTimeout(() => {
    email.toLowerCase().includes('fail') ? reject(new Error('Không tìm thấy tài khoản')) : resolve(true);
  }, 700);
});

const simulateVerify = ({ email, code }) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (!emailRegex.test(email)) return reject(new Error('Email không hợp lệ'));
    if (code !== '123456') return reject(new Error('Mã xác nhận không đúng'));
    resolve(true);
  }, 700);
});

document.addEventListener('DOMContentLoaded', () => {
  // Page enter overlay to smoothly reveal the screen
  const enterOverlay = document.createElement('div');
  enterOverlay.className = 'page-enter-overlay';
  document.body.appendChild(enterOverlay);
  requestAnimationFrame(() => enterOverlay.classList.add('hide'));
  enterOverlay.addEventListener('transitionend', () => enterOverlay.remove());

  // Elements
  const formForgot = el('#forgotForm');
  const btnForgot = el('#btnSubmitForgot');
  const cardVerify = el('.auth-card--verify');
  const linkGoVerify = el('#linkGoVerify');
  const linkGoForgot = el('#linkGoForgot');

  const toVerify = () => {
    const email = (el('#email')?.value || '').trim();
    if (email && el('#emailVerify')) el('#emailVerify').value = email;
    if (cardVerify) cardVerify.hidden = false;
    document.body.classList.add('is-verify');
    try { history.pushState({ step: 'verify' }, '', '?step=verify'); } catch {}
    setTimeout(() => el('#code-1')?.focus(), 220);
  };

  const toForgot = () => {
    document.body.classList.remove('is-verify');
    try { history.pushState({ step: 'forgot' }, '', location.pathname); } catch {}
    setTimeout(() => el('#email')?.focus(), 180);
  };

  linkGoVerify?.addEventListener('click', (e) => { e.preventDefault(); toVerify(); });
  linkGoForgot?.addEventListener('click', (e) => { e.preventDefault(); toForgot(); });

  // Forgot submit → transition to verify
  formForgot?.addEventListener('submit', async (e) => {
    e.preventDefault();
    toast('#fpToast', '', '');

    const email = el('#email').value.trim();
    if (!emailRegex.test(email)) { toast('#fpToast', 'Email không hợp lệ.', 'error'); return; }

    const original = btnForgot.textContent;
    btnForgot.textContent = 'Đang gửi...';
    btnForgot.disabled = true;
    try {
      await simulateSend(email);
      toast('#fpToast', 'Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.', 'success');
      setTimeout(() => toVerify(), 600);
    } catch (err) {
      toast('#fpToast', err.message || 'Có lỗi xảy ra.', 'error');
    } finally {
      btnForgot.textContent = original;
      btnForgot.disabled = false;
    }
  });

  // Verify code inputs behavior
  const inputs = els('.code-input');
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (inp.value && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
      if (e.key === 'ArrowLeft' && idx > 0) inputs[idx - 1].focus();
      if (e.key === 'ArrowRight' && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    inp.addEventListener('paste', (e) => {
      const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
      if (paste.length === 6) {
        e.preventDefault();
        inputs.forEach((input, i) => input.value = paste[i] || '');
        inputs[inputs.length - 1].focus();
      }
    });
  });

  const vForm = el('#verifyForm');
  const vBtn = el('#btnVerify');
  vForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    toast('#vcToast', '', '');
    const email = el('#emailVerify')?.value.trim() || '';
    const code = inputs.map(i => i.value.trim()).join('');
    if (!emailRegex.test(email)) { toast('#vcToast', 'Email không hợp lệ.', 'error'); return; }
    if (code.length !== 6) { toast('#vcToast', 'Vui lòng nhập đủ 6 số.', 'error'); return; }
    const original = vBtn.textContent;
    vBtn.textContent = 'Đang xác nhận...';
    vBtn.disabled = true;
    try {
      await simulateVerify({ email, code });
      toast('#vcToast', 'Xác nhận thành công! Bạn có thể đăng nhập.', 'success');
      setTimeout(() => { window.location.href = '../auth/index.html'; }, 1200);
    } catch (err) {
      toast('#vcToast', err.message || 'Xác nhận thất bại.', 'error');
    } finally {
      vBtn.textContent = original;
      vBtn.disabled = false;
    }
  });

  // URL state restore
  if (location.search.includes('step=verify')) {
    if (cardVerify) cardVerify.hidden = false;
    document.body.classList.add('is-verify');
    setTimeout(() => el('#code-1')?.focus(), 250);
  }

  // Video background fade (generic)
  const videoBackground = document.querySelector('.video-background');
  if (videoBackground) {
    const FADE_WINDOW = 1.5;
    videoBackground.addEventListener('timeupdate', function () {
      const duration = this.duration || 0;
      const currentTime = this.currentTime || 0;
      if (!duration) return;
      const timeLeft = duration - currentTime;
      if (timeLeft <= FADE_WINDOW && timeLeft > 0) this.style.opacity = Math.max(0, timeLeft / FADE_WINDOW);
      else if (currentTime <= FADE_WINDOW) this.style.opacity = Math.min(1, currentTime / FADE_WINDOW);
      else this.style.opacity = 1;
    });
    videoBackground.addEventListener('loadeddata', function () {
      this.style.opacity = 0;
      this.style.transition = 'opacity 1.5s ease-in-out';
    });
    videoBackground.addEventListener('play', function () {
      if (this.currentTime <= 0.1) { this.style.opacity = 0; requestAnimationFrame(() => { this.style.opacity = 1; }); }
    });
  }
});

