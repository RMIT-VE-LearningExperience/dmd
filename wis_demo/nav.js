// ===================================
// SHARED NAVIGATION — Hamburger Drawer
// ===================================

(function () {
    var menuBtn = document.getElementById('menuBtn');
    var drawer = document.getElementById('navDrawer');
    var closeBtn = document.getElementById('navClose');
    var scrim = document.getElementById('navScrim');

    if (!menuBtn || !drawer) return;

    function openNav() {
        drawer.classList.add('open');
        if (scrim) scrim.classList.add('open');
    }

    function closeNav() {
        drawer.classList.remove('open');
        if (scrim) scrim.classList.remove('open');
    }

    menuBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (scrim) scrim.addEventListener('click', closeNav);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeNav();
        }
    });
})();
