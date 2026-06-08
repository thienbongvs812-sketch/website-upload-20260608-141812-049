(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const searchParams = new URLSearchParams(window.location.search);
  const queryFromUrl = searchParams.get('q') || '';
  const searchInput = document.querySelector('.js-search');
  const filterInputs = Array.from(document.querySelectorAll('.js-filter'));
  const scope = document.querySelector('.js-filter-scope');
  const emptyState = document.querySelector('.js-empty');

  if (searchInput && queryFromUrl) {
    searchInput.value = queryFromUrl;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!scope) {
      return;
    }

    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const query = normalize(searchInput ? searchInput.value : '');
    const selected = {};

    filterInputs.forEach(function (input) {
      selected[input.dataset.filter] = normalize(input.value);
    });

    let visibleCount = 0;

    cards.forEach(function (card) {
      const title = normalize(card.dataset.title);
      const region = normalize(card.dataset.region);
      const type = normalize(card.dataset.type);
      const year = normalize(card.dataset.year);
      const tags = normalize(card.dataset.tags);
      const haystack = [title, region, type, year, tags].join(' ');
      const matchesQuery = !query || haystack.includes(query);
      const matchesType = !selected.type || type === selected.type;
      const matchesYear = !selected.year || year === selected.year;
      const matchesRegion = !selected.region || region === selected.region;
      const isVisible = matchesQuery && matchesType && matchesYear && matchesRegion;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('change', applyFilters);
  });

  applyFilters();
})();
