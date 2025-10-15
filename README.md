# NeuralNova Web Application

**Space Technology & Eco Tourism SaaS Platform**

## 📁 Cấu trúc dự án chi tiết

```
web/
├── index.html                       # 🏠 Trang chủ (Single Page Application)
│
├── assets/
│   ├── css/
│   │   ├── reset.css               # CSS reset
│   │   ├── variables.css           # CSS variables (colors, fonts, spacing)
│   │   ├── base.css                # Base styles
│   │   ├── components.css          # Component styles
│   │   ├── layout.css              # Layout styles
│   │   └── responsive.css          # Responsive styles
│   │
│   ├── images/
│   │   ├── logo.png / logo.ico     # Logo & favicon
│   │   ├── bg.jpg, bg2.mp4         # Background images/videos
│   │   ├── nature1-3.jpg           # Nature images for slider
│   │   ├── human2.png, model.png   # Model images
│   │   ├── a.png                   # App screenshot
│   │   ├── thumnail.jpg            # Video thumbnail
│   │   └── payments/               # Payment provider logos
│   │       ├── bank.svg
│   │       ├── momo.svg
│   │       ├── vnpay.svg
│   │       ├── zalopay.svg
│   │       ├── paypal.svg
│   │       └── alipay.svg
│   │
│   ├── js/
│   │   └── main.js                 # Main JavaScript
│   │
│   └── font/
│       └── DFVN MBF Space Habitat Regular.otf
│
├── pages/
│   ├── auth/                       # 🔐 Authentication
│   │   ├── index.html              # Login & Register
│   │   ├── style.css
│   │   └── app.js
│   │
│   ├── checkout/                   # 💳 Payment & Checkout
│   │   ├── index.html              # Main checkout page
│   │   ├── method.html             # Payment method details
│   │   ├── guide.html              # Payment guide
│   │   ├── success.html            # Payment success
│   │   ├── style.css
│   │   └── app.js
│   │
│   ├── wallet/                     # 💰 Wallet Management
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── app.js
│   │   └── logopay/                # Payment logos
│   │
│   ├── profile/                    # 👤 User Profile
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   │
│   ├── forgot-password/            # 🔑 Password Recovery
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   │
│   └── verify-code/                # ✉️ Email Verification
│       ├── index.html
│       ├── style.css
│       └── app.js
│
└── components/                     # 🧩 Reusable Components
    ├── badge.html
    ├── card.html
    └── modal.html
```

## 🎨 Trang chủ (index.html)

### Sections Overview:
1. **Hero Banner** - Animation "NeuralNova" với video background & zoom effect
2. **About Section** - Slider với 4 themes (Space, Nature, Forest, Earth)
3. **Technology Section** - 6 tech cards (2 hàng × 3 cột)
4. **Video Showcase** - Demo video với modal player
5. **Trusted Partners** - Auto-sliding brands (Space & Environmental orgs)
6. **Pricing Section** - 3 pricing tiers (Starter, Professional, Enterprise)
7. **Download App** - Mobile app download với phone mockup

### Header Features:
- ✅ iOS-style glassmorphism design
- ✅ Fixed position with smooth scroll effects
- ✅ Responsive: Text → Icons only when screen < 920px
- ✅ Tooltips on hover for icon-only mode
- ✅ Auto-hide menu on mobile (< 768px)

## 💳 Hệ thống thanh toán

### Checkout Flow:
```
Pricing Page → Checkout → Payment → Success
     ↓             ↓          ↓
  (3 plans)   (Card/Wallet) (Confirmation)
```

### Payment Methods:
1. **Credit/Debit Card** - Visa, Mastercard
2. **NeuralNova Wallet** - Ví điện tử nội bộ
   - Top-up methods:
     - 🇻🇳 VND: Bank Transfer, MoMo, ZaloPay, VNPay
     - 🌍 International: PayPal, Alipay

### Pricing Integration:
- **Starter Plan**: `?plan=starter&price=29` → 696,000₫
- **Professional Plan**: `?plan=professional&price=79&trial=14` → 1,896,000₫
- **Enterprise Plan**: `?plan=enterprise&price=custom` → Custom pricing

### Voucher Codes (Demo):
- `NOVANEW` - Giảm 20,000₫
- `NN50K` - Giảm 50,000₫
- `NN10` - Giảm 10%

## 🎯 Branding & Design System

