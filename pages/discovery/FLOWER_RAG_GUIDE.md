# 🌸 Flower Travel Advisory RAG System

## 📋 Tổng Quan

**RAG (Retrieval-Augmented Generation)** đơn giản được tích hợp vào Map Explorer để tư vấn du lịch ngắm hoa. User hỏi về hoa → AI trả lời với context → Zoom đến hotspots → Navigate với Next/Back.

---

## ✨ Tính Năng

### 1. 🌸 3 Loại Hoa Được Hỗ Trợ

| Hoa | Tên Tiếng Việt | Mùa | Địa điểm | Hotspots |
|-----|----------------|-----|----------|----------|
| 🌾 Buckwheat | Hoa tam giác mạch | T10-11 | Hà Giang | 4 điểm |
| 🪷 Lotus | Hoa sen | T6-8 | Đồng Tháp | 4 điểm |
| 🌸 Cherry Blossom | Hoa anh đào | T3-4 | Đà Lạt | 4 điểm |

### 2. 🧠 Simple RAG Logic

```javascript
User Query → Keyword Detection → Load Context → Generate Response
```

**Keywords Detection:**
- `tam giác mạch`, `buckwheat`, `hà giang` → Buckwheat context
- `sen`, `lotus`, `đồng tháp`, `miền tây` → Lotus context
- `anh đào`, `cherry`, `đà lạt`, `mai anh đào` → Cherry Blossom context

### 3. 📍 Hotspot Data Structure

Mỗi hotspot có:
```javascript
{
  lat: 23.25,           // Latitude
  lng: 104.85,          // Longitude
  name: 'Đồng Văn',    // Tên địa điểm
  score: 0.730,         // Quality score (0-1)
  region: 'Hà Giang'   // Khu vực
}
```

### 4. 🎯 AI Response Format

```
🌸 Hoa tam giác mạch (Buckwheat Flower)

📍 Địa điểm tốt nhất: Hà Giang, Việt Nam
📅 Thời gian: Tháng 10-11 (tốt nhất là Cuối tháng 10)
⭐ Chất lượng: 66% - Rất tốt!
📌 Số điểm ngắm hoa: 46 địa điểm

💡 Lời khuyên:
• Mang theo áo ấm - thời tiết miền núi lạnh
• Đường đi khó, nên có kinh nghiệm lái xe
• Thời gian nở ngắn (2-3 tuần), theo dõi thời tiết

🗺️ Đang zoom đến top 4 địa điểm đẹp nhất...
Sử dụng nút Next/Back để xem từng địa điểm!
```

---

## 🎮 User Flow

### Kịch Bản: "Muốn ngắm hoa tam giác mạch"

**1. User nhập query**
```
Input: "Muốn ngắm hoa tam giác mạch"
```

**2. RAG Detection**
```javascript
detectFlowerContext("Muốn ngắm hoa tam giác mạch")
→ Detected: buckwheat
→ Keywords matched: ['tam giác mạch']
```

**3. Load Context**
```javascript
FLOWER_ADVISORY_DATA['buckwheat'] = {
  flower_name: 'Hoa tam giác mạch',
  best_location: 'Hà Giang',
  hotspots: [4 locations with coordinates],
  travel_tips: [3 tips],
  ...
}
```

**4. AI Response**
```
Bot: 🌸 Hoa tam giác mạch...
     📍 Địa điểm tốt nhất: Hà Giang...
     💡 Lời khuyên: ...
```

**5. Chat Minimize (sau 3s)**
```
Chat box tự thu gọn
```

**6. Zoom to First Hotspot (sau 1s)**
```
Map zoom đến: Đồng Văn (23.25, 104.85)
Marker 🌸 màu hồng xuất hiện
Popup: "Đồng Văn | Quality: 73%"
```

**7. Show Navigation Controls**
```
┌─────────────────────────────────┐
│  [◀ Back]  [1 / 4]  [Next ▶]   │
└─────────────────────────────────┘
```

**8. Location Info Card**
```
🌸 Đồng Văn
Hoa tam giác mạch

Vị trí: Hà Giang
Chất lượng: ⭐ 73% - Xuất sắc
Tọa độ: 23.2500, 104.8500
Thứ tự: Điểm #1 / 4

💡 Mang theo áo ấm - thời tiết miền núi lạnh
```

