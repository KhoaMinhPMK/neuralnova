/**
 * NeuralNova - Authentication Integration
 * Check user login status and update UI
 * 
 * @version 1.0.0
 * @date 2025-10-15
 */

const API_BASE_URL = 'https://neuralnova.space/backend/api';

// Global user state
let currentUser = null;

/**
 * Check if user is logged in
 */
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check-session.php`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.data.user) {
            // User is logged in
            currentUser = data.data.user;
            updateUIForLoggedInUser();
            console.log('✅ User logged in:', currentUser.full_name);
            return true;
        } else {
            // Not logged in
            currentUser = null;
            updateUIForGuest();
            console.log('👤 User not logged in');
            return false;
        }
        
    } catch (error) {
        console.log('Auth check error:', error);
        currentUser = null;
        updateUIForGuest();
        return false;
    }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    
    // Replace login buttons with user menu
    navActions.innerHTML = `
        <div class="user-menu">
            <button class="btn btn-user" id="userMenuBtn">
                <i data-lucide="user"></i>
                <span>${currentUser.full_name}</span>
                <i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i>
            </button>
            
            <div class="user-dropdown" id="userDropdown" style="display: none;">
                <a href="pages/profile/index.html" class="dropdown-item">
                    <i data-lucide="user"></i>
                    <span>Profile</span>
                </a>
                <a href="pages/wallet/index.html" class="dropdown-item">
                    <i data-lucide="wallet"></i>
                    <span>Wallet</span>
                </a>
                <div class="dropdown-divider"></div>
                <button onclick="logout()" class="dropdown-item logout-btn">
                    <i data-lucide="log-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Setup dropdown toggle
    setupUserMenu();
}

/**
 * Update UI for guest (not logged in)
 */
function updateUIForGuest() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    
    navActions.innerHTML = `
        <a href="pages/auth/index.html" class="btn btn-login">
            <i data-lucide="log-in"></i>
            <span>Sign In</span>
        </a>
        <a href="pages/auth/index.html" class="btn btn-primary">
            <i data-lucide="telescope"></i>
            <span>Start Journey</span>
        </a>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Setup user menu dropdown
 */
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!userMenuBtn || !userDropdown) return;
    
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = userDropdown.style.display === 'block';
        userDropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
}

/**
 * Logout function
 */
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout.php`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Logged out successfully');
            currentUser = null;
            updateUIForGuest();
            
            // Show success message (optional)
            showNotification('Logged out successfully!', 'success');
            
        } else {
            console.error('Logout failed:', data.message);
            showNotification('Logout failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed. Please try again.', 'error');
    }
}

/**
 * Show notification (optional - for better UX)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Get current user
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Check if user is logged in (sync)
 */
function isLoggedIn() {
    return currentUser !== null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Auth module loaded');
    checkAuth();
});

// Export functions for use in other scripts
window.NeuralNovaAuth = {
    checkAuth,
    logout,
    getCurrentUser,
    isLoggedIn
};

