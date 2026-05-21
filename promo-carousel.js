const promoItems = [
  {
    title: 'Города Кавказа',
    description: 'Пятигорск, Кисловодск, Ессентуки и курортная атмосфера КМВ.',
    image: 'images/home/kislovodsk-sunset-boulevard.png',
    alt: 'Кисловодск и города Кавказских Минеральных Вод',
    url: 'cities.html',
    target: '_self',
    cta: 'Смотреть города'
  },
  {
    title: 'Полет на параплане',
    description: 'Кавказ с высоты: сильные виды, воздух и эмоции большого путешествия.',
    image: 'images/paragliding/paragliding-cta.png',
    alt: 'Полет на параплане над Кавказом',
    url: 'paragliding.html',
    target: '_self',
    cta: 'Подробнее'
  },
  {
    title: 'Эльбрус',
    description: 'Маршрут к панорамам самой высокой вершины России и Европы.',
    image: 'images/home/elbrus-snow-peak-road.png',
    alt: 'Эльбрус и горная дорога',
    url: 'elbrus.html',
    target: '_self',
    cta: 'Открыть'
  },
  {
    title: 'Домбай',
    description: 'Горные долины, реки и кадры, которые выглядят как открытка.',
    image: 'images/home/dombay-river-mountain.png',
    alt: 'Домбай, река и горы',
    url: 'dombay.html',
    target: '_self',
    cta: 'Смотреть'
  },
  {
    title: 'Архыз',
    description: 'Высокогорный отдых, чистый воздух и маршруты ближе к небу.',
    image: 'images/home/arkhyz-sign-hillside.png',
    alt: 'Архыз и горный склон',
    url: 'arkhyz.html',
    target: '_self',
    cta: 'Перейти'
  },
  {
    title: 'Сулакский каньон',
    description: 'Бирюзовая вода, масштабные панорамы и один из главных видов Кавказа.',
    image: 'images/sulak-canyon-viewpoint-5f15c30.jpg',
    alt: 'Сулакский каньон',
    url: 'sulak-canyon.html',
    target: '_self',
    cta: 'Узнать'
  },
  {
    title: 'Индивидуальный тур',
    description: 'Соберем поездку под даты, темп, компанию и настроение.',
    image: 'images/reference-home/card-elbrus.jpg',
    alt: 'Индивидуальный тур по Кавказу',
    url: 'tours.html',
    target: '_self',
    cta: 'Выбрать тур'
  }
];

class PromoCarousel {
  constructor(root, items) {
    this.root = root;
    this.items = items;
    this.track = null;
    this.prev = null;
    this.next = null;
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.animationFrame = null;
    this.isPaused = false;
    this.autoSpeed = 0.85;
  }

  init() {
    if (!this.root || !this.items.length) return;
    this.render();
    this.bind();
    this.updateControls();
  }

  render() {
    this.root.innerHTML = `
      <div class="promo-carousel-shell">
        <div class="promo-carousel-head">
          <div>
            <span>Рекомендуем</span>
            <h2>Идеи для путешествия</h2>
          </div>
          <div class="promo-carousel-controls" aria-label="Навигация рекламной карусели">
            <button class="promo-carousel-arrow" type="button" data-promo-prev aria-label="Назад">‹</button>
            <button class="promo-carousel-arrow" type="button" data-promo-next aria-label="Вперед">›</button>
          </div>
        </div>
        <div class="promo-carousel-track" data-promo-track tabindex="0" aria-label="Рекламные предложения">
          ${this.items.map((item) => this.card(item)).join('')}
          ${this.items.map((item) => this.card(item, true)).join('')}
        </div>
      </div>
    `;

    this.track = this.root.querySelector('[data-promo-track]');
    this.prev = this.root.querySelector('[data-promo-prev]');
    this.next = this.root.querySelector('[data-promo-next]');
  }

  card(item, duplicate = false) {
    const target = item.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
    const hasImage = Boolean(item.image);
    const image = hasImage
      ? `<img src="${item.image}" alt="${item.alt || item.title}" loading="lazy" decoding="async">`
      : '<div class="promo-carousel-fallback" aria-hidden="true"></div>';

    const duplicateAttrs = duplicate ? ' aria-hidden="true" tabindex="-1"' : '';

    return `
      <a class="promo-carousel-card${hasImage ? '' : ' no-image'}" href="${item.url}"${target}${duplicateAttrs}>
        ${image}
        <div class="promo-carousel-card-copy">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          ${item.cta ? `<span>${item.cta}</span>` : ''}
        </div>
      </a>
    `;
  }

  bind() {
    this.prev.addEventListener('click', () => this.scroll(-1));
    this.next.addEventListener('click', () => this.scroll(1));
    this.track.addEventListener('scroll', () => this.updateControls(), { passive: true });

    this.track.addEventListener('pointerdown', (event) => {
      this.isDragging = true;
      this.pauseAuto();
      this.startX = event.clientX;
      this.scrollLeft = this.track.scrollLeft;
      this.track.classList.add('is-dragging');
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
      this.track.classList.remove('is-dragging');
      this.resumeAuto();
    });

    this.track.addEventListener('pointermove', (event) => {
      if (!this.isDragging) return;
      event.preventDefault();
      this.track.scrollLeft = this.scrollLeft - (event.clientX - this.startX);
    });

    this.track.querySelectorAll('img').forEach((image) => {
      image.addEventListener('error', () => {
        const card = image.closest('.promo-carousel-card');
        card.classList.add('no-image');
        image.remove();
      }, { once: true });
    });

    this.startAuto();
  }

  scroll(direction) {
    const firstCard = this.track.querySelector('.promo-carousel-card');
    const step = firstCard ? firstCard.getBoundingClientRect().width + 18 : this.track.clientWidth;
    this.track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  updateControls() {
    this.prev.disabled = false;
    this.next.disabled = false;
  }

  startAuto() {
    if (this.animationFrame) return;
    const tick = () => {
      if (!this.isPaused && !this.isDragging) {
        this.track.scrollLeft += this.autoSpeed;
        const loopPoint = this.track.scrollWidth / 2;
        if (loopPoint <= this.track.clientWidth) {
          this.animationFrame = window.requestAnimationFrame(tick);
          return;
        }
        if (this.track.scrollLeft >= loopPoint) {
          this.track.scrollLeft -= loopPoint;
        }
      }
      this.animationFrame = window.requestAnimationFrame(tick);
    };
    this.animationFrame = window.requestAnimationFrame(tick);
  }

  pauseAuto() {
    this.isPaused = true;
  }

  resumeAuto() {
    this.isPaused = false;
  }
}

document.querySelectorAll('[data-promo-carousel]').forEach((root) => {
  new PromoCarousel(root, promoItems).init();
});
