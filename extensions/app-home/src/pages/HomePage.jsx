import {useState} from 'preact/hooks';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <s-page heading="Product Video Carousel">
      <s-button 
        slot="primary-action" 
        variant="primary" 
        href="shopify:admin/themes/current/editor"
        target="_blank"
      >
        Open Theme Customizer
      </s-button>

      <s-section slot="aside" heading="Specifications">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <s-text fontWeight="bold">Active Slide Ratio: </s-text>
            <s-text>Portrait 344:573 (Auto-playing Video)</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text fontWeight="bold">Inactive Slide Ratio: </s-text>
            <s-text>Portrait 344:458 (Thumbnail Preview)</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text fontWeight="bold">Carousel Style: </s-text>
            <s-text>Infinite Centered Loop with Scale Animation</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text fontWeight="bold">Theme Target: </s-text>
            <s-text>Online Store 2.0 Section / App Block</s-text>
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="Overview & Storefront Setup">
        <s-stack direction="block" gap="loose">
          <s-banner tone="info">
            The Product Video Carousel section is installed and ready to be placed on your Home Page, Product Pages, or Landing Pages.
          </s-banner>

          <s-box padding="base" background="subdued" borderRadius="base">
            <s-heading level="3">How To Add to Your Theme:</s-heading>
            <s-ordered-list>
              <s-list-item>
                Open your <s-text fontWeight="bold">Shopify Admin &gt; Online Store &gt; Themes</s-text> and click <s-text fontWeight="bold">Customize</s-text>.
              </s-list-item>
              <s-list-item>
                Navigate to the template where you want the carousel to appear (e.g. Home page).
              </s-list-item>
              <s-list-item>
                Click <s-text fontWeight="bold">Add section</s-text>, switch to the <s-text fontWeight="bold">Apps</s-text> tab (or Sections list), and select <s-text fontWeight="bold">Product Video Carousel</s-text>.
              </s-list-item>
              <s-list-item>
                Add or toggle video slides, select products, and choose Shopify-hosted videos or direct MP4 URLs.
              </s-list-item>
              <s-list-item>
                Click <s-text fontWeight="bold">Save</s-text> to publish live to your storefront.
              </s-list-item>
            </s-ordered-list>
          </s-box>

          <s-box padding="base" background="subdued" borderRadius="base">
            <s-heading level="3">Video & Thumbnail Guidelines:</s-heading>
            <s-unordered-list>
              <s-list-item>
                <s-text fontWeight="bold">Optimal Video Aspect Ratio:</s-text> Portrait 9:16 (or exact 344:573 ratio, e.g. 1080x1800 or 720x1200).
              </s-list-item>
              <s-list-item>
                <s-text fontWeight="bold">Video Formats:</s-text> MP4 (H.264 / AAC) with web optimization for fast streaming.
              </s-list-item>
              <s-list-item>
                <s-text fontWeight="bold">Playback Behavior:</s-text> Only the active centered card plays its video; inactive cards show high-resolution product thumbnails.
              </s-list-item>
              <s-list-item>
                <s-text fontWeight="bold">Sound Control:</s-text> Muted by default to satisfy browser autoplay policies, with a user-friendly floating sound toggle on the active item.
              </s-list-item>
            </s-unordered-list>
          </s-box>
        </s-stack>
      </s-section>
    </s-page>
  );
}
