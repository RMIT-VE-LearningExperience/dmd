// ===================================
// SHARED NAVIGATION — Hamburger Drawer
// ===================================

(function () {
    var menuBtn = document.getElementById('menuBtn');
    var drawer = document.getElementById('navDrawer');
    var closeBtn = document.getElementById('navClose');
    var scrim = document.getElementById('navScrim');
    var drawerFocusables = [];

    if (!menuBtn || !drawer) return;

    menuBtn.setAttribute('aria-controls', 'navDrawer');
    menuBtn.setAttribute('aria-expanded', 'false');

    drawerFocusables = Array.prototype.slice.call(
        drawer.querySelectorAll('a, button, [tabindex]')
    );

    function setDrawerKeyboardState(isOpen) {
        if (isOpen) {
            drawer.classList.add('open');
            drawer.removeAttribute('inert');
            drawer.setAttribute('aria-hidden', 'false');
            menuBtn.setAttribute('aria-expanded', 'true');
            drawerFocusables.forEach(function (el) {
                if (el.dataset.prevTabindex !== undefined) {
                    if (el.dataset.prevTabindex === '') el.removeAttribute('tabindex');
                    else el.setAttribute('tabindex', el.dataset.prevTabindex);
                    delete el.dataset.prevTabindex;
                } else {
                    el.removeAttribute('tabindex');
                }
            });
        } else {
            drawer.classList.remove('open');
            drawer.setAttribute('inert', '');
            drawer.setAttribute('aria-hidden', 'true');
            menuBtn.setAttribute('aria-expanded', 'false');
            drawerFocusables.forEach(function (el) {
                if (el.dataset.prevTabindex === undefined) {
                    el.dataset.prevTabindex = el.getAttribute('tabindex') || '';
                }
                el.setAttribute('tabindex', '-1');
            });
        }
    }

    function openNav() {
        setDrawerKeyboardState(true);
        if (scrim) scrim.classList.add('open');
        if (closeBtn) closeBtn.focus();
    }

    function closeNav() {
        setDrawerKeyboardState(false);
        if (scrim) scrim.classList.remove('open');
        menuBtn.focus();
    }

    setDrawerKeyboardState(false);

    menuBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (scrim) scrim.addEventListener('click', closeNav);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeNav();
        }
    });
})();
