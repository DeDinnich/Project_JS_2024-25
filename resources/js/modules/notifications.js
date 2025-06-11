export default function initNotifications() {
  console.log('🔔 Initialisation des notifications…');
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notification-container');
    if (!container) {
      console.warn('⚠️ Pas de container pour notifications');
      return;
    }

    if (!window.Echo) {
      console.error('❌ Echo non trouvé, impossible de rejoindre le channel');
      return;
    }

    console.log('➡️ Rejoindre le channel public "reverb"');
    const channel = window.Echo.channel('reverb');

    // Écoute des événements
    channel.listen('ShelfEvent', event => {
      console.log('📬 ShelfEvent reçu :', event);
      showNotification(container, event.message, event.success);
    });

    channel.listen('BookEvent', event => {
      console.log('📬 BookEvent reçu :', event);
      showNotification(container, event.message, event.success);
    });
  });
}

function showNotification(container, message, success) {
  const alert = document.createElement('div');
  alert.classList.add('notification', success ? 'notification-success' : 'notification-error');
  alert.textContent = message;
  container.appendChild(alert);

  setTimeout(() => {
    alert.classList.add('fade-out');
    alert.addEventListener('transitionend', () => alert.remove());
  }, 3000);
}
