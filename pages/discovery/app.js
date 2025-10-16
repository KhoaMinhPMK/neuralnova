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
})();