**9. User Click "Next"**
```
hotspotsState.currentIndex++
Zoom đến: Mèo Vạc (23.15, 104.95)
Update counter: [2 / 4]
Update info card
```

**10. User Click "Back"**
```
hotspotsState.currentIndex--
Zoom về: Đồng Văn
Update counter: [1 / 4]
```

---

## 🔧 Technical Implementation

### 1. Data Structure

```javascript
const FLOWER_ADVISORY_DATA = {
  'buckwheat': {
    flower_name: 'Hoa tam giác mạch',
    english_name: 'Buckwheat Flower',
    season: 'Tháng 10-11',
    best_location: 'Hà Giang, Việt Nam',
    best_time: 'Cuối tháng 10',
    quality_score: 0.66,
    total_hotspots: 46,
    description: '...',
    keywords: ['tam giác mạch', 'buckwheat', 'hà giang'],
    travel_tips: ['...', '...', '...'],
    hotspots: [
      { lat, lng, name, score, region },
      ...
    ]
  },
  // lotus, cherry_blossom...
};
```

### 2. RAG Detection

```javascript
function detectFlowerContext(query) {
  const normalized = query.toLowerCase();
  
  for (const [flower, data] of Object.entries(FLOWER_ADVISORY_DATA)) {
    for (const keyword of data.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return { flower, data };
      }
    }
  }
  
  return null; // No match found
}
```

### 3. Response Generation

```javascript
function generateFlowerResponse(flowerData, query) {
  const data = flowerData.data;
  
  let response = `🌸 <strong>${data.flower_name}</strong>...`;
  response += `📍 <strong>Địa điểm:</strong> ${data.best_location}...`;
  response += `💡 <strong>Lời khuyên:</strong>...`;
  
  data.travel_tips.forEach(tip => {
    response += `• ${tip}<br/>`;
  });
  
  return response;
}
```

### 4. Hotspot Navigation

```javascript
const hotspotsState = {
  currentFlower: 'buckwheat',
  currentIndex: 0,
  hotspots: [4 hotspots array],
  isNavigating: true
};

// Next
hotspotsState.currentIndex++;
zoomToHotspot(hotspotsState.hotspots[currentIndex], ...);

// Back
hotspotsState.currentIndex--;
zoomToHotspot(hotspotsState.hotspots[currentIndex], ...);
```

### 5. Custom Flower Marker

