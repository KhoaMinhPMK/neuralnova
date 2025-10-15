// Dashboard App - Mockup Data
(() => {
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));

    // Toast notification
    const toast = (message, isError = false) => {
        const toastEl = $('#toast');
        toastEl.textContent = message;
        toastEl.className = 'toast show' + (isError ? ' error' : '');
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    };

    // API Base URL
    const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost/neuralnova/backend/api'
        : 'https://neuralnova.space/backend/api';

    // LocalStorage Helpers
    function saveUserToLocalStorage(userData) {
        try {
            localStorage.setItem('neuralnova_user', JSON.stringify(userData));
            localStorage.setItem('neuralnova_auth_time', Date.now().toString());
        } catch (error) {
            console.error('Failed to save user to localStorage:', error);
        }
    }

    function getUserFromLocalStorage() {
        try {
            const userStr = localStorage.getItem('neuralnova_user');
            const authTime = localStorage.getItem('neuralnova_auth_time');
            
            if (!userStr || !authTime) {
                return null;
            }
            
            // Check if auth is older than 7 days
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - parseInt(authTime) > sevenDaysMs) {
                clearUserFromLocalStorage();
                return null;
            }
            
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Failed to get user from localStorage:', error);
            return null;
        }
    }

    function clearUserFromLocalStorage() {
        try {
            localStorage.removeItem('neuralnova_user');
            localStorage.removeItem('neuralnova_auth_time');
            console.log('✅ User cleared from localStorage');
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }

    // Check authentication
    async function checkAuth() {
        try {
            // First try to get user from localStorage
            const localUser = getUserFromLocalStorage();
            if (localUser) {
                console.log('✅ User loaded from localStorage:', localUser);
                // Update UI immediately from cache
                const userName = localUser.full_name || 'User';
                if ($('#sidebarUserName')) {
                    $('#sidebarUserName').textContent = userName;
                }
            }

            // Then verify with backend
            const res = await fetch(`${API_BASE}/auth/check-session.php`, {
                credentials: 'include'
            });
            const data = await res.json();

            if (!data.authenticated) {
                // Not logged in, clear localStorage and redirect
                clearUserFromLocalStorage();
                window.location.href = '../auth/index.html';
                return;
            }

            // Update UI with fresh backend data
            if (data.user) {
                const userName = data.user.full_name || 'User';
                if ($('#sidebarUserName')) {
                    $('#sidebarUserName').textContent = userName;
                }
                // Save/update user in localStorage
                saveUserToLocalStorage(data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear localStorage and redirect to auth page on error
            clearUserFromLocalStorage();
            window.location.href = '../auth/index.html';
        }
    }

    // User menu toggle
    const userMenuBtn = $('#userMenuBtn');
    const userDropdown = $('#userDropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }

    // Logout
    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                const res = await fetch(`${API_BASE}/auth/logout.php`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const data = await res.json();

                if (data.success) {
                    // Clear localStorage
                    clearUserFromLocalStorage();
                    
                    toast('Logged out successfully');
                    setTimeout(() => {
                        window.location.href = '../../index.html';
                    }, 1000);
                } else {
                    toast('Logout failed', true);
                }
            } catch (error) {
                console.error('Logout error:', error);
                // Clear localStorage anyway
                clearUserFromLocalStorage();
                toast('Logout failed', true);
            }
        });
    }

    // Mockup Posts Data
    const mockupPosts = [
        {
            id: 1,
            userName: 'Sarah Johnson',
            userAvatar: '../../assets/images/logo.png',
            time: '2 hours ago',
            text: 'Just discovered this amazing cherry blossom spot! 🌸 The bloom forecast was spot on. Perfect timing for photography!',
            image: '../../assets/images/nature1.jpg',
            likes: 124,
            comments: 18,
            species: 'Sakura',
            location: 'Tokyo, Japan'
        },
        {
            id: 2,
            userName: 'Mike Chen',
            userAvatar: '../../assets/images/logo.png',
            time: '5 hours ago',
            text: 'Our latest satellite imagery shows incredible biodiversity in the Amazon rainforest. The data is simply breathtaking! 🌳🛰️',
            image: '../../assets/images/nature2.jpg',
            likes: 256,
            comments: 42,
            species: 'Tropical Forest',
            location: 'Amazon Basin'
        },
        {
            id: 3,
            userName: 'Emma Davis',
            userAvatar: '../../assets/images/logo.png',
            time: '1 day ago',
            text: 'Sunflower fields in full bloom! Thanks to NeuralNova\'s bloom tracker, I didn\'t miss this spectacular view. 🌻',
            image: '../../assets/images/nature3.jpg',
            likes: 189,
            comments: 27,
            species: 'Sunflower',
            location: 'Provence, France'
        },
        {
            id: 4,
            userName: 'Alex Thompson',
            userAvatar: '../../assets/images/logo.png',
            time: '2 days ago',
            text: 'Monitoring vegetation changes from space has never been easier. This platform is a game-changer for environmental research! 📊',
            image: null,
            likes: 92,
            comments: 15,
            species: null,
            location: null
        }
    ];

    // Render posts
    function renderPosts() {
        const container = $('#postsContainer');
        if (!container) return;

        container.innerHTML = mockupPosts.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-user">
                        <img src="${post.userAvatar}" alt="${post.userName}" class="post-avatar">
                        <div class="post-user-info">
                            <div class="post-user-name">${post.userName}</div>
                            <div class="post-time">
                                ${post.time}${post.location ? ' · ' + post.location : ''}
                            </div>
                        </div>
                    </div>
                    <button class="post-menu-btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                
                <div class="post-content">
                    <div class="post-text">${post.text}</div>
                    ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
                </div>
                
                <div class="post-stats">
                    <div class="post-reactions">
                        <div class="reactions-icons">
                            <div class="reaction-icon reaction-like">
                                <i class="fas fa-thumbs-up"></i>
                            </div>
                            <div class="reaction-icon reaction-heart">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="reaction-icon reaction-flower">
                                <i class="fas fa-seedling"></i>
                            </div>
                        </div>
                        <span>${post.likes}</span>
                    </div>
                    <div class="post-comments-count">${post.comments} comments</div>
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn">
                        <i class="fas fa-thumbs-up"></i>
                        <span>Like</span>
                    </button>
                    <button class="action-btn comment-btn">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                    <button class="action-btn share-btn">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for like buttons
        $$('.like-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const isLiked = btn.classList.contains('active');
                
                if (isLiked) {
                    mockupPosts[index].likes++;
                    toast('Liked!');
                } else {
                    mockupPosts[index].likes--;
                }
                
                // Update like count
                const postCard = btn.closest('.post-card');
                const likesSpan = postCard.querySelector('.post-reactions span');
                likesSpan.textContent = mockupPosts[index].likes;
            });
        });

        // Comment button
        $$('.comment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toast('Comment feature coming soon!');
            });
        });

        // Share button
        $$('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toast('Share feature coming soon!');
            });
        });
    }

    // Create post input
    const createPostInput = $('#createPostInput');
    if (createPostInput) {
        createPostInput.addEventListener('click', () => {
            toast('Create post feature coming soon!');
        });
    }

    // Post action buttons
    $$('.post-action').forEach(btn => {
        btn.addEventListener('click', () => {
            toast('Feature coming soon!');
        });
    });

    // Initialize
    checkAuth();
    renderPosts();

    console.log('📊 Dashboard loaded with mockup data');
    console.log('🔗 API Base:', API_BASE);
})();

