// resources/js/app.js

import '../css/app.css';
import 'bootstrap';
import 'aos/dist/aos.css';

import initEcho        from './modules/echo';
import initAOS         from './modules/aos';
import monitorReverb   from './modules/reverbStatus';
import initCustomModals from './modules/modals';
import initBookDrag from './modules/initBookDrag';
import initAjaxForms from './modules/ajaxForms';
import initNotifications from './modules/notifications';
import { init } from 'aos';

initEcho();      // initialise Echo
initAOS();       // initialise AOS
monitorReverb(); // monitoring sans réinitialiser Echo
initCustomModals(); // initialise les modals personnalisés
initBookDrag(); // initialise le drag and drop des livres
initAjaxForms(); // initialise les formulaires AJAX
initNotifications(); // initialise les notifications
