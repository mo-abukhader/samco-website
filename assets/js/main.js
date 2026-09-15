// SAMCO Core Logic, GSAP Animations & Language Switcher
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initMobileMenu();
  initGSAPAnimations();
  initCounters();
  initInquiryDrawer();
  initQuickViewModal();
  initProductsCatalog();
  initCareersForm();
});

// Current Language State
let currentLang = 'ar';
try { currentLang = localStorage.getItem('samco_lang') === 'en' ? 'en' : 'ar'; } catch {}

function initLanguage() {
  setLanguage(currentLang);

  const langButtons = document.querySelectorAll('.lang-switcher-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const newLang = currentLang === 'ar' ? 'en' : 'ar';
      setLanguage(newLang);
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem('samco_lang', lang); } catch {}

  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Update text content with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (SAMCO_TRANSLATIONS[lang] && SAMCO_TRANSLATIONS[lang][key]) {
      el.textContent = SAMCO_TRANSLATIONS[lang][key];
    }
  });

  // Update placeholder attributes with data-i18n-ph
  const phElements = document.querySelectorAll('[data-i18n-ph]');
  phElements.forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (SAMCO_TRANSLATIONS[lang] && SAMCO_TRANSLATIONS[lang][key]) {
      el.setAttribute('placeholder', SAMCO_TRANSLATIONS[lang][key]);
    }
  });

  // Update language switcher buttons text
  const langButtons = document.querySelectorAll('.lang-switcher-btn');
  langButtons.forEach(btn => {
    btn.innerHTML = lang === 'ar' ? '<i class="fa-solid fa-globe mr-1 ml-1"></i> English' : '<i class="fa-solid fa-globe mr-1 ml-1"></i> العربية';
  });

  // Re-render product catalog if present
  if (typeof renderProductsCatalog === 'function') {
    renderProductsCatalog();
  }
}

// Mobile Menu Handler
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu-dropdown');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }
}

// GSAP Animations
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Header fade-in
  gsap.from('#main-header', {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Register ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in hero elements
    gsap.from('.gsap-hero-item', {
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2
    });

    // Reveal cards on scroll
    gsap.utils.toArray('.gsap-reveal-card').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 45,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out'
      });
    });
  }
}

// Stats Counters Animation
function initCounters() {
  const counters = document.querySelectorAll('.stat-counter-val');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetNumber = parseInt(target.getAttribute('data-target') || '0', 10);
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';

        let count = 0;
        const speed = 40;
        const increment = Math.ceil(targetNumber / speed);

        const updateCount = () => {
          count += increment;
          if (count < targetNumber) {
            target.textContent = prefix + count.toLocaleString() + suffix;
            requestAnimationFrame(updateCount);
          } else {
            target.textContent = prefix + targetNumber.toLocaleString() + suffix;
          }
        };

        updateCount();
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// Request Quote / Sample Modal Drawer
function initInquiryDrawer() {
  const drawerBackdrop = document.getElementById('inquiry-drawer-backdrop');
  const drawer = document.getElementById('inquiry-drawer');
  const closeBtn = document.getElementById('close-inquiry-drawer');
  const form = document.getElementById('inquiry-form');
  const openButtons = document.querySelectorAll('.open-inquiry-btn');

  if (!drawer || !drawerBackdrop) return;

  window.openInquiryDrawer = function (sku = '', productName = '') {
    drawerBackdrop.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';

    const prodInput = document.getElementById('drawer-form-product');
    if (prodInput) {
      prodInput.value = sku ? `[${sku}] ${productName}` : productName;
    }
  };

  window.closeInquiryDrawer = function () {
    drawerBackdrop.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sku = btn.getAttribute('data-sku') || '';
      const prodName = btn.getAttribute('data-product-name') || '';
      window.openInquiryDrawer(sku, prodName);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeInquiryDrawer);
  }

  drawerBackdrop.addEventListener('click', (e) => {
    if (e.target === drawerBackdrop) {
      window.closeInquiryDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      window.closeInquiryDrawer();
    }
  });

}

// Quick View Modal
function initQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  const closeBtn = document.getElementById('quick-view-close');

  if (!modal) return;

  window.openQuickView = function (productId) {
    const prod = SAMCO_PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    document.getElementById('qv-img').src = prod.image;
    document.getElementById('qv-img').alt = currentLang === 'ar' ? prod.name_ar : prod.name_en;
    document.getElementById('qv-sku').textContent = prod.sku;
    document.getElementById('qv-title').textContent = currentLang === 'ar' ? prod.name_ar : prod.name_en;
    document.getElementById('qv-category').textContent = currentLang === 'ar' ? prod.category_ar : prod.category_en;
    document.getElementById('qv-desc').textContent = currentLang === 'ar' ? prod.desc_ar : prod.desc_en;

    const specsList = document.getElementById('qv-specs');
    specsList.innerHTML = '';
    const specs = currentLang === 'ar' ? prod.specs_ar : prod.specs_en;
    specs.forEach(spec => {
      const li = document.createElement('li');
      li.className = 'flex items-center text-sm text-slate-600';
      li.innerHTML = `<i class="fa-solid fa-check text-sky-600 text-xs mr-2 ml-2"></i> <span>${spec}</span>`;
      specsList.appendChild(li);
    });

    const certsContainer = document.getElementById('qv-certs');
    certsContainer.innerHTML = '';
    prod.certifications.forEach(c => {
      const badge = document.createElement('span');
      badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200';
      badge.textContent = c;
      certsContainer.appendChild(badge);
    });

    const inquireBtn = document.getElementById('qv-inquire-btn');
    if (inquireBtn) {
      inquireBtn.onclick = () => {
        modal.classList.add('hidden');
        window.openInquiryDrawer(prod.sku, currentLang === 'ar' ? prod.name_ar : prod.name_en);
      };
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeQuickView = function () {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeQuickView);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closeQuickView();
    }
  });
}