```javascript
const customIcon = L.divIcon({
  html: `<div style="
    background: linear-gradient(135deg, #ec4899, #f43f5e);
    border-radius: 50% 50% 50% 0;  // Teardrop shape
    transform: rotate(-45deg);
  ">
    <div style="transform: rotate(45deg);">🌸</div>
  </div>`,
  iconSize: [50, 50],
  iconAnchor: [25, 50]
});
```

---

## 🎨 UI Components

### Navigation Controls
```
┌────────────────────────────────────────┐
│  Background: Pink gradient             │
│  Position: Bottom center               │
│  Animation: Slide up bounce            │
│                                        │
│  [◀ Back] disabled when index = 0    │
│  [Counter] Current / Total             │
│  [Next ▶] disabled when index = last  │
└────────────────────────────────────────┘
```

### Location Info Card
```
┌────────────────────────────────┐
│  🌸 Đồng Văn                   │
│  Hoa tam giác mạch             │
│                                │
│  Vị trí: Hà Giang             │
│  Chất lượng: ⭐ 73%           │
│  Tọa độ: 23.25, 104.85        │
│  Thứ tự: #1 / 4               │
│                                │
│  💡 Random travel tip          │
└────────────────────────────────┘
```

### Flower Marker
```
     🌸
    ╱ ╲
   ╱   ╲
  ▕     ▏  Pink gradient
   ╲   ╱   White border
    ╲ ╱    Shadow effect
     ●
```

---

## 📝 Example Queries

### ✅ Supported Queries

| Query | Detected | Result |
|-------|----------|--------|
| "Hoa tam giác mạch ở đâu?" | buckwheat | 4 hotspots Hà Giang |
| "Muốn ngắm hoa sen" | lotus | 4 hotspots Đồng Tháp |
| "Đà Lạt có hoa gì?" | cherry_blossom | 4 hotspots Đà Lạt |
| "Đi Hà Giang tháng 10" | buckwheat | 4 hotspots Hà Giang |
| "Tháng 6 đi đâu ngắm hoa?" | lotus | 4 hotspots (June) |

### ❌ Fallback to Regular Search

| Query | Action |
|-------|--------|
| "Phú Quốc" | Regular location search → Zoom to Phú Quốc |
| "Sài Gòn" | Regular location search → Zoom to TP.HCM |
| "Bangkok" | Not found → Show suggestions |

---

## 🎯 Key Features

### 1. Smart Context Loading
- ✅ Keywords matching (multi-language)
- ✅ Partial match support
- ✅ Context-aware responses

### 2. Smooth UX
- ✅ Chat auto-minimize
- ✅ 2s zoom animation
- ✅ Hotspot navigation
- ✅ Disabled buttons when at boundaries

### 3. Rich Information
- ✅ Flower name (VN + EN)
- ✅ Best location & time
- ✅ Quality score
- ✅ Travel tips
- ✅ Coordinates

### 4. Visual Polish
- ✅ Pink gradient marker 🌸
- ✅ Bounce animation for nav controls
- ✅ Hover effects
- ✅ Responsive design

---

## 🚀 Future Enhancements

### Phase 2 (Optional)
- [ ] Load real JSON files từ `/outputs/`
- [ ] Integrate Groq API cho NLP tốt hơn
- [ ] Parse coordinates from API response
- [ ] More flowers (sunflower, lavender...)
- [ ] Seasonal recommendations
- [ ] Weather integration
- [ ] User reviews & ratings
- [ ] Photo gallery cho mỗi hotspot
- [ ] Booking integration
- [ ] Share to social media

### Advanced RAG
- [ ] Vector embeddings
- [ ] Semantic search
- [ ] Multi-turn conversations
- [ ] Personalized recommendations
- [ ] Historical data analysis

---

## 📊 Data Flow

```
User Input
    ↓
Keyword Detection (RAG)
    ↓
    ├─ Found Flower Context
    │     ↓
    │  Load Flower Data
    │     ↓
    │  Generate Response
    │     ↓
    │  Setup Hotspots Array
    │     ↓
    │  Zoom to Hotspot[0]
    │     ↓
    │  Show Nav Controls
    │
    └─ Not Found
          ↓
       Regular Location Search
          ↓
       Zoom to Location
```

---

## 🎬 Demo Script

**For Presentation:**

```
1. "Hôm nay demo tính năng RAG tư vấn du lịch ngắm hoa"

2. Click "Map Explorer"

3. Type: "Muốn ngắm hoa tam giác mạch"

4. AI: "🌸 Hoa tam giác mạch...
       📍 Hà Giang...
       💡 Lời khuyên..."
   → Chat thu gọn
   → Zoom đến Đồng Văn

5. Navigation controls xuất hiện: [◀ Back] [1/4] [Next ▶]

6. Click "Next"
   → Zoom đến Mèo Vạc
   → Counter: [2/4]

7. Click "Next" again
   → Zoom đến Lũng Cú
   → Counter: [3/4]

8. Click "Back"
   → Zoom về Mèo Vạc
   → Counter: [2/4]

9. "Thử hoa khác nhé"
   → Maximize chat
   → Type: "Hoa sen đẹp ở đâu?"

10. AI response về Hoa sen
    → Zoom đến Đồng Tháp
    → 4 hotspots mới

11. "Rất đơn giản và thông minh!"
```

---

## ✅ Checklist

- [x] RAG keyword detection
- [x] 3 flower types with data
- [x] 12 hotspots total (4 each)
- [x] AI response generation
- [x] Auto zoom to hotspots
- [x] Navigation controls (Next/Back)
- [x] Custom flower marker 🌸
- [x] Location info card
- [x] Chat auto-minimize
- [x] Responsive design
- [x] Smooth animations

---

**Created by**: AI Assistant  
**Date**: 16/10/2025  
**Version**: 1.0 - RAG Integration

**Ready to demo!** 🌸🗺️✨
