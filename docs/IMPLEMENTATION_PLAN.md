# Kế hoạch triển khai static wallet storefront

## 1. Kết luận kiến trúc

Xây storefront bằng **Astro + TypeScript**, xuất toàn bộ thành HTML/CSS/JavaScript tĩnh và deploy bằng GitHub Actions lên GitHub Pages.

Lý do chọn Astro:

- Phù hợp với catalog và content site: HTML được tạo sẵn khi build; JavaScript phía client chỉ dùng khi thật sự cần cho navigation responsive.
- Hỗ trợ dynamic routes được sinh tĩnh cho từng product/category.
- Content collections có thể đọc các file JSON riêng lẻ và kiểm tra schema ngay lúc build.
- Không cần database hoặc server runtime, nhưng vẫn giữ cấu trúc component dễ bảo trì.

Không dùng lại Shopify runtime trong `mock/`. Mock chỉ là nguồn tham chiếu UI/UX và content được chọn lọc. Các script checkout, analytics, account, API và asset CDN của Shopify phải được loại bỏ.

## 2. Hiện trạng và baseline đã xác minh

- Trạng thái ban đầu của repository chỉ có thư mục `mock/`; application Astro, catalog fixtures và workflow Pages hiện đã được scaffold theo kế hoạch này.
- `mock/` khoảng 1.4 GB, trong đó phần lớn là bản sao asset Shopify: hơn 8.400 file JPG và khoảng 1.2 GB trong `mock/cdn/shop/products`.
- Mock là theme “Creative Theme Cyan” với dữ liệu demo tranh bản đồ thành phố, không phải catalog ví. Chỉ tái tạo visual/layout phù hợp, không mặc định migrate dữ liệu sản phẩm demo.
- GitHub Pages chỉ host file tĩnh. Website này chỉ giới thiệu sản phẩm; việc đặt hàng diễn ra qua email hoặc ứng dụng nhắn tin của seller.
- Catalog hiện dùng fixture được chọn lọc từ mock. Production deploy được khóa cho đến khi `src/data/site.json` có ít nhất một contact thật của seller.

## 3. Cấu trúc đích

