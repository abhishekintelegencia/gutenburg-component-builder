const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto('http://localhost/learn-pro/image-slider-test-page/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  
  const result = await page.evaluate(() => {
    const sliders = document.querySelectorAll('.rcb-slider');
    return Array.from(sliders).map((el, index) => {
      const nextBtn = el.querySelector('.swiper-button-next');
      const prevBtn = el.querySelector('.swiper-button-prev');
      const slides = el.querySelectorAll('.swiper-slide');
      return {
        index,
        spv: el.getAttribute('data-slides-per-view'),
        loop: el.getAttribute('data-loop'),
        slideCount: slides.length,
        nextDisabled: nextBtn ? nextBtn.classList.contains('swiper-button-disabled') : null,
        nextLocked: nextBtn ? nextBtn.classList.contains('swiper-button-lock') : null,
        hasSwiper: !!el.swiper,
      };
    });
  });
  console.log(JSON.stringify(result, null, 2));
  
  // Try clicking next on each slider
  const sliders = await page.$$('.rcb-slider');
  for (let i = 0; i < sliders.length; i++) {
    const nextBtn = await sliders[i].$('.swiper-button-next');
    if (nextBtn) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(400);
      const transform = await page.evaluate((idx) => {
        const w = document.querySelectorAll('.rcb-slider')[idx].querySelector('.swiper-wrapper');
        return w ? window.getComputedStyle(w).transform : null;
      }, i);
      console.log(`Slider ${i} transform after click:`, transform);
    }
  }
  
  await browser.close();
})();
