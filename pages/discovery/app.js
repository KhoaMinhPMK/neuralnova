(() => {
  const $ = (s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const toastEl = $('#toast'); let tTimer;
  const toast = (m)=>{ toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(tTimer); tTimer=setTimeout(()=>toastEl.classList.remove('show'),2000); };

  const KEY_SESSION = 'nn_discovery_session';
  const KEY_RESULTS = 'nn_discovery_results';
  const KEY_PLAN = 'nn_itinerary_saved';
  
  // Groq API Configuration
  const GROQ_API_KEY = window.DISCOVERY_CONFIG?.GROQ_API_KEY || 'gsk_BAMU3dFXVOq1EGJYVPCPWGdyb3FYFyR3wO1v0CFDMiBuSL9aQ';
  const GROQ_API_URL = window.DISCOVERY_CONFIG?.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL = window.DISCOVERY_CONFIG?.MODEL || 'openai/gpt-oss-20b';
  const TEMPERATURE = window.DISCOVERY_CONFIG?.TEMPERATURE || 0.6;
  const MAX_TOKENS = window.DISCOVERY_CONFIG?.MAX_TOKENS || 2048;
  const TOP_P = window.DISCOVERY_CONFIG?.TOP_P || 0.95;
  const INCLUDE_REASONING = window.DISCOVERY_CONFIG?.INCLUDE_REASONING || false;
  const REASONING_EFFORT = window.DISCOVERY_CONFIG?.REASONING_EFFORT || 'medium';

  const load = (k, def)=>{ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch { return def; } };
  const save = (k, v)=>{ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  // Groq API function
  async function callGroqAPI(messages) {
    try {
      // Validate API key
      if (!GROQ_API_KEY) {
        throw new Error('API key is missing. Please configure GROQ_API_KEY in config.js');
      }
      
      console.log('🚀 Calling Groq API with model:', MODEL);
      
      const requestBody = {
        model: MODEL,
        messages: messages,
        temperature: TEMPERATURE,
        max_completion_tokens: MAX_TOKENS,
        top_p: TOP_P,
        stream: false
      };
      
      // Add reasoning parameters based on model
      if (MODEL.includes('gpt-oss')) {
        requestBody.include_reasoning = INCLUDE_REASONING;
        if (REASONING_EFFORT) {
          requestBody.reasoning_effort = REASONING_EFFORT;
        }
      } else if (MODEL.includes('qwen')) {
        // Qwen uses reasoning_format instead
        requestBody.reasoning_format = 'hidden'; // or 'raw' or 'parsed'
        requestBody.reasoning_effort = 'default'; // or 'none'
      }
      
      console.log('API Request:', { model: MODEL, temperature: TEMPERATURE, max_tokens: MAX_TOKENS });
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response Error:', response.status, errorText);
        
        let errorMessage = 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = `Lỗi API: ${errorData.error.message}`;
          }
        } catch {
          // If not JSON, use generic message
        }
        
        if (response.status === 401) {
          errorMessage = 'Lỗi xác thực API key. Vui lòng kiểm tra lại API key trong config.js';
        } else if (response.status === 429) {
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.';
        } else if (response.status === 400) {
          errorMessage = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra cấu hình model.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Extract content and reasoning if available
      const message = data.choices[0].message;
      let content = message.content || '';
      
      // If reasoning is included and available, append it
      if (INCLUDE_REASONING && message.reasoning) {
        content = `<div class="reasoning-block"><strong>🧠 Quá trình suy luận:</strong><br/>${message.reasoning}</div><hr/>${content}`;
      }
      
      return content;
    } catch (error) {
      console.error('❌ Groq API Error:', error);
      
      // Return user-friendly error message
      if (error.message) {
        return `<div class="error-message">⚠️ ${error.message}</div>`;
      }
      return '<div class="error-message">⚠️ Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.</div>';
    }
  }

  const state = {
    chat: load(KEY_SESSION, { history: [] }),
    results: load(KEY_RESULTS, { tours: [], hotels: [], places: [], blogs: [], markers: [] }),
    booking: null,
  };

  function renderChat(){
    const box = $('#chatBox'); if (!box) return;
    box.innerHTML = (state.chat.history||[]).map(m=>{
      if (m.role === 'assistant') {
        return `<div class="msg ${m.role}">
          <div class="bubble">
            <div class="message-header">
              <div class="message-avatar">
                <i data-lucide="sparkles"></i>
              </div>
              <span>NeuralNova AI</span>
            </div>
            <div class="message-content">${m.text}</div>
          </div>
        </div>`;
      } else {
        return `<div class="msg ${m.role}">
          <div class="bubble">
            <div class="message-header">
              <div class="message-avatar">
                <i data-lucide="user"></i>
              </div>
              <span>Bạn</span>
            </div>
            <div class="message-content">${m.text}</div>
          </div>
        </div>`;
      }
    }).join('');
    box.scrollTop = box.scrollHeight;
    if (window.lucide) lucide.createIcons();
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
    const toursBox = $('#tourList'); 
    const hotelsBox = $('#hotelList'); 
    const placesBox = $('#placeList'); 
    const blogsBox = $('#blogList'); 
    const mbox = $('#markerList');
    
    // Check if elements exist before rendering
    if (!toursBox || !hotelsBox) {
      console.warn('Required elements not found for rendering results');
      return;
    }
    
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

    // Only render if elements exist
    if (placesBox) {
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
    }

    if (blogsBox) {
      blogsBox.innerHTML = (blogs||[]).map(b=>`
        <div class="card">
          <div class="row"><strong>${b.title}</strong><span>${b.readTimeMin} phút</span></div>
          <div class="muted">${b.summary||''}</div>
          <div><button class="btn" data-act="save" data-type="blog" data-id="${b.id}">Lưu</button></div>
        </div>
      `).join('') || '<div class="card">Chưa có bài viết</div>';
    }

    if (mbox) {
      mbox.innerHTML = (markers||[]).map(m=>`
        <div class="marker">
          <div><strong>${m.label}</strong></div>
          <div class="muted">${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}</div>
          <div class="tags"><span class="tag">${m.kind}</span></div>
        </div>
      `).join('') || '<div class="marker">Chưa có điểm hiển thị</div>';
    }

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

  async function reply(text){
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Prepare messages for Groq API
      const messages = [
        {
          role: 'system',
          content: `Bạn là NeuralNova AI - trợ lý du lịch thông minh chuyên nghiệp. Nhiệm vụ của bạn:

1. GỢI Ý DU LỊCH:
- Phân tích nhu cầu du lịch từ tin nhắn người dùng
- Gợi ý tour, khách sạn, địa điểm phù hợp
- Lên kế hoạch lịch trình chi tiết
- Tư vấn về ngân sách, thời gian, hoạt động

2. PHONG CÁCH TRẢ LỜI:
- Thân thiện, nhiệt tình như một chuyên gia du lịch
- Trả lời bằng tiếng Việt
- Cung cấp thông tin chi tiết và hữu ích
- Đề xuất cụ thể về địa điểm, thời gian, chi phí

3. XỬ LÝ YÊU CẦU:
- Phân tích ngân sách, số ngày, sở thích
- Gợi ý theo chủ đề: biển, núi, văn hóa, ẩm thực
- Tư vấn khách sạn theo yêu cầu
- Hướng dẫn lịch trình tối ưu

Hãy trả lời một cách chuyên nghiệp và hữu ích!`
        },
        ...state.chat.history.map(msg => ({
          role: msg.role,
          content: msg.text
        }))
      ];

      // Call Groq API
      const aiResponse = await callGroqAPI(messages);
      
      // Hide typing indicator
      hideTypingIndicator();
      
      // Add AI response to chat
      state.chat.history.push({ role:'assistant', text: aiResponse });
      save(KEY_SESSION, state.chat);
      renderChat();
      
      // Parse criteria and generate sample data for UI
      const crit = parseCriteria(text);
      const res = sampleData(crit);
      state.results = res; 
      save(KEY_RESULTS, res);
      renderResults();
      
      // Show map if requested
      try {
        const wantMap = /(bản đồ|ban do|map|chỉ đường|chi duong|google map|đi đâu|dia diem)/i.test(text||'');
        if (wantMap) {
          const drawer = document.querySelector('#chatDrawer .drawer-body');
          if (drawer && !document.getElementById('chatMap')) {
            const map = document.createElement('div'); map.id='chatMap'; map.className='map'; map.hidden=false;
            map.innerHTML = '<div class="map-placeholder">🗺️ Bản đồ tương tác — Hiển thị các điểm tham quan được gợi ý</div><div class="legend"><span class="badge tour">🏛️ Tour</span><span class="badge sight">📍 Điểm tham quan</span><span class="badge food">🍽️ Ăn uống</span></div><div id="chatMarkerList" class="markers"></div>';
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
      
    } catch (error) {
      hideTypingIndicator();
      console.error('Reply error:', error);
      const errorMsg = 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.';
      state.chat.history.push({ role:'assistant', text: errorMsg });
      save(KEY_SESSION, state.chat);
      renderChat();
    }
  }

  // Typing indicator functions
  function showTypingIndicator() {
    const chatBox = $('#chatBox');
    if (!chatBox) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'msg assistant';
    typingDiv.innerHTML = `
      <div class="bubble">
        <div class="message-header">
          <div class="message-avatar">
            <i data-lucide="sparkles"></i>
          </div>
          <span>NeuralNova AI</span>
        </div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (window.lucide) lucide.createIcons();
  }
  
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
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

  // Check API key configuration
  function checkAPIConfiguration() {
    if (!window.DISCOVERY_CONFIG) {
      console.error('DISCOVERY_CONFIG not found. Please ensure config.js is loaded.');
      toast('Lỗi cấu hình: Không tìm thấy file config.js');
      return false;
    }
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing. Please configure your API key in config.js');
      toast('Lỗi: Thiếu API key. Vui lòng cấu hình API key trong config.js');
      return false;
    }
    
    console.log('✅ API Configuration loaded successfully');
    console.log('Model:', MODEL);
    console.log('Temperature:', TEMPERATURE);
    console.log('Max Tokens:', MAX_TOKENS);
    return true;
  }

  // First render
  renderChat(); renderResults(); renderHotelsBox();
  
  // Check API configuration
  checkAPIConfiguration();
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
  // Clear chat history function
  window.clearChatHistory = function() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      state.chat.history = [];
      save(KEY_SESSION, state.chat);
      renderChat();
      toast('Đã xóa lịch sử chat');
    }
  };

  // Enhanced welcome message
  if ((state.chat.history||[]).length===0){
    state.chat.history.push({ 
      role:'assistant', 
      text:'Xin chào! Tôi là NeuralNova AI - trợ lý du lịch thông minh được hỗ trợ bởi GPT-OSS. Tôi có thể giúp bạn:\n\n🌟 Gợi ý tour du lịch phù hợp\n🏨 Tìm khách sạn theo yêu cầu\n🗺️ Lên kế hoạch lịch trình chi tiết\n💰 Tư vấn về ngân sách và thời gian\n🍽️ Đề xuất địa điểm ăn uống\n\nHãy cho tôi biết bạn muốn đi đâu và có gì đặc biệt nhé! Tôi sẽ tư vấn một cách chuyên nghiệp và chi tiết nhất.' 
    });
    save(KEY_SESSION, state.chat); 
    renderChat();
  }
})();
