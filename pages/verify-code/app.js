const el = (s) => document.querySelector(s);
const els = (s) => Array.from(document.querySelectorAll(s));
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const showToast = (m, t = 'success') => { 
  const x = el('#vcToast'); 
  x.className = `toast ${t}`; 
  x.textContent = m; 
};

const getCode = () => els('.code-input').map(i => i.value.trim()).join('');

const simulateVerify = ({ email, code }) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (!emailRegex.test(email)) return reject(new Error('Email không hợp lệ'));
    if (code !== '123456') return reject(new Error('Mã xác nhận không đúng'));
    resolve(true);
  }, 700);
});

document.addEventListener('DOMContentLoaded', () => {
  const inputs = els('.code-input');
  
  // Tự động focus vào ô đầu tiên
  if (inputs.length > 0) {
    inputs[0].focus();
  }
  
  // Tự động focus/di chuyển giữa các ô mã
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', (e) => {
      // Chỉ cho phép số
      inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 1);
      
      // Tự động chuyển sang ô tiếp theo
      if (inp.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
    
    inp.addEventListener('keydown', (e) => {
      // Backspace: quay lại ô trước
      if (e.key === 'Backspace' && !inp.value && idx > 0) {
        inputs[idx - 1].focus();
      }
      
      // Arrow keys navigation
      if (e.key === 'ArrowLeft' && idx > 0) {
        inputs[idx - 1].focus();
      }
      if (e.key === 'ArrowRight' && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
    
    // Paste support
    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
      
      if (pasteData.length === 6) {
        inputs.forEach((input, i) => {
          input.value = pasteData[i] || '';
        });
        inputs[inputs.length - 1].focus();
      }
    });
  });

  const form = el('#verifyForm');
  const btn = el('#btnVerify');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showToast('', '');
    
    const email = el('#email').value.trim();
    const code = getCode();
    
    if (!emailRegex.test(email)) { 
      showToast('Email không hợp lệ.', 'error'); 
      return; 
    }
    if (code.length !== 6) { 
      showToast('Vui lòng nhập đủ 6 số.', 'error'); 
      return; 
    }

    const original = btn.textContent; 
    btn.textContent = 'Đang xác nhận...'; 
    btn.disabled = true;
    
    try {
      await simulateVerify({ email, code });
      showToast('Xác nhận thành công! Bạn có thể đặt lại mật khẩu.', 'success');
      setTimeout(() => {
        window.location.href = '../auth/index.html';
      }, 2000);
    } catch (err) {
      showToast(err.message || 'Xác nhận thất bại.', 'error');
    } finally {
      btn.textContent = original; 
      btn.disabled = false;
    }
  });
  
  // Video fade loop smooth transition
  const videoBackground = document.querySelector('.video-background');
  if (videoBackground) {
    // Đặt video bắt đầu từ giây thứ 10
    videoBackground.currentTime = 10;
    
    videoBackground.addEventListener('timeupdate', function() {
      const duration = this.duration;
      const currentTime = this.currentTime;
      const timeLeft = duration - currentTime;
      
      // Fade out ở 1.5 giây cuối
      if (timeLeft <= 1.5 && timeLeft > 0) {
        this.style.opacity = timeLeft / 1.5;
      }
      // Fade in ở 1.5 giây đầu (từ giây 10-11.5)
      else if (currentTime >= 10 && currentTime <= 11.5) {
        this.style.opacity = (currentTime - 10) / 1.5;
      }
      // Opacity bình thường
      else {
        this.style.opacity = 1;
      }
    });
    
    // Đảm bảo fade in khi video load
    videoBackground.addEventListener('loadeddata', function() {
      this.currentTime = 10;
      this.style.opacity = 0;
      this.style.transition = 'opacity 1.5s ease-in-out';
    });
    
    // Khi video kết thúc, quay về giây thứ 10
    videoBackground.addEventListener('ended', function() {
      this.currentTime = 10;
      this.play();
    });
    
    // Fade in khi video bắt đầu play
    videoBackground.addEventListener('play', function() {
      if (this.currentTime < 10.5) {
        this.style.opacity = 0;
        setTimeout(() => {
          this.style.opacity = 1;
        }, 50);
      }
    });
  }
});