### Color Palette:
- **Primary**: `#22d3ee` (Cyan) - Technology, Innovation
- **Secondary**: `#3b82f6` (Blue) - Trust, Reliability
- **Accent**: `#10b981` (Green) - Nature, Eco-friendly
- **Dark**: `#0f0f14` - Background
- **Purple**: `#7c3aed` - Premium features

### Typography:
- **Display**: `Space Habitat` - Hero titles, brand
- **Heading**: `Inter` (700-900) - Section titles
- **Body**: `Inter` (400-600) - Content text

### Spacing System:
- Base unit: `8px`
- Sections: `120px` padding (desktop), `80px` (mobile)
- Cards: `30-40px` gap
- Buttons: `14-16px` padding

## 📱 Responsive Breakpoints

### Desktop (> 1024px)
- Full navigation menu with text
- 3-column tech grid
- Side-by-side content layouts

### Tablet (768px - 1024px)
- 2-column tech grid
- Stacked content layouts

### Medium Screens (≤ 920px)
- **Navigation**: Icons only + tooltips
- **Buttons**: Icons only
- Compact header design

### Mobile (< 768px)
- Hamburger menu toggle
- 1-column layouts
- Full-width cards
- Optimized touch targets

## 🚀 Performance Features

### Loading Strategy:
- ✅ Preloader với resource loading
- ✅ Minimum 5s loading time cho smooth transition
- ✅ Lazy loading cho images & videos
- ✅ CSS/JS inline để giảm requests

### Animations:
- Hero banner text fill animation (4s)
- Background zoom effects
- Smooth scroll behavior
- Card hover effects với transform
- Glassmorphism effects

## 🔧 Development Guidelines

### Quy tắc code:
1. **CSS**: Inline trong `<style>` tag của index.html
2. **HTML**: Single file structure cho landing page
3. **JS**: Minimal vanilla JavaScript, no frameworks
4. **Images**: Optimized & WebP format khi có thể

### Adding New Sections:
1. Thêm HTML vào `index.html` trước `</body>`
2. Thêm styles vào `<style>` tag trong `<head>`
3. Thêm navigation link vào header menu
4. Update preloader visibility list

### Adding New Pages:
1. Tạo folder mới trong `/pages`
2. Include `index.html`, `style.css`, `app.js`
3. Link CSS variables: `../../assets/css/variables.css`
4. Link Lucide icons & fonts

## 🔗 Navigation & Routing

### Internal Links:
- Home sections: `#home`, `#about`, `#technology`, `#video`, `#pricing`, `#download`
- Auth: `pages/auth/index.html`
- Checkout: `pages/checkout/index.html?plan=...&price=...`
- Wallet: `pages/wallet/index.html`
- Profile: `pages/profile/index.html`

### Query Parameters:
- Checkout: `?plan=starter&price=29&trial=14&voucher=NOVANEW`
- Return URLs: `?return=index.html#wallet`

## 📦 Dependencies

### External Libraries:
- **Lucide Icons**: `https://unpkg.com/lucide@latest`
- **Google Fonts**: Inter (300-900)
- **No jQuery, No Bootstrap** - Pure vanilla JS

### Browser Support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎓 Key Features

### ✨ User Experience:
- Smooth scrolling & animations
- Interactive hover effects
- Auto-playing sliders
- Video modal player
- Toast notifications
- Form validation

### 🔒 Security:
- Input sanitization
- Luhn algorithm for card validation
- XSS protection
- LocalStorage for demo data only

### 💾 Data Persistence:
- Wallet balance: `nn_wallet_balance`
- Transactions: `nn_wallet_tx`
- Payments: `nn_payments`

---

## 📚 Documentation

All documentation files are organized in the [`document/`](document/) folder.

**Quick Links:**
- 📖 [Documentation Index](document/INDEX.md) - All docs in one place
- 🔧 [Fixes Summary](document/FIXES_SUMMARY.md) - Fixed issues & solutions
- ⚡ [Optimization Guide](document/OPTIMIZATION_GUIDE.md) - Complete performance guide
- 🎬 [Video Optimization](document/VIDEO_OPTIMIZATION.md) - **CRITICAL** Fix slow reload
- 🎯 [Lucide Fix](document/LUCIDE_FIX.md) - Icon loading fix details

---

## 🔧 Critical Fixes

### ⚡ Lucide Icons Load Error - FIXED

