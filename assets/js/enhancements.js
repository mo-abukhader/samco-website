// Local-only requests: no submission endpoint and no background transmission.
Object.assign(SAMCO_TRANSLATIONS.ar, {
  local_notice: 'يُحفظ الطلب على جهازك فقط، ولا يُرسل إلى الشركة. يُضمّن ملف السيرة الذاتية في طلب التوظيف المحفوظ.',
  local_save: 'تنزيل الطلب على جهازي',
  local_done: 'تم تجهيز الملف للتنزيل. لم يُرسل الطلب إلى الشركة.',
  local_error: 'تعذّر إنشاء الملف. بياناتك ما زالت في النموذج؛ حاول مرة أخرى.',
  file_error: 'اختر ملف PDF أو DOCX بحجم لا يتجاوز 5 ميغابايت.',
  drawer_subtitle: 'جهّز بيانات طلبك واحفظ نسخة محلية على جهازك.',
  'footer_cat_microbiology': 'الميكروبيولوجي',
  'footer_cat_blood-tubes': 'أنابيب سحب الدم',
  'footer_cat_laboratory-plasticware': 'بلاستيكيات مخبرية',
  'footer_cat_specimen-collection': 'مسحات وجمع العينات',
  'footer_cat_molecular-science': 'البيولوجيا الجزيئية'
});
Object.assign(SAMCO_TRANSLATIONS.en, {
  local_notice: 'Your request is saved on your device only and is not sent to SAMCO. Career exports include the selected CV file.',
  local_save: 'Download request to my device',
  local_done: 'Your file is ready to download. The request has not been sent to SAMCO.',
  local_error: 'Could not create the file. Your entries remain in the form; please try again.',
  file_error: 'Choose a PDF or DOCX file no larger than 5 MB.',
  drawer_subtitle: 'Prepare your request and save a local copy on your device.',
  'footer_cat_microbiology': 'Microbiology',
  'footer_cat_blood-tubes': 'Blood collection tubes',
  'footer_cat_laboratory-plasticware': 'Laboratory plasticware',
  'footer_cat_specimen-collection': 'Swabs & specimen collection',
  'footer_cat_molecular-science': 'Molecular biology'
});
const tr = key => SAMCO_TRANSLATIONS[currentLang][key];

function downloadRequest(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `samco-${payload.form}-${Date.now()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    const status = document.createElement('p');
    status.className = 'local-form-note';
    status.setAttribute('role','status');
    status.hidden = true;
    form.append(status);
    const file = form.querySelector('input[type="file"]');
    const validateFile = () => {
      if (!file) return true;
      const selected = file.files[0];
      const valid = !selected || (/\.(pdf|docx)$/i.test(selected.name) && selected.size <= 5 * 1024 * 1024);
      file.setCustomValidity(valid ? '' : tr('file_error'));
      const name = document.getElementById('career-file-name');
      if (name) { name.textContent = valid ? selected?.name || '' : tr('file_error'); name.classList.toggle('hidden', !selected); }
      return valid;
    };
    if (file) {
      file.addEventListener('change', validateFile);
      const dropZone = file.parentElement;
      dropZone.addEventListener('dragover', event => event.preventDefault());
      dropZone.addEventListener('drop', event => {
        event.preventDefault();
        if (event.dataTransfer.files.length) {
          const transfer = new DataTransfer();
          transfer.items.add(event.dataTransfer.files[0]);
          file.files = transfer.files;
          validateFile();
        }
      });
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!validateFile() || !form.reportValidity()) return;
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        const payload = {version:1, form:form.id, createdAt:new Date().toISOString(), language:currentLang, sent:false, fields:[], attachments:[]};
        for (const field of form.querySelectorAll('input,select,textarea')) {
          if (field.type === 'file') {
            for (const attachment of field.files) {
              const data = await new Promise((resolve,reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(attachment);
              });
              payload.attachments.push({name:attachment.name, type:attachment.type, size:attachment.size, data});
            }
          } else {
            payload.fields.push({name:field.name, label:field.labels?.[0]?.textContent.trim() || field.name, value:field.value});
          }
        }
        downloadRequest(payload);
        status.dataset.i18n = 'local_done';
      } catch {
        status.dataset.i18n = 'local_error';
      } finally {
        status.textContent = tr(status.dataset.i18n);
        status.hidden = false;
        button.disabled = false;
      }
    });
  });

  const filterButtons = [...document.querySelectorAll('.category-filter-btn')];
  const category = new URLSearchParams(location.search).get('cat');
  filterButtons.find(button => button.dataset.category === category)?.click();
  const updateFilters = () => filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
  filterButtons.forEach(button => button.addEventListener('click', updateFilters));
  updateFilters();

  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu-dropdown');
  if (toggle && menu) {
    toggle.setAttribute('aria-controls',menu.id);
    const sync = () => toggle.setAttribute('aria-expanded',String(!menu.classList.contains('hidden')));
    new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
    sync();
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click',() => menu.classList.add('hidden')));
    document.addEventListener('keydown',event => { if(event.key==='Escape') { menu.classList.add('hidden'); } });
  }

  // Keep focus inside dialogs and restore it to the opening button.
  for (const [id, openName, closeName] of [
    ['inquiry-drawer','openInquiryDrawer','closeInquiryDrawer'],
    ['quick-view-modal','openQuickView','closeQuickView']
  ]) {
    const dialog = document.getElementById(id);
    if (!dialog || !window[openName]) continue;
    let previousFocus;
    const originalOpen = window[openName], originalClose = window[closeName];
    const isOpen = () => id === 'inquiry-drawer' ? dialog.classList.contains('active') : !dialog.classList.contains('hidden');
    dialog.inert = !isOpen();
    const sync = () => {
      dialog.inert = !isOpen();
      if (!isOpen() && dialog.contains(document.activeElement) && previousFocus?.isConnected) previousFocus.focus();
    };
    new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['class']});
    window[openName] = (...args) => {
      previousFocus = document.activeElement;
      originalOpen(...args);
      dialog.inert = false;
      dialog.focus();
    };
    window[closeName] = () => { originalClose(); sync(); };
    document.addEventListener('keydown', event => {
      if (!isOpen()) return;
      if (event.key === 'Escape') { event.preventDefault(); window[closeName](); }
      if (event.key === 'Tab') {
        const focusable = [...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
        const first = focusable[0], last = focusable.at(-1);
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
      }
    });
  }
});
