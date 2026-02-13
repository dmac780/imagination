/**
 * Imagination Driver - Home page animation
 * @author: dmac780 <https://github.com/dmac780>
 */

const phase1Videos = [
  '/static/webm/records.webm',
  '/static/webm/matrix.webm',
  '/static/webm/destiny2.webm',
  '/static/webm/space2.webm',
  '/static/webm/canada.webm',
  '/static/webm/vapor.webm',
  '/static/webm/howhigh.webm',
  '/static/webm/tech.webm',
  '/static/webm/skate.webm',
  '/static/webm/standbyme.webm',
  '/static/webm/roger.webm',
];

// Phase 2 uses the same video for all letters
const phase2Video = '/static/webm/space.webm';

const letters   = 'IMAGINATION'.split('');
const container = document.getElementById('imaginationContainer');

// Create a single shared phase 2 video element (hidden, used as source)
const sharedPhase2Video = document.createElement('video');
sharedPhase2Video.id = 'sharedPhase2Video';
sharedPhase2Video.src = phase2Video;
sharedPhase2Video.autoplay = false;
sharedPhase2Video.loop = true;
sharedPhase2Video.muted = true;
sharedPhase2Video.playsInline = true;
sharedPhase2Video.preload = 'none'; // Don't preload until needed
sharedPhase2Video.style.display = 'none';
document.body.appendChild(sharedPhase2Video);


/**
 * Get current theme color
 * @returns {string}
 */
function getThemeColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
}


