const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .rcb-dynamic-slider { width: 1000px; height: 500px; }
          .swiper-wrapper { display: flex; }
          .swiper-slide { flex-shrink: 0; width: 100%; height: 100%; }
        </style>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css" />
      </head>
      <body>
        <div class="rcb-slider swiper rcb-dynamic-slider rcb-instance-s2" 
             data-arrows="true" data-dots="true" data-autoplay="false" 
             data-autoplay-delay="3000" data-loop="true" data-effect="slide" 
             data-slides-per-view="2" data-space-between="0"
             data-breakpoints='{"768":{"slidesPerView":2,"spaceBetween":0},"0":{"slidesPerView":2,"spaceBetween":0}}'>
          <div class="swiper-wrapper">
            <div class="swiper-slide rcb-slide-item v-align-center" style="background-color: red; width: 100%;">Slide 1</div>
            <div class="swiper-slide rcb-slide-item v-align-center" style="background-color: blue; width: 100%;">Slide 2</div>
            <div class="swiper-slide rcb-slide-item v-align-center" style="background-color: green; width: 100%;">Slide 3</div>
            <div class="swiper-slide rcb-slide-item v-align-center" style="background-color: yellow; width: 100%;">Slide 4</div>
            <div class="swiper-slide rcb-slide-item v-align-center" style="background-color: pink; width: 100%;">Slide 5</div>
            <div class="swiper-slide rcb-slide-item v-align-center" style="background-color: orange; width: 100%;">Slide 6</div>
          </div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js"></script>
        <script>
          const el = document.querySelector('.rcb-dynamic-slider');
          const slidesPerView = parseInt(el.getAttribute('data-slides-per-view'), 10) || 1;
          const spaceBetween = parseInt(el.getAttribute('data-space-between'), 10) || 0;
          const loop = el.getAttribute('data-loop') === 'true';
          const effect = el.getAttribute('data-effect') || 'slide';
          const autoplay = el.getAttribute('data-autoplay') === 'true';
          const delay = parseInt(el.getAttribute('data-autoplay-delay'), 10) || 3000;
          const arrows = el.getAttribute('data-arrows') === 'true';
          
          let breakpoints = {};
          const breakpointsRaw = el.getAttribute('data-breakpoints');
          if ( breakpointsRaw ) {
              const parsed = JSON.parse( breakpointsRaw );
              breakpoints = {
                  0: parsed[0] || { slidesPerView: 1, spaceBetween: 10 },
                  768: parsed[768] || { slidesPerView: Math.min(2, slidesPerView), spaceBetween: Math.min(20, spaceBetween) },
                  1025: { slidesPerView: slidesPerView, spaceBetween: spaceBetween }
              };
          }
          
          const swiper = new Swiper(el, {
              slidesPerView: slidesPerView,
              spaceBetween: spaceBetween,
              breakpoints: breakpoints,
              loop: loop,
              effect: effect,
              grabCursor: false,
              navigation: arrows ? {
                  nextEl: el.querySelector('.swiper-button-next'),
                  prevEl: el.querySelector('.swiper-button-prev'),
              } : false,
              watchOverflow: false,
          });
          
          window.swiperTestResult = {
             swiperWidth: el.offsetWidth,
             slide1Width: document.querySelectorAll('.swiper-slide')[0].offsetWidth,
             slide1Html: document.querySelectorAll('.swiper-slide')[0].outerHTML,
             isLocked: swiper.isLocked,
             slidesLength: swiper.slides.length
          };
        </script>
      </body>
    </html>
  `);
  
  await page.waitForTimeout(1000);
  const result = await page.evaluate(() => window.swiperTestResult);
  console.log(result);
  await browser.close();
})();
