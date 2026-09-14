# Product Video Carousel (Shopify Online Store 2.0 App)

A high-converting, video-first product carousel Shopify application and theme extension designed for **Kimaya Homes**.

---

## 🌟 Key Features & Requirements

- **Exact Aspect Ratios**:
  - **Active Item (Portrait)**: `344:573` aspect ratio with video autoplay.
  - **Non-Active Items**: `344:458` aspect ratio with high-resolution thumbnail preview.
- **Exclusive Video Playback**:
  - Only the active centered item plays its video (`autoplay`, `muted`, `loop`, `playsinline`).
  - Inactive items automatically pause, reset, and display their poster thumbnail to optimize battery, CPU, and bandwidth.
  - Floating sound toggle button on the active slide allows shoppers to unmute and hear product audio.
- **Active Item Product Link & Price**:
  - Sleek glassmorphism overlay card at the bottom of the active card.
  - Displays product title, live price, compare-at price, and savings badge.
  - Direct clickable link to the product details page.
- **Infinite Centered Carousel**:
  - Seamless infinite loop wrap-around in both directions.
  - Active item is **always positioned at the horizontal center** of the viewport.
  - Smooth hardware-accelerated **scale animation** (`transform` and `aspect-ratio` transition) when sliding between items.
- **Carousel Controls**:
  - Modern Chevron Next / Prev navigation buttons.
  - Pagination indicator dots.
  - Touch swipe / mouse drag gestures with flick velocity detection.
  - Keyboard arrow key navigation (`←` and `→`).
- **Dynamic Items (Add / Remove)**:
  - **Theme App Extension**: Configurable slots in theme customizer with toggle switches, product pickers, and video pickers, plus optional Metafield JSON mode.
  - **Native Theme Section**: Integrated into `funore-theme/sections/product-video-carousel.liquid` with Shopify `blocks` support—allowing merchants to click **"Add block"** to add unlimited dynamic video slides, reorder them via drag-and-drop, or delete them.
  - **Interactive Simulation Demo**: Real-time Add/Remove slide manager in `demo/index.html`.

---

## 📁 Project Structure

```
product-video-carousel/
├── package.json                          # App scripts & Shopify CLI dependencies
├── shopify.app.toml                     # Shopify App configuration
├── extensions/
│   ├── product-video-carousel-theme/    # Theme App Extension (Online Store 2.0)
│   │   ├── shopify.extension.toml       # Theme extension manifest
│   │   ├── blocks/
│   │   │   └── product_video_carousel.liquid # App block (Target: section)
│   │   ├── assets/
│   │   │   ├── product-video-carousel.css   # Aspect ratios (344:573 & 344:458), animations
│   │   │   └── product-video-carousel.js    # Infinite centered carousel engine
│   │   ├── snippets/
│   │   │   └── pvc-slide-card.liquid        # Reusable slide card markup
│   │   └── locales/
│   │       └── en.default.json
│   └── app-home/                        # Polaris App Home Extension (Admin Dashboard)
└── demo/
    └── index.html                       # Standalone interactive browser simulation
```

---

## 🚀 How to Run & Test

### 1. Standalone Browser Simulation (Instant Test)
Open the standalone demo file in any web browser to test all carousel behaviors with live sample videos:
```
D:\Projects\Shopify\KimayaHomes\product-video-carousel\demo\index.html
```

### 2. Build Extensions with Shopify CLI
```bash
npm run build
```

### 3. Run Dev Server with Shopify CLI
To link your development store and preview live:
```bash
npm run dev
```

### 4. Use in Theme (`funore-theme`)
The section is already available directly in `funore-theme/sections/product-video-carousel.liquid`.
1. Open Shopify Theme Customizer (`funore-theme`).
2. Click **Add section** &gt; **Product Video Carousel**.
3. Under the section, click **Add Video Slide** to add as many slides as you want!
