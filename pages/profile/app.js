(() => {
  const $ = (s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const toastEl = $('#toast'); let tTimer;
  const toast = (m)=>{ toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(tTimer); tTimer=setTimeout(()=>toastEl.classList.remove('show'),2000); };
  
  // API Configuration
  const API_BASE = 'https://neuralnova.space/backend/api';
  let currentUser = null;
  // Inject Back to Dashboard button and hide Checkout button if present
  try {
    const header = document.querySelector('.p-header');
    if (header) {
      let actions = header.querySelector('.actions');
      if (!actions) { actions = document.createElement('nav'); actions.className = 'actions'; header.appendChild(actions); }
      const backBtn = document.createElement('a'); backBtn.className = 'btn'; backBtn.href = '../../index.html'; backBtn.textContent = 'Quay lại Dashboard'; actions.appendChild(backBtn);
      const payBtn = actions.querySelector('a[href*="checkout"]'); if (payBtn) payBtn.style.display = 'none';
    }
  } catch {}

  // Adjust UI texts/visibility per request
  try {
    // Change region label to "Nơi đến"
    const regionSelect = document.querySelector('#pRegion');
    if (regionSelect && regionSelect.previousElementSibling && regionSelect.previousElementSibling.tagName === 'LABEL') {
      regionSelect.previousElementSibling.textContent = 'Nơi đến';
    }
    // Hide the "Làm mờ vị trí..." option
    const blurInput = document.querySelector('#blurLoc');
    const blurField = blurInput ? (blurInput.closest('.field') || blurInput.parentElement) : null;
    if (blurField) blurField.style.display = 'none';
  } catch {}

  const keyProfile = 'nn_profile';
  const keyPosts   = 'nn_posts';
  // check-ins removed; integrated into posts

  // Load/save helpers
  const load = (k,def)=>{ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); }catch{ return def; } };
  const save = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

  // Initialize with backend data
  async function initProfile() {
    try {
      // Check authentication
      const authResponse = await fetch(`${API_BASE}/auth/check-session.php`, {
        credentials: 'include'
      });
      const authData = await authResponse.json();
      
      if (!authData.success || !authData.authenticated) {
        window.location.href = '../auth/index.html';
        return;
      }
      
      currentUser = authData.user;
      
      // Load profile data
      const profileResponse = await fetch(`${API_BASE}/profile/get.php`, {
        credentials: 'include'
      });
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        const prof = profileData.profile;
        const avatarSrc = prof.avatar_url || '../../assets/images/logo.png';
        if ($('#avatar')) $('#avatar').src = avatarSrc;
        const avHero = $('#avatarHero'); if (avHero) avHero.src = avatarSrc;
        if (prof.cover_url) $('#cover').src = prof.cover_url;
        $('#username').value = prof.full_name || '';
        $('#userId').value = prof.custom_user_id || ('USR_'+Date.now());
        $('#ipRegion').value = prof.ip_region || 'auto';
        $('#ipDisplay').textContent = prof.ip_address || '—';
        $('#displayName').textContent = prof.full_name || 'User';
        $('#uid').textContent = prof.custom_user_id || '—';
        $('#ipShort').textContent = prof.ip_address || '—';
        
        // Load bio and interests
        if (prof.bio) $('#bio').value = prof.bio;
        if (prof.interests) $('#interests').value = prof.interests;
        if (prof.country) $('#countrySel').value = prof.country;
        if (prof.gps_coordinates) $('#introCoords').value = prof.gps_coordinates;
      }
      
      // Load timeline and stats
      await loadTimelineAndStats();
      
      // Load badges
      await loadBadges();
      
    } catch (error) {
      console.error('Profile initialization error:', error);
      toast('Failed to load profile data');
    }
  }
  
  // Load timeline and stats from backend
  async function loadTimelineAndStats() {
    try {
      const response = await fetch(`${API_BASE}/profile/timeline.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        // Update stats
        const statsEl = $('#stats');
        if (statsEl) {
          statsEl.innerHTML = `
            <div class="stat">Nơi đến: <strong>${data.stats.regions_count}</strong></div>
            <div class="stat">Bài viết: <strong>${data.stats.total_posts}</strong></div>
            <div class="stat">Loài đã ghi: <strong>${data.stats.species_count}</strong></div>
            <div class="stat">Độ chính xác: <strong>${data.stats.accuracy_rate}%</strong></div>
          `;
        }
        
        // Update timeline
        const timelineEl = $('#timeline');
        if (timelineEl) {
          timelineEl.innerHTML = data.timeline.map(item => `
            <div class="tl-item ${item.is_accurate ? 'ok' : 'miss'}">
              <div><strong>${item.species}</strong> • ${item.region}</div>
              <div>Ngày quan sát: ${item.observation_date} • Cửa sổ dự báo: ${item.bloom_window}</div>
              <div>${item.is_accurate ? 'Khớp dự báo ✅' : 'Ngoài cửa sổ dự báo ⚠'}</div>
            </div>
          `).join('') || '<div class="tl-item">Chưa có dữ liệu. Hãy đăng một bài viết có ngày và loài.</div>';
        }
      }
    } catch (error) {
      console.error('Timeline/Stats error:', error);
    }
  }
  
  // Load badges from backend
  async function loadBadges() {
    try {
      const response = await fetch(`${API_BASE}/profile/badges.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        const badgesEl = $('#badges');
        if (badgesEl) {
          badgesEl.innerHTML = data.badges.map(badge => `
            <span class="badge" style="border-color: ${badge.color}; background: ${badge.color}20;">
              <i data-lucide="${badge.icon}"></i>${badge.name}
            </span>
          `).join('');
          
          if (window.lucide) lucide.createIcons();
        }
      }
    } catch (error) {
      console.error('Badges error:', error);
    }
  }
  
  // Initialize profile on page load
  initProfile();

  // Countries list (ISO 3166-1 alpha-2)
  const COUNTRIES = [
    ['AF','Afghanistan'],['AL','Albania'],['DZ','Algeria'],['AS','American Samoa'],['AD','Andorra'],['AO','Angola'],['AI','Anguilla'],['AG','Antigua and Barbuda'],['AR','Argentina'],['AM','Armenia'],['AW','Aruba'],['AU','Australia'],['AT','Austria'],['AZ','Azerbaijan'],
    ['BS','Bahamas'],['BH','Bahrain'],['BD','Bangladesh'],['BB','Barbados'],['BY','Belarus'],['BE','Belgium'],['BZ','Belize'],['BJ','Benin'],['BM','Bermuda'],['BT','Bhutan'],['BO','Bolivia'],['BA','Bosnia and Herzegovina'],['BW','Botswana'],['BR','Brazil'],['IO','British Indian Ocean Territory'],['VG','British Virgin Islands'],
    ['BN','Brunei'],['BG','Bulgaria'],['BF','Burkina Faso'],['BI','Burundi'],
    ['KH','Cambodia'],['CM','Cameroon'],['CA','Canada'],['CV','Cape Verde'],['KY','Cayman Islands'],['CF','Central African Republic'],['TD','Chad'],['CL','Chile'],['CN','China'],['CX','Christmas Island'],['CC','Cocos (Keeling) Islands'],['CO','Colombia'],['KM','Comoros'],['CG','Congo - Brazzaville'],['CD','Congo - Kinshasa'],['CK','Cook Islands'],['CR','Costa Rica'],['CI','Côte d’Ivoire'],['HR','Croatia'],['CU','Cuba'],['CW','Curaçao'],['CY','Cyprus'],['CZ','Czechia'],
    ['DK','Denmark'],['DJ','Djibouti'],['DM','Dominica'],['DO','Dominican Republic'],
    ['EC','Ecuador'],['EG','Egypt'],['SV','El Salvador'],['GQ','Equatorial Guinea'],['ER','Eritrea'],['EE','Estonia'],['SZ','Eswatini'],['ET','Ethiopia'],
    ['FK','Falkland Islands'],['FO','Faroe Islands'],['FJ','Fiji'],['FI','Finland'],['FR','France'],['GF','French Guiana'],['PF','French Polynesia'],['TF','French Southern Territories'],
    ['GA','Gabon'],['GM','Gambia'],['GE','Georgia'],['DE','Germany'],['GH','Ghana'],['GI','Gibraltar'],['GR','Greece'],['GL','Greenland'],['GD','Grenada'],['GP','Guadeloupe'],['GU','Guam'],['GT','Guatemala'],['GG','Guernsey'],['GN','Guinea'],['GW','Guinea-Bissau'],['GY','Guyana'],
    ['HT','Haiti'],['HN','Honduras'],['HK','Hong Kong SAR China'],['HU','Hungary'],
    ['IS','Iceland'],['IN','India'],['ID','Indonesia'],['IR','Iran'],['IQ','Iraq'],['IE','Ireland'],['IM','Isle of Man'],['IL','Israel'],['IT','Italy'],
    ['JM','Jamaica'],['JP','Japan'],['JE','Jersey'],['JO','Jordan'],
    ['KZ','Kazakhstan'],['KE','Kenya'],['KI','Kiribati'],['XK','Kosovo'],['KW','Kuwait'],['KG','Kyrgyzstan'],
    ['LA','Laos'],['LV','Latvia'],['LB','Lebanon'],['LS','Lesotho'],['LR','Liberia'],['LY','Libya'],['LI','Liechtenstein'],['LT','Lithuania'],['LU','Luxembourg'],
    ['MO','Macao SAR China'],['MG','Madagascar'],['MW','Malawi'],['MY','Malaysia'],['MV','Maldives'],['ML','Mali'],['MT','Malta'],['MH','Marshall Islands'],['MQ','Martinique'],['MR','Mauritania'],['MU','Mauritius'],['YT','Mayotte'],['MX','Mexico'],['FM','Micronesia'],['MD','Moldova'],['MC','Monaco'],['MN','Mongolia'],['ME','Montenegro'],['MS','Montserrat'],['MA','Morocco'],['MZ','Mozambique'],['MM','Myanmar (Burma)'],
    ['NA','Namibia'],['NR','Nauru'],['NP','Nepal'],['NL','Netherlands'],['NC','New Caledonia'],['NZ','New Zealand'],['NI','Nicaragua'],['NE','Niger'],['NG','Nigeria'],['NU','Niue'],['NF','Norfolk Island'],['KP','North Korea'],['MK','North Macedonia'],['MP','Northern Mariana Islands'],['NO','Norway'],
    ['OM','Oman'],
    ['PK','Pakistan'],['PW','Palau'],['PS','Palestinian Territories'],['PA','Panama'],['PG','Papua New Guinea'],['PY','Paraguay'],['PE','Peru'],['PH','Philippines'],['PN','Pitcairn Islands'],['PL','Poland'],['PT','Portugal'],['PR','Puerto Rico'],
    ['QA','Qatar'],
    ['RE','Réunion'],['RO','Romania'],['RU','Russia'],['RW','Rwanda'],
    ['WS','Samoa'],['SM','San Marino'],['ST','São Tomé & Príncipe'],['SA','Saudi Arabia'],['SN','Senegal'],['RS','Serbia'],['SC','Seychelles'],['SL','Sierra Leone'],['SG','Singapore'],['SX','Sint Maarten'],['SK','Slovakia'],['SI','Slovenia'],['SB','Solomon Islands'],['SO','Somalia'],['ZA','South Africa'],['GS','South Georgia & South Sandwich Is.'],['KR','South Korea'],['SS','South Sudan'],['ES','Spain'],['LK','Sri Lanka'],['BL','St. Barthélemy'],['SH','St. Helena'],['KN','St. Kitts & Nevis'],['LC','St. Lucia'],['MF','St. Martin'],['PM','St. Pierre & Miquelon'],['VC','St. Vincent & Grenadines'],['SD','Sudan'],['SR','Suriname'],['SE','Sweden'],['CH','Switzerland'],['SY','Syria'],
    ['TW','Taiwan'],['TJ','Tajikistan'],['TZ','Tanzania'],['TH','Thailand'],['TL','Timor-Leste'],['TG','Togo'],['TK','Tokelau'],['TO','Tonga'],['TT','Trinidad & Tobago'],['TN','Tunisia'],['TR','Türkiye'],['TM','Turkmenistan'],['TC','Turks & Caicos Islands'],['TV','Tuvalu'],
    ['UG','Uganda'],['UA','Ukraine'],['AE','United Arab Emirates'],['GB','United Kingdom'],['US','United States'],['UM','U.S. Outlying Islands'],['UY','Uruguay'],['UZ','Uzbekistan'],
    ['VU','Vanuatu'],['VA','Vatican City'],['VE','Venezuela'],['VN','Vietnam'],['VI','U.S. Virgin Islands'],
    ['WF','Wallis & Futuna'],['EH','Western Sahara'],['YE','Yemen'],['ZM','Zambia'],['ZW','Zimbabwe']
  ];
  function populateCountries(){
    const sel = $('#countrySel'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '<option value="">— Chọn quốc gia —</option>' + COUNTRIES.map(([c,n])=>`<option value="${c}">${n}</option>`).join('');
    if (cur) sel.value = cur;
  }
  populateCountries();

  // Avatar upload with backend integration
  async function uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${API_BASE}/profile/upload-avatar.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        const avatarUrl = data.avatar_url;
        if ($('#avatar')) $('#avatar').src = avatarUrl;
        if ($('#avatarHero')) $('#avatarHero').src = avatarUrl;
        toast('Avatar uploaded successfully');
        await initProfile(); // Reload profile data
      } else {
        toast('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast('Avatar upload failed');
    }
  }
  
  $('#avatarInput').addEventListener('change', (e)=>{
    const f = e.target.files[0]; 
    if (!f) return;
    uploadAvatar(f);
  });
  
  const bindAvatarHero = (inputSel)=>{
    const inp = $(inputSel); 
    if (!inp) return; 
    inp.addEventListener('change', (e)=>{
      const f=e.target.files[0]; 
      if(!f) return; 
      uploadAvatar(f);
    });
  };
  bindAvatarHero('#avatarInputHero');

  // Cover upload with backend integration
  async function uploadCover(file) {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await fetch(`${API_BASE}/profile/upload-cover.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        $('#cover').src = data.cover_url;
        toast('Cover photo uploaded successfully');
        await initProfile(); // Reload profile data
      } else {
        toast('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Cover upload error:', error);
      toast('Cover upload failed');
    }
  }
  
  const coverInput = $('#coverInput');
  if (coverInput) coverInput.addEventListener('change', (e)=>{ 
    const f=e.target.files[0]; 
    if(!f) return; 
    uploadCover(f);
  });

  // Detect IP (best effort; may fail offline)
  $('#detectIp').addEventListener('click', async ()=>{
    try {
      const r = await fetch('https://api.ipify.org?format=json', {cache:'no-store'});
      const j = await r.json(); $('#ipDisplay').textContent = j.ip || '—'; toast('Đã phát hiện IP');
    } catch {
      // Fallback by region
      const region = $('#ipRegion').value;
      const sample = {na:'23.21.76.141', sa:'181.143.0.10', eu:'81.2.69.142', af:'41.79.0.12', as:'27.111.228.1', oc:'1.1.1.1', auto:'—'};
      $('#ipDisplay').textContent = sample[region] || '—'; toast('Dùng IP mẫu theo vùng');
    }
  });

  // Save profile to backend
  $('#saveProfile').addEventListener('click', async ()=>{
    try {
      const formData = new FormData();
      formData.append('full_name', $('#username').value.trim());
      formData.append('custom_user_id', $('#userId').value.trim() || ('USR_'+Date.now()));
      formData.append('ip_region', $('#ipRegion').value);
      formData.append('ip_address', $('#ipDisplay').textContent || '—');
      
      const response = await fetch(`${API_BASE}/profile/update.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast('Đã lưu hồ sơ');
        $('#displayName').textContent = $('#username').value.trim() || 'User';
        $('#uid').textContent = $('#userId').value.trim() || '—';
        $('#ipShort').textContent = $('#ipDisplay').textContent || '—';
      } else {
        toast('Lỗi khi lưu hồ sơ: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save profile error:', error);
      toast('Lỗi khi lưu hồ sơ');
    }
  });

  // Tabs
  const panels={ intro:$('#intro'), posts:$('#posts') };
  const wireTabs = (btnSel)=>{
    const t=$$(btnSel); t.forEach(b=> b.addEventListener('click', ()=>{ t.forEach(x=>x.classList.remove('active')); b.classList.add('active'); Object.values(panels).forEach(p=>p.hidden=true); panels[b.dataset.k].hidden=false; }));
  };
  wireTabs('.tab'); wireTabs('.h-tab');
  // Default show intro
  Object.values(panels).forEach(p=>p.hidden=true); if(panels.intro) panels.intro.hidden=false;

  // Bloom tracker: simple heuristic months per climate/species
  // Reuse bloom rules for suggestions
  const rules = {
    sakura: { 'temperate-n':'03-04', 'temperate-s':'09-10', tropical:'01-02', med:'03-04' },
    lotus:  { 'temperate-n':'06-08', 'temperate-s':'12-02', tropical:'05-10', med:'06-08' },
    sunflower:{ 'temperate-n':'07-09', 'temperate-s':'01-03', tropical:'06-11', med:'07-09' },
    lavender:{ 'temperate-n':'06-07', 'temperate-s':'12-01', tropical:'05-08', med:'06-07' },
    orchid:  { 'temperate-n':'04-06', 'temperate-s':'10-12', tropical:'Quanh năm', med:'03-05' },
  };
  // INTRO: save bio/interests/country, GPS to backend
  $('#saveIntro')?.addEventListener('click', async ()=>{
    try {
      const formData = new FormData();
      formData.append('bio', $('#bio').value.trim());
      formData.append('interests', $('#interests').value.trim());
      formData.append('country', $('#countrySel').value || '');
      formData.append('gps_coordinates', $('#introCoords').value || '');
      
      const response = await fetch(`${API_BASE}/profile/update.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast('Đã lưu Giới thiệu');
      } else {
        toast('Lỗi khi lưu: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save intro error:', error);
      toast('Lỗi khi lưu Giới thiệu');
    }
  });
  $('#updateGPSIntro')?.addEventListener('click', ()=>{
    if (!navigator.geolocation) { toast('Thiết bị không hỗ trợ GPS'); return; }
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude, longitude} = pos.coords; $('#introCoords').value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }, ()=> toast('Không lấy được vị trí'));
  });
  $('#detectCountry')?.addEventListener('click', async ()=>{
    try { const r = await fetch('https://ipapi.co/json/'); const j = await r.json(); $('#countrySel').value = (j && j.country) || ''; toast('Đã phát hiện quốc gia'); }
    catch { toast('Không thể phát hiện, chọn thủ công'); }
  });

  // POSTS: species -> region suggestion -> bloom window; info and posting
  const speciesInfo = {
    sakura: { name:'Anh đào', regions:['temperate-n','temperate-s','med'], info:'Hoa anh đào nổi bật ở khí hậu ôn đới, nở rộ theo mùa xuân.' },
    lotus:  { name:'Sen', regions:['tropical','temperate-n','temperate-s'], info:'Sen ưa khí hậu ấm và hồ/đầm nông, nở rộ mùa hè.' },
    sunflower:{ name:'Hướng dương', regions:['temperate-n','temperate-s','med'], info:'Hướng về mặt trời, nở đẹp giữa hè.' },
    lavender:{ name:'Oải hương', regions:['med','temperate-n'], info:'Thảo mộc thơm nở tím rực ở vùng Địa Trung Hải/ôn đới.' },
    orchid:  { name:'Lan', regions:['tropical','temperate-n','temperate-s'], info:'Đa dạng loài, nhiều loài nở quanh năm trong điều kiện phù hợp.' },
  };
  const regionLabels = {
    'temperate-n':'Ôn đới - Bắc bán cầu', 'temperate-s':'Ôn đới - Nam bán cầu', tropical:'Nhiệt đới', med:'Địa Trung Hải'
  };
  function fillRegions(){
    const sp = $('#pSpecies').value; const cfg = speciesInfo[sp]; const sel = $('#pRegion');
    sel.innerHTML = (cfg.regions||[]).map(r=>`<option value="${r}">${regionLabels[r]}</option>`).join('');
    updateBloomAndInfo();
  }
  function updateBloomAndInfo(){
    const sp = $('#pSpecies').value; const reg = $('#pRegion').value; const win = (rules[sp]||{})[reg] || '—';
    $('#pBloomWin').value = (win==='Quanh năm')? 'Quanh năm (điều kiện tốt)' : (win==='—'?'Chưa có dữ liệu':win);
    $('#pInfo').value = (speciesInfo[sp]||{}).info || '—';
  }
  $('#pSpecies')?.addEventListener('change', fillRegions);
  $('#pRegion')?.addEventListener('change', updateBloomAndInfo);
  if ($('#pSpecies')) { fillRegions(); }
  $('#pGetLoc')?.addEventListener('click', ()=>{
    if (!navigator.geolocation) { toast('Thiết bị không hỗ trợ GPS'); return; }
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude, longitude} = pos.coords; $('#pCoords').value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }, ()=> toast('Không lấy được vị trí'));
  });
  // Post feed with like/comment
  const posts2 = load(keyPosts, []); renderFeed();
  computeBadgesAndStats(); renderTimeline();
  // POSTS: Create post with backend integration
  $('#pPublish')?.addEventListener('click', async ()=>{
    try {
      const sp = $('#pSpecies').value;
      const reg = $('#pRegion').value;
      const win = $('#pBloomWin').value;
      const info = $('#pInfo').value;
      const coords = $('#pCoords').value.trim();
      const date = $('#pDate').value;
      const cap = $('#pCaption').value.trim();
      const f = $('#pMedia').files[0];
      
      if (!cap.trim()) {
        toast('Vui lòng nhập mô tả');
        return;
      }
      
      let mediaUrl = '';
      
      // Upload media if provided
      if (f) {
        const mediaFormData = new FormData();
        mediaFormData.append('media', f);
        
        const mediaResponse = await fetch(`${API_BASE}/posts/upload-media.php`, {
          method: 'POST',
          credentials: 'include',
          body: mediaFormData
        });
        
        const mediaData = await mediaResponse.json();
        
        if (mediaData.success) {
          mediaUrl = mediaData.file.url;
        } else {
          toast('Lỗi upload media: ' + (mediaData.error || 'Unknown error'));
          return;
        }
      }
      
      // Create post
      const postFormData = new FormData();
      postFormData.append('caption', cap);
      if (mediaUrl) postFormData.append('media_url', mediaUrl);
      postFormData.append('is_public', '1');
      postFormData.append('species', sp);
      postFormData.append('region', reg);
      postFormData.append('bloom_window', win);
      postFormData.append('observation_date', date);
      postFormData.append('coordinates', coords);
      postFormData.append('species_info', info);
      
      const response = await fetch(`${API_BASE}/posts/create.php`, {
        method: 'POST',
        credentials: 'include',
        body: postFormData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast('Đã đăng bài');
        $('#pCaption').value = '';
        $('#pMedia').value = '';
        $('#pCoords').value = '';
        $('#pDate').value = '';
        
        // Reload timeline and stats
        await loadTimelineAndStats();
        await loadBadges();
      } else {
        toast('Lỗi khi đăng bài: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Publish post error:', error);
      toast('Lỗi khi đăng bài');
    }
  });
  function renderFeed(){
    const box=$('#postFeed'); if (!box) return;
    const useBlur = false; // blur option removed
    box.innerHTML = posts2.slice().reverse().map(p=>{
      const media = p.media ? (p.isVideo?`<video src="${p.media}" controls></video>`:`<img src="${p.media}" alt="media">`) : '';
      const coords = p.coords||'—';
      const coordsShown = useBlur && coords.includes(',') ? `${Number(coords.split(',')[0]).toFixed(2)}, ${Number(coords.split(',')[1]).toFixed(2)} (~km)` : coords;
      return `<div class="card">
        <div class="head"><img src="${avatarSrc}" alt="av"><div><div class="name">${prof.username||'User'}</div><div class="sub">${new Date(p.at).toLocaleString('vi-VN')}</div></div></div>
        <div class="body">
          <div><strong>${(speciesInfo[p.sp]||{}).name||p.sp}</strong> • ${regionLabels[p.reg]||p.reg}</div>
          <div>Cửa sổ nở: ${p.win||'—'}</div>
          <div>${p.info||''}</div>
          <div>Toạ độ: ${coordsShown} ${p.date?('• Ngày: '+p.date):''}</div>
          <div class="media">${media}</div>
          <div>${p.cap||''}</div>
        </div>
        <div class="actions">
          <div class="reacts">
            <button class="react-btn" data-act="react" data-type="like" data-id="${p.id}"><i data-lucide="thumbs-up"></i><span>${(p.reactions?.like ?? p.likes) || 0}</span></button>
            <button class="react-btn" data-act="react" data-type="heart" data-id="${p.id}"><i data-lucide="heart"></i><span>${p.reactions?.heart||0}</span></button>
            <button class="react-btn" data-act="react" data-type="flower" data-id="${p.id}"><i data-lucide="flower-2"></i><span>${p.reactions?.flower||0}</span></button>
            <button class="react-btn" data-act="react" data-type="wow" data-id="${p.id}"><i data-lucide="sparkles"></i><span>${p.reactions?.wow||0}</span></button>
          </div>
          <button class="chip-btn" data-act="cmt" data-id="${p.id}">💬 Bình luận</button>
          <button class="chip-btn" data-act="share" data-id="${p.id}">↗ Chia sẻ</button>
        </div>
        <div class="comments" id="c_${p.id}" hidden>
          ${(p.comments||[]).map(c=>`<div class="item">${c}</div>`).join('')}
          <div class="write"><input id="i_${p.id}" placeholder="Viết bình luận..."/><button class="chip-btn" data-act="send" data-id="${p.id}">Gửi</button></div>
        </div>
      </div>`;
    }).join('') || '<div class="checkin-card">Chưa có bài viết</div>';
    // wire actions
    if (window.lucide) lucide.createIcons();
    $$('.chip-btn', box).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const act = btn.dataset.act; const idx = posts2.findIndex(x=>x.id===id); if (idx<0) return;
        if (act==='like'){ posts2[idx].likes = (posts2[idx].likes||0) + 1; save(keyPosts, posts2); renderFeed(); }
        if (act==='cmt'){ const el=$('#c_'+id); el.hidden=!el.hidden; }
        if (act==='share'){ navigator.clipboard?.writeText(location.href+'#'+id); toast('Đã sao chép liên kết'); }
        if (act==='send'){ const inp=$('#i_'+id); const txt=(inp.value||'').trim(); if(!txt) return; posts2[idx].comments = posts2[idx].comments||[]; posts2[idx].comments.push(txt); save(keyPosts, posts2); renderFeed(); }
      });
    });
    $$('.react-btn', box).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const type = btn.dataset.type; const idx = posts2.findIndex(x=>x.id===id); if (idx<0) return;
        posts2[idx].reactions = posts2[idx].reactions || {like:0,heart:0,flower:0,wow:0};
        posts2[idx].reactions[type] = (posts2[idx].reactions[type]||0) + 1;
        // keep legacy likes in sync if type is like
        if (type==='like') posts2[idx].likes = (posts2[idx].likes||0) + 1;
        save(keyPosts, posts2); renderFeed();
      });
    });
  }

  // Badges, stats, timeline helpers
  function computeBadgesAndStats(){
    const set = new Set(); const regs = new Set(); let within=0, total=0;
    posts2.forEach(p=>{ set.add(p.sp); regs.add(p.reg); if (p.win && p.date) { total++; if (isDateWithinWindow(p.date, p.win)) within++; } });
    const badges = [];
    if (set.size>=3) badges.push(['Explorer','map-pin']);
    if (regs.size>=3) badges.push(['Regional','globe']);
    if (within>=3) badges.push(['Bloom Master','flower']);
    const box=$('#badges'); if (box) box.innerHTML = badges.map(([t,icon])=>`<span class="badge"><i data-lucide="${icon}"></i>${t}</span>`).join('');
    if (window.lucide) lucide.createIcons();
    // Stats
    const st=$('#stats'); if (st) st.innerHTML = `
      <div class="stat">Loài đã ghi: <strong>${set.size}</strong></div>
      <div class="stat">Vùng đã ghé: <strong>${regs.size}</strong></div>
      <div class="stat">Bài viết: <strong>${posts2.length}</strong></div>
      <div class="stat">Độ chính xác dự báo: <strong>${total?Math.round(within*100/total):0}%</strong></div>
    `;
    // Override stats layout per request
    if (st) st.innerHTML = `
      <div class="stat">Nơi đến: <strong>${regs.size}</strong></div>
      <div class="stat">Bài viết: <strong>${posts2.length}</strong></div>
    `;
  }
  function isDateWithinWindow(dateStr, win){
    // win format: "MM-MM" or "Quanh năm"
    if (!win || win==='—' || win==='Quanh năm') return win==='Quanh năm';
    const [m1,m2] = win.split('-').map(x=>parseInt(x,10)); const m = (new Date(dateStr)).getMonth()+1;
    if (m1<=m2) return m>=m1 && m<=m2; // e.g., 03-04
    return m>=m1 || m<=m2; // cross-year windows (e.g., 12-02)
  }
  function renderTimeline(){
    const box=$('#timeline'); if (!box) return;
    const items = posts2.slice().sort((a,b)=> new Date(a.date||a.at) - new Date(b.date||b.at));
    box.innerHTML = items.map(p=>{
      const ok = p.win && p.date && isDateWithinWindow(p.date, p.win);
      return `<div class="tl-item ${ok?'ok':'miss'}">
        <div><strong>${(speciesInfo[p.sp]||{}).name||p.sp}</strong> • ${regionLabels[p.reg]||p.reg}</div>
        <div>Ngày quan sát: ${p.date||'—'} • Cửa sổ dự báo: ${p.win||'—'}</div>
        <div>${ok?'Khớp dự báo ✅':'Ngoài cửa sổ dự báo ⚠'}</div>
      </div>`;
    }).join('') || '<div class="tl-item">Chưa có dữ liệu. Hãy đăng một bài viết có ngày và loài.</div>';
  }

  // Check-in feature removed; now part of Posts via coordinates/date/media

  // Gallery posts
  const posts = load(keyPosts, []); renderPosts();
  $('#addPost').addEventListener('click', ()=>{
    const f = $('#flowerImg').files[0]; if (!f) { toast('Chọn ảnh hoa'); return; }
    const cap = $('#flowerCaption').value.trim();
    const rd = new FileReader(); rd.onload = ()=>{
      posts.push({ id:'POST_'+Date.now(), img:rd.result, caption:cap, at:new Date().toISOString() });
      save(keyPosts, posts); renderPosts(); toast('Đã đăng');
      $('#flowerImg').value=''; $('#flowerCaption').value='';
    }; rd.readAsDataURL(f);
  });
  function renderPosts(){
    $('#postGrid').innerHTML = (posts.slice().reverse().map(p=>`<div class="post"><img src="${p.img}" alt="flower"><div class="meta">${p.caption||'—'}<br><span>${new Date(p.at).toLocaleString('vi-VN')}</span></div></div>`).join('')) || '<div class="checkin-card">Chưa có bài chia sẻ</div>';
  }
})();
