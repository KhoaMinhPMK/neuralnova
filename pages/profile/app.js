// Profile Page - Facebook Dark Mode Style
(() => {
  const API_BASE = 'https://neuralnova.space/backend/api';
  const FILE_SERVER = 'https://neuralnova.space:3000'; // Node.js file server
  let currentUser = null;
  
  // Toast notification
  const toast = (msg, duration = 3000) => {
    const toastEl = document.getElementById('toast');
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  };
  
  // User menu dropdown
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  userMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });
  
  document.addEventListener('click', () => {
    userDropdown.classList.remove('show');
  });
  
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/auth/logout.php`, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('nn_user');
      window.location.href = '../auth/index.html';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '../auth/index.html';
    }
  });
  
  // Tab switching
  const tabs = document.querySelectorAll('.profile-nav-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      const activeContent = document.getElementById(`${tabName}Tab`);
      if (activeContent) {
        activeContent.style.display = 'block';
      }
    });
  });
  
  // Cover photo upload
  const editCoverBtn = document.querySelector('.edit-cover-btn');
  const coverInput = document.getElementById('coverInput');
  
  editCoverBtn?.addEventListener('click', () => {
    coverInput.click();
  });
  
  coverInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 10MB for cover)
    if (file.size > 10 * 1024 * 1024) {
      toast('File too large. Max 10MB');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      console.log('📤 Uploading cover to Node.js server:', file.name, file.size, 'bytes');
      
      // Step 1: Upload to Node.js file server
      const response = await fetch(`${FILE_SERVER}/upload/cover`, {
        method: 'POST',
        body: formData
      });
      
      console.log('📡 Cover upload status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Backend error (cover):');
        console.error('━'.repeat(80));
        console.error(text);
        console.error('━'.repeat(80));
        toast('Upload failed - check Console');
        return;
      }
      
      const data = await response.json();
      console.log('📦 Cover response:', data);
      
      if (data.success && data.file) {
        const coverUrl = data.file.url;
        
        // Step 2: Save URL to database via PHP API
        const saveResponse = await fetch(`${API_BASE}/profile/update.php`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ cover_url: coverUrl }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        const saveData = await saveResponse.json();
        
        if (saveData.success) {
          document.getElementById('coverImg').src = coverUrl;
          toast('Cover photo updated!');
        } else {
          toast('Failed to save: ' + (saveData.error || 'Unknown error'));
        }
      } else {
        toast('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Cover upload error:', error);
      toast('Upload failed');
    }
  });

  // Avatar upload
  const editAvatarBtn = document.querySelector('.edit-avatar-btn');
  const avatarInput = document.getElementById('avatarInput');
  
  editAvatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarInput.click();
  });
  
  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB for avatar)
    if (file.size > 5 * 1024 * 1024) {
      toast('File too large. Max 5MB');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('📤 Uploading avatar to Node.js server:', file.name, file.size, 'bytes');
      
      // Step 1: Upload to Node.js file server
      const response = await fetch(`${FILE_SERVER}/upload/avatar`, {
        method: 'POST',
        body: formData
      });
      
      console.log('📡 Avatar upload status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Backend error (avatar):');
        console.error('━'.repeat(80));
        console.error(text);
        console.error('━'.repeat(80));
        toast('Upload failed - check Console');
        return;
      }
      
      const data = await response.json();
      console.log('📦 Avatar response:', data);
      
      if (data.success && data.file) {
        const avatarUrl = data.file.url;
        
        // Step 2: Save URL to database via PHP API
        const saveResponse = await fetch(`${API_BASE}/profile/update.php`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ avatar_url: avatarUrl }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        const saveData = await saveResponse.json();
        
        if (saveData.success) {
          document.getElementById('profilePicture').src = avatarUrl;
          document.getElementById('navAvatar').src = avatarUrl;
          document.getElementById('createPostAvatar').src = avatarUrl;
          toast('Profile picture updated!');
        } else {
          toast('Failed to save: ' + (saveData.error || 'Unknown error'));
        }
      } else {
        toast('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      toast('Upload failed');
    }
  });
  
  // Edit details modal
  const editModal = document.getElementById('editModal');
  const editDetailsBtn = document.getElementById('editDetailsBtn');
  const closeModal = document.getElementById('closeModal');
  const cancelEdit = document.getElementById('cancelEdit');
  const saveIntro = document.getElementById('saveIntro');
  
  editDetailsBtn?.addEventListener('click', () => {
    editModal.style.display = 'flex';
  });
  
  closeModal?.addEventListener('click', () => {
    editModal.style.display = 'none';
  });
  
  cancelEdit?.addEventListener('click', () => {
    editModal.style.display = 'none';
  });
  
  editModal?.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.style.display = 'none';
    }
  });
  
  saveIntro?.addEventListener('click', async () => {
    try {
      const formData = new FormData();
      formData.append('bio', document.getElementById('bio').value.trim());
      formData.append('interests', document.getElementById('interests').value.trim());
      formData.append('country', document.getElementById('countrySel').value);
      
      const response = await fetch(`${API_BASE}/profile/update.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast('Details updated!');
        editModal.style.display = 'none';
        await loadProfile();
      } else {
        toast('Update failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update error:', error);
      toast('Update failed');
    }
  });
  
  // Load profile data
  async function loadProfile() {
    try {
      // Check auth
      const authResponse = await fetch(`${API_BASE}/auth/check-session.php`, {
        credentials: 'include'
      });
      const authData = await authResponse.json();
      
      if (!authData.success || !authData.authenticated) {
        window.location.href = '../auth/index.html';
        return;
      }
      
      currentUser = authData.user;
      
      // Load profile
      const profileResponse = await fetch(`${API_BASE}/profile/get.php`, {
        credentials: 'include'
      });
      const profileData = await profileResponse.json();
      
      console.log('📦 Profile data:', profileData);
      
      if (profileData.success && profileData.user) {
        const prof = profileData.user;
        
        // Null-safe checks for all fields
        const avatarUrl = prof?.avatar_url || '../../assets/images/logo.png';
        const coverUrl = prof?.cover_url || '../../assets/images/nature1.jpg';
        const fullName = prof?.full_name || 'User';
        
        // Update UI safely
        const profilePic = document.getElementById('profilePicture');
        const navAvatar = document.getElementById('navAvatar');
        const createPostAvatar = document.getElementById('createPostAvatar');
        const coverImg = document.getElementById('coverImg');
        const profileName = document.getElementById('profileName');
        const profileFriends = document.getElementById('profileFriends');
        
        if (profilePic) profilePic.src = avatarUrl;
        if (navAvatar) navAvatar.src = avatarUrl;
        if (createPostAvatar) createPostAvatar.src = avatarUrl;
        if (coverImg) coverImg.src = coverUrl;
        if (profileName) profileName.textContent = fullName;
        
        // Update friends count with posts count
        const friendsCount = prof.stats?.posts || 0;
        if (profileFriends) profileFriends.textContent = `${friendsCount} posts`;
        
        console.log('✅ Profile loaded:', fullName, 'Posts:', friendsCount);
        
        // Update bio safely
        const bioDisplay = document.getElementById('bioDisplay');
        if (bioDisplay) {
          bioDisplay.textContent = prof?.bio || '';
        }
        
        // Update intro details safely
        const introDetails = document.getElementById('introDetails');
        if (introDetails) {
          let detailsHTML = '';
          
          if (prof?.interests) {
            // interests is array from API
            const interests = Array.isArray(prof.interests) ? prof.interests.join(', ') : prof.interests;
            detailsHTML += `
              <div class="intro-item">
                <i class="fas fa-heart"></i>
                <span>${interests}</span>
        </div>
            `;
          }
          
          if (prof?.country) {
            detailsHTML += `
              <div class="intro-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${prof.country}</span>
          </div>
            `;
          }
          
          if (prof?.email) {
            detailsHTML += `
              <div class="intro-item">
                <i class="fas fa-envelope"></i>
                <span>${prof.email}</span>
        </div>
            `;
          }
          
          introDetails.innerHTML = detailsHTML;
        }
        
        // Fill edit form safely
        const bioInput = document.getElementById('bio');
        const interestsInput = document.getElementById('interests');
        const countrySel = document.getElementById('countrySel');
        
        if (bioInput) {
          bioInput.value = prof?.bio || '';
        }
        if (interestsInput) {
          // interests is array from API
          const interests = Array.isArray(prof?.interests) ? prof.interests.join(', ') : (prof?.interests || '');
          interestsInput.value = interests;
        }
        if (countrySel) {
          countrySel.value = prof?.country || '';
        }
      } else {
        console.error('❌ Profile load failed:', profileData);
        toast('Failed to load profile. Please refresh the page.');
        
        // Set default values
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = 'User';
      }
      
      // Load badges
      await loadBadges();
      
      // Load stats
      await loadStats();
      
      // Load posts
      await loadPosts();
      
    } catch (error) {
      console.error('❌ Load profile error:', error);
      toast('Failed to load profile. Please refresh the page.');
      
      // Set default values to prevent blank page
      const profileName = document.getElementById('profileName');
      const profileFriends = document.getElementById('profileFriends');
      const profilePic = document.getElementById('profilePicture');
      const navAvatar = document.getElementById('navAvatar');
      
      if (profileName) profileName.textContent = 'User';
      if (profileFriends) profileFriends.textContent = '0 posts';
      if (profilePic) profilePic.src = '../../assets/images/logo.png';
      if (navAvatar) navAvatar.src = '../../assets/images/logo.png';
    }
  }
  
  // Load badges
  async function loadBadges() {
    try {
      const response = await fetch(`${API_BASE}/profile/badges.php`, {
        credentials: 'include'
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ BADGES API ERROR:');
        console.error('━'.repeat(80));
        console.error(text);
        console.error('━'.repeat(80));
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.badges) {
        const badgesEl = document.getElementById('badges');
        if (badgesEl) {
          badgesEl.innerHTML = data.badges.map(badge => `
            <div class="badge" style="border-color: ${badge.color}">
              <i class="fas fa-${badge.icon}"></i>
              ${badge.name}
        </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('❌ Badges error:', error);
    }
  }
  
  // Load stats
  async function loadStats() {
    try {
      const response = await fetch(`${API_BASE}/profile/timeline.php`, {
        credentials: 'include'
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ TIMELINE API ERROR:');
        console.error('━'.repeat(80));
        console.error(text);
        console.error('━'.repeat(80));
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.stats) {
        const statsDisplay = document.getElementById('statsDisplay');
        if (statsDisplay) {
          statsDisplay.innerHTML = `
            <div class="stat-item">
              <span class="stat-value">${data.stats.total_posts}</span>
              <span class="stat-label">Posts</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${data.stats.regions_count}</span>
              <span class="stat-label">Places</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${data.stats.species_count}</span>
              <span class="stat-label">Species</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${data.stats.accuracy_rate}%</span>
              <span class="stat-label">Accuracy</span>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('❌ Stats error:', error);
    }
  }
  
  // Load posts
  async function loadPosts() {
    try {
      if (!currentUser) {
        console.log('⚠️ No currentUser, skipping posts load');
        return;
      }
      
      const url = `${API_BASE}/posts/feed.php?user_id=${currentUser.id}&limit=50`;
      console.log('🔄 Loading posts from:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Backend error:', text.substring(0, 500));
        return;
      }
      
      const data = await response.json();
      console.log('📦 Posts data:', data);
      
      if (data.success && data.posts) {
        console.log('✅ Loaded', data.posts.length, 'posts');
        renderPosts(data.posts);
        
        // Update photos grid
        const photos = data.posts.filter(p => p.image_url).slice(0, 9);
        renderPhotos(photos);
      } else {
        console.log('⚠️ No posts or error:', data.message || 'Unknown');
        renderPosts([]);
      }
    } catch (error) {
      console.error('❌ Load posts error:', error);
      renderPosts([]);
    }
  }
  
  // Render posts
  function renderPosts(posts) {
    const postsFeed = document.getElementById('postsFeed');
    if (!postsFeed) {
      console.log('⚠️ postsFeed element not found');
      return;
    }
    
    console.log('🎨 Rendering', posts.length, 'posts');
    
    if (!posts || posts.length === 0) {
      postsFeed.innerHTML = '<div class="card"><p style="text-align:center;color:#b0b3b8;padding:40px 20px;">No posts yet. Create your first post!</p></div>';
      return;
    }
    
    postsFeed.innerHTML = posts.map(post => `
      <div class="post-card">
        <div class="post-header">
          <img src="${post.user_avatar || '../../assets/images/logo.png'}" alt="User" class="user-avatar-small">
          <div class="post-author-info">
            <h3>${post.user_name || 'User'}</h3>
            <p class="post-time">${new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>
        ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
        ${post.image_url ? `<div class="post-media"><img src="${post.image_url}" alt="Post"></div>` : ''}
        ${post.species ? `<div class="post-content" style="color:#b0b3b8;font-size:13px">
          <i class="fas fa-seedling"></i> ${post.species} 
          ${post.region ? `• ${post.region}` : ''}
          ${post.bloom_window ? `• Bloom: ${post.bloom_window}` : ''}
        </div>` : ''}
        <div class="post-actions">
          <button class="post-action-btn ${post.user_reaction ? 'liked' : ''}">
            <i class="fas fa-thumbs-up"></i>
            <span>${post.total_reactions || 0} Like</span>
          </button>
          <button class="post-action-btn">
            <i class="fas fa-comment"></i>
            <span>${post.total_comments || 0} Comment</span>
          </button>
        </div>
      </div>
    `).join('');
  }
  
  // Render photos
  function renderPhotos(photos) {
    const photosGrid = document.getElementById('photosGrid');
    if (!photosGrid) return;
    
    if (!photos || photos.length === 0) {
      photosGrid.innerHTML = '<div class="photo-placeholder">No photos yet</div>';
      return;
    }
    
    photosGrid.innerHTML = photos.map(photo => `
      <div class="photo-item">
        <img src="${photo.image_url}" alt="Photo">
      </div>
    `).join('');
  }
  
  // Initialize
  loadProfile();
})();
