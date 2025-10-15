// ===========================================
// NeuralNova Authentication
// API Integration with Backend
// ===========================================

// ⚠️ CHANGE THIS TO YOUR API URL
const API_BASE_URL = 'https://neuralnova.space/backend/api'; // Production - ĐANG DÙNG
// const API_BASE_URL = 'http://localhost/neuralnova/backend/api'; // Local

// UI Toggle
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
  clearMessages();
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
  clearMessages();
});

// ===========================================
// Helper Functions
// ===========================================

function showError(elementId, message, errors = null) {
  const errorEl = document.getElementById(elementId);
  
  let html = `<strong>❌ ${message}</strong>`;
  
  if (errors && typeof errors === 'object') {
    html += '<ul>';
    for (const [field, error] of Object.entries(errors)) {
      if (error) html += `<li>${error}</li>`;
    }
    html += '</ul>';
  }
  
  errorEl.innerHTML = html;
  errorEl.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

function showSuccess(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.className = 'success-message';
  errorEl.innerHTML = `<strong>✅ ${message}</strong>`;
  errorEl.style.display = 'block';
}

function clearMessages() {
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('registerError').style.display = 'none';
}

function setLoading(buttonEl, isLoading) {
  if (isLoading) {
    buttonEl.classList.add('loading');
    buttonEl.disabled = true;
  } else {
    buttonEl.classList.remove('loading');
    buttonEl.disabled = false;
  }
}

// ===========================================
// Login Handler
// ===========================================

const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('loginBtn');
  
  // Clear previous errors
  clearMessages();
  
  // Validate
  if (!email || !password) {
    showError('loginError', 'Please fill in all fields');
    return;
  }
  
  // Set loading state
  setLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important for sessions
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Success!
      showSuccess('loginError', data.message);
      
      // Redirect after 1 second
      setTimeout(() => {
        window.location.href = data.data.redirect || '../../index.html';
      }, 1000);
      
    } else {
      // Error
      showError('loginError', data.message, data.errors);
      setLoading(submitBtn, false);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showError('loginError', 'Connection error. Please try again.');
    setLoading(submitBtn, false);
  }
});

// ===========================================
// Register Handler
// ===========================================

const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('registerFullName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const termsAccepted = document.getElementById('terms').checked;
  const submitBtn = document.getElementById('registerBtn');
  
  // Clear previous errors
  clearMessages();
  
  // Validate
  if (!fullName || !email || !password) {
    showError('registerError', 'Please fill in all fields');
    return;
  }
  
  if (!termsAccepted) {
    showError('registerError', 'You must accept the Terms & Conditions');
    return;
  }
  
  // Set loading state
  setLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important for sessions
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
        terms_accepted: termsAccepted
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Success!
      showSuccess('registerError', data.message);
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = data.data.redirect || '../../index.html';
      }, 1500);
      
    } else {
      // Error
      showError('registerError', data.message, data.errors);
      setLoading(submitBtn, false);
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    showError('registerError', 'Connection error. Please try again.');
    setLoading(submitBtn, false);
  }
});

// ===========================================
// Social Login Handlers (Mock)
// ===========================================

document.querySelectorAll('.social-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    const provider = icon.getAttribute('aria-label').replace('Continue with ', '');
    
    // Show coming soon message
    alert(`🚧 ${provider} login coming soon!\n\nThis feature will be available in the next update.`);
  });
});

// ===========================================
// Foggy transition to Forgot Password
// ===========================================

const forgotLink = document.querySelector('.forgot-password a');
if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    const href = forgotLink.getAttribute('href');

    // Create a fog/blur overlay
    const overlay = document.createElement('div');
    overlay.className = 'route-transition';
    document.body.appendChild(overlay);

    // Subtle blur/scale on the main container
    container?.classList.add('route-blur');

    // Fade out video a bit sooner for crossfade feel
    const vid = document.querySelector('.video-background');
    if (vid) {
      vid.classList.add('fade-out');
    }

    // Force reflow then activate transition
    overlay.offsetHeight;
    overlay.classList.add('active');

    // Navigate after transition
    setTimeout(() => {
      window.location.href = href;
    }, 700);
  });
}

// ===========================================
// Video fade loop smooth transition
// ===========================================

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

// ===========================================
// Check if user is already logged in
// ===========================================

async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-session.php`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // User is logged in, redirect to home
      console.log('User already logged in:', data.data.user);
      // Uncomment to auto-redirect:
      // window.location.href = '../../index.html';
    }
  } catch (error) {
    console.log('Not authenticated');
  }
}

// Check auth on page load
checkAuth();

console.log('🚀 NeuralNova Auth loaded. API:', API_BASE_URL);