```text
.
├── .github/workflows/deploy.yml
├── public/
│   ├── fonts/
│   ├── icons/
│   └── images/
│       ├── brand/
│       ├── categories/<category-slug>/
│       ├── products/<product-slug>/
│       │   ├── cover.webp
│       │   ├── gallery-01.webp
│       │   └── gallery-02.webp
│       └── pages/<page-slug>/
├── src/
│   ├── components/
│   │   ├── catalog/
│   │   ├── layout/
│   │   └── ui/
│   ├── content/
│   │   ├── categories/<category-slug>.json
│   │   └── products/<product-slug>.json
│   ├── content.config.ts
│   ├── data/site.json
│   ├── layouts/
│   ├── pages/
│   │   ├── collections/[slug].astro
│   │   ├── collections/index.astro
│   │   ├── products/[slug].astro
│   │   ├── index.astro
│   │   ├── how-its-made.astro
│   │   ├── about.astro
│   │   ├── how-to-order.astro
│   │   ├── contact.astro
│   │   └── 404.astro
│   ├── scripts/
│   ├── styles/
│   └── utils/
├── tests/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Quy ước quan trọng:

- Mỗi product có đúng một JSON tại `src/content/products/<slug>.json`.
- Mọi ảnh của product nằm tại `public/images/products/<slug>/`.
- Product tự khai báo `categorySlugs`; thêm product không cần sửa một danh sách product trung tâm.
- Category JSON chỉ chứa metadata, thứ tự hiển thị và hero image, không lặp lại toàn bộ product.
- Thông tin seller và các URL liên hệ được quản lý tập trung trong `src/data/site.json`, không hard-code ở từng component.
- Tất cả đường dẫn asset phải hoạt động cả ở local root và GitHub Pages project subpath.

`site.json` cần giữ logo text và contact destination theo một cấu trúc tương tự:

```json
{
  "brand": { "name": "BOHUC" },
  "pricing": { "currency": "USD", "locale": "en-US" },
  "contacts": [
    {
      "type": "email",
      "label": "Email BOHUC",
      "href": "mailto:seller@example.com"
    },
    {
      "type": "messenger",
      "label": "Chat với BOHUC trên Messenger",
      "href": "https://m.me/seller-handle"
    }
  ]
}
```

Các giá trị trên chỉ mô tả schema; khi implement phải thay bằng địa chỉ thật do seller cung cấp, không publish placeholder.

## 4. Data model

Giá tiền dùng duy nhất **USD** và hiển thị bằng ký hiệu **`$`**. Giá được lưu bằng số nguyên theo đơn vị cent để tránh sai số số thực; ví dụ `12900` được hiển thị thành `$129.00`.

```json
{
  "slug": "vi-da-bohu-classic",
  "name": "Ví da Bohu Classic",
  "status": "active",
  "featured": true,
  "categorySlugs": ["vi-nam", "ban-chay"],
  "summary": "Ví da bò thủ công, dáng gọn.",
  "description": [
    "Da bò full-grain được hoàn thiện thủ công.",
    "Thiết kế mỏng, phù hợp sử dụng hằng ngày."
  ],
  "price": {
    "amount": 12900,
    "currency": "USD",
    "compareAtAmount": null
  },
  "images": [
    {
      "src": "images/products/vi-da-bohu-classic/cover.webp",
      "alt": "Ví da Bohu Classic màu nâu nhìn từ phía trước"
    }
  ],
  "styles": ["outer-black-alligator", "lining-red-goat"],
  "seo": {
    "title": "Ví da Bohu Classic",
    "description": "Ví da bò thủ công Bohu Classic."
  }
}
```

Schema build-time phải kiểm tra ít nhất:

- `slug` duy nhất và trùng tên file.
- `categorySlugs` đều tham chiếu category tồn tại.
- `price.amount` là số cent nguyên không âm và `price.currency` bắt buộc là `USD`.
- Mọi giá được format bằng `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`; không nối ký hiệu `$` thủ công.
- `styles` chứa slug tham chiếu đến `src/data/leathers.json`; `["*"]` hiển thị toàn bộ leather. Đây chỉ là nội dung mô tả, không phải variant có thể chọn.
- Product active có ít nhất một ảnh; file ảnh tồn tại; `alt` không rỗng.
- Asset path trong JSON là path tương đối như `images/products/...`; helper chung sẽ thêm `BASE_URL` khi render.
- Không có đường dẫn tuyệt đối gắn cứng với domain hoặc `/static-wallet/`.

## 5. Phạm vi tính năng

### MVP

- Responsive header/navigation, footer và announcement bar; logo là wordmark chữ `BOHUC` được tạo bằng HTML/CSS phù hợp theme.
- Menu chính theo đúng thứ tự: `HOME`, `COLLECTION`, `HOW IT'S MADE`, `ABOUT`, `HOW TO ORDER`, `CONTACT`.
- Menu `COLLECTION` có đúng năm item: `ALL PRODUCT`, `NORTH`, `EAST`, `SOUTH`, `WEST`.
- Home page dựa trên visual language của mock.
- Trang All Product và bốn collection; desktop hiển thị bốn product card trên một hàng và giảm cột responsive trên màn hình nhỏ.
- Product detail chỉ hiển thị ảnh, thông tin sản phẩm, giá nếu có, phần `Product Detail` và `Style`. Không có variant selector, accordion đóng/mở, zoom bắt buộc hoặc nút mua hàng.
- Các trang `How It's Made`, `About`, `How To Order`, `Contact` và trang 404.
- Contact hiển thị icon cho các kênh được cấu hình như email, Messenger và các ứng dụng chat khác; click icon mở thẳng cuộc trò chuyện hoặc ứng dụng tương ứng.
- SEO metadata, canonical URL, Open Graph, JSON-LD Product/Breadcrumb.
- Deploy GitHub Pages tự động từ branch `main`.

### Các tính năng bị loại khỏi phạm vi

- Không có cart, add-to-cart, checkout hoặc thanh toán.
- Không có login/account và không hiển thị icon user.
- Không có chọn variant/style; Style chỉ là nội dung tĩnh.
- Không có search/filter trong MVP.
- Không thu thập thông tin thẻ hoặc mô phỏng một đơn hàng đã được xử lý.

## 6. Các phase triển khai

### Phase 0 — Chốt input và baseline

- Xác nhận catalog ví thật, ngôn ngữ, domain và URL/username của từng kênh liên hệ; currency đã cố định là USD (`$`).
- Chụp screenshot desktop/mobile của các màn mock cần giữ để làm visual baseline.
- Lập danh sách asset được phép sử dụng và kiểm tra license font/image.

Điều kiện hoàn tất: có product mẫu thật và URL liên hệ thật cho các icon cần hiển thị.

### Phase 1 — Scaffold và design system

- Khởi tạo Astro TypeScript strict, scripts `dev`, `build`, `preview`, `check`, `test`.
- Cấu hình `site`/`base` cho GitHub Pages mà không hard-code URL trong component.
- Xây design tokens: màu, typography, spacing, radius, shadow và breakpoints.
- Thiết kế wordmark text `BOHUC`; tạo layout, menu đúng sáu mục, dropdown collection đúng năm item, mobile menu, footer và primitives dùng chung.
- Không đưa cart icon, user/login icon hoặc link checkout vào shell.

