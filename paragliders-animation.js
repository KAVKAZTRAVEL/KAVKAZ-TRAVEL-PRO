(function () {
  class ParaglidersAnimation {
    constructor(root) {
      this.root = root;
      this.layer = null;
      this.models = [];
      this.frame = null;
      this.fallbackTimer = null;
      this.lastTime = 0;
      this.lastRafTime = 0;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.mobile = window.matchMedia('(max-width: 720px)');
      this.assets = [
        'images/paragliding/paraglider-photo-model-1.png',
        'images/paragliding/paraglider-photo-model-3.png'
      ];
      this.handleResize = () => this.resize();
      this.handleMotionChange = () => this.restart();
    }

    init() {
      if (!this.root) return;

      this.resize();
      this.createLayer();
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.reducedMotion.addEventListener('change', this.handleMotionChange);
      this.mobile.addEventListener('change', this.handleMotionChange);

      if (this.reducedMotion.matches) {
        this.layer.classList.add('is-reduced-motion');
      }

      this.lastTime = performance.now();
      this.lastRafTime = this.lastTime;
      this.frame = window.requestAnimationFrame((time) => this.tick(time));
      this.fallbackTimer = window.setInterval(() => {
        const now = performance.now();
        if (now - this.lastRafTime > 240) {
          this.step(now);
        }
      }, 120);
    }

    restart() {
      this.destroy();
      this.init();
    }

    createLayer() {
      this.layer = document.createElement('div');
      this.layer.className = 'paragliders-animation';
      this.layer.setAttribute('aria-hidden', 'true');
      document.body.append(this.layer);

      this.models = this.assets.map((src, index) => {
        const image = document.createElement('img');
        image.className = `paraglider-model paraglider-model-${index + 1}`;
        image.src = src;
        image.alt = '';
        image.decoding = 'async';
        this.layer.append(image);

        return this.createState(image, index);
      });
    }

    createState(element, index) {
      const state = {
        element,
        index,
        phase: this.random(0, Math.PI * 2),
        wave: this.random(0.18, 0.42),
        sway: this.random(0.75, 1.35),
        amplitude: this.random(18, 42),
        baseY: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        scale: 1,
        direction: 1,
        hiddenUntil: performance.now() + this.random(0, 2800),
        exitY: null,
        exitX: null
      };

      this.seedVisibleState(state, index);
      return state;
    }

    seedVisibleState(model, index) {
      const placements = [
        { x: 0.16, y: 0.20, vx: 30, vy: 4, scale: 0.92 },
        { x: 0.72, y: 0.32, vx: -24, vy: -3, scale: 0.76 },
        { x: 0.42, y: 0.50, vx: 20, vy: -6, scale: 0.66 }
      ];
      const placement = placements[index];
      const mobileScale = this.mobile.matches ? 0.72 : 1;

      model.x = this.width * placement.x + this.random(-38, 38);
      model.baseY = this.height * placement.y + this.random(-34, 34);
      model.y = model.baseY;
      model.vx = placement.vx + this.random(-10, 10);
      model.vy = placement.vy + this.random(-6, 6);
      model.scale = placement.scale * mobileScale;
      model.direction = model.vx >= 0 ? 1 : -1;
      model.hiddenUntil = performance.now() + index * 320;
      this.paint(model, this.random(-5, 5), 0);
    }

    resize() {
      this.width = window.innerWidth || document.documentElement.clientWidth || 1280;
      this.height = window.innerHeight || document.documentElement.clientHeight || 720;
    }

    tick(time) {
      this.lastRafTime = time;
      this.step(time);
      this.frame = window.requestAnimationFrame((nextTime) => this.tick(nextTime));
    }

    step(time) {
      const dt = Math.min((time - this.lastTime) / 1000, 0.05);
      this.lastTime = time;

      for (const model of this.models) {
        this.updateModel(model, time, dt);
      }
    }

    updateModel(model, time, dt) {
      if (time < model.hiddenUntil) {
        model.element.style.opacity = '0';
        return;
      }

      const motionFactor = this.motionFactor();
      const t = time / 1000 + model.phase;
      model.x += model.vx * dt * motionFactor;
      model.baseY += model.vy * dt * motionFactor;
      model.y = model.baseY
        + Math.sin(t * model.wave) * model.amplitude * motionFactor
        + Math.sin(t * model.sway) * 7 * motionFactor;

      model.vy += Math.sin(t * 0.19) * dt * 2.2 * motionFactor;
      model.vy = this.clamp(model.vy, -18, 18);

      const angle = this.clamp(model.vy * 0.55 + Math.sin(t * 1.4) * 5 * motionFactor, -14, 14);
      const bob = Math.sin(t * 2.1) * 2.4 * motionFactor;
      this.paint(model, angle, bob);

      const margin = this.mobile.matches ? 110 : 180;
      if (model.x < -margin) {
        model.exitY = model.y;
        this.reset(model, 'left');
        return;
      }
      if (model.x > this.width + margin) {
        model.exitY = model.y;
        this.reset(model, 'right');
        return;
      }
      if (model.y < -margin) {
        model.exitX = model.x;
        this.reset(model, 'top');
        return;
      }
      if (model.y > this.height + margin) {
        model.exitX = model.x;
        this.reset(model, 'bottom');
        return;
      }
    }

    reset(model, side, firstRun = false) {
      const mobileFactor = this.mobile.matches ? 0.68 : 1;
      const reducedFactor = this.reducedMotion.matches ? 0.7 : 1;
      const margin = this.mobile.matches ? 96 : 150;
      const speed = this.random(24, 52) * mobileFactor * reducedFactor;
      const scaleBase = this.mobile.matches ? this.random(0.42, 0.68) : this.random(0.64, 1.05);
      const nearY = model.exitY == null ? this.random(this.height * 0.12, this.height * 0.62) : model.exitY;
      const nearX = model.exitX == null ? this.random(this.width * 0.12, this.width * 0.88) : model.exitX;

      model.exitY = null;
      model.exitX = null;
      model.scale = scaleBase * (model.index === 1 ? 0.92 : 1);
      model.phase = this.random(0, Math.PI * 2);
      model.wave = this.random(0.16, 0.38);
      model.sway = this.random(0.7, 1.28);
      model.amplitude = this.random(16, 44);
      model.hiddenUntil = performance.now() + (firstRun ? this.random(0, 700) : this.random(260, 1200));

      if (side === 'left') {
        model.x = -margin;
        model.baseY = this.clamp(nearY + this.random(-90, 90), this.height * 0.08, this.height * 0.78);
        model.vx = speed;
        model.vy = this.random(-8, 8);
        model.direction = 1;
        return;
      }

      if (side === 'right') {
        model.x = this.width + margin;
        model.baseY = this.clamp(nearY + this.random(-90, 90), this.height * 0.08, this.height * 0.78);
        model.vx = -speed;
        model.vy = this.random(-8, 8);
        model.direction = -1;
        return;
      }

      if (side === 'top') {
        model.x = this.clamp(nearX + this.random(-160, 160), -margin * 0.4, this.width + margin * 0.4);
        model.baseY = -margin;
        model.vx = this.random(-28, 28) || 18;
        model.vy = this.random(10, 24);
        model.direction = model.vx >= 0 ? 1 : -1;
        return;
      }

      model.x = this.clamp(nearX + this.random(-160, 160), -margin * 0.4, this.width + margin * 0.4);
      model.baseY = this.height + margin;
      model.vx = this.random(-28, 28) || -18;
      model.vy = -this.random(10, 24);
      model.direction = model.vx >= 0 ? 1 : -1;
    }

    destroy() {
      if (this.frame) {
        window.cancelAnimationFrame(this.frame);
        this.frame = null;
      }
      if (this.fallbackTimer) {
        window.clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
      }
      window.removeEventListener('resize', this.handleResize);
      this.reducedMotion.removeEventListener('change', this.handleMotionChange);
      this.mobile.removeEventListener('change', this.handleMotionChange);
      if (this.layer) {
        this.layer.remove();
        this.layer = null;
      }
      this.models = [];
    }

    random(min, max) {
      return min + Math.random() * (max - min);
    }

    paint(model, angle, bob) {
      model.element.style.opacity = '1';
      model.element.style.transform = [
        `translate3d(${model.x}px, ${model.y + bob}px, 0)`,
        `scale(${model.scale})`,
        `scaleX(${model.direction})`,
        `rotate(${angle}deg)`
      ].join(' ');
    }

    motionFactor() {
      const mobileFactor = this.mobile.matches ? 0.72 : 1;
      const reducedFactor = this.reducedMotion.matches ? 0.58 : 1;
      return mobileFactor * reducedFactor;
    }

    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  }

  window.ParaglidersAnimation = ParaglidersAnimation;

  const boot = () => {
    const root = document.querySelector('.paragliding-clean-hero');
    if (!root) return;
    new ParaglidersAnimation(root).init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
