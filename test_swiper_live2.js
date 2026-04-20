const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Try both test pages to confirm behavior
  for (const url of ['http://localhost/learn-pro/test-slider/', 'http://localhost/learn-pro/test-slider-2/']) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    
    const result = await page.evaluate(() => {
      const sliders = document.querySelectorAll('.rcb-dynamic-slider');
      return Array.from(sliders).map((el, index) => {
        const nextBtn = el.querySelector('.swiper-button-next');
        const prevBtn = el.querySelector('.swiper-button-prev');
        const wrapper = el.querySelector('.swiper-wrapper');
        return {
          index,
          spv: el.getAttribute('data-slides-per-view'),
          loops: el.getAttribute('data-loop'),  
          slides: el.querySelectorAll('.swiper-slide').length,
          nextDisabled: nextBtn ? nextBtn.classList.contains('swiper-button-disabled') : null,
          nextLocked: nextBtn ? nextBtn.classList.contains('swiper-button-lock') : null,
          swiperIsLocked: el.swiper ? el.swiper.isLocked : 'no swiper property',
          swiperParams: el.swiper ? { loop: el.swiper.params.loop, spv: el.swiper.params.slidesPerView } : null,
          wrapperStyle: wrapper ? wrapper.getAttribute('style') : null,
        };
      });
    });
    
    console.log('\nURL:', url);
    console.log(JSON.stringify(result, null, 2));
  }
  
  await browser.close();
})();
