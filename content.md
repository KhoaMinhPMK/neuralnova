**Tên sản phẩm:**
NeuralNova - AI Travel Social Network

**Giới thiệu ngắn gọn (≤ 30 ký tự):**
Mạng xã hội du lịch AI thông minh

**Giới thiệu chi tiết:**

**Vấn đề:**
Hiện nay, du khách Việt Nam gặp nhiều khó khăn khi lên kế hoạch du lịch: phải tìm kiếm thông tin rải rác từ nhiều nguồn, không biết thời điểm tối ưu để ngắm hoa/cảnh đẹp, thiếu tư vấn về độ khó và chi phí chi tiết, và khó tìm được địa điểm ít người biết nhưng chất lượng cao. Các mạng xã hội du lịch hiện tại chỉ chia sẻ nội dung mà thiếu tính năng tư vấn thông minh.

**Phương pháp giải quyết:**
NeuralNova kết hợp 3 thành phần: (1) Mạng xã hội du lịch cho phép chia sẻ hành trình, (2) AI Travel Advisory sử dụng LLM (Groq API) để tư vấn chi tiết về độ trình, chi phí, lịch trình và địa điểm, và (3) Map Explorer tích hợp RAG system với AI prediction model để dự đoán mùa hoa/cảnh đẹp dựa trên dữ liệu thực tế.

Điểm đột phá là tính năng "Click-to-Consult": khi người dùng click vào bất kỳ marker nào trên bản đồ, AI sẽ tự động phân tích và tư vấn chi tiết về địa điểm đó. Hệ thống RAG của chúng tôi sử dụng dataset thật từ machine learning model với 137 hotspots được dự đoán chính xác (tọa độ GPS, chất lượng, thời gian), không phải dữ liệu mockup.

**Hiệu quả mong đợi:**
- Giảm 70% thời gian lên kế hoạch du lịch từ 5-7 ngày xuống còn 1-2 ngày
- Tăng trải nghiệm du lịch nhờ tư vấn độ trình phù hợp với năng lực cá nhân
- Phát hiện 46 điểm ngắm hoa tam giác mạch tối ưu thay vì 3-4 điểm phổ biến
- Cộng đồng du lịch Việt Nam kết nối và chia sẻ kinh nghiệm hiệu quả hơn

**Kế hoạch phát triển:**

*Giai đoạn 1 (3 tháng):*
- Mở rộng dataset lên 500+ hotspots cho 10 loại hoa/cảnh đẹp
- Tích hợp booking khách sạn/vé máy bay trực tiếp
- Phát triển mobile app (iOS/Android)

*Giai đoạn 2 (6 tháng):*
- AI cá nhân hóa dựa trên lịch sử du lịch và sở thích người dùng
- Tích hợp real-time weather và crowd prediction
- Hệ thống review và đánh giá cộng đồng

*Chiến lược Marketing:*
- Hợp tác với travel bloggers/influencers để review và chia sẻ
- Tổ chức sự kiện "AI Travel Challenge" - cuộc thi lên kế hoạch du lịch với AI
- Partnership với các tỉnh/thành phát triển du lịch để cung cấp data chính thức
- Content marketing qua TikTok/Instagram với demo tính năng độc đáo

*Mở rộng tính năng:*
- Group travel planning - lên kế hoạch nhóm với AI điều phối
- Budget optimizer - tối ưu chi phí dựa trên ngân sách
- Emergency assistant - hỗ trợ khẩn cấp khi du lịch (ngôn ngữ, y tế, pháp luật)
- AR navigation - chỉ đường tăng cường thực tế tại điểm du lịch

**Lĩnh vực / Chủ đề:**
- Generative AI
- Natural Language Processing (NLP)
- Retrieval-Augmented Generation (RAG)
- AI for Tourism & Social Good
- Geospatial AI & Prediction Modeling

**Công nghệ sử dụng:**

*AI & Machine Learning:*
- Groq API (llama-3.1-70b-versatile) - Large Language Model
- RAG System với vector embedding cho travel advisory
- Custom ML model cho flower/scenery prediction

*Frontend:*
- HTML5, CSS3, JavaScript (Vanilla)
- Leaflet.js - Interactive maps
- Lucide Icons - UI iconography
- Glass Morphism design system

*Backend:*
- PHP 8.x - RESTful API
- MySQL 8.0 - Database
- Node.js - File upload server
- Apache 2.4 - Web server & reverse proxy

*APIs & Services:*
- Nominatim Geocoding API (OpenStreetMap)
- Groq Cloud API
- Geolocation API

*DevOps & Infrastructure:*
- Git version control
- Apache mod_proxy, mod_headers
- PM2 process manager
- Windows VPS deployment

*Data & Tools:*
- Real prediction dataset: 137 hotspots với GPS coordinates
- JSON-based advisory system
- bcrypt password hashing
- Session-based authentication
