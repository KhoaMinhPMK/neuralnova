# NeuralNova - Dự án Web Chuyên nghiệp

Một dự án web hiện đại, sạch sẽ và có khả năng mở rộng cao được xây dựng với HTML5, CSS3 và JavaScript ES6+.

## 🚀 Tính năng nổi bật

- **Cấu trúc Modular**: Code được tổ chức theo modules dễ bảo trì và mở rộng
- **Responsive Design**: Hoạt động hoàn hảo trên mọi thiết bị (mobile-first approach)
- **Performance Optimized**: Tối ưu tốc độ tải và hiệu suất
- **Accessibility**: Tuân thủ WCAG 2.1 AA standards
- **Modern JavaScript**: Sử dụng ES6+ features với clean code
- **Component-based**: Các component tái sử dụng dễ dàng tùy chỉnh

## 📁 Cấu trúc dự án

```
web/
├── index.html              # File HTML chính
├── assets/
│   ├── css/
│   │   ├── reset.css       # CSS reset cho mọi trình duyệt
│   │   ├── variables.css   # Biến CSS (colors, typography, spacing)
│   │   ├── base.css        # Styles cơ bản (typography, buttons, forms)
│   │   ├── components.css  # Styles cho các components
│   │   ├── layout.css      # Layout utilities và grid system
│   │   └── responsive.css  # Responsive design
│   ├── js/
│   │   └── main.js         # JavaScript chính với modules
│   ├── images/             # Thư mục chứa hình ảnh
│   │   ├── logo.svg
│   │   ├── hero-illustration.svg
│   │   ├── project-1.jpg
│   │   ├── project-2.jpg
│   │   ├── project-3.jpg
│   │   └── favicon.ico
│   └── fonts/              # Thư mục chứa fonts tùy chỉnh
├── components/             # Các component HTML tái sử dụng
│   ├── modal.html         # Modal component
│   ├── card.html          # Card component
│   └── badge.html         # Badge component
├── pages/                  # Các trang khác (about.html, contact.html, etc.)
└── utils/                  # Utility scripts và helpers
```

## 🛠 Công nghệ sử dụng

- **HTML5**: Semantic markup với accessibility tốt nhất
- **CSS3**: Modern CSS với custom properties, Grid và Flexbox
- **JavaScript ES6+**: Classes, modules, async/await, destructuring
- **Web APIs**: Intersection Observer, Local Storage, Form Validation

## 🚀 Cách chạy dự án

### Điều kiện tiên quyết

- Web server (Apache, Nginx) hoặc
- Live Server extension trong VS Code hoặc
- Python's built-in server: `python -m http.server 8000`

### Các bước chạy

1. **Clone hoặc tải dự án**
   ```bash
   git clone <repository-url>
   cd neuralnova/web
   ```

2. **Khởi động web server**
   ```bash
   # Với Python 3
   python -m http.server 8000

   # Với Node.js (nếu có http-server)
   npx http-server

   # Với Live Server extension trong VS Code
   # Click vào "Go Live" trong status bar
   ```

3. **Mở trình duyệt**
   ```
   http://localhost:8000
   ```

## 📖 Cách sử dụng

### 1. Tùy chỉnh Colors & Typography

Mở file `assets/css/variables.css` và sửa đổi các biến:

```css
:root {
  /* Brand Colors */
  --color-primary: #3b82f6;
  --color-secondary: #10b981;

  /* Typography */
  --font-family-sans: 'Your Font', sans-serif;
  --font-size-base: 1rem;
}
```

### 2. Thêm Components mới

Tạo file HTML mới trong thư mục `components/`:

```html
<!-- components/new-component.html -->
<div class="new-component">
  <h3>New Component</h3>
  <p>This is a reusable component.</p>
</div>
```

Thêm styles vào `assets/css/components.css`:

```css
.new-component {
  /* Your styles here */
}
```

### 3. JavaScript Modules

Thêm module mới vào `assets/js/main.js`:

```javascript
const newModule = {
  init() {
    // Module initialization
  }
};

// Thêm vào this.modules array
this.modules = [
  // ... existing modules
  newModule
];
```

## 🎨 Các Components có sẵn

### Modal Component
- **File**: `components/modal.html`
- **Tính năng**: Hiển thị nội dung trong popup
- **Cách sử dụng**:
  ```javascript
  // Hiện modal
  modal.show('modal-id');

  // Ẩn modal
  modal.hide('modal-id');
  ```

### Card Component
- **File**: `components/card.html`
- **Tính năng**: Hiển thị nội dung trong card đẹp mắt
- **Variants**: Default, horizontal, featured

### Badge Component
- **File**: `components/badge.html`
- **Tính năng**: Nhãn thông tin nhỏ gọn
- **Types**: Primary, secondary, success, warning, error

## 📱 Responsive Design

Dự án sử dụng mobile-first approach với các breakpoints:

- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 1024px
- **Large Desktop**: > 1024px

Các utilities classes:
- `.sm\:hidden` - Ẩn trên mobile
- `.md\:block` - Hiện trên tablet trở lên
- `.lg\:grid-cols-3` - 3 cột trên desktop

## ⚡ Performance Optimization

- **Lazy Loading**: Hình ảnh được tải khi cần thiết
- **CSS Optimization**: Tối ưu hóa CSS với variables và utilities
- **JavaScript Modules**: Code được chia nhỏ theo modules
- **Image Optimization**: Sử dụng WebP và responsive images
- **Caching**: Headers phù hợp cho caching

## 🔧 Customization

### Thêm Fonts mới

1. Đặt font files vào `assets/fonts/`
2. Thêm vào `assets/css/variables.css`:
   ```css
   @font-face {
     font-family: 'CustomFont';
     src: url('../fonts/custom-font.woff2') format('woff2');
   }
   ```

### Thay đổi Color Scheme

Sửa đổi các biến màu trong `variables.css`:

```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-secondary;
  /* Các màu khác */
}
```

## 🧪 Testing

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Testing
Sử dụng browser dev tools hoặc các công cụ như:
- Responsive Design Mode trong Firefox
- Device Toolbar trong Chrome
- Online tools như BrowserStack

## 🚨 Các Lưu ý Quan trọng

1. **Accessibility**: Luôn kiểm tra với screen readers
2. **Performance**: Kiểm tra tốc độ tải với PageSpeed Insights
3. **SEO**: Sử dụng semantic HTML và meta tags phù hợp
4. **Security**: Validate forms và sanitize inputs

## 📚 Tài liệu tham khảo

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [Can I Use](https://caniuse.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Tác giả

**NeuralNova Team**
- Email: hello@neuralnova.com
- Website: https://neuralnova.com

---

*Được xây dựng với ❤️ bởi NeuralNova Team*