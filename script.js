const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, {passive:true}); updateProgress();

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));

const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project');
const categorySections = document.querySelectorAll('[data-category-section]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  projects.forEach(project => {
    const show = filter === 'all' || project.dataset.category === filter;
    project.classList.toggle('hidden', !show);
    if (show) project.animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:360, easing:'ease-out'});
  });
  categorySections.forEach(section => {
    section.hidden = !(filter === 'all' || section.dataset.categorySection === filter);
  });
}));

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxType = document.getElementById('lightboxType');
const slideCount = document.getElementById('slideCount');
const slidePrev = document.getElementById('slidePrev');
const slideNext = document.getElementById('slideNext');
let activeSlides = [];
let activeSlideIndex = 0;
let activeProject = null;
const renderSlide = () => {
  const total = activeSlides.length || 1;
  const src = activeSlides[activeSlideIndex] || activeProject?.dataset.image || '';
  lightboxImage.src = src;
  lightboxImage.alt = `${activeProject?.dataset.title || 'Selected project'} — slide ${activeSlideIndex + 1}`;
  slideCount.textContent = total > 1 ? `${activeSlideIndex + 1} / ${total}` : '';
  slidePrev.hidden = total < 2;
  slideNext.hidden = total < 2;
};
const goToSlide = (step) => {
  if (activeSlides.length < 2) return;
  activeSlideIndex = (activeSlideIndex + step + activeSlides.length) % activeSlides.length;
  renderSlide();
};
const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); document.body.classList.remove('locked'); };
projects.forEach(project => project.addEventListener('click', () => {
  activeProject = project;
  activeSlides = project.dataset.slides ? project.dataset.slides.split('|') : [project.dataset.image];
  activeSlideIndex = 0;
  lightboxTitle.textContent = project.dataset.title;
  lightboxType.textContent = project.dataset.type;
  renderSlide();
  lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); document.body.classList.add('locked');
}));
slidePrev.addEventListener('click', () => goToSlide(-1));
slideNext.addEventListener('click', () => goToSlide(1));
 document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'ArrowLeft') goToSlide(-1);
  if (event.key === 'ArrowRight') goToSlide(1);
});

// Subtle pointer tilt on desktop hero cards; disabled for touch-first layouts.
if (window.matchMedia('(pointer:fine)').matches) {
  const art = document.querySelector('.hero-art');
  art.addEventListener('mousemove', e => {
    const rect = art.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    art.style.setProperty('--tilt-x', `${x * 5}deg`);
    art.style.setProperty('--tilt-y', `${y * -5}deg`);
    art.querySelectorAll('.art-card').forEach((card, i) => { card.style.translate = `${x * (i ? -10 : 10)}px ${y * (i ? -8 : 8)}px`; });
  });
  art.addEventListener('mouseleave', () => art.querySelectorAll('.art-card').forEach(card => { card.style.translate = '0 0'; }));
}
