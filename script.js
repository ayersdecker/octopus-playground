// Enhanced virtual octopus logic with music
const DEFAULT = { hunger: 20, happiness: 50, toys: 0 };
let state = loadState();
let isMuted = false;

// Web Audio API setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;

// Initialize audio on user interaction
function initAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// Note frequencies for a major scale
const noteFrequencies = {
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.00,
  'A4': 440.00,
  'B4': 493.88,
  'C5': 523.25
};

// Play a musical note
function playNote(frequency, duration = 0.3) {
  if (isMuted || !audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  // Envelope for smooth attack and decay
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
}

// DOM refs
const hungerEl = document.getElementById('hunger');
const happinessEl = document.getElementById('happiness');
const toysEl = document.getElementById('toys');
const hungerBar = document.getElementById('hungerBar');
const happinessBar = document.getElementById('happinessBar');
const feedBtn = document.getElementById('feedBtn');
const toyBtn = document.getElementById('toyBtn');
const resetBtn = document.getElementById('resetBtn');
const muteBtn = document.getElementById('muteBtn');
const oct = document.getElementById('octopus');
const bubbles = document.getElementById('bubbles');
const octArea = document.querySelector('.octopus-area');
const octSvg = document.querySelector('.octopus-svg');

// Jokes and responses
const jokes = [
  "Why did the octopus cross the road? To get to the other tide!",
  "What's an octopus's favorite musical instrument? The squeeze-box!",
  "Why are octopuses so smart? They're well-armed for problem solving!",
  "What did one tentacle say to the other? Stop grabbing me!",
  "How do octopuses call each other? With an octo-phone!",
  "What do you call an octopus detective? Sherlock Tentacles!",
  "Why don't octopuses share? They're eight-ful!"
];

function loadState(){
  try{
    const raw = localStorage.getItem('octo-state');
    if(!raw) return {...DEFAULT};
    return {...DEFAULT, ...JSON.parse(raw)};
  }catch(e){
    return {...DEFAULT};
  }
}
function saveState(){
  localStorage.setItem('octo-state', JSON.stringify(state));
}

function render(){
  hungerEl.textContent = Math.round(state.hunger) + '%';
  happinessEl.textContent = Math.round(state.happiness) + '%';
  toysEl.textContent = state.toys;
  // update progress bars
  if(hungerBar) hungerBar.style.width = Math.min(100, Math.max(0, state.hunger)) + '%';
  if(happinessBar) happinessBar.style.width = Math.min(100, Math.max(0, state.happiness)) + '%';
  updateOctColor();
}

function feed(){
  state.hunger = Math.max(0, state.hunger - 15);
  state.happiness = Math.min(100, state.happiness + 8);
  saveState();
  render();
  animateFish();
  react('fed');
}

function giveToy(){
  state.toys += 1;
  state.happiness = Math.min(100, state.happiness + 12);
  saveState();
  render();
  react('toy');
  spawnConfetti();
}

function reset(){
  state = {...DEFAULT};
  saveState();
  render();
  postChatSystem('Octopus is refreshed and ready!');
}

function react(type){
  // add wiggle class briefly and create bubbles
  oct.classList.add('wiggle');
  setTimeout(()=>oct.classList.remove('wiggle'),700);
  if(Math.random()<0.7) spawnBubbles(type);
}

function spawnBubbles(type){
  const count = 2 + (type==='toy'?2:0);
  for(let i=0;i<count;i++){
    const b = document.createElement('div');
    b.className = 'bubble';
    b.style.left = (50 + Math.random()*160) + 'px';
    const size = (8 + Math.random()*22);
    b.style.width = b.style.height = size + 'px';
    bubbles.appendChild(b);
    setTimeout(()=>b.remove(),1700);
  }
}

function animateFish(){
  const fishContainer = document.getElementById('fish-container');
  if(!fishContainer) return;
  fishContainer.classList.remove('swimming');
  // trigger reflow to restart animation
  void fishContainer.offsetWidth;
  fishContainer.classList.add('swimming');
  setTimeout(()=>fishContainer.classList.remove('swimming'), 1250);
}

function spawnConfetti(){
  if(!octArea) return;
  const colors = ['#ffd166','#06d6a0','#ef476f','#118ab2','#f78fb3','#ffd700','#ff69b4'];
  const count = 16;
  for(let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    const size = 6 + Math.random()*12;
    c.style.width = c.style.height = size + 'px';
    c.style.left = (octArea.clientWidth/2 + (Math.random()*140 - 70)) + 'px';
    c.style.top = (octArea.clientHeight/2 + (Math.random()*60 - 30)) + 'px';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.boxShadow = `0 0 ${4+Math.random()*4}px ${colors[Math.floor(Math.random()*colors.length)]}`;
    octArea.appendChild(c);
    // animate using transform
    requestAnimationFrame(()=>{
      c.style.transform = `translateY(-${100 + Math.random()*140}px) translateX(${Math.random()*100-50}px) rotate(${Math.random()*720}deg) scale(${0.5 + Math.random()*0.5})`;
      c.style.opacity = '0';
    });
    setTimeout(()=>c.remove(),950);
  }
}

// small function to change octopus tone by adjusting gradient stops inside SVG
function updateOctColor(){
  const stopA = document.querySelector('#bodyGrad stop:nth-child(1)');
  const stopB = document.querySelector('#bodyGrad stop:nth-child(2)');
  if(!stopA || !stopB) return;
  // happiness 0..100 -> color mapping (happy=pink, neutral=purple, sad=blue)
  const h = state.happiness;
  if(h >= 70){
    stopA.setAttribute('stop-color', '#ffc4f0');
    stopB.setAttribute('stop-color', '#9b5cf5');
  } else if(h >= 40){
    stopA.setAttribute('stop-color', '#b66cf9');
    stopB.setAttribute('stop-color', '#7b3df2');
  } else {
    stopA.setAttribute('stop-color', '#7fb3ff');
    stopB.setAttribute('stop-color', '#4a7bd6');
  }
}

// Eye tracking and reactive pupils
function updatePupils(event){
  const leftPupil = document.querySelector('.left-eye .pupil');
  const rightPupil = document.querySelector('.right-eye .pupil');
  if(!leftPupil || !rightPupil || !octSvg) return;
  
  const rect = octSvg.getBoundingClientRect();
  const octCenterX = rect.left + rect.width / 2;
  const octCenterY = rect.top + rect.height / 2;
  
  const angle = Math.atan2(event.clientY - octCenterY, event.clientX - octCenterX);
  const distance = 2.5; // max offset from center
  
  const offsetX = Math.cos(angle) * distance;
  const offsetY = Math.sin(angle) * distance;
  
  leftPupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  rightPupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

document.addEventListener('mousemove', updatePupils);

// Occasional idle blink
setInterval(()=>{
  const leftPupil = document.querySelector('.left-eye .pupil');
  const rightPupil = document.querySelector('.right-eye .pupil');
  if(leftPupil && rightPupil){
    leftPupil.style.transition = 'all 100ms ease';
    rightPupil.style.transition = 'all 100ms ease';
    leftPupil.style.r = '1';
    rightPupil.style.r = '1';
    setTimeout(()=>{
      leftPupil.style.r = '6.5';
      rightPupil.style.r = '6.5';
    }, 100);
  }
}, 5000);

// Hunger timer: hunger increases slowly every minute (faster for demo)
const HUNGER_INTERVAL_MS = 15 * 1000; // 15s for demo (change to 60000 for 1min)
setInterval(()=>{
  state.hunger = Math.min(100, state.hunger + 3);
  if(state.hunger>70) state.happiness = Math.max(0, state.happiness - 4);
  saveState();
  render();
}, HUNGER_INTERVAL_MS);

// attach events
feedBtn.addEventListener('click', feed);
toyBtn.addEventListener('click', giveToy);
resetBtn.addEventListener('click', reset);

// Mute button toggle
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted', isMuted);
  });
}

