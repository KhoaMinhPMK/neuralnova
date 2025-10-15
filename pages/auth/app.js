// ===========================================
// NeuralNova Authentication
// API Integration with Backend
// ===========================================

// ⚠️ CHANGE THIS TO YOUR API URL
const API_BASE_URL = 'https://neuralnova.space/backend/api'; // Production - ĐANG DÙNG
// const API_BASE_URL = 'http://localhost/neuralnova/backend/api'; // Local

// ===========================================
// Login Handler
// ===========================================

async function handleLogin() {
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
  
  // 🔍 DEBUG: Log request details
  console.log('🔍 Login Request:');
  console.log('API URL:', `${API_BASE_URL}/auth/login.php`);
  console.log('Data:', { email, password: '[hidden]' });
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    // 🔍 DEBUG: Log response
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    const data = await response.json();
    console.log('📦 Response Data:', data);
    
    if (data.success) {
      showSuccess('loginError', data.message);
      setTimeout(() => {
        window.location.href = data.data.redirect || '../../index.html';
      }, 1000);
    } else {
      // 🔍 DEBUG: Log validation errors
      if (data.errors) {
        console.log('❌ Login Errors:', data.errors);
        Object.entries(data.errors).forEach(([field, error]) => {
          console.log(`   - ${field}: ${error}`);
        });
      }
      showError('loginError', data.message, data.errors);
      setLoading(submitBtn, false);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showError('loginError', 'Connection error. Please try again.');
    setLoading(submitBtn, false);
  }
}

// ===========================================
// Register Handler
// ===========================================

async function handleRegister() {
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
  
  // 🔍 DEBUG: Log request details
  console.log('🔍 Registration Request:');
  console.log('API URL:', `${API_BASE_URL}/auth/register.php`);
  console.log('Data:', { full_name: fullName, email, password: '[hidden]', terms_accepted: termsAccepted });
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
        terms_accepted: termsAccepted
      })
    });
    
    // 🔍 DEBUG: Log response
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    const data = await response.json();
    console.log('📦 Response Data:', data);
    
    if (data.success) {
      showSuccess('registerError', data.message);
      setTimeout(() => {
        window.location.href = data.data.redirect || '../../index.html';
      }, 1500);
    } else {
      // 🔍 DEBUG: Log validation errors
      if (data.errors) {
        console.log('❌ Validation Errors:', data.errors);
        Object.entries(data.errors).forEach(([field, error]) => {
          console.log(`   - ${field}: ${error}`);
        });
      }
      showError('registerError', data.message, data.errors);
      setLoading(submitBtn, false);
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', error.message, error.stack);
    showError('registerError', 'Connection error. Please try again.');
    setLoading(submitBtn, false);
  }
}

// Make functions globally available IMMEDIATELY
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;

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
// UI Toggle
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  const sign_in_btn = document.querySelector("#sign-in-btn");
  const sign_up_btn = document.querySelector("#sign-up-btn");
  const container = document.querySelector(".container");
  
  if (sign_up_btn) {
    sign_up_btn.addEventListener("click", () => {
      container.classList.add("sign-up-mode");
      clearMessages();
    });
  }
  
  if (sign_in_btn) {
    sign_in_btn.addEventListener("click", () => {
      container.classList.remove("sign-up-mode");
      clearMessages();
    });
  }
});

// ===========================================
// Social Login Handlers (Mock)
// ===========================================

document.querySelectorAll('.social-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    const provider = icon.getAttribute('aria-label').replace('Continue with ', '');
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

    const overlay = document.createElement('div');
    overlay.className = 'route-transition';
    document.body.appendChild(overlay);

    const container = document.querySelector(".container");
    container?.classList.add('route-blur');

    const vid = document.querySelector('.video-background');
    if (vid) {
      vid.classList.add('fade-out');
    }

    overlay.offsetHeight;
    overlay.classList.add('active');

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
  videoBackground.currentTime = 10;
  
  videoBackground.addEventListener('timeupdate', function() {
    const duration = this.duration;
    const currentTime = this.currentTime;
    const timeLeft = duration - currentTime;
    
    if (timeLeft <= 1.5 && timeLeft > 0) {
      this.style.opacity = timeLeft / 1.5;
    } else if (currentTime >= 10 && currentTime <= 11.5) {
      this.style.opacity = (currentTime - 10) / 1.5;
    } else {
      this.style.opacity = 1;
    }
  });
  
  videoBackground.addEventListener('loadeddata', function() {
    this.currentTime = 10;
    this.style.opacity = 0;
    this.style.transition = 'opacity 1.5s ease-in-out';
  });
  
  videoBackground.addEventListener('ended', function() {
    this.currentTime = 10;
    this.play();
  });
  
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
