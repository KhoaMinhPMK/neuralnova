# 💰 Pricing & Wallet Integration Update

**Date**: October 15, 2025  
**Status**: ✅ Completed

---

## 📋 Overview

Updated pricing section with Vietnamese content based on flower bloom forecast service tiers and integrated wallet page to display selected plan information dynamically.

---

## 🎯 Changes Made

### 1️⃣ **Pricing Section Update** (`index.html`)

Replaced 3-tier pricing with service-specific Vietnamese plans:

#### **Gói Cá nhân** - $5/tháng
**Target**: Du khách cá nhân, Người yêu thích nhiếp ảnh

**Features**:
- ✅ Bản đồ tương tác & Tìm kiếm
- ✅ 100 truy vấn địa điểm/tháng
- ✅ Dự báo nở hoa 14 ngày
- ✅ Web & Ứng dụng di động
- ✅ Thông báo cá nhân hóa
- ✅ Hỗ trợ cộng đồng

**CTA**: Links to `pages/wallet/index.html?plan=individual&planName=Gói Cá nhân&price=5`

---

#### **Gói Doanh nghiệp** - $70/tháng (⭐ Featured)
**Target**: Nhà điều hành tour, Truyền thông, Doanh nghiệp SME

**Features**:
- ✅ Tất cả tính năng gói Cá nhân
- ✅ 5.000 truy vấn/tháng
- ✅ Dự báo nở hoa 30 ngày
- ✅ Truy cập API cơ bản
- ✅ Dữ liệu nở hoa 1 năm
- ✅ Bảng điều khiển khu vực
- ✅ Xuất dữ liệu
- ✅ Hỗ trợ email tiêu chuẩn

**CTA**: Links to `pages/wallet/index.html?plan=business&planName=Gói Doanh nghiệp&price=70&trial=14`

**Trial**: 14 ngày miễn phí

---

#### **Gói Tùy chỉnh** - Liên hệ báo giá
**Target**: Tập đoàn nông nghiệp lớn, Viện nghiên cứu, Cơ quan chính phủ

**Features**:
- ✅ Tất cả tính năng gói Doanh nghiệp
- ✅ Truy vấn không giới hạn
- ✅ Dự báo mở rộng & Tùy chỉnh
- ✅ API đầy đủ, lưu lượng cao
- ✅ Toàn bộ kho lưu trữ lịch sử
- ✅ Huấn luyện mô hình tùy chỉnh
- ✅ Phân tích kịch bản & Dữ liệu thô
- ✅ Quản lý tài khoản chuyên trách

**CTA**: `mailto:sales@neuralnova.space?subject=Yêu cầu báo giá Gói Tùy chỉnh`

---

### 2️⃣ **Wallet Page Enhancement** (`pages/wallet/`)

#### **HTML Changes** (`index.html`)

Added plan info display section:

```html
<!-- Selected Plan Info -->
<div class="plan-info" id="planInfo" style="display: none;">
  <div class="plan-info-header">
    <h3>Gói đã chọn</h3>
  </div>
  <div class="plan-info-content">
    <div class="plan-detail">
      <span class="plan-label">Tên gói:</span>
      <strong class="plan-value" id="planName">-</strong>
    </div>
    <div class="plan-detail">
      <span class="plan-label">Giá:</span>
      <strong class="plan-value" id="planPrice">-</strong>
    </div>
    <div class="plan-detail" id="trialInfo" style="display: none;">
      <span class="plan-label">Dùng thử:</span>
      <strong class="plan-value trial" id="planTrial">-</strong>
    </div>
  </div>
</div>
```

---

#### **CSS Styling** (`style.css`)

```css
.plan-info {
  background: linear-gradient(135deg, rgba(124,58,237,.15), rgba(34,211,238,.1));
  border: 1px solid rgba(124,58,237,.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.plan-info-header h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: var(--cyan);
}

.plan-info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.plan-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-label {
  font-size: 13px;
  color: var(--muted);
}

.plan-value {
  font-size: 18px;
  color: #fff;
}

.plan-value.trial {
  color: var(--ok);
}
```

---

#### **JavaScript Logic** (`app.js`)

```javascript
// Display selected plan info from URL params
const urlParams = new URLSearchParams(window.location.search);
const planId = urlParams.get('plan');
const planName = urlParams.get('planName');
const planPrice = urlParams.get('price');
const planTrial = urlParams.get('trial');

if (planId && planName && planPrice) {
  const planInfoEl = $('#planInfo');
  const planNameEl = $('#planName');
  const planPriceEl = $('#planPrice');
  const planTrialEl = $('#planTrial');
  const trialInfoEl = $('#trialInfo');

  planInfoEl.style.display = 'block';
  planNameEl.textContent = planName;
  
  if (planPrice === 'custom') {
    planPriceEl.textContent = 'Liên hệ báo giá';
  } else {
    planPriceEl.textContent = `$${planPrice}/tháng`;
  }

  if (planTrial) {
    trialInfoEl.style.display = 'flex';
    planTrialEl.textContent = `${planTrial} ngày miễn phí`;
  }

  console.log('📦 Plan Info:', { planId, planName, planPrice, planTrial });
}
```