// Products Catalog Renderer & Filter
let activeCategory = 'all';
let searchQuery = '';

function initProductsCatalog() {
  const container = document.getElementById('products-catalog-grid');
  if (!container) return;

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.category-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-sky-600', 'text-white'));
      filterBtns.forEach(b => b.classList.add('bg-white', 'text-slate-700'));
      btn.classList.remove('bg-white', 'text-slate-700');
      btn.classList.add('active', 'bg-sky-600', 'text-white');

      activeCategory = btn.getAttribute('data-category');
      renderProductsCatalog();
    });
  });

  // Search input
  const searchInput = document.getElementById('product-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProductsCatalog();
    });
  }

  window.renderProductsCatalog = function () {
    if (!container) return;

    const filtered = SAMCO_PRODUCTS.filter(p => {
      const matchesCat = (activeCategory === 'all') || (p.category === activeCategory);
      const name = (currentLang === 'ar' ? p.name_ar : p.name_en).toLowerCase();
      const sku = p.sku.toLowerCase();
      const desc = (currentLang === 'ar' ? p.desc_ar : p.desc_en).toLowerCase();
      const searchable = [p.name_ar, p.name_en, p.desc_ar, p.desc_en, p.category_ar, p.category_en, p.sku].join(' ').toLowerCase();
      const matchesSearch = !searchQuery || searchable.includes(searchQuery);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <h4 class="text-lg font-semibold text-slate-800 mb-1">${currentLang === 'ar' ? 'لم يتم العثور على منتجات' : 'No Products Found'}</h4>
          <p class="text-sm text-slate-500">${currentLang === 'ar' ? 'يرجى تجربة كلمات بحث أخرى أو اختيار فئة مختلفة.' : 'Please try different keywords or select another category.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const name = currentLang === 'ar' ? p.name_ar : p.name_en;
      const cat = currentLang === 'ar' ? p.category_ar : p.category_en;
      const desc = currentLang === 'ar' ? p.desc_ar : p.desc_en;
      const specs = currentLang === 'ar' ? p.specs_ar : p.specs_en;
      const specSnippet = specs.slice(0, 2).map(s => `<li class="flex items-center text-xs text-slate-500"><i class="fa-solid fa-circle-check text-sky-500 mr-1.5 ml-1.5"></i> ${s}</li>`).join('');

      return `
        <div class="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col border border-slate-200/90 gsap-reveal-card transition-all duration-300">
          <div class="relative overflow-hidden bg-slate-100 h-52 group">
            <img src="${p.image}" alt="${name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            <div class="absolute top-3 right-3 left-3 flex justify-between items-center pointer-events-none">
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-sky-800 shadow-sm border border-slate-200">${p.sku}</span>
              ${p.featured ? `<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-sm">${currentLang === 'ar' ? 'مميز' : 'Featured'}</span>` : ''}
            </div>
            <button onclick="openQuickView('${p.id}')" class="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-md">
              <i class="fa-solid fa-eye mr-1 ml-1"></i> ${currentLang === 'ar' ? 'معاينة سريعة' : 'Quick View'}
            </button>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <span class="text-xs font-medium text-sky-600 block mb-1.5">${cat}</span>
              <h3 class="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug hover:text-sky-600 cursor-pointer" onclick="openQuickView('${p.id}')">${name}</h3>
              <p class="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">${desc}</p>
              <ul class="space-y-1 mb-5">
                ${specSnippet}
              </ul>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button onclick="openInquiryDrawer('${p.sku}', '${name.replace(/'/g, "\\'")}')" class="flex-1 py-2.5 px-4 rounded-xl gradient-primary text-white text-xs font-semibold shadow-sm hover:shadow-md hover:opacity-95 transition-all text-center flex items-center justify-center">
                <i class="fa-solid fa-paper-plane mr-2 ml-2"></i> ${currentLang === 'ar' ? 'طلب عرض سعر' : 'Inquire Now'}
              </button>
              <button onclick="openQuickView('${p.id}')" class="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="${currentLang === 'ar' ? 'التفاصيل' : 'Details'}">
                <i class="fa-solid fa-circle-info"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  renderProductsCatalog();
}

// Forms share a local export handler in enhancements.js.
function initCareersForm() {}