Điều kiện hoàn tất: shell responsive chạy được dưới cả `/` và project subpath.

### Phase 2 — Catalog và asset pipeline

- Tạo collections/schema cho product và category.
- Thêm fixture nhỏ bằng dữ liệu ví thật hoặc placeholder được đánh dấu rõ.
- Tạo validation cho cross-reference và file asset.
- Chọn lọc/đổi tên ảnh, convert WebP/AVIF khi phù hợp; không copy hàng nghìn bản resize trùng lặp từ mock.

Điều kiện hoàn tất: thêm một JSON + một folder ảnh sinh được product và category pages mà không sửa code.

### Phase 3 — Pages và tương tác

- Implement home, All Product, bốn collection, product detail và bốn content pages trong menu.
- Collection grid dùng bốn cột ở desktop, hai cột ở tablet và một hoặc hai cột ở mobile tùy kích thước thực tế của card.
- Product detail hiển thị gallery tĩnh cùng hai section luôn mở `Product Detail` và `Style`; không render control giả có vẻ click được.
- Contact dùng link chuẩn của từng kênh và accessible label cho mỗi icon.
- Giữ progressive enhancement: toàn bộ catalog và contact links dùng được nếu JavaScript lỗi.

Điều kiện hoàn tất: luồng browse → xem detail → mở kênh liên hệ với seller hoạt động trên mobile và desktop.

### Phase 4 — Contact handoff và SEO

- Nối icon email/chat với URL thật từ site config; dùng `mailto:`/deep link/web fallback phù hợp từng kênh.
- Thêm sitemap, robots, canonical, Open Graph và structured data.
- Thêm privacy-friendly analytics chỉ khi được yêu cầu.

Điều kiện hoàn tất: mọi contact CTA có đích thật, không còn link Shopify demo hoặc dead link.

### Phase 5 — QA và deploy

- Chạy type/schema checks, unit tests, build và preview production.
- Kiểm tra responsive, keyboard/focus, contrast, alt text và reduced motion.
- Kiểm tra link/asset dưới GitHub Pages base path và refresh trực tiếp ở mọi route.
- Tạo workflow Pages dùng official GitHub Actions, artifact là thư mục `dist/`.
- Ghi hướng dẫn ngắn “thêm product/category” trong tài liệu dự án.

Điều kiện hoàn tất: CI xanh, site deploy thành công, không có request về Shopify domain, không có secret trong client bundle.

## 7. Definition of Done

- `npm run check`, test suite và `npm run build` đều pass.
- Build sinh route cho mọi product/category active.
- Build fail rõ ràng khi slug trùng, category sai, ảnh thiếu hoặc JSON sai schema.
- Không ship runtime Shopify, account/login giả, API giả hoặc asset mock không dùng.
- Header có wordmark `BOHUC`, đúng sáu menu chính, đúng năm item collection và không có icon user/cart.
- Collection grid có bốn sản phẩm mỗi hàng ở desktop.
- Product detail không chứa control mua hàng, chọn variant hoặc section giả có thể click.
- Contact icon có accessible name và mở đúng kênh seller.
- Tất cả giá đều dùng USD và hiển thị ký hiệu `$` đúng từ số cent trong JSON.
- Layout chính được kiểm tra tối thiểu ở 360 px, 768 px, 1280 px và 1440 px.
- Có keyboard navigation, visible focus, semantic headings và alt text có nghĩa.
- Không có URL localhost hay path `/static-wallet/` hard-code trong source UI.
- Bundle không chứa secret; mọi tích hợp ngoài chỉ dùng public identifier/url phù hợp.
- Một maintainer có thể thêm product bằng cách thêm folder ảnh + JSON và chạy validation/build.

## 8. Rủi ro cần quản lý

- **Dung lượng repo:** không commit toàn bộ 1.4 GB mock vào nhánh deploy; chỉ giữ nguồn mock theo chiến lược riêng hoặc Git LFS nếu thực sự cần.
- **Contact link:** deep link có thể khác giữa desktop/mobile; cần có web fallback và kiểm tra URL thật trước khi publish.
- **Bản quyền:** xác minh quyền sử dụng theme, font và ảnh trước khi publish.
- **Base path:** project Pages thường nằm dưới `/static-wallet/`; mọi route và asset phải qua helper/config của Astro.
- **Dữ liệu sản phẩm:** giá hoặc trạng thái trong JSON chỉ phản ánh lần deploy gần nhất; website không quản lý tồn kho.
