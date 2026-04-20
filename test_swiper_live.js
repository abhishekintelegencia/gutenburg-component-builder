const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  // Go to the actual live WordPress page with both sliders
  await page.goto('http://localhost/learn-pro/?p=647', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(1000); // wait for DOMContentLoaded scripts
  
  const result = await page.evaluate(() => {
    const sliders = document.querySelectorAll('.rcb-dynamic-slider');
    return Array.from(sliders).map((el, index) => {
      const nextBtn = el.querySelector('.swiper-button-next');
      const prevBtn = el.querySelector('.swiper-button-prev');
      const slides = el.querySelectorAll('.swiper-slide');
      const wrapper = el.querySelector('.swiper-wrapper');
      return {
        index,
        id: el.className,
        spv: el.getAttribute('data-slides-per-view'),
        loop: el.getAttribute('data-loop'),
        slideCount: slides.length,
        nextBtnDisabled: nextBtn ? nextBtn.classList.contains('swiper-button-disabled') : null,
        prevBtnDisabled: prevBtn ? prevBtn.classList.contains('swiper-button-disabled') : null,
        nextBtnLocked: nextBtn ? nextBtn.classList.contains('swiper-button-lock') : null,
        prevBtnLocked: prevBtn ? prevBtn.classList.contains('swiper-button-lock') : null,
        wrapperTransform: wrapper ? window.getComputedStyle(wrapper).transform : null,
        swiperOnEl: !!el.swiper,
        swiperIsLocked: el.swiper ? el.swiper.isLocked : null,
        swiperLoopEnabled: el.swiper ? el.swiper.params.loop : null,
        swiperSlidesLength: el.swiper ? el.swiper.slides.length : null,
      };
    });
  });
  
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
