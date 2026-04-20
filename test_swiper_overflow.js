const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewportSize({ width: 1280, height: 900 });
  
  await page.goto('http://localhost/learn-pro/test-slider/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  
  const result = await page.evaluate(() => {
    const sliders = document.querySelectorAll('.rcb-dynamic-slider');
    return Array.from(sliders).map((el, index) => {
      const nextBtn = el.querySelector('.swiper-button-next');
      const prevBtn = el.querySelector('.swiper-button-prev');
      const sliderRect = el.getBoundingClientRect();
      const nextRect = nextBtn ? nextBtn.getBoundingClientRect() : null;
      const nextStyle = nextBtn ? window.getComputedStyle(nextBtn) : null;
      const sliderStyle = window.getComputedStyle(el);
      
      return {
        index,
        spv: el.getAttribute('data-slides-per-view'),
        sliderOverflow: sliderStyle.overflow,
        sliderZIndex: sliderStyle.zIndex,
        sliderRect: { top: sliderRect.top, left: sliderRect.left, width: sliderRect.width, height: sliderRect.height },
        nextBtnRect: nextRect ? { top: nextRect.top, left: nextRect.left, right: nextRect.right, width: nextRect.width, height: nextRect.height } : null,
        nextBtnPointerEvents: nextStyle ? nextStyle.pointerEvents : null,
        nextBtnZIndex: nextStyle ? nextStyle.zIndex : null,
        nextBtnVisible: nextStyle ? nextStyle.visibility : null,
        // Check if arrow is clipped outside slider
        arrowOutside: nextRect && sliderRect ? (nextRect.right > sliderRect.right || nextRect.left < sliderRect.left) : null,
      };
    });
  });
  
  console.log(JSON.stringify(result, null, 2));
  
  // Try clicking the next button of the SECOND slider
  const sliders = await page.$$('.rcb-dynamic-slider');
  if (sliders.length >= 2) {
    const secondSlider = sliders[1];
    const nextBtn = await secondSlider.$('.swiper-button-next');
    if (nextBtn) {
      console.log('\nTrying to click next button of second slider...');
      await nextBtn.click({ force: true });
      await page.waitForTimeout(500);
      const wrapperTransform = await page.evaluate(() => {
        const w = document.querySelectorAll('.rcb-dynamic-slider')[1].querySelector('.swiper-wrapper');
        return w ? window.getComputedStyle(w).transform : null;
      });
      console.log('Wrapper transform after click:', wrapperTransform);
    }
  }
  
  await browser.close();
})();
