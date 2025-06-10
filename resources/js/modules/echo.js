import Pusher from 'pusher-js'
import Echo   from 'laravel-echo'

export default function initEcho() {
  window.Pusher = Pusher

  const key     = import.meta.env.VITE_REVERB_APP_KEY        // "j9mlyl3djesxxkzmxafx"
  const host    = import.meta.env.VITE_REVERB_HOST           // "192.168.21.44"
  const port    = Number(import.meta.env.VITE_REVERB_PORT)   // 8080
  const cluster = import.meta.env.VITE_REVERB_APP_CLUSTER    // "eu"

  window.Echo = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws','wss'],
  })

  // expose pour le monitor
  window.Laravel = { reverbHost: host, reverbPort: port }

  console.log('✅ Laravel Echo initialisé avec succès !')
}