// Create letter elements
letters.forEach((letter, index) => {
  const box = document.createElement('div');
  box.className = 'letter-box';

  // SVG mask for all elements
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <text
        x="50%"
        y="75%"
        text-anchor="middle"
font-family="monospace, sans-serif"
font-size="280"
        font-weight="900"
        fill="white"
      >${letter}</text>
    </svg>
  `;

  const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  // Create phase 1 video element
  const video1 = document.createElement('video');
  video1.className = 'letter-video phase1-video';
  video1.src = phase1Videos[index];
  video1.autoplay = true;
  video1.loop = true;
  video1.muted = true;
  video1.playsInline = true;
  video1.preload = 'metadata';
  video1.style.webkitMaskImage = `url("${encodedSvg}")`;
  video1.style.maskImage = `url("${encodedSvg}")`;
  video1.style.webkitMaskSize = '100% 100%';
  video1.style.maskSize = '100% 100%';
  video1.style.webkitMaskRepeat = 'no-repeat';
  video1.style.maskRepeat = 'no-repeat';
  video1.style.webkitMaskPosition = 'center';
  video1.style.maskPosition = 'center';

  // Create phase 2 canvas element
  const canvas2 = document.createElement('canvas');
  canvas2.className = 'letter-video phase2-video';
  canvas2.width = 200;
  canvas2.height = 200;
  canvas2.style.display = 'block';
  canvas2.style.opacity = '0';
  canvas2.style.webkitMaskImage = `url("${encodedSvg}")`;
  canvas2.style.maskImage = `url("${encodedSvg}")`;
  canvas2.style.webkitMaskSize = '100% 100%';
  canvas2.style.maskSize = '100% 100%';
  canvas2.style.webkitMaskRepeat = 'no-repeat';
  canvas2.style.maskRepeat = 'no-repeat';
  canvas2.style.webkitMaskPosition = 'center';
  canvas2.style.maskPosition = 'center';

  // Create white text element with same mask
  const textImg = document.createElement('div');
  textImg.className = 'letter-text glitch';
  textImg.setAttribute('data-text', letter);
  textImg.style.display = 'block';
  textImg.style.opacity = '0';
  textImg.style.background = getThemeColor();
  textImg.style.webkitMaskImage = `url("${encodedSvg}")`;
  textImg.style.maskImage = `url("${encodedSvg}")`;
  textImg.style.webkitMaskSize = '100% 100%';
  textImg.style.maskSize = '100% 100%';
  textImg.style.webkitMaskRepeat = 'no-repeat';
  textImg.style.maskRepeat = 'no-repeat';
  textImg.style.webkitMaskPosition = 'center';
  textImg.style.maskPosition = 'center';

  // Create cloud element with same mask
  const cloudImg = document.createElement('img');
  cloudImg.className = 'letter-cloud';
  cloudImg.src = '/static/images/c.webp';
  cloudImg.alt = letter;
  cloudImg.style.display = 'block';
  cloudImg.style.opacity = '0';
  cloudImg.style.webkitMaskImage = `url("${encodedSvg}")`;
  cloudImg.style.maskImage = `url("${encodedSvg}")`;
  cloudImg.style.webkitMaskSize = '100% 100%';
  cloudImg.style.maskSize = '100% 100%';
  cloudImg.style.webkitMaskRepeat = 'no-repeat';
  cloudImg.style.maskRepeat = 'no-repeat';
  cloudImg.style.webkitMaskPosition = 'center';
  cloudImg.style.maskPosition = 'center';

  box.appendChild(video1);
  box.appendChild(canvas2);
  box.appendChild(textImg);
  box.appendChild(cloudImg);
  container.appendChild(box);
});

// Update letter colors when theme changes
function updateLetterColors() {
  const themeColor = getThemeColor();
  document.querySelectorAll('.letter-text').forEach(el => {
    el.style.background = themeColor;
  });
}

// Watch for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-theme') {
      updateLetterColors();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});

// Canvas rendering for shared video
let animationFrameId = null;
function renderSharedVideoToCanvases() {
  const canvases = document.querySelectorAll('.phase2-video');
  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    if (sharedPhase2Video.readyState >= 2) { // HAVE_CURRENT_DATA or better
      ctx.drawImage(sharedPhase2Video, 0, 0, canvas.width, canvas.height);
    }
  });
  
  if (sharedPhase2Video && !sharedPhase2Video.paused) {
    animationFrameId = requestAnimationFrame(renderSharedVideoToCanvases);
  }
}

// Page visibility handling - pause videos when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause all videos when tab is hidden
    document.querySelectorAll('.phase1-video').forEach(video => video.pause());
    sharedPhase2Video.pause();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else {
    // Resume videos when tab is visible again
    AnimationCycle.resumeCurrentPhase();
  }
});


// Animation cycle manager
const AnimationCycle = {
  currentPhase: 0,

  phases: [
    { name: 'phase1', duration: 8000 },      // Phase 1 GIFs - 8s
    { name: 'glitch1', duration: 4000 },     // White text glitching - 4s
    { name: 'phase2', duration: 8000 },      // Phase 2 GIFs - 8s
    { name: 'glitch2', duration: 4000 }      // White text glitching - 4s
  ],
  
  animationFrameId: null,
  phaseStartTime: null,
  accumulatedTime: 0,
  lastFrameTime: null,

  taglineStartTime: 0,
  taglineInitialDelay: 1000,
  taglineCharDelay: 200,
  taglinePauseAfterReveal: 2500,


  /**
   * Initialize the animation cycle
   * @returns {void}
   */
  init() {
    const boxes         = document.querySelectorAll('.letter-box');
    const driverText    = document.querySelector('.driver-text');
    const driverCloud   = document.querySelector('.driver-cloud');
    const driverTagline = document.querySelector('.driver-tagline');
    
    boxes.forEach(box => {
      const video1  = box.querySelector('.phase1-video');
      const canvas2 = box.querySelector('.phase2-video');
      const text    = box.querySelector('.letter-text');
      
      // Start phase 1 videos
      video1.style.opacity = '1';
      video1.play().catch(err => console.log('Video autoplay prevented:', err));
      
      // Keep canvas hidden initially
      canvas2.style.opacity = '0';
      
      text.style.opacity = '0';
    });
    
    driverText.style.opacity = '0';
    driverCloud.classList.add('active');
    driverCloud.style.opacity = '1';
    
    // Initialize tagline with wrapped characters and proper spacing
    const taglineText = 'Moving Ideas Forward';
    driverTagline.innerHTML = taglineText.split('').map(char => 
      char === ' ' ? '<span class="space">&nbsp;&nbsp;&nbsp;&nbsp;</span>' : `<span>${char}</span>`
    ).join('');
    
    this.startCycle();
  },


  /**
   * Start the cycle
   * @returns {void}
   */
  startCycle() {
    this.phaseStartTime  = performance.now();
    this.lastFrameTime   = this.phaseStartTime;
    this.accumulatedTime = 0;
    this.currentPhase    = 0;

    this.updatePhaseVisuals();

    this.animate(this.phaseStartTime);
  },


  /**
   * Animate the cycle
   * @param {number} timestamp
   * @returns {void}
   */
  animate(timestamp) {

    const deltaTime    = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Clamp deltaTime to prevent huge jumps when tab was hidden
    // If delta is > 100ms, assume we were paused and don't accumulate time
    if (deltaTime < 100) {
      this.accumulatedTime += deltaTime;
    }
    
    const phase = this.phases[this.currentPhase];
    
    // Update tagline animation if in phase2
    if (phase.name === 'phase2') {
      this.updateTaglineAnimation(this.accumulatedTime - this.taglineStartTime);
    }
    
    // Check transition to next phase
    if (this.accumulatedTime >= phase.duration) {
      this.accumulatedTime -= phase.duration;    
      this.currentPhase     = (this.currentPhase + 1) % this.phases.length;
      
      // Reset tagline timer when entering phase2
      if (this.phases[this.currentPhase].name === 'phase2') {
        this.taglineStartTime = this.accumulatedTime;
      }
      
      this.updatePhaseVisuals();
    }
    
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  },
  

  /**
   * Update the phase visuals
   * @returns {void}
   */
  updatePhaseVisuals() {
    const phase = this.phases[this.currentPhase];
    
    switch(phase.name) {
      case 'phase1':
        this.showPhase1();
        this.showDriverClouds();
        break;
      case 'glitch1':
        this.showGlitch();
        this.showDriverText();
        break;
      case 'phase2':
        this.showPhase2();
        this.hideDriver();
        break;
      case 'glitch2':
        this.showGlitch();
        this.showDriverFadeIn();
        break;
    }
  },
  
  updateTaglineAnimation(elapsedTime) {
    const driverTagline = document.querySelector('.driver-tagline');
    if (!driverTagline) return;
    
    const chars = driverTagline.querySelectorAll('span');
    
    const totalFadeInTime = chars.length * this.taglineCharDelay;
    const totalAnimationTime = this.taglineInitialDelay + totalFadeInTime + this.taglinePauseAfterReveal;
    
    if (elapsedTime < this.taglineInitialDelay) {
      // Initial delay - all hidden
      chars.forEach(char => char.style.opacity = '0');
    } else if (elapsedTime < this.taglineInitialDelay + totalFadeInTime) {
      // Character fade-in phase
      const fadeInElapsed = elapsedTime - this.taglineInitialDelay;
      chars.forEach((char, index) => {
        const charStartTime = index * this.taglineCharDelay;
        if (fadeInElapsed >= charStartTime) {
          char.style.opacity = '1';
        } else {
          char.style.opacity = '0';
        }
      });
    } else if (elapsedTime < totalAnimationTime) {
      // Pause with all visible
      chars.forEach(char => char.style.opacity = '1');
    } else {
      // Fade out - all hidden
      chars.forEach(char => char.style.opacity = '0');
    }
  },
  
  resumeCurrentPhase() {
    // Resume videos when tab becomes visible again
    const phase = this.phases[this.currentPhase];
    
    // Reset lastFrameTime to prevent huge deltaTime spike
    this.lastFrameTime = performance.now();
    
    switch(phase.name) {
      case 'phase1':
        this.showPhase1();
        break;
      case 'phase2':
        this.showPhase2();
        break;
      case 'glitch1':
      case 'glitch2':
        // Glitch phases don't need video playback
        break;
    }
  },

  showPhase1() {
    const boxes = document.querySelectorAll('.letter-box');
    
    // Stop shared video and rendering
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    sharedPhase2Video.pause();
    
    boxes.forEach(box => {
      const video1 = box.querySelector('.phase1-video');
      const canvas2 = box.querySelector('.phase2-video');
      const text = box.querySelector('.letter-text');
      
      // Ensure phase 1 video is playing (only if page is visible)
      if (video1.paused && !document.hidden) {
        video1.play().catch(err => console.log('Video autoplay prevented:', err));
      }
      
      // Crossfade: show phase1, hide canvas and text
      video1.style.opacity = '1';
      canvas2.style.opacity = '0';
      text.style.opacity = '0';
    });
  },

  showPhase2() {
    const boxes = document.querySelectorAll('.letter-box');
    
    // Start shared video if not playing (only if page is visible)
    if (sharedPhase2Video.paused && !document.hidden) {
      // Load video on first use
      if (sharedPhase2Video.readyState === 0) {
        sharedPhase2Video.load();
      }
      sharedPhase2Video.currentTime = 0; // Reset to start
      sharedPhase2Video.play().then(() => {
        // Start rendering to all canvases
        renderSharedVideoToCanvases();
      }).catch(err => console.log('Video autoplay prevented:', err));
    } else if (!animationFrameId && !document.hidden) {
      renderSharedVideoToCanvases();
    }
    
    boxes.forEach(box => {
      const video1 = box.querySelector('.phase1-video');
      const canvas2 = box.querySelector('.phase2-video');
      const text = box.querySelector('.letter-text');
      
      // Crossfade: show canvas, hide phase1 and text
      video1.style.opacity = '0';
      canvas2.style.opacity = '1';
      text.style.opacity = '0';
    });
  },


  /**
   * Show glitch phase
   * @returns {void}
   */
  showGlitch() {
    const boxes = document.querySelectorAll('.letter-box');
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    sharedPhase2Video.pause();
    
    boxes.forEach(box => {
      const video1  = box.querySelector('.phase1-video');
      const canvas2 = box.querySelector('.phase2-video');
      const text    = box.querySelector('.letter-text');
      
      video1.style.opacity  = '0';
      canvas2.style.opacity = '0';
      text.style.opacity    = '1';
    });
  },
  

  /**
   * Show driver clouds
   * @returns {void}
   */
  showDriverClouds() {
    const driverText  = document.querySelector('.driver-text');
    const driverCloud = document.querySelector('.driver-cloud');
    
    driverText.style.opacity  = '0';
    driverCloud.style.opacity = '1';

    if (!driverCloud.classList.contains('active')) {
      driverCloud.classList.add('active');
    }
  },


  /**
   * Show driver text
   * @returns {void}
   */
  showDriverText() {
    const driverText  = document.querySelector('.driver-text');
    const driverCloud = document.querySelector('.driver-cloud');
    
    driverCloud.style.opacity = '0';
    driverText.style.opacity  = '1';
  },


  /**
   * Hide driver text and cloud
   * @returns {void}
   */
  hideDriver() {
    const driverText    = document.querySelector('.driver-text');
    const driverCloud   = document.querySelector('.driver-cloud');
    const driverTagline = document.querySelector('.driver-tagline');
    
    driverCloud.style.opacity = '0';
    driverText.style.opacity  = '0';
    
    const chars = driverTagline.querySelectorAll('span');
    chars.forEach(char => {
      char.style.opacity = '0';
    });
  },


  /**
   * Show driver text and cloud back in
   * @returns {void}
   */
  showDriverFadeIn() {
    const driverText   = document.querySelector('.driver-text');
    const driverCloud   = document.querySelector('.driver-cloud');
    const driverTagline = document.querySelector('.driver-tagline');
    
    const chars = driverTagline.querySelectorAll('span');
    chars.forEach(char => {
      char.style.opacity = '0';
    });
    
    driverText.style.opacity  = '1';
    driverCloud.style.opacity = '0';
  }
};

AnimationCycle.init();