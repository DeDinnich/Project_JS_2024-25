export default function initCustomModals() {
    document.querySelectorAll('[data-custom-open]').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-custom-open');
            const modal = document.getElementById(targetId);
            if (modal) {
                modal.classList.add('show');
                modal.style.display = 'block';
                document.body.classList.add('modal-open');
                const backdrop = document.createElement('div');
                backdrop.classList.add('modal-backdrop', 'fade', 'show');
                backdrop.setAttribute('data-custom-backdrop', '');
                document.body.appendChild(backdrop);
            }
        });
    });

    document.querySelectorAll('[data-custom-close]').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('[data-custom-modal]');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                document.querySelector('[data-custom-backdrop]')?.remove();
            }
        });
    });
}
