import AOS from 'aos';

window.AOS = AOS;

export default function initAOS() {
    AOS.init();
    console.log("✅ AOS initialisé");
}
