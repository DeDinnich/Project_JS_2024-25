// modules/helpers.js
export function rebindScripts() {
  console.log('🔁 Rebind des scripts personnalisés...');
  import('./modals.js').then(m => m.default());
  import('./initBookDrag.js').then(m => m.default());
  import('./initShelfDrag.js').then(m => m.default());
  import('./ajaxForms.js').then(m => m.default());
}
