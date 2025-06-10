import axios from 'axios'

window.axios = axios
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// on importe le module echo, mais c'est app.js qui appellera initEcho()
import './modules/echo'
