# NeuralNova Web Application

## 📁 Cấu trúc dự án

```
web/
├── index.html                  # Trang chủ (chứa tất cả sections)
├── assets/
│   ├── css/
│   │   ├── reset.css          # CSS reset
│   │   ├── variables.css      # CSS variables (colors, fonts, spacing)
│   │   ├── base.css           # Base styles
│   │   ├── components.css     # Component styles
│   │   ├── layout.css         # Layout styles
│   │   ├── responsive.css     # Responsive styles
│   │   └── home.css           # Home page specific styles (Section 1, etc.)
│   ├── images/                # All images
│   │   ├── bg.jpg
│   │   ├── valentin-petrov-m-mal-01.jpg
│   │   ├── after.png
│   │   └── ...
│   └── js/
│       └── main.js
├── pages/
│   ├── auth/                  # Authentication pages
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── forgot-password/       # Password recovery
│   └── verify-code/           # Email verification
└── components/                # Reusable HTML components
    ├── badge.html
    ├── card.html
    └── modal.html
```

## 🎨 Home Page (index.html)

### Sections:
1. **Section 1 - Hero Banner**: Animation "NeuralNova" với zoom effect
2. **Features Section**: Hiển thị tính năng chính
3. **CTA Section**: Call to action

### Styles:
- Global styles: Trong `<style>` tag của index.html
- Section 1 styles: `assets/css/home.css`

## 🚀 Dynamic Island Header

Header với glassmorphism effect:
- Fixed position, float giữa màn hình
- Animation fade in khi load
- Thu nhỏ khi scroll xuống (70% kích thước)
- Text → Icon khi thu nhỏ
- Gradient purple theme

## 🎯 NeuralNova Branding

### Colors:
- Primary Purple: `#7c3aed`
- Secondary Cyan: `#22d3ee`
- Dark: `#0f0a1f`
- Black: `#000000`

### Fonts:
- Display: `Space Habitat` (for titles/hero)
- Heading: `Inter`
- Body: System fonts

## 📝 Quy tắc phát triển

1. **CSS tách riêng**: Mỗi page có file CSS riêng trong `assets/css/`
2. **HTML gộp chung**: Tất cả sections trong 1 file `index.html`
3. **Images tập trung**: Tất cả ảnh trong `assets/images/`
4. **Components**: Tái sử dụng component trong folder `components/`

## 🔧 Thêm Section mới

1. Viết HTML trực tiếp trong `index.html`
2. Thêm CSS vào `assets/css/home.css` (hoặc tạo file mới nếu cần)
3. Link CSS trong `<head>` của index.html

## 📱 Responsive

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

Tất cả responsive styles trong `assets/css/responsive.css` và inline styles.
