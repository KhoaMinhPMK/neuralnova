const el = (s) => document.querySelector(s);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const showToast = (msg, type = 'success') => { 
  const t = el('#fpToast'); 
  t.className = `toast ${type}`; 
  t.textContent = msg; 
};

const simulateSend = (email) => new Promise((resolve, reject) => {
  setTimeout(() => { 
    email.toLowerCase().includes('fail') 
      ? reject(new Error('Không tìm thấy tài khoản')) 
      : resolve(true); 
  }, 700);
});

document.addEventListener('DOMContentLoaded', () => {
  const form = el('#forgotForm');
  const btn = el('#btnSubmitForgot');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showToast('', '');
    
    const email = el('#email').value.trim();
    if (!emailRegex.test(email)) { 
      showToast('Email không hợp lệ.', 'error'); 
      return; 
    }
    
    const original = btn.textContent; 
    btn.textContent = 'Đang gửi...'; 
    btn.disabled = true;
    
    try {
      await simulateSend(email);
      showToast('Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.', 'success');
      setTimeout(() => {
        window.location.href = '../verify-code/index.html';
      }, 2000);
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra.', 'error');
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
