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
    // Enhanced mock data with more variety
    const theme = criteria.theme;
    let baseCity = 'Đà Lạt';
    if (theme==='biển') baseCity = 'Phú Quốc';
    if (theme==='trekking') baseCity = 'Sa Pa';

    const tours = [
      { 
        id:'T-'+Date.now(), 
        name:`${theme==='biển'?'🏖️ Khám phá thiên đường biển': theme==='trekking'?'⛰️ Chinh phục núi rừng':'🌆 Khám phá thành phố'} ${baseCity}`, 
        region: baseCity, 
        theme:[theme], 
        durationDays: criteria.days||3, 
        priceFrom: criteria.budget? 3000000 : 2500000, 
        rating: 4.6,
        difficulty: theme==='trekking'? '⭐⭐⭐ Khó' : theme==='biển'? '⭐ Dễ' : '⭐⭐ Trung Bình',
        includes:['xe đưa đón','vé tham quan','hướng dẫn viên','bảo hiểm'], 
        excludes:['chi phí cá nhân','đồ uống'], 
        schedule:[
          {day:1,title:'Ngày 1: Khởi hành - Check-in', activities:['Di chuyển','Nhận phòng','Nghỉ ngơi','Khám phá địa phương']}, 
          {day:2,title:'Ngày 2: Tham quan chính', activities:['Ăn sáng','Điểm tham quan A','Điểm tham quan B','Ăn tối']},
          {day:3,title:'Ngày 3: Trở về', activities:['Ăn sáng','Mua sắm','Check-out','Về nhà']}
        ], 
        coords:[{lat:10.2,lng:103.95}],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
      },
      { 
        id:'T2-'+Date.now(), 
        name:`🎭 Trải nghiệm văn hóa địa phương ${baseCity}`, 
        region: baseCity, 
        theme:['văn hóa'], 
        durationDays:(criteria.days||2), 
        priceFrom: 2200000, 
        rating: 4.5,
        difficulty: '⭐ Dễ',
        includes:['hướng dẫn viên','vé tham quan','ăn trưa'], 
        excludes:['ăn tối','di chuyển cá nhân'], 
        schedule:[
          {day:1,title:'Ngày 1: Khám phá văn hóa', activities:['Chợ địa phương','Làng nghề','Ẩm thực đường phố']},
          {day:2,title:'Ngày 2: Di sản & Lịch sử', activities:['Bảo tàng','Di tích lịch sử','Trung tâm văn hóa']}
        ], 
        coords:[{lat:10.23,lng:103.98}],
        image: 'https://images.unsplash.com/photo-1523906630133-f6934a1ab2b9?w=400'
      },
      { 
        id:'T3-'+Date.now(), 
        name:`🍜 Tour ẩm thực ${baseCity}`, 
        region: baseCity, 
        theme:['ẩm thực'], 
        durationDays:1, 
        priceFrom: 890000, 
        rating: 4.8,
        difficulty: '⭐ Dễ',
        includes:['hướng dẫn viên','5-7 món ăn','nước uống','xe đưa đón'], 
        excludes:['chi phí cá nhân'], 
        schedule:[
          {day:1,title:'Tour ẩm thực buổi tối', activities:['Phở','Bánh mì','Bún chả','Chè','Cà phê']}
        ], 
        coords:[{lat:10.19,lng:103.93}],
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400'
      },
      { 
        id:'T4-'+Date.now(), 
        name:`📸 Photography Tour ${baseCity}`, 
        region: baseCity, 
        theme:['nhiếp ảnh'], 
        durationDays:2, 
        priceFrom: 3500000, 
        rating: 4.7,
        difficulty: '⭐⭐ Trung Bình',
        includes:['Nhiếp ảnh gia chuyên nghiệp','Xe riêng','In ảnh miễn phí'], 
        excludes:['Thiết bị camera','Ăn uống'], 
        schedule:[
          {day:1,title:'Golden Hour Morning', activities:['Sunrise shoot','Landscape','Local life']},
          {day:2,title:'Night Photography', activities:['Sunset','Night market','Long exposure']}
        ], 
        coords:[{lat:10.22,lng:103.97}],
        image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=400'
      },
      { 
        id:'T5-'+Date.now(), 
        name:`🚴 Adventure & Sport ${baseCity}`, 
        region: baseCity, 
        theme:['thể thao','mạo hiểm'], 
        durationDays:3, 
        priceFrom: 4500000, 
        rating: 4.9,
        difficulty: '⭐⭐⭐⭐ Cực Khó',
        includes:['Thiết bị an toàn','Huấn luyện viên','Bảo hiểm cao cấp'], 
        excludes:['Chi phí cá nhân','Quần áo thể thao'], 
        schedule:[
          {day:1,title:'Trekking & Camping', activities:['Trekking 8km','Dựng lều','BBQ']},
          {day:2,title:'Rock Climbing', activities:['Huấn luyện','Leo núi','Rappelling']},
          {day:3,title:'Water Sports', activities:['Kayaking','Snorkeling','Diving']}
        ], 
        coords:[{lat:10.18,lng:103.99}],
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400'
      },
      { 
        id:'T6-'+Date.now(), 
        name:`🧘 Wellness & Retreat ${baseCity}`, 
        region: baseCity, 
        theme:['wellness','thư giãn'], 
        durationDays:4, 
        priceFrom: 6800000, 
        rating: 4.8,
        difficulty: '⭐ Dễ',
        includes:['Yoga class','Spa treatment','Healthy meals','Meditation'], 
        excludes:['Dịch vụ spa cao cấp','Đồ uống có cồn'], 
        schedule:[
          {day:1,title:'Arrival & Detox', activities:['Check-in','Yoga buổi chiều','Bữa tối detox']},
          {day:2,title:'Mind & Body', activities:['Yoga sunrise','Spa treatment','Meditation']},
          {day:3,title:'Nature Connection', activities:['Forest bathing','Organic farm visit','Sound healing']},
          {day:4,title:'Farewell', activities:['Final yoga','Brunch','Check-out']}
        ], 
        coords:[{lat:10.16,lng:103.92}],
        image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400'
      }
    ];

    const places = [
      { id:'P1', name: theme==='biển'?'Bãi Sao - Biển đẹp nhất':'Đỉnh Langbiang - View 360°', type:'sight', lat: theme==='biển'?10.05:12.02, lng: theme==='biển'?103.96:108.44, tags:[theme,'ảnh đẹp','hot'], rating: 4.5 },
      { id:'P2', name:'Cafe View Hoàng Hôn', type:'cafe', lat: theme==='biển'?10.21:11.94, lng: theme==='biển'?103.94:108.43, tags:['ngắm cảnh','coffee'], rating:4.4 },
      { id:'P3', name:'Chợ Đêm Địa Phương', type:'market', lat: theme==='biển'?10.19:11.95, lng: theme==='biển'?103.95:108.42, tags:['ăn uống','mua sắm','văn hóa'], rating:4.6 },
      { id:'P4', name:'Nhà Hàng Hải Sản Fresh', type:'restaurant', lat: theme==='biển'?10.17:11.93, lng: theme==='biển'?103.97:108.45, tags:['hải sản','ngon','giá tốt'], rating:4.7 }
    ];

    const blogs = [
      { id:'B1', title:`Top 10 Homestay View Đẹp ${baseCity} 2025`, slug:'top-homestay', tags:[baseCity,'lưu trú','2025'], summary:'Danh sách homestay view đẹp, giá tốt, được review cao', coverImg:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300', readTimeMin:6 },
      { id:'B2', title:`Kinh nghiệm ăn uống ${baseCity} A-Z`, slug:'food-guide', tags:['ẩm thực','kinh nghiệm'], summary:'Điểm ăn nổi bật từ bình dân đến cao cấp', coverImg:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', readTimeMin:5 },
      { id:'B3', title:`Budget 5 triệu du lịch ${baseCity} 3N2Đ`, slug:'budget-guide', tags:['budget','tiết kiệm'], summary:'Chi tiết chi phí từng hạng mục, tips tiết kiệm', coverImg:'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300', readTimeMin:8 }
    ];

    // hotels - more variety
    const hotels = [
      { id:'H1', name:`🌟 Luxury Resort & Spa ${baseCity}`, city: baseCity, stars: 5, pricePerNight: 2450000, rating:4.9, amenities:['hồ bơi vô cực','spa','buffet sáng','gym','view biển'], image:'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' },
      { id:'H2', name:`🏨 Premium Hotel ${baseCity} Downtown`, city: baseCity, stars: 4, pricePerNight: 1250000, rating:4.6, amenities:['gần biển','buffet sáng','wifi','rooftop bar'], image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
      { id:'H3', name:`🏡 Cozy Homestay & Cafe`, city: baseCity, stars: 3, pricePerNight: 650000, rating:4.7, amenities:['gia đình','ấm cúng','ăn sáng','cafe','sân vườn'], image:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' },
      { id:'H4', name:`🏖️ Beachfront Bungalow`, city: baseCity, stars: 3, pricePerNight: 890000, rating:4.5, amenities:['gần biển 50m','view đẹp','yên tĩnh','bãi biển riêng'], image:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
      { id:'H5', name:`🌴 Garden Villa & Pool`, city: baseCity, stars: 4, pricePerNight: 1680000, rating:4.8, amenities:['hồ bơi riêng','sân vườn','BBQ','4 phòng ngủ'], image:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
      { id:'H6', name:`🏔️ Mountain View Lodge`, city: baseCity, stars: 3, pricePerNight: 750000, rating:4.4, amenities:['view núi','trekking','lửa trại','ăn sáng'], image:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' }
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
      <div class="card tour-card" data-tour-id="${t.id}">
        ${t.image ? `<div class="card-image" style="background-image: url('${t.image}')"><div class="card-badge">${t.difficulty||''}</div></div>` : ''}
        <div class="card-content">
          <div class="card-header">
            <strong class="card-title">${t.name}</strong>
            <div class="card-rating">⭐ ${t.rating||'-'}</div>
          </div>
          <div class="card-meta">
            <span>📅 ${t.durationDays||'-'} ngày</span>
            <span>•</span>
            <span class="card-price">Từ ${Number(t.priceFrom||0).toLocaleString('vi-VN')}đ</span>
          </div>
          <div class="tags">
            ${(t.theme||[]).map(x=>`<span class="tag tag-theme">${x}</span>`).join('')}
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary" data-act="save" data-type="tour" data-id="${t.id}">
              <i data-lucide="bookmark"></i> Lưu
            </button>
            <button class="btn btn-primary" data-act="book" data-id="${t.id}">
              <i data-lucide="calendar-check"></i> Đặt ngay
            </button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="card empty-card"><p>🔍 Chưa có tour phù hợp với tiêu chí của bạn</p><p class="muted">Hãy thử chat với AI để tìm tour phù hợp!</p></div>';

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
          content: `Bạn là NeuralNova AI - chuyên gia tư vấn du lịch "Độ Trình" hàng đầu Việt Nam. Nhiệm vụ của bạn:

🎯 1. TƯ VẤN ĐỘ TRÌNH ĐỊA ĐIỂM:
- Đánh giá độ khó của mỗi điểm đến: Dễ (⭐) - Trung Bình (⭐⭐) - Khó (⭐⭐⭐) - Cực Khó (⭐⭐⭐⭐)
- Phân tích yếu tố: địa hình, thời tiết, chi phí, di chuyển, ngôn ngữ, văn hóa
- Đề xuất chuẩn bị: trang bị, thể lực, kinh nghiệm cần thiết
- Cảnh báo rủi ro và lưu ý an toàn

💰 2. TƯ VẤN CHI PHÍ CHI TIẾT:
- Ước tính ngân sách từng hạng mục: vé máy bay, khách sạn, ăn uống, tham quan, mua sắm
- Gợi ý tiết kiệm và tối ưu chi phí
- So sánh các mức giá: tiết kiệm, trung bình, cao cấp
- Tips săn vé rẻ và deals khuyến mãi

🗺️ 3. LẬP LỊCH TRÌNH TỐI ƯU:
- Lịch trình từng ngày, từng giờ cụ thể
- Tối ưu di chuyển giữa các điểm
- Thời gian phù hợp cho mỗi hoạt động
- Dự phòng thời gian cho nghỉ ngơi

🏨 4. GỢI Ý CHẤT LƯỢNG:
- Khách sạn/Homestay: địa điểm, giá cả, đánh giá
- Nhà hàng/quán ăn địa phương authentic
- Điểm check-in đẹp cho Instagram
- Hoạt động trải nghiệm độc đáo

📱 5. PHONG CÁCH TRẢ LỜI:
- Thân thiện, chuyên nghiệp, đầy nhiệt huyết
- Trả lời bằng tiếng Việt, dễ hiểu
- Emoji và format đẹp (bullets, numbers, icons)
- Ví dụ cụ thể và trải nghiệm thực tế
- Luôn hỏi thêm thông tin nếu chưa rõ

⚡ 6. YÊU CẦU QUAN TRỌNG:
- LUÔN đánh giá độ khó (Độ Trình) của địa điểm
- CHI TIẾT về chi phí từng hạng mục
- CẢNH BÁO rõ ràng về rủi ro, mùa mưa, khó khăn
- GỢI Ý chuẩn bị cụ thể (quần áo, thuốc, giấy tờ...)
- TIPS thực tế từ kinh nghiệm du lịch

Hãy tư vấn chuyên nghiệp, chi tiết và đầy cảm hứng để người dùng tự tin lên đường! 🚀`
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

  // Tabs
  $$('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.tab').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.tab;
      const tours = document.getElementById('panel-tours'); const hotels=document.getElementById('panel-hotels');
      if (tours) tours.hidden = key!=='tours';
      if (hotels) hotels.hidden = key!=='hotels';
      if (key==='tours'){ setupTourFilters(); applyBudgetFilter(); }
      if (key==='hotels'){ renderHotelsBox(); }
    });
  });

  // Render hotels list
  function renderHotelsBox(){
    const hotelsBox = $('#hotelList'); 
    if (!hotelsBox) return;
    const hotels = state.results.hotels||[];
    hotelsBox.innerHTML = hotels.map(h=>`
      <div class="card hotel-card" data-hotel-id="${h.id}">
        ${h.image ? `<div class="card-image" style="background-image: url('${h.image}')"><div class="card-stars">${'⭐'.repeat(h.stars||3)}</div></div>` : ''}
        <div class="card-content">
          <div class="card-header">
            <strong class="card-title">${h.name}</strong>
            <div class="card-rating">⭐ ${h.rating || '-'}</div>
          </div>
          <div class="card-meta">
            <span class="card-price-large">${Number(h.pricePerNight||0).toLocaleString('vi-VN')}đ<span class="per-night">/đêm</span></span>
          </div>
          <div class="tags">
            ${(h.amenities||[]).map(x=>`<span class="tag tag-amenity">${x}</span>`).join('')}
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary" data-act="save" data-type="hotel" data-id="${h.id}">
              <i data-lucide="heart"></i> Yêu thích
            </button>
            <button class="btn btn-primary" data-act="book" data-id="${h.id}">
              <i data-lucide="bed"></i> Đặt phòng
            </button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="card empty-card"><p>🏨 Chưa có khách sạn phù hợp</p><p class="muted">Hãy chat với AI để tìm chỗ ở tốt nhất!</p></div>';
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
    
    let bookingDetails = {};
    let itemName = '';
    let totalPrice = 0;
    
    if (state.booking.kind==='tour'){
      const date = $('#tourDate').value; 
      const adults = Number($('#tourAdults').value||0); 
      const kids = Number($('#tourKids').value||0);
      if (!date || adults<1){ toast('⚠️ Vui lòng chọn ngày và số khách hợp lệ'); return; }
      
      const tour = (state.results.tours||[]).find(x=>x.id===state.booking.id);
      itemName = tour?.name || 'Tour';
      totalPrice = (tour?.priceFrom||0) * adults;
      
      bookingDetails = { 
        id:'BK'+Date.now(), 
        type:'tour', 
        refId: state.booking.id, 
        itemName,
        date, 
        adults, 
        kids,
        totalPrice,
        status: 'pending',
        at: new Date().toISOString() 
      };
      bookings.push(bookingDetails);
    } else {
      const ci = $('#hotelCheckin').value; 
      const co = $('#hotelCheckout').value; 
      const guests = Number($('#hotelGuests').value||0); 
      const rooms = Number($('#hotelRooms').value||0); 
      const prefs = $('#hotelPrefs').value||'';
      
      if (!ci || !co || guests<1 || rooms<1){ toast('⚠️ Vui lòng điền đầy đủ thông tin'); return; }
      
      const hotel = (state.results.hotels||[]).find(x=>x.id===state.booking.id);
      itemName = hotel?.name || 'Hotel';
      
      // Calculate nights
      const checkin = new Date(ci);
      const checkout = new Date(co);
      const nights = Math.max(1, Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)));
      totalPrice = (hotel?.pricePerNight||0) * nights * rooms;
      
      bookingDetails = { 
        id:'BK'+Date.now(), 
        type:'hotel', 
        refId: state.booking.id,
        itemName,
        checkin:ci, 
        checkout:co, 
        nights,
        guests, 
        rooms, 
        prefs,
        totalPrice,
        status: 'pending',
        at: new Date().toISOString() 
      };
      bookings.push(bookingDetails);
    }
    
    localStorage.setItem('nn_bookings', JSON.stringify(bookings));
    $('#bookingModal').hidden = true; 
    
    // Show detailed confirmation
    showBookingConfirmation(bookingDetails);
  });
  
  // Booking confirmation notification
  function showBookingConfirmation(booking) {
    const confirmMsg = document.createElement('div');
    confirmMsg.className = 'booking-confirmation';
    confirmMsg.innerHTML = `
      <div class="booking-confirmation-content">
        <div class="booking-check">✓</div>
        <h3>🎉 Đặt thành công!</h3>
        <p><strong>${booking.itemName}</strong></p>
        ${booking.type === 'tour' 
          ? `<p>📅 Ngày: ${booking.date}</p><p>👥 ${booking.adults} người lớn${booking.kids ? `, ${booking.kids} trẻ em` : ''}</p>` 
          : `<p>📅 ${booking.checkin} → ${booking.checkout} (${booking.nights} đêm)</p><p>🛏️ ${booking.rooms} phòng • ${booking.guests} khách</p>`
        }
        <p class="booking-total">💰 Tổng tiền: <strong>${(booking.totalPrice||0).toLocaleString('vi-VN')}đ</strong></p>
        <p class="booking-note">Mã đặt: <code>${booking.id}</code></p>
        <p class="muted">Chúng tôi sẽ liên hệ xác nhận trong 24h</p>
        <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Đóng</button>
      </div>
    `;
    document.body.appendChild(confirmMsg);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (confirmMsg.parentElement) confirmMsg.remove();
    }, 10000);
  }

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

  // ==========================================
  // MAP EXPLORER FUNCTIONALITY
  // ==========================================
  
  const mapState = {
    map: null,
    markers: [],
    chatHistory: [],
    isMinimized: false
  };

  // Vietnam locations database (expandable)
  const VIETNAM_LOCATIONS = {
    'hà nội': { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, zoom: 12, description: 'Thủ đô ngàn năm văn hiến' },
    'ha noi': { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, zoom: 12, description: 'Thủ đô ngàn năm văn hiến' },
    'hanoi': { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, zoom: 12, description: 'Thủ đô ngàn năm văn hiến' },
    'sài gòn': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, zoom: 12, description: 'Thành phố năng động nhất Việt Nam' },
    'sai gon': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, zoom: 12, description: 'Thành phố năng động nhất Việt Nam' },
    'hồ chí minh': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, zoom: 12, description: 'Thành phố năng động nhất Việt Nam' },
    'ho chi minh': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, zoom: 12, description: 'Thành phố năng động nhất Việt Nam' },
    'tp.hcm': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, zoom: 12, description: 'Thành phố năng động nhất Việt Nam' },
    'đà nẵng': { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, zoom: 13, description: 'Thành phố đáng sống nhất Việt Nam' },
    'da nang': { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, zoom: 13, description: 'Thành phố đáng sống nhất Việt Nam' },
    'danang': { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, zoom: 13, description: 'Thành phố đáng sống nhất Việt Nam' },
    'huế': { name: 'Huế', lat: 16.4637, lng: 107.5909, zoom: 13, description: 'Cố đô Huế - Di sản văn hóa thế giới' },
    'hue': { name: 'Huế', lat: 16.4637, lng: 107.5909, zoom: 13, description: 'Cố đô Huế - Di sản văn hóa thế giới' },
    'hội an': { name: 'Hội An', lat: 15.8801, lng: 108.3380, zoom: 14, description: 'Phố cổ Hội An - Di sản văn hóa thế giới' },
    'hoi an': { name: 'Hội An', lat: 15.8801, lng: 108.3380, zoom: 14, description: 'Phố cổ Hội An - Di sản văn hóa thế giới' },
    'nha trang': { name: 'Nha Trang', lat: 12.2388, lng: 109.1967, zoom: 13, description: 'Biển Nha Trang - Thiên đường biển đảo' },
    'đà lạt': { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, zoom: 13, description: 'Thành phố ngàn hoa - Thủ phủ tình yêu' },
    'da lat': { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, zoom: 13, description: 'Thành phố ngàn hoa - Thủ phủ tình yêu' },
    'dalat': { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, zoom: 13, description: 'Thành phố ngàn hoa - Thủ phủ tình yêu' },
    'phú quốc': { name: 'Phú Quốc', lat: 10.2899, lng: 103.9840, zoom: 12, description: 'Đảo Ngọc - Thiên đường nghỉ dưỡng' },
    'phu quoc': { name: 'Phú Quốc', lat: 10.2899, lng: 103.9840, zoom: 12, description: 'Đảo Ngọc - Thiên đường nghỉ dưỡng' },
    'sa pa': { name: 'Sa Pa', lat: 22.3364, lng: 103.8438, zoom: 13, description: 'Sa Pa - Thiên đường trekking miền Bắc' },
    'sapa': { name: 'Sa Pa', lat: 22.3364, lng: 103.8438, zoom: 13, description: 'Sa Pa - Thiên đường trekking miền Bắc' },
    'hạ long': { name: 'Vịnh Hạ Long', lat: 20.9101, lng: 107.1839, zoom: 12, description: 'Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới' },
    'ha long': { name: 'Vịnh Hạ Long', lat: 20.9101, lng: 107.1839, zoom: 12, description: 'Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới' },
    'halong': { name: 'Vịnh Hạ Long', lat: 20.9101, lng: 107.1839, zoom: 12, description: 'Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới' },
    'vũng tàu': { name: 'Vũng Tàu', lat: 10.3460, lng: 107.0843, zoom: 13, description: 'Vũng Tàu - Thành phố biển gần Sài Gòn' },
    'vung tau': { name: 'Vũng Tàu', lat: 10.3460, lng: 107.0843, zoom: 13, description: 'Vũng Tàu - Thành phố biển gần Sài Gòn' },
    'cần thơ': { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, zoom: 13, description: 'Cần Thơ - Thủ phủ miền Tây' },
    'can tho': { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, zoom: 13, description: 'Cần Thơ - Thủ phủ miền Tây' },
    'côn đảo': { name: 'Côn Đảo', lat: 8.6854, lng: 106.6070, zoom: 13, description: 'Côn Đảo - Thiên đường hoang sơ' },
    'con dao': { name: 'Côn Đảo', lat: 8.6854, lng: 106.6070, zoom: 13, description: 'Côn Đảo - Thiên đường hoang sơ' },
    'ninh bình': { name: 'Ninh Bình', lat: 20.2506, lng: 105.9745, zoom: 12, description: 'Ninh Bình - Vịnh Hạ Long trên cạn' },
    'ninh binh': { name: 'Ninh Bình', lat: 20.2506, lng: 105.9745, zoom: 12, description: 'Ninh Bình - Vịnh Hạ Long trên cạn' },
    'mũi né': { name: 'Mũi Né', lat: 10.9333, lng: 108.2667, zoom: 13, description: 'Mũi Né - Thiên đường lướt ván' },
    'mui ne': { name: 'Mũi Né', lat: 10.9333, lng: 108.2667, zoom: 13, description: 'Mũi Né - Thiên đường lướt ván' }
  };

  // Initialize Leaflet Map
  function initializeMap() {
    if (mapState.map) return; // Already initialized
    
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;

    // Create map centered on Vietnam
    mapState.map = L.map('mapContainer').setView([16.0, 106.0], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(mapState.map);

    console.log('✅ Map initialized');
  }

  // Open Map Explorer
  document.getElementById('openMap')?.addEventListener('click', () => {
    const mapExplorer = document.getElementById('mapExplorer');
    if (!mapExplorer) return;
    
    mapExplorer.hidden = false;
    
    // Initialize map if not done yet
    setTimeout(() => {
      initializeMap();
      if (mapState.map) {
        mapState.map.invalidateSize(); // Fix map rendering
      }
    }, 100);
  });

  // Close Map Explorer
  document.getElementById('closeMap')?.addEventListener('click', () => {
    const mapExplorer = document.getElementById('mapExplorer');
    if (mapExplorer) mapExplorer.hidden = true;
  });

  // Toggle chat minimize/maximize
  document.getElementById('toggleMapChat')?.addEventListener('click', () => {
    const chatInterface = document.getElementById('mapChatInterface');
    if (!chatInterface) return;
    
    mapState.isMinimized = !mapState.isMinimized;
    if (mapState.isMinimized) {
      chatInterface.classList.add('minimized');
    } else {
      chatInterface.classList.remove('minimized');
    }
  });

  // Find location from user input
  function findLocation(query) {
    const normalized = query.toLowerCase().trim();
    
    // Check exact match
    if (VIETNAM_LOCATIONS[normalized]) {
      return VIETNAM_LOCATIONS[normalized];
    }
    
    // Check partial match
    for (const [key, loc] of Object.entries(VIETNAM_LOCATIONS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return loc;
      }
    }
    
    return null;
  }

  // Zoom to location on map
  function zoomToLocation(location) {
    if (!mapState.map || !location) return;
    
    // Clear existing markers
    mapState.markers.forEach(m => m.remove());
    mapState.markers = [];
    
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="
        background: linear-gradient(135deg, #10b981, #059669);
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 15px rgba(16,185,129,.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <i class="fas fa-map-marker-alt" style="
          color: white;
          font-size: 20px;
          transform: rotate(45deg);
        "></i>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    
    // Add marker
    const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(mapState.map);
    marker.bindPopup(`<strong>${location.name}</strong><br/>${location.description}`).openPopup();
    mapState.markers.push(marker);
    
    // Add click event to marker - Ask AI about location
    marker.on('click', () => {
      askAIAboutLocation(location.name, location.description);
    });
    
    // Zoom to location with animation
    mapState.map.flyTo([location.lat, location.lng], location.zoom || 13, {
      duration: 2,
      easeLinearity: 0.5
    });
    
    // Show location info card
    showLocationInfo(location);
  }

  // Show location info card
  function showLocationInfo(location) {
    const infoCard = document.getElementById('locationInfoCard');
    const infoContent = document.getElementById('locationInfoContent');
    
    if (!infoCard || !infoContent) return;
    
    infoContent.innerHTML = `
      <h3>📍 ${location.name}</h3>
      <p>${location.description}</p>
      <p class="info-label">Tọa độ</p>
      <p>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
    `;
    
    infoCard.hidden = false;
  }

  // Add message to map chat
  function addMapChatMessage(text, isUser = false) {
    const messagesBox = document.getElementById('mapChatMessages');
    if (!messagesBox) return;
    
    // Remove welcome message if exists
    const welcome = messagesBox.querySelector('.map-chat-welcome');
    if (welcome) welcome.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `map-chat-message ${isUser ? 'user' : 'ai'}`;
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    messagesBox.appendChild(msgDiv);
    
    // Scroll to bottom
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    // Save to history
    mapState.chatHistory.push({ text, isUser });
  }

  // Handle map chat send
  async function handleMapChatSend() {
    const input = document.getElementById('mapChatInput');
    if (!input) return;
    
    const query = input.value.trim();
    if (!query) return;
    
    // Add user message
    addMapChatMessage(query, true);
    input.value = '';
    
    // Find location
    const location = findLocation(query);
    
    if (location) {
      // AI responds with location info
      const aiResponse = `🎯 Đã tìm thấy: <strong>${location.name}</strong>!<br/><br/>
        ${location.description}<br/><br/>
        Đang zoom đến vị trí trên bản đồ... 🗺️`;
      
      addMapChatMessage(aiResponse, false);
      
      // Minimize chat after 2 seconds
      setTimeout(() => {
        const chatInterface = document.getElementById('mapChatInterface');
        if (chatInterface && !mapState.isMinimized) {
          chatInterface.classList.add('minimized');
          mapState.isMinimized = true;
        }
      }, 2000);
      
      // Zoom to location
      setTimeout(() => {
        zoomToLocation(location);
      }, 500);
      
    } else {
      // Location not found
      const aiResponse = `😅 Xin lỗi, tôi chưa tìm thấy địa điểm "<strong>${query}</strong>" trong database.<br/><br/>
        <strong>Các địa điểm phổ biến:</strong><br/>
        🏖️ Phú Quốc, Nha Trang, Vũng Tàu<br/>
        🏔️ Sa Pa, Đà Lạt, Ninh Bình<br/>
        🏙️ Hà Nội, Sài Gòn, Đà Nẵng<br/>
        🌊 Hạ Long, Hội An, Mũi Né<br/><br/>
        Hãy thử lại với một trong những địa điểm trên nhé!`;
      
      addMapChatMessage(aiResponse, false);
    }
  }

  // Map chat send button - OLD (will be replaced with RAG handler at end of file)
  // document.getElementById('mapChatSend')?.addEventListener('click', handleMapChatSend);

  // Map chat input enter key - OLD (will be replaced with RAG handler at end of file)
  // document.getElementById('mapChatInput')?.addEventListener('keydown', (e) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //     handleMapChatSend();
  //   }
  // });

  // ==========================================
  // FLOWER TRAVEL ADVISORY RAG SYSTEM
  // ==========================================
  
  // Embedded travel advisory data - Can be loaded from JSON
  let FLOWER_ADVISORY_DATA = {
    'buckwheat': {
      flower_name: 'Hoa tam giác mạch',
      english_name: 'Buckwheat Flower',
      season: 'Tháng 10-11',
      best_location: 'Hà Giang, Việt Nam',
      best_time: 'Cuối tháng 10',
      quality_score: 0.66,
      total_hotspots: 46,
      description: 'Hoa tam giác mạch nở rộ trên cao nguyên đá Hà Giang',
      keywords: ['tam giác mạch', 'buckwheat', 'hà giang', 'cao nguyên đá'],
      travel_tips: [
        'Mang theo áo ấm - thời tiết miền núi lạnh',
        'Đường đi khó, nên có kinh nghiệm lái xe',
        'Thời gian nở ngắn (2-3 tuần), theo dõi thời tiết'
      ],
      hotspots: [
        { lat: 23.25, lng: 104.85, name: 'Đồng Văn', score: 0.730, region: 'Hà Giang' },
        { lat: 23.15, lng: 104.95, name: 'Mèo Vạc', score: 0.725, region: 'Hà Giang' },
        { lat: 23.35, lng: 104.75, name: 'Lũng Cú', score: 0.720, region: 'Hà Giang' },
        { lat: 23.05, lng: 105.05, name: 'Quản Bạ', score: 0.715, region: 'Hà Giang' }
      ]
    },
    'lotus': {
      flower_name: 'Hoa sen',
      english_name: 'Lotus',
      season: 'Tháng 6-8',
      best_location: 'Đồng Tháp, Việt Nam',
      best_time: 'Tháng 6',
      quality_score: 0.66,
      total_hotspots: 45,
      description: 'Hoa sen nở rộ trên đồng bằng sông Cửu Long',
      keywords: ['sen', 'lotus', 'đồng tháp', 'miền tây', 'sông nước'],
      travel_tips: [
        'Đi sớm (5-8h sáng) để hoa nở đẹp nhất',
        'Mang theo kem chống nắng và nón',
        'Có thể kết hợp với tour du lịch sông nước'
      ],
      hotspots: [
        { lat: 10.50, lng: 105.65, name: 'Tháp Mười', score: 0.727, region: 'Đồng Tháp' },
        { lat: 10.45, lng: 105.70, name: 'Tam Nông', score: 0.722, region: 'Đồng Tháp' },
        { lat: 10.55, lng: 105.60, name: 'Cao Lãnh', score: 0.718, region: 'Đồng Tháp' },
        { lat: 10.60, lng: 105.55, name: 'Sa Đéc', score: 0.710, region: 'Đồng Tháp' }
      ]
    },
    'cherry_blossom': {
      flower_name: 'Hoa anh đào',
      english_name: 'Cherry Blossom',
      season: 'Tháng 3-4',
      best_location: 'Đà Lạt, Lâm Đồng',
      best_time: 'Tháng 3',
      quality_score: 0.67,
      total_hotspots: 46,
      description: 'Hoa anh đào nở rộ trên cao nguyên Đà Lạt',
      keywords: ['anh đào', 'cherry', 'đà lạt', 'mai anh đào', 'lâm đồng'],
      travel_tips: [
        'Thời tiết mát mẻ, dễ chịu',
        'Thời gian nở rất ngắn (1-2 tuần)',
        'Book accommodation sớm - mùa du lịch cao điểm'
      ],
      hotspots: [
        { lat: 11.94, lng: 108.44, name: 'Hồ Xuân Hương', score: 0.742, region: 'Đà Lạt' },
        { lat: 11.92, lng: 108.46, name: 'Thung lũng Tình Yêu', score: 0.738, region: 'Đà Lạt' },
        { lat: 11.96, lng: 108.42, name: 'Langbiang', score: 0.735, region: 'Đà Lạt' },
        { lat: 11.90, lng: 108.48, name: 'Đồi Robin', score: 0.730, region: 'Đà Lạt' }
      ]
    }
  };
  
  // Load real flower data from JSON files (if available)
  async function loadFlowerDataFromJSON() {
    try {
      // Load both advisory and batch report data
      const [advisoryResponse, batchResponse] = await Promise.all([
        fetch('/outputs/travel_advisory/combined_advisory_20251016_200806.json'),
        fetch('/outputs/batch_report_20251016_200806.json')
      ]);
      
      let updated = false;
      
      // Update advisory data
      if (advisoryResponse.ok) {
        const data = await advisoryResponse.json();
        console.log('📦 Loaded flower advisory data from JSON');
        
        if (data.detailed_analysis) {
          // Parse buckwheat data
          if (data.detailed_analysis.buckwheat) {
            const bw = data.detailed_analysis.buckwheat;
            FLOWER_ADVISORY_DATA.buckwheat.quality_score = bw.best_location.kq_score;
            FLOWER_ADVISORY_DATA.buckwheat.total_hotspots = bw.best_location.hotspots;
            if (bw.travel_advice && bw.travel_advice.special_notes) {
              FLOWER_ADVISORY_DATA.buckwheat.travel_tips = bw.travel_advice.special_notes;
            }
          }
          
          // Parse lotus data
          if (data.detailed_analysis.lotus) {
            const lt = data.detailed_analysis.lotus;
            FLOWER_ADVISORY_DATA.lotus.quality_score = lt.best_location.kq_score;
            FLOWER_ADVISORY_DATA.lotus.total_hotspots = lt.best_location.hotspots;
            if (lt.travel_advice && lt.travel_advice.special_notes) {
              FLOWER_ADVISORY_DATA.lotus.travel_tips = lt.travel_advice.special_notes;
            }
          }
          
          // Parse cherry blossom data
          if (data.detailed_analysis.cherry_blossom) {
            const cb = data.detailed_analysis.cherry_blossom;
            FLOWER_ADVISORY_DATA.cherry_blossom.quality_score = cb.best_location.kq_score;
            FLOWER_ADVISORY_DATA.cherry_blossom.total_hotspots = cb.best_location.hotspots;
            if (cb.travel_advice && cb.travel_advice.special_notes) {
              FLOWER_ADVISORY_DATA.cherry_blossom.travel_tips = cb.travel_advice.special_notes;
            }
          }
        }
        updated = true;
      }
      
      // Update hotspots from batch report
      if (batchResponse.ok) {
        const batchData = await batchResponse.json();
        console.log('📍 Loaded hotspot predictions from batch report');
        
        if (batchData.best_predictions) {
          // Update buckwheat hotspots
          if (batchData.best_predictions.buckwheat) {
            const bwPreds = batchData.best_predictions.buckwheat;
            FLOWER_ADVISORY_DATA.buckwheat.hotspots = bwPreds.map(pred => ({
              lat: pred.lat,
              lng: pred.lon,
              name: pred.predicted_location || pred.region,
              score: pred.kq_score,
              region: pred.region
            }));
            console.log(`  ✅ ${FLOWER_ADVISORY_DATA.buckwheat.hotspots.length} buckwheat hotspots`);
          }
          
          // Update lotus hotspots
          if (batchData.best_predictions.lotus) {
            const ltPreds = batchData.best_predictions.lotus;
            FLOWER_ADVISORY_DATA.lotus.hotspots = ltPreds.map(pred => ({
              lat: pred.lat,
              lng: pred.lon,
              name: pred.predicted_location || pred.region,
              score: pred.kq_score,
              region: pred.region
            }));
            console.log(`  ✅ ${FLOWER_ADVISORY_DATA.lotus.hotspots.length} lotus hotspots`);
          }
          
          // Update cherry blossom hotspots
          if (batchData.best_predictions.cherry_blossom) {
            const cbPreds = batchData.best_predictions.cherry_blossom;
            FLOWER_ADVISORY_DATA.cherry_blossom.hotspots = cbPreds.map(pred => ({
              lat: pred.lat,
              lng: pred.lon,
              name: pred.predicted_location || pred.region,
              score: pred.kq_score,
              region: pred.region
            }));
            console.log(`  ✅ ${FLOWER_ADVISORY_DATA.cherry_blossom.hotspots.length} cherry blossom hotspots`);
          }
        }
        updated = true;
      }
      
      if (updated) {
        console.log('✅ Flower data updated from JSON files');
      }
      return updated;
      
    } catch (error) {
      console.log('ℹ️ Using embedded flower data (JSON not found):', error.message);
    }
    return false;
  }
  
  // Try to load real data when map opens
  document.getElementById('openMap')?.addEventListener('click', () => {
    loadFlowerDataFromJSON();
  });

  // Current hotspot navigation state
  const hotspotsState = {
    currentFlower: null,
    currentIndex: 0,
    hotspots: [],
    isNavigating: false
  };

  // Simple RAG: Detect flower type from user query
  function detectFlowerContext(query) {
    const normalized = query.toLowerCase();
    
    for (const [flower, data] of Object.entries(FLOWER_ADVISORY_DATA)) {
      for (const keyword of data.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          return { flower, data };
        }
      }
    }
    
    return null;
  }

  // Generate AI response with context
  function generateFlowerResponse(flowerData, query) {
    const data = flowerData.data;
    const flower = flowerData.flower;
    
    let response = `🌸 <strong>${data.flower_name}</strong> (${data.english_name})<br/><br/>`;
    response += `📍 <strong>Địa điểm tốt nhất:</strong> ${data.best_location}<br/>`;
    response += `📅 <strong>Thời gian:</strong> ${data.season} (tốt nhất là ${data.best_time})<br/>`;
    response += `⭐ <strong>Chất lượng:</strong> ${(data.quality_score * 100).toFixed(0)}% - Rất tốt!<br/>`;
    response += `📌 <strong>Số điểm ngắm hoa:</strong> ${data.total_hotspots} địa điểm<br/><br/>`;
    
    response += `💡 <strong>Lời khuyên:</strong><br/>`;
    data.travel_tips.forEach(tip => {
      response += `• ${tip}<br/>`;
    });
    
    response += `<br/>🗺️ Đang zoom đến top ${data.hotspots.length} địa điểm đẹp nhất...<br/>`;
    response += `Sử dụng nút <strong>Next/Back</strong> để xem từng địa điểm!`;
    
    return response;
  }

  // Zoom to specific hotspot with index
  function zoomToHotspot(hotspot, index, total) {
    if (!mapState.map || !hotspot) return;
    
    // Clear existing markers
    mapState.markers.forEach(m => m.remove());
    mapState.markers = [];
    
    // Create custom flower marker
    const customIcon = L.divIcon({
      className: 'custom-flower-marker',
      html: `<div style="
        background: linear-gradient(135deg, #ec4899, #f43f5e);
        width: 50px;
        height: 50px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 4px solid white;
        box-shadow: 0 6px 20px rgba(236,72,153,.6);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); font-size: 24px;">🌸</div>
      </div>`,
      iconSize: [50, 50],
      iconAnchor: [25, 50]
    });
    
    // Add marker
    const marker = L.marker([hotspot.lat, hotspot.lng], { icon: customIcon }).addTo(mapState.map);
    marker.bindPopup(`
      <strong>${hotspot.name}</strong><br/>
      ${hotspot.region}<br/>
      Quality: ${(hotspot.score * 100).toFixed(0)}%<br/>
      <small>${index + 1}/${total}</small>
    `).openPopup();
    mapState.markers.push(marker);
    
    // Add click event to marker - Ask AI about hotspot
    marker.on('click', () => {
      const flowerData = FLOWER_ADVISORY_DATA[hotspotsState.currentFlower];
      const flowerName = flowerData ? flowerData.flower_name : 'hoa';
      askAIAboutLocation(
        hotspot.name, 
        `Điểm ngắm ${flowerName} tại ${hotspot.region} với chất lượng ${(hotspot.score * 100).toFixed(0)}%`
      );
    });
    
    // Zoom with animation
    mapState.map.flyTo([hotspot.lat, hotspot.lng], 13, {
      duration: 2,
      easeLinearity: 0.5
    });
    
    // Update location info card
    showHotspotInfo(hotspot, index, total);
    
    // Show navigation controls
    showHotspotNavigation(index, total);
  }

  // Show hotspot info card
  function showHotspotInfo(hotspot, index, total) {
    const infoCard = document.getElementById('locationInfoCard');
    const infoContent = document.getElementById('locationInfoContent');
    
    if (!infoCard || !infoContent) return;
    
    const flowerData = FLOWER_ADVISORY_DATA[hotspotsState.currentFlower];
    
    infoContent.innerHTML = `
      <h3>🌸 ${hotspot.name}</h3>
      <p><strong>${flowerData.flower_name}</strong></p>
      <p class="info-label">Vị trí</p>
      <p>${hotspot.region}</p>
      <p class="info-label">Chất lượng dự đoán</p>
      <p>⭐ ${(hotspot.score * 100).toFixed(0)}% - ${hotspot.score >= 0.73 ? 'Xuất sắc' : hotspot.score >= 0.72 ? 'Rất tốt' : 'Tốt'}</p>
      <p class="info-label">Tọa độ</p>
      <p>${hotspot.lat.toFixed(4)}, ${hotspot.lng.toFixed(4)}</p>
      <p class="info-label">Thứ tự</p>
      <p>Điểm #${index + 1} / ${total}</p>
      <p style="margin-top: 12px; padding: 8px; background: rgba(236,72,153,.1); border-radius: 8px; font-size: 12px;">
        💡 ${flowerData.travel_tips[Math.floor(Math.random() * flowerData.travel_tips.length)]}
      </p>
    `;
    
    infoCard.hidden = false;
  }

  // Show/update hotspot navigation controls
  function showHotspotNavigation(index, total) {
    let navControls = document.getElementById('hotspotNavControls');
    
    // Create if doesn't exist
    if (!navControls) {
      navControls = document.createElement('div');
      navControls.id = 'hotspotNavControls';
      navControls.className = 'hotspot-nav-controls';
      document.querySelector('.map-explorer-container').appendChild(navControls);
    }
    
    navControls.innerHTML = `
      <button id="prevHotspot" class="nav-btn" ${index === 0 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Back
      </button>
      <div class="nav-counter">
        <span class="current">${index + 1}</span> / <span class="total">${total}</span>
      </div>
      <button id="nextHotspot" class="nav-btn" ${index === total - 1 ? 'disabled' : ''}>
        Next <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    navControls.hidden = false;
    
    // Wire navigation buttons
    document.getElementById('prevHotspot')?.addEventListener('click', () => {
      if (hotspotsState.currentIndex > 0) {
        hotspotsState.currentIndex--;
        const hotspot = hotspotsState.hotspots[hotspotsState.currentIndex];
        zoomToHotspot(hotspot, hotspotsState.currentIndex, hotspotsState.hotspots.length);
      }
    });
    
    document.getElementById('nextHotspot')?.addEventListener('click', () => {
      if (hotspotsState.currentIndex < hotspotsState.hotspots.length - 1) {
        hotspotsState.currentIndex++;
        const hotspot = hotspotsState.hotspots[hotspotsState.currentIndex];
        zoomToHotspot(hotspot, hotspotsState.currentIndex, hotspotsState.hotspots.length);
      }
    });
  }

  // Ask AI about a specific location (triggered by marker click)
  async function askAIAboutLocation(locationName, locationDescription) {
    // Show chat interface if minimized
    const chatInterface = document.getElementById('mapChatInterface');
    if (chatInterface) {
      chatInterface.classList.remove('minimized');
      mapState.isMinimized = false;
    }
    
    // Create user message
    const userQuestion = `Cho tôi biết về ${locationName}`;
    
    // Add user message to chat
    addMapChatMessage(userQuestion, true);
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'mapTypingIndicatorLocation';
    typingDiv.className = 'map-chat-message ai';
    typingDiv.innerHTML = `<div class="bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
    const messagesBox = document.getElementById('mapChatMessages');
    if (messagesBox) {
      messagesBox.appendChild(typingDiv);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
    
    try {
      // Prepare context for AI
      const systemPrompt = `Bạn là AI Travel Advisory chuyên về du lịch Việt Nam. 

Người dùng hỏi về địa điểm: ${locationName}
Mô tả: ${locationDescription}

Hãy tư vấn chi tiết về:
- Điểm đặc biệt của địa điểm này
- Thời gian tốt nhất để đi
- Chi phí ước tính
- Lời khuyên chuẩn bị
- Hoạt động nên làm tại đây

Trả lời ngắn gọn (3-5 câu), thân thiện, có emoji, nhiệt tình.`;
      
      // Call Groq API
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuestion }
          ],
          temperature: 0.7,
          max_completion_tokens: 400,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content || 'Xin lỗi, tôi không có thông tin về địa điểm này.';
      
      // Remove typing indicator
      const typing = document.getElementById('mapTypingIndicatorLocation');
      if (typing) typing.remove();
      
      // Add AI response
      addMapChatMessage(aiMessage, false);
      
    } catch (error) {
      console.error('AI advisory error:', error);
      
      // Remove typing indicator
      const typing = document.getElementById('mapTypingIndicatorLocation');
      if (typing) typing.remove();
      
      // Fallback response
      const fallbackMessage = `📍 <strong>${locationName}</strong><br/><br/>
        ${locationDescription}<br/><br/>
        💡 Đây là một địa điểm thú vị! Bạn có thể khám phá thêm bằng cách tìm kiếm trực tuyến hoặc hỏi tôi về các hoạt động cụ thể tại đây.`;
      
      addMapChatMessage(fallbackMessage, false);
    }
  }

  // Enhanced map chat handler with RAG + Groq API
  async function handleMapChatSendWithRAG() {
    const input = document.getElementById('mapChatInput');
    if (!input) return;
    
    const query = input.value.trim();
    if (!query) return;
    
    // Add user message
    addMapChatMessage(query, true);
    input.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'mapTypingIndicator';
    typingDiv.className = 'map-chat-message ai';
    typingDiv.innerHTML = `<div class="bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
    const messagesBox = document.getElementById('mapChatMessages');
    if (messagesBox) {
      messagesBox.appendChild(typingDiv);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
    
    try {
      // Call Groq API for intelligent response
      const groqResponse = await callGroqForMapExplorer(query);
      
      // Remove typing indicator
      const typing = document.getElementById('mapTypingIndicator');
      if (typing) typing.remove();
      
      // Add AI response
      addMapChatMessage(groqResponse.aiMessage, false);
      
      // Check response type
      if (!groqResponse.flowerType && !groqResponse.locationName) {
        // CHAT_ONLY - just conversation, no map action needed
        console.log('💬 Chat only - no map action');
        return;
      }
      
      // Check if response contains flower recommendation
      if (groqResponse.flowerType) {
        const flowerData = FLOWER_ADVISORY_DATA[groqResponse.flowerType];
        
        if (flowerData) {
          // Setup hotspots navigation
          hotspotsState.currentFlower = groqResponse.flowerType;
          hotspotsState.hotspots = flowerData.hotspots;
          hotspotsState.currentIndex = 0;
          hotspotsState.isNavigating = true;
          
          // Minimize chat after 3 seconds
          setTimeout(() => {
            const chatInterface = document.getElementById('mapChatInterface');
            if (chatInterface && !mapState.isMinimized) {
              chatInterface.classList.add('minimized');
              mapState.isMinimized = true;
            }
          }, 3000);
          
          // Zoom to first hotspot
          setTimeout(() => {
            const firstHotspot = hotspotsState.hotspots[0];
            zoomToHotspot(firstHotspot, 0, hotspotsState.hotspots.length);
          }, 1000);
        }
      } else if (groqResponse.locationName) {
        // Try to find location using geocoding (Nominatim API)
        try {
          const geocodeResult = await geocodeLocation(groqResponse.locationName);
          
          if (geocodeResult) {
            // Reset hotspots navigation
            hotspotsState.isNavigating = false;
            const navControls = document.getElementById('hotspotNavControls');
            if (navControls) navControls.hidden = true;
            
            // Create location object
            const location = {
              name: geocodeResult.display_name,
              lat: parseFloat(geocodeResult.lat),
              lng: parseFloat(geocodeResult.lon),
              zoom: 12,
              description: geocodeResult.type || 'Địa điểm'
            };
            
            setTimeout(() => {
              const chatInterface = document.getElementById('mapChatInterface');
              if (chatInterface && !mapState.isMinimized) {
                chatInterface.classList.add('minimized');
                mapState.isMinimized = true;
              }
            }, 2000);
            
            setTimeout(() => {
              zoomToLocation(location);
            }, 500);
          } else {
            // Fallback to local database
            const localLocation = findLocation(groqResponse.locationName);
            if (localLocation) {
              hotspotsState.isNavigating = false;
              const navControls = document.getElementById('hotspotNavControls');
              if (navControls) navControls.hidden = true;
              
              setTimeout(() => {
                const chatInterface = document.getElementById('mapChatInterface');
                if (chatInterface && !mapState.isMinimized) {
                  chatInterface.classList.add('minimized');
                  mapState.isMinimized = true;
                }
              }, 2000);
              
              setTimeout(() => {
                zoomToLocation(localLocation);
              }, 500);
            }
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          // Fallback to local database
          const localLocation = findLocation(groqResponse.locationName);
          if (localLocation) {
            hotspotsState.isNavigating = false;
            const navControls = document.getElementById('hotspotNavControls');
            if (navControls) navControls.hidden = true;
            
            setTimeout(() => {
              const chatInterface = document.getElementById('mapChatInterface');
              if (chatInterface && !mapState.isMinimized) {
                chatInterface.classList.add('minimized');
                mapState.isMinimized = true;
              }
            }, 2000);
            
            setTimeout(() => {
              zoomToLocation(localLocation);
            }, 500);
          }
        }
      }
      
    } catch (error) {
      // Remove typing indicator
      const typing = document.getElementById('mapTypingIndicator');
      if (typing) typing.remove();
      
      console.error('Groq API error:', error);
      
      // Fallback to simple keyword detection
      const flowerContext = detectFlowerContext(query);
      
      if (flowerContext) {
        const aiResponse = generateFlowerResponse(flowerContext, query);
        addMapChatMessage(aiResponse, false);
        
        hotspotsState.currentFlower = flowerContext.flower;
        hotspotsState.hotspots = flowerContext.data.hotspots;
        hotspotsState.currentIndex = 0;
        hotspotsState.isNavigating = true;
        
        setTimeout(() => {
          const chatInterface = document.getElementById('mapChatInterface');
          if (chatInterface && !mapState.isMinimized) {
            chatInterface.classList.add('minimized');
            mapState.isMinimized = true;
          }
        }, 3000);
        
        setTimeout(() => {
          const firstHotspot = hotspotsState.hotspots[0];
          zoomToHotspot(firstHotspot, 0, hotspotsState.hotspots.length);
        }, 1000);
        
      } else {
        const location = findLocation(query);
        
        if (location) {
          const aiResponse = `🎯 Đã tìm thấy: <strong>${location.name}</strong>!<br/><br/>
            ${location.description}<br/><br/>
            Đang zoom đến vị trí trên bản đồ... 🗺️`;
          
          addMapChatMessage(aiResponse, false);
          
          hotspotsState.isNavigating = false;
          const navControls = document.getElementById('hotspotNavControls');
          if (navControls) navControls.hidden = true;
          
          setTimeout(() => {
            const chatInterface = document.getElementById('mapChatInterface');
            if (chatInterface && !mapState.isMinimized) {
              chatInterface.classList.add('minimized');
              mapState.isMinimized = true;
            }
          }, 2000);
          
          setTimeout(() => {
            zoomToLocation(location);
          }, 500);
          
        } else {
          const aiResponse = `😅 Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu.<br/><br/>
            <strong>Bạn có thể hỏi về:</strong><br/>
            🌸 <strong>Hoa:</strong> Hoa tam giác mạch, Hoa sen, Hoa anh đào<br/>
            🏙️ <strong>Địa điểm:</strong> Hà Nội, Sài Gòn, Đà Nẵng, Phú Quốc...`;
          
          addMapChatMessage(aiResponse, false);
        }
      }
    }
  }
  
  // Geocode location using Nominatim API (OpenStreetMap)
  async function geocodeLocation(locationName) {
    try {
      console.log('🔍 Geocoding:', locationName);
      
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NeuralNova Travel App'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log('✅ Found location:', data[0].display_name);
        return data[0];
      }
      
      console.log('❌ Location not found');
      return null;
      
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  // Call Groq API for Map Explorer - Enhanced
  async function callGroqForMapExplorer(userQuery) {
    const systemPrompt = `Bạn là AI Travel Assistant thông minh, có khả năng:
1. Trò chuyện tự nhiên với user
2. Tư vấn du lịch ngắm hoa ở Việt Nam
3. Hướng dẫn tìm địa điểm trên bản đồ

QUAN TRỌNG - PHÂN LOẠI INTENT:

🗨️ CHAT_ONLY (Không cần map):
- Chào hỏi: "xin chào", "hello", "hi"
- Cảm ơn: "cảm ơn", "thanks"
- Hỏi về bản thân AI: "bạn là ai", "bạn có thể làm gì"
- Hỏi chung chung: "thế nào", "như thế nào"
→ Trả lời thân thiện, KHÔNG thêm FLOWER_TYPE hay LOCATION

🌸 FLOWER_QUERY (Cần map + data hoa):
- Hỏi về hoa cụ thể: "hoa tam giác mạch", "hoa sen", "hoa anh đào"
- Hỏi về mùa hoa: "tháng 10 có hoa gì", "mùa nào đi ngắm hoa"
→ Giới thiệu hoa + Thêm: FLOWER_TYPE: [buckwheat/lotus/cherry_blossom]

🗺️ LOCATION_QUERY (Cần map + geocoding):
- Tìm địa điểm cụ thể: "Hà Nội", "Bangkok", "Paris", "Tokyo"
- Hỏi về địa điểm: "Đà Nẵng có gì", "đi Phú Quốc"
- BẤT KỲ tên địa điểm nào (thành phố, quốc gia, điểm du lịch...)
→ Giới thiệu địa điểm + Thêm: LOCATION: [tên chính xác của địa điểm]

CÁC LOẠI HOA ĐƯỢC HỖ TRỢ (Data thật từ AI prediction):
- 🌾 Hoa tam giác mạch (buckwheat): Hà Giang, Cao Bằng, Lạng Sơn - Tháng 10-11
- 🪷 Hoa sen (lotus): Đồng Tháp, An Giang, Cần Thơ - Tháng 6-8
- 🌸 Hoa anh đào (cherry_blossom): Đà Lạt, Sa Pa, Mộc Châu - Tháng 3-4

ĐỊNH DẠNG TRẢ LỜI:

1. CHAT_ONLY - Trò chuyện thông thường:
VD: "Xin chào! Tôi là AI Travel Assistant, chuyên tư vấn du lịch ngắm hoa và tìm địa điểm trên bản đồ. Bạn muốn đi đâu hoặc tìm hiểu về loài hoa nào không?"
→ KHÔNG có FLOWER_TYPE hay LOCATION

2. FLOWER_QUERY - Hỏi về hoa:
VD: "🌾 Hoa tam giác mạch nở rộ tại Hà Giang vào tháng 10-11! Đây là thời điểm cao nguyên đá chuyển sang màu hồng tím tuyệt đẹp.

💡 Lời khuyên: Mang áo ấm, đường núi khó nên cẩn thận. Thời gian nở ngắn, nên theo dõi thời tiết!

🗺️ Tôi sẽ chỉ cho bạn các điểm ngắm hoa tốt nhất trên bản đồ!
FLOWER_TYPE: buckwheat"

3. LOCATION_QUERY - Tìm địa điểm:
VD: "📍 Bangkok là thủ đô của Thái Lan, nổi tiếng với chùa chiền vàng óng và ẩm thực đường phố tuyệt vời!

🗺️ Đang tìm Bangkok trên bản đồ cho bạn...
LOCATION: Bangkok, Thailand"

QUAN TRỌNG:
- Nếu user chỉ chào hỏi → CHAT_ONLY (không cần map)
- Nếu hỏi về hoa → FLOWER_QUERY + FLOWER_TYPE
- Nếu nói TÊN địa điểm → LOCATION_QUERY + LOCATION (bất kỳ địa điểm nào)
- LOCATION phải là tên chính xác, rõ ràng (có thể kèm quốc gia nếu cần)

PHONG CÁCH: Tự nhiên, thân thiện, ngắn gọn, có emoji`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.7,
          max_completion_tokens: 500,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      let aiMessage = data.choices[0].message.content || '';
      
      // Parse flower type or location from response
      let flowerType = null;
      let locationName = null;
      
      if (aiMessage.includes('FLOWER_TYPE:')) {
        const match = aiMessage.match(/FLOWER_TYPE:\s*(buckwheat|lotus|cherry_blossom)/);
        if (match) {
          flowerType = match[1];
          // Remove the FLOWER_TYPE line from display
          aiMessage = aiMessage.replace(/FLOWER_TYPE:.*$/m, '').trim();
        }
      }
      
      if (aiMessage.includes('LOCATION:')) {
        const match = aiMessage.match(/LOCATION:\s*(.+)$/m);
        if (match) {
          locationName = match[1].trim();
          // Remove the LOCATION line from display
          aiMessage = aiMessage.replace(/LOCATION:.*$/m, '').trim();
        }
      }
      
      return {
        aiMessage,
        flowerType,
        locationName
      };
      
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  // Add RAG handlers for Map Chat
  const mapChatSendBtn = document.getElementById('mapChatSend');
  if (mapChatSendBtn) {
    mapChatSendBtn.addEventListener('click', handleMapChatSendWithRAG);
    console.log('✅ Map Chat Send button initialized with RAG');
  }

  const mapChatInput = document.getElementById('mapChatInput');
  if (mapChatInput) {
    mapChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleMapChatSendWithRAG();
      }
    });
    console.log('✅ Map Chat Enter key initialized with RAG');
  }

  console.log('✅ Map Explorer with RAG fully initialized');
})();