// Tentacle click handlers for music
const tentacles = document.querySelectorAll('.tent-clickable');
tentacles.forEach(tent => {
  tent.addEventListener('click', (e) => {
    initAudio(); // Initialize audio context on first interaction
    const note = tent.getAttribute('data-note');
    const frequency = noteFrequencies[note];
    
    if (frequency) {
      playNote(frequency);
      
      // Visual feedback
      tent.classList.add('tent-active');
      setTimeout(() => tent.classList.remove('tent-active'), 300);
      
      // Spawn note visual
      spawnMusicalNote(e);
      
      // Octopus reacts with happiness
      state.happiness = Math.min(100, state.happiness + 2);
      saveState();
      render();
      
      // Small wiggle
      oct.classList.add('wiggle');
      setTimeout(() => oct.classList.remove('wiggle'), 400);
    }
  });
  
  // Make tentacles look interactive
  tent.style.cursor = 'pointer';
});

// Spawn floating musical note visual
function spawnMusicalNote(event) {
  const notes = ['♩', '♪', '♫', '♬'];
  const note = document.createElement('div');
  note.className = 'musical-note';
  note.textContent = notes[Math.floor(Math.random() * notes.length)];
  
  const rect = octArea.getBoundingClientRect();
  note.style.left = (event.clientX - rect.left) + 'px';
  note.style.top = (event.clientY - rect.top) + 'px';
  
  octArea.appendChild(note);
  
  // Animate and remove
  requestAnimationFrame(() => {
    note.style.transform = 'translateY(-80px) scale(1.5)';
    note.style.opacity = '0';
  });
  
  setTimeout(() => note.remove(), 800);
}

// initial render and greeting
render();