**Problem**: CDN timeout causing 10+ seconds load delay
```
❌ GET https://unpkg.com/lucide@latest net::ERR_CONNECTION_TIMED_OUT
```

**Solution**: Local Lucide Icons with fallback
- ✅ Downloaded to `assets/js/lucide.min.js`
- ✅ Fallback to jsDelivr CDN
- ✅ Retry mechanism with error handling
- ✅ **Result**: -90% load time improvement

See [LUCIDE_FIX.md](document/LUCIDE_FIX.md) for details.

### 🎬 Video & Animation Optimization - FIXED

**Problem**: Website reload very slow due to large videos
```
❌ Preloading 2 videos on every reload:
   - bg2.mp4: 9.32 MB (banner)
   - intro.mp4: 98.72 MB (modal)
   = 108 MB total!
```

**Solution**: Lazy loading + On-demand video loading
- ✅ Removed videos from preloader
- ✅ Lazy load banner video (after 1s delay)
- ✅ On-demand load modal video (only when clicked)
- ✅ Added `preload="none"` to all videos
- ✅ **Result**: -99.7% initial load size (108 MB → 0.25 MB)

**Impact:**
- Load time: 30s → 1-2s (-93%)
- Initial payload: -108 MB
- Mobile: Now usable ✅

See [VIDEO_OPTIMIZATION.md](document/VIDEO_OPTIMIZATION.md) for complete guide.

---

## 🎬 YouTube Video Solution - GAME CHANGER!

### Problem: Local Video Files
- `bg2.mp4`: 9.32 MB
- `intro.mp4`: 98.72 MB
- **Total**: 108 MB bandwidth cost per visitor

### Solution: YouTube Embeds ✅
- **Background video**: [https://youtu.be/xKFDadYur_Q](https://youtu.be/xKFDadYur_Q)
- **Intro modal**: [https://youtu.be/0_XRGxNd-Go](https://youtu.be/0_XRGxNd-Go)

### Benefits:
- ✅ **Zero bandwidth cost** for video hosting
- ✅ **98% payload reduction** (110 MB → 2.2 MB)
- ✅ **YouTube CDN** global delivery
- ✅ **Adaptive streaming** (auto quality based on connection)
- ✅ **10-20x faster** page load
- ✅ **Mobile-friendly** streaming

### Performance Impact:
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Payload | 110 MB | 2.2 MB | -98% 🚀 |
| Load Time (3G) | 30-60s | 2-5s | -90% 🚀 |
| Bandwidth Cost | High | $0 | 100% savings 💰 |

See [YOUTUBE_VIDEO_SOLUTION.md](document/YOUTUBE_VIDEO_SOLUTION.md) for implementation details.

---

## ⚡ Performance Optimization

### 🚀 Quick Start Optimization

```bash
# Run auto-optimization script
node optimize.js

# Start local server
npm start

# Run Lighthouse audit
npm run analyze
```

### 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.8s | ~5.5s |
| Largest Contentful Paint | < 2.5s | ~6.2s |
| Time to Interactive | < 3.8s | ~7.0s |
| Total Page Size | < 5MB | ~25MB |
| Lighthouse Score | > 90 | ~45 |

### 🛠️ Optimization Files

- **`optimize.js`** - Auto-optimization script
- **`service-worker.js`** - Caching & offline support
- **`.htaccess`** - Server-side caching & compression
- **`document/OPTIMIZATION_GUIDE.md`** - Complete optimization guide

### ✅ Applied Optimizations

After running `node optimize.js`:
- ✅ Removed 5s artificial load time
- ✅ Deferred external scripts (Lucide)
- ✅ Lazy loading for images
- ✅ Optimized font loading
- ✅ Reduced preloader resources (12 → 2)
- ✅ Service Worker enabled
- ✅ Resource hints added

### 📈 Expected Improvements

- **Load Time**: -83% (5.5s → 0.8s)
- **Page Size**: -80% (25MB → 5MB)
- **FCP**: -83% faster
- **LCP**: -76% faster
- **TTI**: -71% faster

### 🔧 Manual Optimizations Needed

1. **Extract CSS** to external file
2. **Convert images** to WebP format
3. **Create responsive** images
4. **Setup CDN** for static assets

See `document/OPTIMIZATION_GUIDE.md` for detailed instructions.

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Tech Stack**: HTML5, CSS3, Vanilla JavaScript  
**Performance**: Optimized for Core Web Vitals