---

## 🔗 URL Parameters Schema

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `plan` | string | Plan ID | `individual`, `business`, `custom` |
| `planName` | string | Plan display name (Vietnamese) | `Gói Cá nhân` |
| `price` | number\|string | Monthly price in USD or "custom" | `5`, `70`, `custom` |
| `trial` | number (optional) | Trial days | `14` |

---

## 🎯 User Flow

### **Scenario 1: Individual Plan**
```
1. User clicks "Bắt đầu ngay" on Gói Cá nhân
2. Redirects to: /pages/wallet/index.html?plan=individual&planName=Gói Cá nhân&price=5
3. Wallet page displays:
   ┌─────────────────────────────────┐
   │ Gói đã chọn                     │
   │ Tên gói: Gói Cá nhân            │
   │ Giá: $5/tháng                   │
   └─────────────────────────────────┘
4. User tops up wallet and proceeds
```

---

### **Scenario 2: Business Plan (with Trial)**
```
1. User clicks "Dùng thử 14 ngày miễn phí" on Gói Doanh nghiệp
2. Redirects to: /pages/wallet/index.html?plan=business&planName=Gói Doanh nghiệp&price=70&trial=14
3. Wallet page displays:
   ┌─────────────────────────────────┐
   │ Gói đã chọn                     │
   │ Tên gói: Gói Doanh nghiệp       │
   │ Giá: $70/tháng                  │
   │ Dùng thử: 14 ngày miễn phí      │
   └─────────────────────────────────┘
4. User sees trial info highlighted in green
```

---

### **Scenario 3: Custom Plan**
```
1. User clicks "Liên hệ Sales" on Gói Tùy chỉnh
2. Opens email client: mailto:sales@neuralnova.space
3. Subject pre-filled: "Yêu cầu báo giá Gói Tùy chỉnh"
```

---

## 📊 Comparison Table (User-provided)

| Tính năng | Gói Cá nhân | Gói Doanh nghiệp | Gói Tùy chỉnh |
|-----------|-------------|------------------|---------------|
| **Giá** | $5/tháng | $70/tháng | Liên hệ |
| **Người dùng** | Du khách, Nhiếp ảnh gia | Tour operator, SME | Tập đoàn, Viện NC, Chính phủ |
| **Truy vấn** | 100/tháng | 5.000/tháng | Không giới hạn |
| **Dự báo** | 14 ngày | 30 ngày | Mở rộng & Tùy chỉnh |
| **API** | Không | Cơ bản | Đầy đủ, lưu lượng cao |
| **Lịch sử** | Không | 1 năm | Toàn bộ kho |
| **Hỗ trợ** | Cộng đồng | Email | Quản lý chuyên trách |

---

## ✅ Testing Checklist

- [ ] Click "Bắt đầu ngay" on Gói Cá nhân → Wallet shows correct plan info
- [ ] Click "Dùng thử 14 ngày miễn phí" on Gói Doanh nghiệp → Trial info displays
- [ ] Click "Liên hệ Sales" on Gói Tùy chỉnh → Email client opens
- [ ] Wallet page without URL params → Plan info section hidden
- [ ] URL with custom price → Displays "Liên hệ báo giá"
- [ ] URL with numeric price → Displays "$XX/tháng"
- [ ] Console logs plan info correctly
- [ ] Responsive design on mobile

---

## 🎨 Visual Design

**Plan Info Box:**
- Gradient background: Purple → Cyan (theme colors)
- Border: Purple glow
- Trial info: Green highlight
- Grid layout: Responsive (auto-fit)

---

## 🚀 Deployment

```bash
# Stage changes
git add index.html pages/wallet/

# Commit
git commit -m "feat: Update pricing with Vietnamese content & wallet plan display"

# Push
git push origin main

# VPS
cd /path/to/neuralnova
git pull origin main
```

**Clear cache**: `Ctrl + F5`

---

## 📝 Notes

1. **No checkout page yet**: Currently links to wallet for top-up
2. **No backend integration**: Plan selection stored in URL only
3. **Future enhancement**: Save plan selection to user account after login
4. **Custom plan**: Uses `mailto:` link instead of form (simpler MVP)
5. **Currency**: USD only (VND conversion can be added later)

---

## 🔗 Related Files

- `index.html` - Pricing section (lines 3422-3669)
- `pages/wallet/index.html` - Plan info display
- `pages/wallet/style.css` - Plan info styling
- `pages/wallet/app.js` - URL param parsing logic

---

**Status**: ✅ Ready for Testing & Deployment
