// Enhanced virtual octopus logic
const DEFAULT = { hunger: 20, happiness: 50, toys: 0 };
let state = loadState();

// DOM refs
const hungerEl = document.getElementById('hunger');
const happinessEl = document.getElementById('happiness');
const toysEl = document.getElementById('toys');
const hungerBar = document.getElementById('hungerBar');
const happinessBar = document.getElementById('happinessBar');
const feedBtn = document.getElementById('feedBtn');
const toyBtn = document.getElementById('toyBtn');
const resetBtn = document.getElementById('resetBtn');
const chatBtn = document.getElementById('chatBtn');
const chatInput = document.getElementById('chatInput');
const chatLog = document.getElementById('chatLog');
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
  // small chat message
  if(type==='fed') postChatOcto("Mmm... thanks! More please later 😊");
  if(type==='toy') postChatOcto("Yay! Toys are the best — squishy!");
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

// Chat handling
function postChatUser(text){
  const p = document.createElement('div'); p.className='msg user'; p.textContent = 'You: ' + text; chatLog.appendChild(p); chatLog.scrollTop = chatLog.scrollHeight;
}
function postChatOcto(text){
  const p = document.createElement('div'); p.className='msg octo'; p.textContent = 'Octopus: ' + text; chatLog.appendChild(p); chatLog.scrollTop = chatLog.scrollHeight;
}
function postChatSystem(text){
  const p = document.createElement('div'); p.className='msg sys'; p.textContent = text; chatLog.appendChild(p); chatLog.scrollTop = chatLog.scrollHeight;
}

function handleChat(){
  const text = chatInput.value.trim();
  if(!text) return;
  postChatUser(text);
  chatInput.value='';
  // simple NLProc: look for 'joke' or 'funny'
  const lower = text.toLowerCase();
  if(lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')){
    const j = jokes[Math.floor(Math.random()*jokes.length)];
    setTimeout(()=>postChatOcto(j), 600);
    state.happiness = Math.min(100, state.happiness + 4);
    saveState(); render();
    react('chat-joke');
    return;
  }
  // if user says feed or hungry
  if(lower.includes('hungry') || lower.includes('feed')){
    setTimeout(()=>postChatOcto("I could use a snack! Try 'Feed' button."),500);
    return;
  }
  // fallback playful replies
  const replies = [
    "Blub blub! Tell me another thing.",
    "That's interesting — do you have a toy?",
    "I like your hat! (I don't really see hats but I pretend)",
    "Ooh, that makes my tentacles tingle!",
    "You're fun! What else can we talk about?"
  ];
  const r = replies[Math.floor(Math.random()*replies.length)];
  setTimeout(()=>postChatOcto(r), 600);
}

// attach events
feedBtn.addEventListener('click', feed);
toyBtn.addEventListener('click', giveToy);
resetBtn.addEventListener('click', reset);
chatBtn.addEventListener('click', handleChat);
chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') handleChat(); });

// initial render and greeting
render();
postChatSystem('Say hi to your octopus! Try feeding it or asking for a joke (type "joke").');

// small accessibility: focus chat on load
chatInput.focus();
