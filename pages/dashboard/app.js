// Dashboard App - Real Backend Integration v2.0
(() => {
    console.log('🚀 Dashboard v2.0 - Loading real data from backend...');
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
                // Save to global for create post
                currentUser = data.user;
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

    // Posts state
    let postsData = [];
    let currentUser = null;

    // Load posts from backend
    async function loadPosts() {
        try {
            console.log('🔄 Fetching posts from:', `${API_BASE}/posts/feed.php`);
            
            const res = await fetch(`${API_BASE}/posts/feed.php?limit=20&offset=0`, {
                credentials: 'include'
            });
            
            console.log('📡 Response status:', res.status);
            console.log('📡 Response headers:', res.headers.get('content-type'));
            
            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('❌ BACKEND ERROR - Returned HTML instead of JSON:');
                console.error('━'.repeat(80));
                console.error(text.substring(0, 1000)); // Show first 1000 chars
                console.error('━'.repeat(80));
                
                postsData = [];
                renderPosts();
                toast('Backend error - check Console for details', true);
                return;
            }
            
            const data = await res.json();

            if (data.success) {
                // Backend success - posts might be empty array
                postsData = data.posts || [];
                
                if (postsData.length === 0) {
                    console.log('📭 No posts in database yet. Create your first post!');
                } else {
                    console.log(`✅ Loaded ${postsData.length} posts from database`);
                }
                
                renderPosts();
            } else {
                // Backend error
                console.error('❌ Backend error:', data.message);
                postsData = [];
                renderPosts();
                toast(data.message || 'Failed to load posts', true);
            }
        } catch (error) {
            // Network or parsing error
            console.error('❌ Exception while loading posts:', error);
            console.error('Stack trace:', error.stack);
            postsData = [];
            renderPosts();
            toast('Failed to connect to server', true);
        }
    }

    // Format time ago
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    // Render posts
    function renderPosts() {
        const container = $('#postsContainer');
        if (!container) return;

        if (postsData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper" style="font-size: 64px; color: #999; margin-bottom: 16px;"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = postsData.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-user">
                        <img src="${post.user_avatar || '../../assets/images/logo.png'}" alt="${post.user_name}" class="post-avatar">
                        <div class="post-user-info">
                            <div class="post-user-name">${post.user_name}</div>
                            <div class="post-time">
                                ${timeAgo(post.created_at)}${post.location ? ' · ' + post.location : ''}
                            </div>
                        </div>
                    </div>
                    <button class="post-menu-btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                
                <div class="post-content">
                    <div class="post-text">${post.content}</div>
                    ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="post-image">` : ''}
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
                        <span>${post.total_reactions || 0}</span>
                    </div>
                    <div class="post-comments-count">${post.total_comments || 0} comments</div>
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn ${post.user_reaction ? 'active' : ''}" data-post-id="${post.id}">
                        <i class="fas fa-thumbs-up"></i>
                        <span>Like</span>
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                    <button class="action-btn share-btn">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                </div>
                
                <!-- Comments Section -->
                <div class="post-comments" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list" id="comments-list-${post.id}"></div>
                    <div class="comment-form">
                        <img src="${currentUser?.avatar || '../../assets/images/logo.png'}" alt="You" class="comment-avatar">
                        <input type="text" placeholder="Write a comment..." class="comment-input" data-post-id="${post.id}">
                        <button class="comment-submit-btn" data-post-id="${post.id}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Setup event listeners
        setupLikeButtons();
        setupCommentButtons();
        setupCommentSubmit();
    }

    // Handle Like/Unlike
    async function handleLike(postId, isCurrentlyLiked) {
        try {
            const endpoint = isCurrentlyLiked ? 'remove.php' : 'add.php';
            const res = await fetch(`${API_BASE}/reactions/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    post_id: postId,
                    reaction_type: 'like'
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                // Update local state
                const post = postsData.find(p => p.id === postId);
                if (post) {
                    if (isCurrentlyLiked) {
                        post.total_reactions = Math.max(0, (post.total_reactions || 0) - 1);
                        post.user_reaction = null;
                    } else {
                        post.total_reactions = (post.total_reactions || 0) + 1;
                        post.user_reaction = 'like';
                    }
                    
                    // Update UI
                    const postCard = $(`.post-card[data-post-id="${postId}"]`);
                    if (postCard) {
                        const likeBtn = postCard.querySelector('.like-btn');
                        const likesSpan = postCard.querySelector('.post-reactions span');
                        
                        if (isCurrentlyLiked) {
                            likeBtn.classList.remove('active');
                        } else {
                            likeBtn.classList.add('active');
                        }
                        
                        likesSpan.textContent = post.total_reactions;
                    }
                }
            } else {
                toast(data.message || 'Failed to update reaction', true);
            }
        } catch (error) {
            console.error('Like error:', error);
            toast('Failed to update reaction', true);
        }
    }

    // Setup Like buttons
    function setupLikeButtons() {
        $$('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const postId = parseInt(btn.dataset.postId);
                const isLiked = btn.classList.contains('active');
                await handleLike(postId, isLiked);
            });
        });
    }

    // Setup Comment buttons (toggle comment section)
    function setupCommentButtons() {
        $$('.comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const postId = parseInt(btn.dataset.postId);
                const commentsSection = $(`#comments-${postId}`);
                
                if (commentsSection) {
                    const isVisible = commentsSection.style.display !== 'none';
                    commentsSection.style.display = isVisible ? 'none' : 'block';
                    
                    if (!isVisible) {
                        // Load comments when opening
                        await loadComments(postId);
                    }
                }
            });
        });
    }

    // Load comments for a post
    async function loadComments(postId) {
        try {
            const res = await fetch(`${API_BASE}/comments/get.php?post_id=${postId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success && data.comments) {
                renderComments(postId, data.comments);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    // Render comments
    function renderComments(postId, comments) {
        const commentsList = $(`#comments-list-${postId}`);
        if (!commentsList) return;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <img src="${comment.user_avatar || '../../assets/images/logo.png'}" alt="${comment.user_name}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-author">${comment.user_name}</div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-time">${timeAgo(comment.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    // Setup comment submit
    function setupCommentSubmit() {
        $$('.comment-submit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const postId = parseInt(btn.dataset.postId);
                const input = $(`.comment-input[data-post-id="${postId}"]`);
                
                if (input && input.value.trim()) {
                    await submitComment(postId, input.value.trim());
                    input.value = '';
                }
            });
        });
        
        // Also submit on Enter key
        $$('.comment-input').forEach(input => {
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    const postId = parseInt(input.dataset.postId);
                    await submitComment(postId, input.value.trim());
                    input.value = '';
                }
            });
        });
    }

    // Submit comment
    async function submitComment(postId, content) {
        try {
            const res = await fetch(`${API_BASE}/comments/add.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    post_id: postId,
                    content: content
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                // Update comment count
                const post = postsData.find(p => p.id === postId);
                if (post) {
                    post.total_comments = (post.total_comments || 0) + 1;
                    
                    const postCard = $(`.post-card[data-post-id="${postId}"]`);
                    if (postCard) {
                        const countEl = postCard.querySelector('.post-comments-count');
                        if (countEl) {
                            countEl.textContent = `${post.total_comments} comments`;
                        }
                    }
                }
                
                // Reload comments
                await loadComments(postId);
                toast('Comment added!');
            } else {
                toast(data.message || 'Failed to add comment', true);
            }
        } catch (error) {
            console.error('Comment error:', error);
            toast('Failed to add comment', true);
        }
    }

    // Create Post
    async function createPost(content, imageUrl = null) {
        try {
            const res = await fetch(`${API_BASE}/posts/create.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    content: content,
                    image_url: imageUrl,
                    visibility: 'public'
                })
            });
            
            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('❌ Backend returned HTML instead of JSON:', text.substring(0, 500));
                toast('Backend error - check console', true);
                return false;
            }
            
            const data = await res.json();
            
            if (data.success) {
                toast('Post created!');
                // Reload posts
                await loadPosts();
                return true;
            } else {
                toast(data.message || 'Failed to create post', true);
                return false;
            }
        } catch (error) {
            console.error('Create post error:', error);
            toast('Failed to create post', true);
            return false;
        }
    }

    // Create post input
    const createPostInput = $('#createPostInput');
    if (createPostInput) {
        createPostInput.addEventListener('click', () => {
            // Show create post modal
            showCreatePostModal();
        });
    }

    // Show create post modal
    function showCreatePostModal() {
        const modal = document.createElement('div');
        modal.className = 'create-post-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create Post</h3>
                    <button class="modal-close" onclick="this.closest('.create-post-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-user-info">
                        <img src="${currentUser?.avatar_url || '../../assets/images/logo.png'}" alt="You" class="modal-user-avatar">
                        <div class="modal-user-name">${currentUser?.full_name || 'User'}</div>
                    </div>
                    <textarea id="newPostContent" placeholder="What's on your mind?" rows="5" autofocus></textarea>
                    <div class="modal-image-input">
                        <label for="newPostImage">
                            <i class="fas fa-image"></i> Image URL (optional)
                        </label>
                        <input type="text" id="newPostImage" placeholder="https://example.com/image.jpg" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="this.closest('.create-post-modal').remove()">Cancel</button>
                    <button class="btn-post" id="submitPostBtn">Post</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus textarea after modal is added to DOM
        setTimeout(() => {
            const textarea = document.getElementById('newPostContent');
            if (textarea) textarea.focus();
        }, 100);
        
        // Post handler
        const submitBtn = document.getElementById('submitPostBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                const content = document.getElementById('newPostContent').value.trim();
                const imageUrl = document.getElementById('newPostImage').value.trim();
                
                if (!content) {
                    toast('Please write something!', true);
                    return;
                }
                
                // Disable button during submission
                submitBtn.disabled = true;
                submitBtn.textContent = 'Posting...';
                
                const success = await createPost(content, imageUrl || null);
                
                if (success) {
                    modal.remove();
                } else {
                    // Re-enable button on failure
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Post';
                }
            });
        }
    }

    // Post action buttons
    $$('.post-action').forEach(btn => {
        btn.addEventListener('click', () => {
            toast('Feature coming soon!');
        });
    });

    // Initialize - Load real data from backend
    console.log('🔗 API Base:', API_BASE);
    console.log('📊 Dashboard initializing with REAL backend data...');
    
    checkAuth().then(() => {
        console.log('✅ Auth checked, loading posts from database...');
        loadPosts();
    });
})();

