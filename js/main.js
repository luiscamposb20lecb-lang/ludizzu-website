/* ==========================================================================
   Portafolio — Luis Enrique Campos Barquero (Ludizzu)
   Lógica de interfaz
   --------------------------------------------------------------------------
   Contiene:
     1. Filtrado de proyectos por categoría
     2. Accesibilidad de tarjetas (teclado)
     3. Carga diferida de imágenes
     4. Lightbox con galería multi-imagen y soporte de video
   ========================================================================== */

(function () {
  'use strict';

  // Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');
  const grid = document.getElementById('grid');
  function applyGridWidth(){
    const visible = Array.from(cards).filter(c=>!c.classList.contains('hide')).length;
    grid.classList.remove('few-1','few-2','few-3');
    if(visible === 1) grid.classList.add('few-1');
    else if(visible === 2) grid.classList.add('few-2');
    else grid.classList.add('few-3');
  }
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c=>{
        if(f === 'all' || c.dataset.cat === f){ c.classList.remove('hide'); }
        else{ c.classList.add('hide'); }
      });
      applyGridWidth();
    });
  });
  applyGridWidth();

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCount = document.getElementById('lightboxCount');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentImages = [];
  let currentIndex = 0;
  let isVideo = false;

  function stopVideo(){
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
  }

  function renderSlide(){
    if(isVideo){
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = currentImages[0];
      lightboxNav(false);
      lightboxCount.textContent = '';
    } else {
      lightboxVideo.style.display = 'none';
      lightboxImg.style.display = 'block';
      lightboxImg.src = currentImages[currentIndex];
      lightboxNav(currentImages.length > 1);
      lightboxCount.textContent = currentImages.length > 1 ? (currentIndex+1) + ' / ' + currentImages.length : '';
    }
  }
  function lightboxNav(show){
    lightboxPrev.classList.toggle('hidden', !show);
    lightboxNext.classList.toggle('hidden', !show);
  }

  // Accesibilidad: las tarjetas se pueden abrir con teclado
  cards.forEach(c=>{
    c.setAttribute('tabindex','0');
    c.setAttribute('role','button');
    c.setAttribute('aria-label','Ver proyecto: ' + (c.dataset.title || ''));
    c.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); c.click(); }
    });
  });

  // Carga diferida para todas las imágenes de las tarjetas
  document.querySelectorAll('.card-img img').forEach(img=>{
    if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    img.setAttribute('decoding','async');
  });

  cards.forEach(c=>{
    c.addEventListener('click', ()=>{
      stopVideo();
      lightboxTitle.textContent = c.dataset.title;
      lightboxDesc.textContent = c.dataset.desc;
      if(c.dataset.video){
        isVideo = true;
        currentImages = [c.dataset.video];
        currentIndex = 0;
      } else if(c.dataset.images){
        isVideo = false;
        currentImages = JSON.parse(c.dataset.images);
        currentIndex = 0;
      } else {
        isVideo = false;
        currentImages = [c.dataset.img];
        currentIndex = 0;
      }
      renderSlide();
      lightbox.classList.add('open');
    });
  });

  lightboxPrev.addEventListener('click', (e)=>{
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderSlide();
  });
  lightboxNext.addEventListener('click', (e)=>{
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderSlide();
  });

  function closeLightbox(){
    stopVideo();
    lightbox.classList.remove('open');
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e)=>{
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight' && !isVideo && currentImages.length>1){ currentIndex=(currentIndex+1)%currentImages.length; renderSlide(); }
    if(e.key === 'ArrowLeft' && !isVideo && currentImages.length>1){ currentIndex=(currentIndex-1+currentImages.length)%currentImages.length; renderSlide(); }
  });
})();
