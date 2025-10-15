(() => {
  const $ = (s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const toastEl = $('#toast'); let tTimer;
  const toast = (m)=>{ toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(tTimer); tTimer=setTimeout(()=>toastEl.classList.remove('show'),2000); };

  const KEY_SESSION = 'nn_discovery_session';
  const KEY_RESULTS = 'nn_discovery_results';
  const KEY_PLAN = 'nn_itinerary_saved';

  const load = (k, def)=>{ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch { return def; } };
  const save = (k, v)=>{ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const state = {
    chat: load(KEY_SESSION, { history: [] }),
    results: load(KEY_RESULTS, { tours: [], hotels: [], places: [], blogs: [], markers: [] }),
    booking: null,
  };

  function renderChat(){
    const box = $('#chatBox'); if (!box) return;
    box.innerHTML = (state.chat.history||[]).map(m=>`<div class="msg ${m.role}"><div class="bubble">${m.text}</div></div>`).join('');
    box.scrollTop = box.scrollHeight;
  }

  function parseCriteria(text){
    const t = (text||'').toLowerCase();
    const budget = (t.match(/(\d+[\.,]?\d*)\s*(triệu|tr|million|m)/) || [])[1];
    const days = (t.match(/(\d+)\s*(ngày|day|d)\b/) || [])[1];
    const beach = /(biển|bien|sea)/.test(t);
    const trek = /(trek|leo núi|leo nui|hiking|trekking)/.test(t);
    const start = (t.match(/từ\s+([\w\s]+)|(from\s+([\w\s]+))/) || [])[1] || '';
    // hotel intent & dates
    const hotelIntent = /(khách sạn|khach san|đặt phòng|dat phong|hotel)/.test(t);
    const datePair = t.match(/(\d{1,2}[\/\-]\d{1,2})(?:\s*[-tođến]+\s*)(\d{1,2}[\/\-]\d{1,2})/);
    const checkin  = (t.match(/check\s*in\s*(\d{1,2}[\/\-]\d{1,2})/) || (datePair? [,'',datePair[1]]:null))?.[1] || (datePair?datePair[1]:undefined);
    const checkout = (t.match(/check\s*out\s*(\d{1,2}[\/\-]\d{1,2})/) || datePair)?.[2];
    const stars = (t.match(/(\d)\s*sao/) || [])[1];
    return { budget, days: days?Number(days):undefined, theme: beach? 'biển' : (trek? 'trekking' : 'phổ thông'), start: start.trim(), hotelIntent, checkin, checkout, stars: stars?Number(stars):undefined };
  }

  function sampleData(criteria){
    // Minimal mock data based on theme
    const theme = criteria.theme;
    let baseCity = 'Đà Lạt';
    if (theme==='biển') baseCity = 'Phú Quốc';
    if (theme==='trekking') baseCity = 'Sa Pa';

    const tours = [
      { id:'T-'+Date.now(), name:`${theme==='biển'?'Khám phá bờ biển': theme==='trekking'?'Trekking thư giãn':'City break'} ${baseCity}`, region: baseCity, theme:[theme], durationDays: criteria.days||3, priceFrom: criteria.budget? 3000000 : 2500000, rating: 4.6,
        includes:['xe đưa đón','vé tham quan'], excludes:['chi phí cá nhân'], schedule:[{day:1,title:'Ngày 1'}, {day:2,title:'Ngày 2'}], coords:[{lat:10.2,lng:103.95}] },
      { id:'T2-'+Date.now(), name:`Trải nghiệm địa phương ${baseCity}`, region: baseCity, theme:['văn hóa'], durationDays:(criteria.days||2), priceFrom: 2200000, rating: 4.5,
        includes:['hướng dẫn viên'], excludes:['ăn tối'], schedule:[{day:1,title:'Khởi hành'}], coords:[{lat:10.23,lng:103.98}] }
    ];

    const places = [
      { id:'P1', name: theme==='biển'?'Bãi Sao':'Đỉnh Langbiang', type:'sight', lat: theme==='biển'?10.05:12.02, lng: theme==='biển'?103.96:108.44, tags:[theme,'ảnh đẹp'], rating: 4.5 },
      { id:'P2', name:'Cafe View', type:'cafe', lat: theme==='biển'?10.21:11.94, lng: theme==='biển'?103.94:108.43, tags:['ngắm cảnh'], rating:4.4 }
    ];

    const blogs = [
      { id:'B1', title:`Top homestay ${baseCity}`, slug:'top-homestay', tags:[baseCity,'lưu trú'], summary:'Danh sách homestay view đẹp', coverImg:'', readTimeMin:6 },
      { id:'B2', title:`Kinh nghiệm ăn uống ${baseCity}`, slug:'food-guide', tags:['ẩm thực'], summary:'Điểm ăn nổi bật', coverImg:'', readTimeMin:5 }
    ];

    // hotels
    const hotels = [
      { id:'H1', name:`Resort gần biển ${baseCity}`, city: baseCity, stars: criteria.stars||4, pricePerNight: 950000, rating:4.5, amenities:['hồ bơi','buffet sáng','gần biển'] },
      { id:'H2', name:`Khách sạn trung tâm ${baseCity}`, city: baseCity, stars: 3, pricePerNight: 650000, rating:4.2, amenities:['gần chợ','wifi','gia đình'] }
    ];

    // Derive markers from tours/places
    const markers = [];
    tours.forEach(t=> (t.coords||[]).forEach(c=> markers.push({ kind:'tour', label:t.name, lat:c.lat, lng:c.lng })) );
    places.forEach(p=> markers.push({ kind: p.type==='sight'?'sight':'food', label:p.name, lat:p.lat, lng:p.lng }));

    return { tours, hotels, places, blogs, markers };
  }

  function renderResults(){
    const toursBox = $('#tourList'); const hotelsBox=$('#hotelList'); const placesBox = $('#placeList'); const blogsBox = $('#blogList'); const mbox = $('#markerList');
    const { tours, hotels, places, blogs, markers } = state.results;

    toursBox.innerHTML = (tours||[]).map(t=>`
      <div class="card">
        <div class="row"><strong>${t.name}</strong><span>⭐ ${t.rating||'-'}</span></div>
        <div class="row">
          <div class="tags">
            ${(t.theme||[]).map(x=>`<span class="tag">${x}</span>`).join('')}
            <span class="tag">${t.durationDays||'-'}N</span>
          </div>
          <div>
            <button class="btn" data-act="save" data-type="tour" data-id="${t.id}">Lưu</button>
          </div>
        </div>
        <div class="muted">Từ ${Number(t.priceFrom||0).toLocaleString('vi-VN')}đ</div>
      </div>
    `).join('') || '<div class="card">Chưa có tour phù hợp</div>';

    placesBox.innerHTML = (places||[]).map(p=>`
      <div class="card">
        <div class="row"><strong>${p.name}</strong><span class="tag">${p.type}</span></div>
        <div class="tags">${(p.tags||[]).map(x=>`<span class="tag">${x}</span>`).join('')}</div>
        <div class="row">
          <small class="muted">${p.lat.toFixed(2)}, ${p.lng.toFixed(2)}</small>
          <button class="btn" data-act="save" data-type="place" data-id="${p.id}">Lưu</button>
        </div>
      </div>
    `).join('') || '<div class="card">Chưa có địa điểm</div>';

    blogsBox.innerHTML = (blogs||[]).map(b=>`
      <div class="card">
        <div class="row"><strong>${b.title}</strong><span>${b.readTimeMin} phút</span></div>
        <div class="muted">${b.summary||''}</div>
        <div><button class="btn" data-act="save" data-type="blog" data-id="${b.id}">Lưu</button></div>
      </div>
    `).join('') || '<div class="card">Chưa có bài viết</div>';

    mbox.innerHTML = (markers||[]).map(m=>`
      <div class="marker">
        <div><strong>${m.label}</strong></div>
        <div class="muted">${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}</div>
        <div class="tags"><span class="tag">${m.kind}</span></div>
      </div>
    `).join('') || '<div class="marker">Chưa có điểm hiển thị</div>';

    if (window.lucide) lucide.createIcons();
    // Ensure tour book buttons exist (inject if missing)
    (tours||[]).forEach(t=>{
      const saveBtn = toursBox.querySelector(`button[data-type="tour"][data-id="${t.id}"]`);
      const actionsBox = saveBtn ? saveBtn.parentElement : null;
      if (actionsBox && !actionsBox.querySelector('[data-act="book"]')){
        const b = document.createElement('button'); b.className='btn primary'; b.dataset.act='book'; b.dataset.id=t.id; b.textContent='Đặt tour'; actionsBox.appendChild(b);
      }
    });

    // Wire save & book buttons
    $$('#tourList [data-act="save"], #placeList [data-act="save"], #blogList [data-act="save"], #hotelList [data-act="save"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const type = btn.dataset.type; const id = btn.dataset.id;
        const plan = load(KEY_PLAN, []);
        if (type==='tour') { const item = state.results.tours.find(x=>x.id===id); if (item) plan.push({type:'tour', refId:id, item, addedAt:Date.now()}); }
        if (type==='place') { const item = state.results.places.find(x=>x.id===id); if (item) plan.push({type:'place', refId:id, item, addedAt:Date.now()}); }
        if (type==='blog') { const item = state.results.blogs.find(x=>x.id===id); if (item) plan.push({type:'blog', refId:id, item, addedAt:Date.now()}); }
        if (type==='hotel') { const item = state.results.hotels.find(x=>x.id===id); if (item) plan.push({type:'hotel', refId:id, item, addedAt:Date.now()}); }
        save(KEY_PLAN, plan); toast('Đã lưu vào Kế hoạch');
      });
    });

    // Book buttons
    $$('#tourList [data-act="book"]').forEach(btn=> btn.addEventListener('click', ()=> openBooking('tour', btn.dataset.id)));
    $$('#hotelList [data-act="book"]').forEach(btn=> btn.addEventListener('click', ()=> openBooking('hotel', btn.dataset.id)));
    // Ensure hotels list is rendered with latest data
    try { renderHotelsBox(); } catch {}
  }

  function reply(text){
    const crit = parseCriteria(text);
    const res = sampleData(crit);
    state.results = res; save(KEY_RESULTS, res);
    const hints = [];
    if (crit.theme) hints.push(`chủ đề: ${crit.theme}`);
    if (crit.days) hints.push(`${crit.days} ngày`);
    if (crit.budget) hints.push(`ngân sách ~ ${crit.budget}`);
    if (crit.hotelIntent) hints.push('kèm gợi ý khách sạn');
    const msg = `Mình gợi ý theo ${hints.join(', ') || 'nhu cầu của bạn'} — xem Tour và Địa điểm ở khung bên phải.`;
    state.chat.history.push({ role:'assistant', text: msg }); save(KEY_SESSION, state.chat);
    renderChat(); renderResults();
    // Show map in chat if user asked for map/places/directions
    try {
      const wantMap = /(bản đồ|ban do|map|chỉ đường|chi duong|google map|đi đâu|dia diem)/i.test(text||'');
      if (wantMap) {
        const drawer = document.querySelector('#chatDrawer .drawer-body');
        if (drawer && !document.getElementById('chatMap')) {
          const map = document.createElement('div'); map.id='chatMap'; map.className='map'; map.hidden=false;
          map.innerHTML = '<div class="map-placeholder">Bản đồ (demo) — sẽ hiện các điểm gợi ý</div><div class="legend"><span class="badge tour">Tour</span><span class="badge sight">Điểm tham quan</span><span class="badge food">Ăn uống</span></div><div id="chatMarkerList" class="markers"></div>';
          const tools = drawer.querySelector('.chat-tools') || drawer.querySelector('.composer');
          drawer.insertBefore(map, tools);
        }
        const box = document.getElementById('chatMarkerList');
        if (box) {
          const markers = (state.results.markers||[]);
          box.innerHTML = markers.map(m=>`<div class="marker"><div><strong>${m.label}</strong></div><div class="muted">${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}</div><div class="tags"><span class="tag">${m.kind}</span></div></div>`).join('') || '<div class="marker">Chưa có điểm hiển thị</div>';
        }
        const cm = document.getElementById('chatMap'); if (cm) cm.hidden = false;
      }
    } catch {}
  }

  function send(){
    const inp = $('#chatInput'); const v = (inp.value||'').trim(); if (!v) return;
    state.chat.history.push({ role:'user', text:v }); save(KEY_SESSION, state.chat);
    renderChat(); inp.value='';
    setTimeout(()=> reply(v), 150);
  }

  // Header actions
  $('#saveAll')?.addEventListener('click', ()=>{
    const plan = load(KEY_PLAN, []);
    (state.results.tours||[]).forEach(t=> plan.push({type:'tour', refId:t.id, item:t, addedAt:Date.now()}));
    (state.results.hotels||[]).forEach(h=> plan.push({type:'hotel', refId:h.id, item:h, addedAt:Date.now()}));
    (state.results.places||[]).forEach(p=> plan.push({type:'place', refId:p.id, item:p, addedAt:Date.now()}));
    (state.results.blogs||[]).forEach(b=> plan.push({type:'blog', refId:b.id, item:b, addedAt:Date.now()}));
    save(KEY_PLAN, plan); toast('Đã lưu tất cả vào Kế hoạch');
  });
  $('#openPlan')?.addEventListener('click', ()=>{
    const plan = load(KEY_PLAN, []);
    toast(`Kế hoạch hiện có ${plan.length} mục (lưu cục bộ).`);
  });

  // Chat actions (drawer)
  $('#sendBtn')?.addEventListener('click', send);
  $('#chatInput')?.addEventListener('keydown', (e)=>{ if (e.key==='Enter') send(); });
  $('#openChat')?.addEventListener('click', ()=>{ $('#chatDrawer').hidden=false; if (window.lucide) lucide.createIcons(); });
  $('#closeChat')?.addEventListener('click', ()=>{ $('#chatDrawer').hidden=true; });

  // Budget filter UI injection and DOM filtering
  function setupTourFilters(){
    const panel = document.getElementById('panel-tours'); if (!panel) return;
    if (document.getElementById('tourFilters')) return;
    const bar = document.createElement('div'); bar.className='filters'; bar.id='tourFilters';
    bar.innerHTML = '<button class="chip active" data-budget="all">Tất cả</button>'+
      '<button class="chip" data-budget="lt3">Dưới 3 triệu</button>'+
      '<button class="chip" data-budget="3to5">3 - 5 triệu</button>'+
      '<button class="chip" data-budget="5to10">5 - 10 triệu</button>'+
      '<button class="chip" data-budget="gt10">Trên 10 triệu</button>';
    const list = document.getElementById('tourList'); panel.insertBefore(bar, list);
    bar.querySelectorAll('.chip').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        bar.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        window.nnBudget = btn.dataset.budget || 'all';
        applyBudgetFilter();
      });
    });
  }
  function applyBudgetFilter(){
    const budget = window.nnBudget || 'all'; const tours = state.results.tours||[]; const idx = Object.fromEntries(tours.map(t=>[t.id, t]));
    document.querySelectorAll('#tourList button[data-type="tour"]').forEach(btn=>{
      const id = btn.dataset.id; const t = idx[id]; const card = btn.closest('.card'); if (!card) return;
      const v = Number((t&&t.priceFrom)||0);
      let show=true; if (budget==='lt3') show= v>0&&v<3000000; else if(budget==='3to5') show= v>=3000000&&v<=5000000; else if(budget==='5to10') show= v>5000000&&v<=10000000; else if(budget==='gt10') show= v>10000000; else show=true;
      card.style.display = show? '' : 'none';
    });
  }
  function ensureItineraryButtons(){
    document.querySelectorAll('#tourList [data-act="book"]').forEach(btn=>{
      const wrap = btn.parentElement; if (!wrap) return;
      if (!wrap.querySelector('[data-act="itinerary"]')){
        const i = document.createElement('button'); i.className='btn'; i.dataset.act='itinerary'; i.dataset.id=btn.dataset.id; i.textContent='Xem lịch trình'; wrap.appendChild(i);
        i.addEventListener('click', ()=> openItinerary(btn.dataset.id));
      }
    });
  }

  // Tabs
  $$('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.tab').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.tab;
      const tours = document.getElementById('panel-tours'); const hotels=document.getElementById('panel-hotels');
      if (tours) tours.hidden = key!=='tours';
      if (hotels) hotels.hidden = key!=='hotels';
      if (key==='tours'){ setupTourFilters(); applyBudgetFilter(); ensureItineraryButtons(); }
    });
  });

  // Render hotels list
  function renderHotelsBox(){
    const hotelsBox = $('#hotelList'); const hotels = state.results.hotels||[];
    hotelsBox.innerHTML = hotels.map(h=>`
      <div class="card">
        <div class="row"><strong>${h.name}</strong><span>⭐ ${h.stars || '-'} | ${h.rating || '-'}</span></div>
        <div class="tags">${(h.amenities||[]).map(x=>`<span class="tag">${x}</span>`).join('')}</div>
        <div class="row">
          <div class="muted">Từ ${Number(h.pricePerNight||0).toLocaleString('vi-VN')}đ/đêm</div>
          <div>
            <button class="btn" data-act="save" data-type="hotel" data-id="${h.id}">Lưu</button>
            <button class="btn primary" data-act="book" data-id="${h.id}">Đặt phòng</button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="card">Chưa có khách sạn</div>';
  }

  function openBooking(kind, id){
    const modal = $('#bookingModal'); const tourFields = $('#tourFields'); const hotelFields = $('#hotelFields');
    const title = $('#bookTitle'); const sum = $('#bookSummary');
    state.booking = { kind, id };
    tourFields.hidden = kind!=='tour'; hotelFields.hidden = kind!=='hotel';
    if (kind==='tour'){
      const item = (state.results.tours||[]).find(x=>x.id===id);
      title.textContent = 'Đặt Tour'; sum.textContent = item? `${item.name} — ${item.durationDays||'-'} ngày` : '';
    } else {
      const item = (state.results.hotels||[]).find(x=>x.id===id);
      title.textContent = 'Đặt Phòng Khách Sạn'; sum.textContent = item? `${item.name} — từ ${Number(item.pricePerNight||0).toLocaleString('vi-VN')}đ/đêm` : '';
    }
    modal.hidden = false;
  }

  $('#closeBooking')?.addEventListener('click', ()=> { $('#bookingModal').hidden = true; });
  $('#bookForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!state.booking) return;
    const bookings = load('nn_bookings', []);
    if (state.booking.kind==='tour'){
      const date = $('#tourDate').value; const adults = Number($('#tourAdults').value||0); const kids = Number($('#tourKids').value||0);
      if (!date || adults<1){ toast('Chọn ngày và số khách hợp lệ'); return; }
      bookings.push({ id:'BK'+Date.now(), type:'tour', refId: state.booking.id, date, adults, kids, at: new Date().toISOString() });
    } else {
      const ci = $('#hotelCheckin').value; const co = $('#hotelCheckout').value; const guests = Number($('#hotelGuests').value||0); const rooms = Number($('#hotelRooms').value||0); const prefs = $('#hotelPrefs').value||'';
      if (!ci || !co || guests<1 || rooms<1){ toast('Điền ngày check‑in/out và số khách/phòng hợp lệ'); return; }
      bookings.push({ id:'BK'+Date.now(), type:'hotel', refId: state.booking.id, checkin:ci, checkout:co, guests, rooms, prefs, at: new Date().toISOString() });
    }
    localStorage.setItem('nn_bookings', JSON.stringify(bookings));
    $('#bookingModal').hidden = true; toast('Đã tạo yêu cầu đặt. Chúng tôi sẽ liên hệ xác nhận.');
  });

  // First render
  renderChat(); renderResults(); renderHotelsBox();
  // Ensure composer exists (self-heal if missing)
  try {
    const drawerBody = document.querySelector('#chatDrawer .drawer-body');
    const hasInput = document.getElementById('chatInput');
    if (drawerBody && !hasInput){
      const composer = document.createElement('div'); composer.className='composer';
      composer.innerHTML = `
        <input id="chatInput" placeholder="Nhập tin nhắn..." />
        <button id="voiceBtn" class="btn icon" type="button" title="Trợ lý giọng nói"><i data-lucide="mic"></i></button>
        <button id="sendBtn" class="btn primary icon" type="button" title="Gửi"><i data-lucide="send"></i></button>
      `;
      const anchor = drawerBody.querySelector('.chat-tools') || drawerBody.lastElementChild;
      drawerBody.appendChild(composer);
      // wire basic events
      document.getElementById('sendBtn')?.addEventListener('click', ()=>{
        const inp = document.getElementById('chatInput'); const v = (inp?.value||'').trim(); if(!v) return; state.chat.history.push({role:'user', text:v}); save(KEY_SESSION, state.chat); renderChat(); if (inp) inp.value=''; setTimeout(()=> reply(v), 120);
      });
      document.getElementById('chatInput')?.addEventListener('keydown', (e)=>{ if (e.key==='Enter'){ e.preventDefault(); document.getElementById('sendBtn')?.click(); }});
      if (window.lucide) lucide.createIcons();
    }
  } catch {}
  // Tweak Chat UI: button label/logo and drawer header; improve send button icon
  try {
    const openBtn = document.getElementById('openChat');
    if (openBtn){
      openBtn.classList.add('btn-ai');
      openBtn.innerHTML = `<img src="../../assets/images/logo.png" alt="" class="mini-logo"/><span>AI</span>`;
    }
    const head = document.querySelector('#chatDrawer .drawer-head');
    if (head){
      const closeBtn = head.querySelector('button');
      const brand = document.createElement('div');
      brand.className = 'brand-mini';
      brand.innerHTML = `<img src="../../assets/images/logo.png" alt=""/><span>AI</span>`;
      head.innerHTML = '';
      head.appendChild(brand);
      if (closeBtn) head.appendChild(closeBtn);
    }
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn){ sendBtn.classList.add('icon'); sendBtn.title='Gửi'; sendBtn.innerHTML = '<i data-lucide="send"></i>'; }
    if (window.lucide) lucide.createIcons();
  } catch {}
  // Enhance chat controls and init voice
  (function(){
    const sbtn = document.getElementById('sendBtn');
    if (sbtn){ sbtn.classList.add('icon'); sbtn.setAttribute('title','Gửi'); sbtn.innerHTML = '<i data-lucide="send"></i>'; }
    if (!document.getElementById('voiceBtn') && sbtn && sbtn.parentElement){
      const mic = document.createElement('button'); mic.id='voiceBtn'; mic.className='btn icon'; mic.type='button'; mic.title='Trợ lý giọng nói'; mic.innerHTML='<i data-lucide="mic"></i>';
      sbtn.parentElement.insertBefore(mic, sbtn);
    }
    if (window.lucide) lucide.createIcons();
    // Upload handlers
    document.getElementById('chatImageInput')?.addEventListener('change', (e)=>{
      const f = e.target.files?.[0]; if (!f) return;
      state.chat.history.push({ role:'user', text:`[Ảnh] ${f.name} (${Math.round(f.size/1024)} KB)` }); save(KEY_SESSION, state.chat); renderChat();
    });
    document.getElementById('chatFileInput')?.addEventListener('change', (e)=>{
      const f = e.target.files?.[0]; if (!f) return;
      state.chat.history.push({ role:'user', text:`[Tệp] ${f.name} (${Math.round(f.size/1024)} KB)` }); save(KEY_SESSION, state.chat); renderChat();
    });
    // Voice (Web Speech API)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; const vbtn = document.getElementById('voiceBtn');
    if (vbtn){
      if (!SR){ vbtn.addEventListener('click',()=>toast('Trình duyệt không hỗ trợ giọng nói')); }
      else {
        const rec = new SR(); rec.lang='vi-VN'; rec.interimResults=false; rec.maxAlternatives=1; let on=false;
        vbtn.addEventListener('click', ()=>{ if (on){ try{rec.stop();}catch{} on=false; vbtn.classList.remove('active'); } else { try{rec.start(); on=true; vbtn.classList.add('active'); toast('Đang nghe...'); }catch{} } });
        rec.onresult = (ev)=>{ const tx=ev.results?.[0]?.[0]?.transcript||''; if (tx){ state.chat.history.push({role:'user', text:tx}); save(KEY_SESSION, state.chat); renderChat(); reply(tx);} on=false; vbtn.classList.remove('active'); };
        rec.onend = ()=>{ on=false; vbtn.classList.remove('active'); };
        rec.onerror = ()=>{ on=false; vbtn.classList.remove('active'); toast('Lỗi thu giọng nói'); };
      }
    }
  })();
  if ((state.chat.history||[]).length===0){
    state.chat.history.push({ role:'assistant', text:'Xin chào! Hãy nói bạn muốn đi đâu và mong muốn của bạn nhé.' });
    save(KEY_SESSION, state.chat); renderChat();
  }
})();
