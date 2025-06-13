// resources/js/app.js

import '../css/app.css';
import 'bootstrap';
import 'aos/dist/aos.css';

import initEcho from './modules/echo';
import initAOS from './modules/aos';
import monitorReverb from './modules/reverbStatus';
import initCustomModals from './modules/modals';
import initBookDrag from './modules/initBookDrag';
import initShelfDrag from './modules/initShelfDrag';
import initAjaxForms from './modules/ajaxForms';
import initNotifications from './modules/notifications';
import initRenderer from './modules/renderer';

initEcho();
initAOS();
monitorReverb();
initCustomModals();
initBookDrag();
initShelfDrag();
initAjaxForms();
initNotifications();
initRenderer();
