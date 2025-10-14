(() => {
  const $ = (s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const toastEl = $('#toast'); let tTimer;
  const toast = (m)=>{ toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(tTimer); tTimer=setTimeout(()=>toastEl.classList.remove('show'),2000); };

  const keyProfile = 'nn_profile';
  const keyPosts   = 'nn_posts';
  // check-ins removed; integrated into posts

  // Load/save helpers
  const load = (k,def)=>{ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); }catch{ return def; } };
  const save = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

  // Init profile
  const prof = load(keyProfile, { avatar:'', cover:'', username:'', userId:'', ip:'', region:'auto' });
  const avatarSrc = prof.avatar || '../../assets/images/logo.png';
  if ($('#avatar')) $('#avatar').src = avatarSrc;
  const avHero = $('#avatarHero'); if (avHero) avHero.src = avatarSrc;
  if (prof.cover) $('#cover').src = prof.cover;
  $('#username').value = prof.username || '';
  $('#userId').value   = prof.userId   || ('USR_'+Date.now());
  $('#ipRegion').value = prof.region   || 'auto';
  $('#ipDisplay').textContent = prof.ip || '—';
  $('#displayName').textContent = prof.username || 'User';
  $('#uid').textContent = prof.userId || '—';
  $('#ipShort').textContent = prof.ip || '—';

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

  // Avatar upload
  $('#avatarInput').addEventListener('change', (e)=>{
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = ()=>{ $('#avatar').src = rd.result; }; rd.readAsDataURL(f);
  });
  const bindAvatarHero = (inputSel)=>{
    const inp = $(inputSel); if (!inp) return; inp.addEventListener('change', (e)=>{
      const f=e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ if($('#avatar')) $('#avatar').src=rd.result; if($('#avatarHero')) $('#avatarHero').src=rd.result; }; rd.readAsDataURL(f);
    });
  };
  bindAvatarHero('#avatarInputHero');

  // Cover upload
  const coverInput = $('#coverInput');
  if (coverInput) coverInput.addEventListener('change', (e)=>{ const f=e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ $('#cover').src=rd.result; }; rd.readAsDataURL(f); });

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

  // Save profile
  $('#saveProfile').addEventListener('click', ()=>{
    const data = {
      avatar: ($('#avatar')?$('#avatar').src:($('#avatarHero')?$('#avatarHero').src:'')) || '',
      cover: $('#cover')?$('#cover').src:'',
      username: $('#username').value.trim(),
      userId: $('#userId').value.trim() || ('USR_'+Date.now()),
      region: $('#ipRegion').value,
      ip: $('#ipDisplay').textContent || '—',
    };
    save(keyProfile, data); toast('Đã lưu hồ sơ');
    $('#displayName').textContent = data.username || 'User';
    $('#uid').textContent = data.userId || '—';
    $('#ipShort').textContent = data.ip || '—';
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
  // INTRO: save bio/interests/country, GPS
  $('#saveIntro')?.addEventListener('click', ()=>{
    const data = load(keyProfile, {});
    data.bio = $('#bio').value.trim();
    data.interests = $('#interests').value.trim();
    data.country = $('#countrySel').value || data.country || '';
    data.gps = $('#introCoords').value || '';
    save(keyProfile, data); toast('Đã lưu Giới thiệu');
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
  $('#pPublish')?.addEventListener('click', ()=>{
    const sp=$('#pSpecies').value; const reg=$('#pRegion').value; const win=$('#pBloomWin').value; const info=$('#pInfo').value;
    const coords=$('#pCoords').value.trim(); const date=$('#pDate').value; const cap=$('#pCaption').value.trim();
    const f=$('#pMedia').files[0];
    const add=(src,isVideo)=>{
      posts2.push({ id:'POST_'+Date.now(), sp, reg, win, info, coords, date, cap, media:src||'', isVideo: !!isVideo, likes:0, comments:[] , at:new Date().toISOString()});
      save(keyPosts, posts2); renderFeed(); toast('Đã đăng');
      $('#pCaption').value=''; $('#pMedia').value='';
    };
    if (f) { const rd=new FileReader(); rd.onload=()=> add(rd.result, (f.type||'').startsWith('video/')); rd.readAsDataURL(f); } else add('', false);
  });
  function renderFeed(){
    const box=$('#postFeed'); if (!box) return;
    box.innerHTML = posts2.slice().reverse().map(p=>{
      const media = p.media ? (p.isVideo?`<video src="${p.media}" controls></video>`:`<img src="${p.media}" alt="media">`) : '';
      return `<div class="card">
        <div class="head"><img src="${avatarSrc}" alt="av"><div><div class="name">${prof.username||'User'}</div><div class="sub">${new Date(p.at).toLocaleString('vi-VN')}</div></div></div>
        <div class="body">
          <div><strong>${(speciesInfo[p.sp]||{}).name||p.sp}</strong> • ${regionLabels[p.reg]||p.reg}</div>
          <div>Cửa sổ nở: ${p.win||'—'}</div>
          <div>${p.info||''}</div>
          <div>Toạ độ: ${p.coords||'—'} ${p.date?('• Ngày: '+p.date):''}</div>
          <div class="media">${media}</div>
          <div>${p.cap||''}</div>
        </div>
        <div class="actions">
          <button class="chip-btn" data-act="like" data-id="${p.id}">👍 Thích (${p.likes||0})</button>
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
    $$('.chip-btn', box).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const act = btn.dataset.act; const idx = posts2.findIndex(x=>x.id===id); if (idx<0) return;
        if (act==='like'){ posts2[idx].likes = (posts2[idx].likes||0) + 1; save(keyPosts, posts2); renderFeed(); }
        if (act==='cmt'){ const el=$('#c_'+id); el.hidden=!el.hidden; }
        if (act==='share'){ navigator.clipboard?.writeText(location.href+'#'+id); toast('Đã sao chép liên kết'); }
        if (act==='send'){ const inp=$('#i_'+id); const txt=(inp.value||'').trim(); if(!txt) return; posts2[idx].comments = posts2[idx].comments||[]; posts2[idx].comments.push(txt); save(keyPosts, posts2); renderFeed(); }
      });
    });
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
