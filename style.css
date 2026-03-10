'use strict';
// ═══════════════════════════════════════════════════════
//  OIL BUSTER — v7
//  NORMAL: musuh mulai ronde 5, musuh 3 HP, skill [R] roll
//  CHAOS:  musuh dari ronde 1, HP x2, upgrade 6 pilihan,
//          tiap level: pilih 1 + 1 random bonus otomatis
// ═══════════════════════════════════════════════════════

const ROWS = 120, COLS = 180, CS = 4;
const W = COLS * CS, H = ROWS * CS;  // 720 × 480

const BASE_TIME_SEC  = 60;
const BASE_SPREAD_MS = 3500;
const BASE_SPREAD_CH = 0.12;
const CLEAN_SCORE    = 1;
const ENEMY_SCORE    = 10;
const BOSS_SCORE     = 50;
const PLAYER_CELLS   = 6;
const ENEMY_CELLS    = 6;
const BOSS_CELLS     = 14;
const BOSS_HP_BASE   = 20;

// Enemy base HP (both modes start at 3)
const ENEMY_HP_BASE     = 3;
// Chaos: enemy scales every 5 rounds
const CHAOS_HP_PER_5    = 1;     // +1 HP every 5 rounds
const CHAOS_MOV_PER_5   = 0.10;  // +10% move speed every 5 rounds
const CHAOS_ATK_PER_5   = 0.10;  // +10% attack speed every 5 rounds
// Chaos upgrade choices
const CHAOS_UPGRADE_CHOICES = 6;
// Barter: every 3 rounds in chaos
const CHAOS_BARTER_EVERY = 3;

// ─── BARTER PENALTY DATABASE ─────────────────────────
const BARTER_PENALTIES = [
  { id:'penHp',    name:'ARMOR UP',    icon:'🛡', desc:'Semua musuh +1 darah',           color:'#ff2255', apply:(es)=>{ es.chaosHpBonus=(es.chaosHpBonus||0)+1; } },
  { id:'penMov',   name:'TURBO',       icon:'💨', desc:'Musuh gerak +15% lebih cepat',   color:'#ff8800', apply:(es)=>{ es.chaosMovBonus=(es.chaosMovBonus||0)+0.15; } },
  { id:'penShot',  name:'RAPID FIRE',  icon:'🔫', desc:'Musuh tembak +20% lebih cepat',  color:'#ff4444', apply:(es)=>{ es.chaosShotBonus=(es.chaosShotBonus||0)+0.20; } },
  { id:'penSpawn', name:'SWARM',       icon:'🐝', desc:'+1 musuh tambahan per ronde',     color:'#ffaa00', apply:(es)=>{ es.chaosSpawnBonus=(es.chaosSpawnBonus||0)+1; } },
  { id:'penSpread',name:'OIL SURGE',   icon:'🌊', desc:'Oil menyebar +5% lebih cepat',   color:'#cc8800', apply:(es)=>{ es.chaosSpreadBonus=(es.chaosSpreadBonus||0)+0.05; } },
];

// ─── UPGRADE DATABASE ────────────────────────────────
const UPGRADE_DB = [
  { id:'cooldownReduction', name:'FASTER CLEAN',  icon:'⏱', desc:'Cooldown Area Clear -0.2s',   stackable:true,  color:'#4aeeff' },
  { id:'areaExpansion',     name:'WIDER AREA',     icon:'🌊', desc:'Radius Area Clear +2 sel',   stackable:true,  color:'#22ff88' },
  { id:'boostDuration',     name:'LONG BOOST',     icon:'💨', desc:'Durasi Speed Boost +1s',     stackable:true,  color:'#00ccff' },
  { id:'doubleShot',        name:'DOUBLE SHOT',    icon:'🔫', desc:'Tembak 2 peluru paralel',    stackable:false, color:'#ffe347' },
  { id:'tripleShot',        name:'TRIPLE SHOT',    icon:'💥', desc:'3 peluru (butuh Double)',    stackable:false, color:'#ff8c00', requires:'doubleShot' },
  { id:'slowSpread',        name:'CONTAINMENT',    icon:'🛑', desc:'Oil spread -2% per stack',   stackable:true,  color:'#ff2255' },
  { id:'extraHp',           name:'EXTRA HULL',     icon:'❤️', desc:'+1 HP maks & pulih 1 HP',   stackable:true,  color:'#ff5577' },
  { id:'boostCooldown',     name:'NITRO REFUEL',   icon:'⚡', desc:'Boost cooldown -2s',         stackable:true,  color:'#aaddff' },
  { id:'bulletSpeed',       name:'HIGH VELOCITY',  icon:'🎯', desc:'Kecepatan peluru +30%',      stackable:true,  color:'#ffff88' },
  { id:'moveSpeed',         name:'ENGINE UPGRADE', icon:'🚀', desc:'Kecepatan gerak +15%',       stackable:true,  color:'#44ffcc' },
  { id:'rapidFire',         name:'RAPID FIRE',     icon:'🔥', desc:'Cooldown tembak -30%',       stackable:true,  color:'#ff8833' },
  { id:'oilVacuum',         name:'OIL VACUUM',     icon:'🌀', desc:'Cleaning radius player +1',  stackable:true,  color:'#88ccff' },
];

// ─── PIXEL COLORS ─────────────────────────────────────
const PC = {
  waterDeep:'#0d1b4b', waterShallow:'#1a3a7a',
  land:'#4a3520', landLight:'#6b5030',
  oil:'#1a0d00', oilMid:'#3d1a00', oilLight:'#6b3800',
  oilSheen:'#a06010', oilHighlight:'#c07820',
  pHull:'#007a6a', pHullMid:'#009980', pHullLight:'#00c8a8',
  pDeck:'#00ffcc', pCabin:'#d0f0e8', pWindow:'#88eeff',
  pWindowDark:'#226688', pStripe:'#00ffaa', pOutline:'#003322',
  pGun:'#334444', pGunBarrel:'#556666', pWake:'#6cf0ff',
  eHull:'#991122', eHullDark:'#550011', eHullLight:'#cc2244',
  eDeck:'#cc3344', eAccent:'#ff6644', eTurret:'#220008',
  eTurretLight:'#441120', eWindow:'#ff4400', eLight:'#ff8844',
  eOutline:'#330008',
  bCore:'#5500aa', bDark:'#220044', bMid:'#7700cc',
  bGlow:'#dd44ff', bAccent:'#cc44ff', bTurret:'#110022',
  bArmor:'#882299', bDetail:'#ff99ff',
  bPlayer:'#ffee00', bPlayerGlow:'#ffcc00',
  bEnemy:'#ff5522', bBoss:'#ee00ff',
  heal:'#22ff88', healDark:'#008844', healBright:'#88ffcc',
  grid:'#0a1230', wave:'#1e4080', waveLight:'#2855a0', waveFoam:'#4488cc',
};

// ─── UTILS ───────────────────────────────────────────
const $     = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const rand  = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

// ─── BULLET ──────────────────────────────────────────
class Bullet{
  constructor(r,c,dr,dc,isPlayer,speed,isBoss=false){
    this.r=r;this.c=c;this.dr=dr;this.dc=dc;
    this.isPlayer=isPlayer;this.speed=speed;this.isBoss=isBoss;this.alive=true;
  }
  update(){
    this.r+=this.dr*this.speed;this.c+=this.dc*this.speed;
    if(this.r<0||this.r>=ROWS||this.c<0||this.c>=COLS) this.alive=false;
  }
}

class HealOrb{
  constructor(r,c){this.r=r;this.c=c;this.alive=true;this.t=performance.now();}
}

// ══════════════════════════════════════════════════════
//  GAME
// ══════════════════════════════════════════════════════
class Game{
  constructor(mode){
    this.mode   = mode;   // 'normal' | 'chaos'
    this.canvas = $('gc');
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width  = W;
    this.canvas.height = H;

    this.keys   = new Set();
    this.level  = 1;
    this.paused = false;

    this.upgrades = {};
    for(const u of UPGRADE_DB) this.upgrades[u.id]=0;

    // Roll skill state (Normal only)
    this.rollUsedMs  = -999999;
    this.rollCd      = 20000;
    this.rollActive  = false;

    // Chaos bonus pending state
    this._chaosBonusPending = false;
    this._chaosBonusUpgrade = null;

    // Chaos enemy scaling (accumulates via barter + periodic)
    // These are the "enemy stats" object used by _spawnEnemies etc.
    this.enemyStats = {
      chaosHpBonus:     0,  // extra HP added via barter penalty
      chaosMovBonus:    0,  // move speed multiplier bonus (0.1 = 10%)
      chaosShotBonus:   0,  // attack speed multiplier bonus
      chaosSpawnBonus:  0,  // extra enemies per wave
      chaosSpreadBonus: 0,  // extra oil spread chance
    };

    // Barter state
    this._barterPending        = false;
    this._barterChosenUpgrade  = null;
    this._barterChosenPenalty  = null;

    this._buildWaterSnap();
    this._bindInput();
    this._init();
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  // ── Derived stats ────────────────────────────────
  get isChaos()    { return this.mode==='chaos'; }
  get skillCCd()   { return Math.max(2000, 10000 - this.upgrades.cooldownReduction*200); }
  get skillArea()  { return (10+Math.floor((this.level-1)/2)) + this.upgrades.areaExpansion*2 + this.upgrades.oilVacuum; }
  get skillVDur()  { return 3000 + this.upgrades.boostDuration*1000; }
  get skillVCd()   { return Math.max(5000, 15000 - this.upgrades.boostCooldown*2000); }
  get spreadCh()   {
    const base = Math.max(0.01, BASE_SPREAD_CH - this.upgrades.slowSpread*0.02);
    return this.isChaos ? Math.min(0.5, base + (this.enemyStats.chaosSpreadBonus||0)) : base;
  }
  get bulletSpd()  { return 1.8 * (1 + this.upgrades.bulletSpeed*0.3); }
  get movDelay()   { return Math.max(10, Math.round(35 / (1 + this.upgrades.moveSpeed*0.15))); }
  get shootCd()    { return Math.max(80, 250 * (1 - this.upgrades.rapidFire*0.3)); }

  // ── Chaos enemy derived stats ────────────────────
  // Periodic scaling tier (every 5 levels in chaos)
  get chaosTier()      { return this.isChaos ? Math.floor((this.level-1)/5) : 0; }
  // Enemy HP: both modes base = 3 flat; chaos adds tier scaling + barter bonus on top
  get enemyBaseHp()    {
    if(!this.isChaos) return ENEMY_HP_BASE;  // Normal: always 3, no scaling
    return ENEMY_HP_BASE + this.chaosTier*CHAOS_HP_PER_5 + (this.enemyStats.chaosHpBonus||0);
  }
  // Enemy move interval (ms lower = faster). Base 500ms, -10% per tier, - barter bonus
  get enemyMoveInterval() {
    const base = this.isChaos ? 500 : 500;
    const tierBonus = this.chaosTier * CHAOS_MOV_PER_5;
    const barterBonus = this.isChaos ? (this.enemyStats.chaosMovBonus||0) : 0;
    return Math.max(80, Math.round(base / (1 + tierBonus + barterBonus)));
  }
  // Enemy shoot interval (ms). Base 1500/1000, -10% per tier
  get enemyShootInterval() {
    const base = this.isChaos ? 1000 : 1500;
    const tierBonus = this.chaosTier * CHAOS_ATK_PER_5;
    const barterBonus = this.isChaos ? (this.enemyStats.chaosShotBonus||0) : 0;
    return Math.max(250, Math.round(base / (1 + tierBonus + barterBonus)));
  }
  get bossBaseHp()     { return BOSS_HP_BASE*(this.level/10)*(this.isChaos?1.5:1); }
  get enemyStartLevel(){ return this.isChaos?1:5; }
  get upgradeChoiceCount(){ return this.isChaos?CHAOS_UPGRADE_CHOICES:3; }
  // Enemy power level string for HUD
  get enemyPowerLabel(){
    const t=this.chaosTier;
    const extra=[];
    if((this.enemyStats.chaosHpBonus||0)>0) extra.push(`+${this.enemyStats.chaosHpBonus}HP`);
    if((this.enemyStats.chaosMovBonus||0)>0) extra.push(`+${Math.round(this.enemyStats.chaosMovBonus*100)}%MOV`);
    if((this.enemyStats.chaosShotBonus||0)>0) extra.push(`+${Math.round(this.enemyStats.chaosShotBonus*100)}%ATK`);
    if((this.enemyStats.chaosSpawnBonus||0)>0) extra.push(`+${this.enemyStats.chaosSpawnBonus}SPAWN`);
    return `T${t}${extra.length?' ['+extra.join(' ')+']':''}`;
  }

  // ── Build water background ───────────────────────
  _buildWaterSnap(){
    this.land = Array.from({length:ROWS},(_,r)=>
      new Uint8Array(COLS).map((_,c)=>(r===0||r===ROWS-1||c===0||c===COLS-1)?1:0)
    );
    const img=this.ctx.createImageData(W,H);
    const d=img.data;
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const isLand=this.land[r][c];
        const ck=(Math.floor(r/4)+Math.floor(c/4))%2===0;
        let R,G,B;
        if(isLand){R=ck?0x4a:0x5a;G=ck?0x35:0x40;B=ck?0x20:0x28;}
        else{const t=r/ROWS,b=ck?[13,27,75]:[20,40,100];R=Math.round(b[0]+t*8);G=Math.round(b[1]+t*30);B=Math.round(b[2]+t*50);}
        for(let py=r*CS;py<(r+1)*CS;py++)
          for(let px=c*CS;px<(c+1)*CS;px++){const i=(py*W+px)*4;d[i]=R;d[i+1]=G;d[i+2]=B;d[i+3]=255;}
      }
    }
    const gc=document.createElement('canvas');gc.width=W;gc.height=H;
    const gx=gc.getContext('2d');gx.putImageData(img,0,0);
    gx.strokeStyle=PC.grid;gx.lineWidth=1;gx.globalAlpha=0.5;
    for(let r=0;r<=ROWS;r+=4){gx.beginPath();gx.moveTo(0,r*CS);gx.lineTo(W,r*CS);gx.stroke();}
    for(let c=0;c<=COLS;c+=4){gx.beginPath();gx.moveTo(c*CS,0);gx.lineTo(c*CS,H);gx.stroke();}
    gx.globalAlpha=1;
    this.bgSnap=gx.getImageData(0,0,W,H);
  }

  // ── Init level state ─────────────────────────────
  _init(){
    this.grid    = Array.from({length:ROWS},()=>new Uint8Array(COLS));
    this.bullets = [];this.enemies=[];this.orbs=[];this.boss=null;

    this.maxHp = 5+Math.floor((this.level-1)/2)+this.upgrades.extraHp;
    this.hp    = this.maxHp;
    this.score = 0;
    this.gameOver=false;this.paused=false;

    this.pr=Math.floor(ROWS/2);this.pc=Math.floor(COLS/2);
    this.facingDr=-1;this.facingDc=0;

    this.totalTime=BASE_TIME_SEC+(this.level-1)*20;
    this.timeLeft =this.totalTime;
    this.startMs  =performance.now();

    this.lastSpreadMs=performance.now();
    this.enemyMoveMs =performance.now();
    this.lastEShotMs =performance.now();
    this.lastBShotMs =performance.now();
    this.bossMoveMs  =performance.now();
    this.lastShootMs =-999999;

    this.skillCUsedMs=-999999;
    this.skillVUsedMs=-999999;
    this.moveAccMs=0;
    this.waveT=0;
    this.skillCFlashMs=null;
    this._skillCHalf=10;

    this._placeOil();
    this._spawnEnemies();
    this._updateHUD();
    this._updateModeUI();
  }

  _updateModeUI(){
    const modeEl=$('h-mode');
    if(modeEl){
      modeEl.textContent=this.isChaos?'CHAOS':'NORMAL';
      modeEl.className='pill-val'+(this.isChaos?' chaos-mode':'');
    }
    // Show/hide roll skill
    const spR=$('sp-r'),hintR=$('hint-roll');
    if(spR) spR.style.display=this.isChaos?'none':'flex';
    if(hintR) hintR.style.display=this.isChaos?'none':'inline';
  }

  // ── Oil ──────────────────────────────────────────
  _placeOil(){
    for(let i=0;i<this.level;i++){
      let r,c,t=0;
      do{r=rand(2,ROWS-3);c=rand(2,COLS-3);t++;}while(this.grid[r][c]&&t<100);
      this._spillSource(r,c);
    }
  }
  _spillSource(r,c){
    const sz=rand(15,50),stack=[[r,c]],vis=new Set();
    while(stack.length&&vis.size<sz){
      const[rr,cc]=stack.pop();
      if(rr<1||rr>ROWS-2||cc<1||cc>COLS-2) continue;
      const k=rr*COLS+cc;if(vis.has(k))continue;
      this.grid[rr][cc]=1;vis.add(k);
      const ns=shuffle([[rr+1,cc],[rr-1,cc],[rr,cc+1],[rr,cc-1]]);
      for(let i=0;i<rand(1,3);i++)stack.push(ns[i]);
    }
  }
  _anyOil(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c])return true;return false;}
  _oilCount(){let n=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c])n++;return n;}

  // ── Enemies ──────────────────────────────────────
  _spawnEnemies(){
    this.enemies=[];this.boss=null;
    if(this.level%10===0){
      const hp=Math.round(this.bossBaseHp);
      this.boss={r:rand(15,ROWS-15-BOSS_CELLS),c:rand(15,COLS-15-BOSS_CELLS),
        hp,maxHp:hp,phase:0,facingDr:1,facingDc:0};
      return;
    }
    if(this.level<this.enemyStartLevel) return;
    // Base enemy count
    let n = this.level===this.enemyStartLevel
      ? 1
      : Math.max(1, Math.floor((this.level-this.enemyStartLevel+1)/2) + (this.isChaos?1:0));
    // Barter spawn bonus
    n += (this.isChaos ? (this.enemyStats.chaosSpawnBonus||0) : 0);
    const ehp=this.enemyBaseHp;
    for(let i=0;i<n;i++)
      this.enemies.push({r:rand(8,ROWS-8-ENEMY_CELLS),c:rand(8,COLS-8-ENEMY_CELLS),
        hp:ehp,maxHp:ehp,facingDr:1,facingDc:0});
  }

  // ── Input ─────────────────────────────────────────
  _bindInput(){
    document.addEventListener('keydown',e=>{
      if(this.paused) return;
      this.keys.add(e.key);
      if((e.key==='c'||e.key==='C')&&!this.gameOver) this._skillC();
      if((e.key==='v'||e.key==='V')&&!this.gameOver) this._skillV();
      if((e.key==='r'||e.key==='R')&&!this.gameOver&&!this.isChaos) this._skillRoll();
      if(e.key===' '){e.preventDefault();if(!this.gameOver)this._shoot();}
    });
    document.addEventListener('keyup',e=>this.keys.delete(e.key));
    $('btn-restart')?.addEventListener('click',()=>this.restart());
    $('btn-menu')?.addEventListener('click',()=>this.backToMenu());
    $('btn-chaos-claim')?.addEventListener('click',()=>this._claimChaosBonus());
    $('barter-confirm')?.addEventListener('click',()=>this._barterConfirm());
  }
  _getDir(){
    if(this.keys.has('ArrowUp')  ||this.keys.has('w'))return[-1,0];
    if(this.keys.has('ArrowDown')||this.keys.has('s'))return[1,0];
    if(this.keys.has('ArrowLeft')||this.keys.has('a'))return[0,-1];
    if(this.keys.has('ArrowRight')||this.keys.has('d'))return[0,1];
    return null;
  }

  // ── Move ─────────────────────────────────────────
  _processMove(dt){
    if(this.gameOver||this.paused) return;
    const now=performance.now();
    const boosted=now-this.skillVUsedMs<this.skillVDur;
    const delay=boosted?Math.round(this.movDelay*0.35):this.movDelay;
    this.moveAccMs+=dt;
    if(this.moveAccMs<delay) return;
    this.moveAccMs=0;
    const dir=this._getDir();if(!dir)return;
    this.facingDr=dir[0];this.facingDc=dir[1];
    this.pr=clamp(this.pr+dir[0],1,ROWS-1-PLAYER_CELLS);
    this.pc=clamp(this.pc+dir[1],1,COLS-1-PLAYER_CELLS);
    const cl=this._cleanArea(this.pr,this.pc,PLAYER_CELLS+(this.upgrades.oilVacuum||0));
    if(cl){this.score+=cl*CLEAN_SCORE;if(!this._anyOil())this._nextLevel();}
    this._pickOrbs();
  }
  _cleanArea(row,col,size){
    let n=0;
    for(let r=row;r<row+size;r++)
      for(let c=col;c<col+size;c++)
        if(r>0&&r<ROWS-1&&c>0&&c<COLS-1&&this.grid[r][c]){this.grid[r][c]=0;n++;}
    return n;
  }

  // ── Skills ───────────────────────────────────────
  _skillC(){
    const now=performance.now();
    if(now-this.skillCUsedMs<this.skillCCd) return;
    this.skillCUsedMs=now;
    const half=this.skillArea;
    const cr=this.pr+Math.floor(PLAYER_CELLS/2);
    const cc=this.pc+Math.floor(PLAYER_CELLS/2);
    let n=0;
    for(let r=cr-half;r<cr+half;r++)
      for(let c=cc-half;c<cc+half;c++)
        if(r>0&&r<ROWS-1&&c>0&&c<COLS-1&&this.grid[r][c]){this.grid[r][c]=0;n++;}
    if(n){this.score+=n*CLEAN_SCORE;if(!this._anyOil())this._nextLevel();}
    this.skillCFlashMs=now;this._skillCHalf=half;
  }
  _skillV(){
    const now=performance.now();
    if(now-this.skillVUsedMs<this.skillVCd) return;
    this.skillVUsedMs=now;
  }
  // Roll: randomize/swap skill C and V effects temporarily
  _skillRoll(){
    if(this.isChaos) return;
    const now=performance.now();
    if(now-this.rollUsedMs<this.rollCd) return;
    this.rollUsedMs=now;
    // Effect: instantly reset both skill cooldowns
    this.skillCUsedMs=-999999;
    this.skillVUsedMs=-999999;
    // And give a short area-clear burst at current position as bonus
    this._skillC();
    showToast('🎲 ROLL! SKILLS RESET!');
  }

  // ── Shoot ─────────────────────────────────────────
  _shoot(){
    const now=performance.now();
    if(now-this.lastShootMs<this.shootCd) return;
    this.lastShootMs=now;
    const dir=this._getDir()||[this.facingDr,this.facingDc]||[-1,0];
    const cr=this.pr+Math.floor(PLAYER_CELLS/2);
    const cc=this.pc+Math.floor(PLAYER_CELLS/2);
    const sp=this.bulletSpd;
    const count=this.upgrades.tripleShot>=1?3:this.upgrades.doubleShot>=1?2:1;
    if(count===1){
      this.bullets.push(new Bullet(cr,cc,dir[0],dir[1],true,sp));
    } else if(count===2){
      const p=[-dir[1],dir[0]];
      this.bullets.push(new Bullet(cr+p[0]*1.5,cc+p[1]*1.5,dir[0],dir[1],true,sp));
      this.bullets.push(new Bullet(cr-p[0]*1.5,cc-p[1]*1.5,dir[0],dir[1],true,sp));
    } else {
      this.bullets.push(new Bullet(cr,cc,dir[0],dir[1],true,sp));
      const ang=Math.atan2(dir[0],dir[1]);
      for(const da of[-0.22,0.22])
        this.bullets.push(new Bullet(cr,cc,Math.sin(ang+da),Math.cos(ang+da),true,sp));
    }
  }
  _enemyShoot(now){
    if(!this.enemies.length||this.gameOver||this.paused) return;
    if(now-this.lastEShotMs<this.enemyShootInterval) return;
    this.lastEShotMs=now;
    for(const e of this.enemies){
      const dR=this.pr-e.r,dC=this.pc-e.c;
      let dr=0,dc=0;
      if(Math.abs(dR)>=Math.abs(dC))dr=Math.sign(dR);else dc=Math.sign(dC);
      if(!dr&&!dc)dr=1;
      this.bullets.push(new Bullet(e.r+Math.floor(ENEMY_CELLS/2),e.c+Math.floor(ENEMY_CELLS/2),dr,dc,false,1.1));
      // Chaos level 5+: spread shots
      if(this.isChaos&&this.level>=5){
        const ang=Math.atan2(dR,dC);
        for(const da of[-0.25,0.25])
          this.bullets.push(new Bullet(e.r+Math.floor(ENEMY_CELLS/2),e.c+Math.floor(ENEMY_CELLS/2),
            Math.sin(ang+da),Math.cos(ang+da),false,1.0));
      }
    }
  }
  _bossShoot(now){
    if(!this.boss||this.gameOver||this.paused) return;
    if(now-this.lastBShotMs<(this.isChaos?600:800)) return;
    this.lastBShotMs=now;
    const b=this.boss;
    const cr=b.r+Math.floor(BOSS_CELLS/2),cc=b.c+Math.floor(BOSS_CELLS/2);
    const ang=Math.atan2(this.pr-b.r,this.pc-b.c);
    const spread=this.isChaos?[-0.4,-0.2,0,0.2,0.4]:[-0.3,0,0.3];
    for(const da of spread)
      this.bullets.push(new Bullet(cr,cc,Math.sin(ang+da),Math.cos(ang+da),false,1.4,true));
  }

  // ── Bullet update ────────────────────────────────
  _updateBullets(){
    for(const b of this.bullets){
      if(!b.alive)continue;
      b.update();
      const r=Math.floor(b.r),c=Math.floor(b.c);
      if(r<0||r>=ROWS||c<0||c>=COLS){b.alive=false;continue;}
      if(b.isPlayer){
        if(this.grid[r][c]){this.grid[r][c]=0;this.score+=CLEAN_SCORE;}
        // Hit enemy
        for(let i=this.enemies.length-1;i>=0;i--){
          const e=this.enemies[i];
          if(r>=e.r&&r<e.r+ENEMY_CELLS&&c>=e.c&&c<e.c+ENEMY_CELLS){
            e.hp--;b.alive=false;
            if(e.hp<=0){
              this.enemies.splice(i,1);this.score+=ENEMY_SCORE;
              this.orbs.push(new HealOrb(e.r+Math.floor(ENEMY_CELLS/2),e.c+Math.floor(ENEMY_CELLS/2)));
            }
            break;
          }
        }
        // Hit boss
        if(b.alive&&this.boss){
          const bs=this.boss;
          if(r>=bs.r&&r<bs.r+BOSS_CELLS&&c>=bs.c&&c<bs.c+BOSS_CELLS){
            bs.hp--;b.alive=false;
            if(bs.hp<=0){
              this.score+=BOSS_SCORE;
              this.orbs.push(new HealOrb(bs.r+BOSS_CELLS/2,bs.c+BOSS_CELLS/2-1));
              this.orbs.push(new HealOrb(bs.r+BOSS_CELLS/2,bs.c+BOSS_CELLS/2+1));
              this.boss=null;
              if(!this._anyOil())this._nextLevel();
            }
          }
        }
      } else {
        if(r>=this.pr&&r<this.pr+PLAYER_CELLS&&c>=this.pc&&c<this.pc+PLAYER_CELLS){
          b.alive=false;this.hp--;this._flashDmg();
          if(this.hp<=0){this.hp=0;this.gameOver=true;}
        }
      }
    }
    this.bullets=this.bullets.filter(b=>b.alive);
    const now=performance.now();
    this.orbs=this.orbs.filter(o=>o.alive&&now-o.t<8000);
  }
  _pickOrbs(){
    const cr=this.pr+Math.floor(PLAYER_CELLS/2),cc=this.pc+Math.floor(PLAYER_CELLS/2);
    for(const o of this.orbs){
      if(!o.alive)continue;
      if(Math.abs(cr-o.r)<=3&&Math.abs(cc-o.c)<=3){o.alive=false;this.hp=Math.min(this.maxHp,this.hp+1);}
    }
  }

  // ── Enemy update ─────────────────────────────────
  _updateEnemies(now){
    if(this.gameOver||this.paused)return;
    if(this.enemies.length&&now-this.enemyMoveMs>this.enemyMoveInterval){
      this.enemyMoveMs=now;
      for(const e of this.enemies){
        const pr=e.r,pc=e.c;
        if(e.r<this.pr)e.r++;else if(e.r>this.pr)e.r--;
        if(e.c<this.pc)e.c++;else if(e.c>this.pc)e.c--;
        e.r=clamp(e.r,1,ROWS-1-ENEMY_CELLS);e.c=clamp(e.c,1,COLS-1-ENEMY_CELLS);
        const dr=e.r-pr,dc=e.c-pc;
        if(dr||dc){e.facingDr=dr;e.facingDc=dc;}
      }
    }
    if(this.boss&&now-this.bossMoveMs>600){
      this.bossMoveMs=now;const b=this.boss;
      const pr=b.r,pc=b.c;
      if(b.r<this.pr)b.r++;else if(b.r>this.pr)b.r--;
      if(b.c<this.pc)b.c++;else if(b.c>this.pc)b.c--;
      b.r=clamp(b.r,1,ROWS-1-BOSS_CELLS);b.c=clamp(b.c,1,COLS-1-BOSS_CELLS);
      const dr=b.r-pr,dc=b.c-pc;
      if(dr||dc){b.facingDr=dr;b.facingDc=dc;}
      b.phase=(b.phase||0)+0.08;
    }
  }

  // ── Oil spread ───────────────────────────────────
  _spreadOil(now){
    if(this.paused||now-this.lastSpreadMs<BASE_SPREAD_MS)return;
    this.lastSpreadMs=now;
    const ch=this.spreadCh,oil=[];
    for(let r=1;r<ROWS-1;r++)
      for(let c=1;c<COLS-1;c++){
        if(!this.grid[r][c])continue;
        for(const[nr,nc]of[[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]])
          if(nr>0&&nr<ROWS-1&&nc>0&&nc<COLS-1&&!this.grid[nr][nc]&&Math.random()<ch)
            oil.push([nr,nc]);
      }
    for(const[nr,nc]of oil)this.grid[nr][nc]=1;
  }

  // ── Next Level ───────────────────────────────────
  _nextLevel(){
    this.level++;
    const newMax=5+Math.floor((this.level-1)/2)+this.upgrades.extraHp;
    if(newMax>this.maxHp){const d=newMax-this.maxHp;this.maxHp=newMax;this.hp=Math.min(this.maxHp,this.hp+d);}
    this.totalTime=BASE_TIME_SEC+(this.level-1)*20;
    this.startMs=performance.now();
    this._placeOil();
    this._spawnEnemies();

    if(this.isChaos){
      // Every 3 rounds: barter (takes priority over upgrade)
      if(this.level%CHAOS_BARTER_EVERY===0){
        this.paused=true;
        this._showBarterMenu();
      } else {
        // Every other level: upgrade
        this.paused=true;
        this._showUpgradeMenu();
      }
    } else {
      // Normal: upgrade every 2 levels
      const doUpgrade=this.level>=2&&this.level%2===0;
      if(doUpgrade){this.paused=true;this._showUpgradeMenu();}
      else showLevelFlash(this.level, false);
    }
  }

  // ── Time ─────────────────────────────────────────
  _updateTime(now){
    if(this.gameOver||this.paused)return;
    this.timeLeft=Math.max(0,this.totalTime-(now-this.startMs)/1000);
    if(this.timeLeft<=0)this.gameOver=true;
  }

  // ══════════════════════════════════════════════════
  //  UPGRADE SYSTEM
  // ══════════════════════════════════════════════════
  _getUpgradePool(){
    return UPGRADE_DB.filter(u=>{
      if(!u.stackable&&this.upgrades[u.id]>=1)return false;
      if(u.requires&&this.upgrades[u.requires]<1)return false;
      return true;
    });
  }
  _getUpgradeChoices(n){
    return shuffle([...this._getUpgradePool()]).slice(0,Math.min(n,this._getUpgradePool().length));
  }
  _applyUpgrade(id){
    this.upgrades[id]=(this.upgrades[id]||0)+1;
    if(id==='extraHp'){this.maxHp++;this.hp=Math.min(this.maxHp,this.hp+1);}
  }

  _showUpgradeMenu(){
    const choices=this._getUpgradeChoices(this.upgradeChoiceCount);
    if(!choices.length){this.paused=false;showLevelFlash(this.level,this.isChaos);return;}

    const box=$('upgrade-cards');
    box.innerHTML='';
    $('upgrade-title').textContent='UPGRADE!';
    $('upgrade-sub').textContent=this.isChaos
      ?`CHAOS LVL ${this.level} — PILIH 1 + 1 BONUS RANDOM`
      :`LEVEL ${this.level} — PILIH 1 PERK`;

    // Hide chaos bonus section initially
    const bonusWrap=$('chaos-bonus-wrap');
    if(bonusWrap) bonusWrap.classList.add('hidden');

    choices.forEach(u=>{
      const cnt=this.upgrades[u.id];
      const card=document.createElement('div');
      card.className='upg-card';
      card.style.setProperty('--card-color',u.color);
      card.innerHTML=`
        <div class="upg-icon">${u.icon}</div>
        <div class="upg-name">${u.name}${u.stackable&&cnt>0?`<span class="upg-stack">×${cnt+1}</span>`:''}</div>
        <div class="upg-desc">${u.desc}</div>
        ${u.stackable?'<div class="upg-tag">STACKABLE</div>':'<div class="upg-tag one">1×</div>'}
      `;
      card.addEventListener('click',()=>{
        this._applyUpgrade(u.id);
        // Disable all cards
        box.querySelectorAll('.upg-card').forEach(c=>c.style.pointerEvents='none');
        box.querySelectorAll('.upg-card').forEach(c=>c.style.opacity='0.4');
        card.style.opacity='1';
        card.style.boxShadow=`6px 6px 0 ${u.color}`;

        if(this.isChaos){
          // Show chaos bonus
          this._showChaosBonus();
        } else {
          this._closeUpgradeMenu();
        }
      });
      box.appendChild(card);
    });

    $('upgrade-overlay').classList.remove('hidden');
  }

  _showChaosBonus(){
    // Pick a random upgrade different from what player just picked
    const pool=this._getUpgradePool();
    if(!pool.length){this._closeUpgradeMenu();return;}
    const bonus=shuffle([...pool])[0];
    this._chaosBonusUpgrade=bonus;

    const bonusWrap=$('chaos-bonus-wrap');
    const bonusCard=$('chaos-bonus-card');
    bonusCard.innerHTML='';

    const cnt=this.upgrades[bonus.id];
    const card=document.createElement('div');
    card.className='upg-card bonus';
    card.style.setProperty('--card-color','#ff2255');
    card.innerHTML=`
      <div class="upg-icon">${bonus.icon}</div>
      <div class="upg-name">${bonus.name}${bonus.stackable&&cnt>0?`<span class="upg-stack">×${cnt+1}</span>`:''}</div>
      <div class="upg-desc">${bonus.desc}</div>
      <div class="upg-tag" style="border-color:#ff2255;color:#ff2255">🎲 RANDOM BONUS</div>
    `;
    bonusCard.appendChild(card);
    bonusWrap.classList.remove('hidden');
    // animate reveal after short delay
    setTimeout(()=>card.classList.add('revealed'),100);
  }

  _claimChaosBonus(){
    if(this._chaosBonusUpgrade){
      this._applyUpgrade(this._chaosBonusUpgrade.id);
      this._chaosBonusUpgrade=null;
    }
    this._closeUpgradeMenu();
  }

  // ══════════════════════════════════════════════════
  //  BARTER SYSTEM (Chaos, every 3 rounds)
  // ══════════════════════════════════════════════════
  _showBarterMenu(){
    this._barterChosenUpgrade = null;
    this._barterChosenPenalty = null;

    $('barter-round').textContent = this.level;

    // Reset to step 0
    $('barter-step-0').classList.remove('hidden');
    $('barter-step-1').classList.add('hidden');
    $('barter-step-2').classList.add('hidden');
    const confirmBtn = $('barter-confirm');
    if(confirmBtn) confirmBtn.style.display='none';

    // Wire step-0 buttons (re-assign each time to avoid duplicate listeners)
    const skipBtn  = $('barter-do-skip');
    const takeBtn  = $('barter-do-take');
    const newSkip  = skipBtn.cloneNode(true);
    const newTake  = takeBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);
    takeBtn.parentNode.replaceChild(newTake, takeBtn);

    newSkip.addEventListener('click', ()=> this._barterSkip());
    newTake.addEventListener('click', ()=> this._barterShowStep1());

    $('barter-overlay').classList.remove('hidden');
  }

  _barterShowStep1(){
    $('barter-step-0').classList.add('hidden');
    $('barter-step-1').classList.remove('hidden');

    const upgPool = this._getUpgradeChoices(3);
    const upgContainer = $('barter-upgrade-cards');
    upgContainer.innerHTML = '';

    if(!upgPool.length){
      // No upgrades available — auto-skip
      this._barterSkip(); return;
    }

    upgPool.forEach(u=>{
      const cnt = this.upgrades[u.id];
      const card = document.createElement('div');
      card.className = 'barter-upg-card';
      card.style.setProperty('--card-color', u.color);
      card.innerHTML = `
        <div class="upg-icon">${u.icon}</div>
        <div class="upg-name" style="font-size:8px">${u.name}${u.stackable&&cnt>0?`<span class="upg-stack">×${cnt+1}</span>`:''}</div>
        <div class="upg-desc">${u.desc}</div>
        ${u.stackable?'<div class="upg-tag">STACKABLE</div>':'<div class="upg-tag one">1×</div>'}
      `;
      card.addEventListener('click', ()=>{
        upgContainer.querySelectorAll('.barter-upg-card').forEach(c=>c.classList.remove('selected'));
        card.classList.add('selected');
        this._barterChosenUpgrade = u;
        this._barterShowStep2();
      });
      upgContainer.appendChild(card);
    });
  }

  _barterShowStep2(){
    $('barter-step-2').classList.remove('hidden');

    const penPool = shuffle([...BARTER_PENALTIES]).slice(0,3);
    const penContainer = $('barter-penalty-cards');
    penContainer.innerHTML = '';

    penPool.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'barter-pen-card';
      card.style.setProperty('--pen-color', p.color);
      const curVal = this._getPenaltyCurrentStr(p.id);
      card.innerHTML = `
        <div class="upg-icon">${p.icon}</div>
        <div class="barter-pen-name">${p.name}</div>
        <div class="barter-pen-desc">${p.desc}</div>
        <div class="barter-pen-cur">${curVal}</div>
      `;
      card.addEventListener('click', ()=>{
        penContainer.querySelectorAll('.barter-pen-card').forEach(c=>c.classList.remove('selected'));
        card.classList.add('selected');
        this._barterChosenPenalty = p;
        const btn = $('barter-confirm');
        if(btn) btn.style.display = 'block';
      });
      penContainer.appendChild(card);
    });
  }

  _getPenaltyCurrentStr(id){
    const es = this.enemyStats;
    if(id==='penHp')    return `HP musuh: ${this.enemyBaseHp} → ${this.enemyBaseHp+1}`;
    if(id==='penMov')   return `Mov bonus: +${Math.round((es.chaosMovBonus||0)*100)}% → +${Math.round(((es.chaosMovBonus||0)+0.15)*100)}%`;
    if(id==='penShot')  return `Atk bonus: +${Math.round((es.chaosShotBonus||0)*100)}% → +${Math.round(((es.chaosShotBonus||0)+0.20)*100)}%`;
    if(id==='penSpawn') return `Spawn bonus: +${es.chaosSpawnBonus||0} → +${(es.chaosSpawnBonus||0)+1}`;
    if(id==='penSpread')return `Oil spread: +${Math.round((es.chaosSpreadBonus||0)*100)}% → +${Math.round(((es.chaosSpreadBonus||0)+0.05)*100)}%`;
    return '';
  }

  _barterSkip(){
    $('barter-overlay').classList.add('hidden');
    this.paused=false;
    this.startMs=performance.now();
    showLevelFlash(this.level, true);
    showToast('🛡 SKIP — Musuh tetap sama');
    this._updateHUD();
  }

  _barterConfirm(){
    if(!this._barterChosenUpgrade||!this._barterChosenPenalty) return;
    this._applyUpgrade(this._barterChosenUpgrade.id);
    this._barterChosenPenalty.apply(this.enemyStats);
    // Re-spawn current level enemies with updated stats
    if(this.level>=this.enemyStartLevel && this.level%10!==0){
      const ehp=this.enemyBaseHp;
      this.enemies.forEach(e=>{e.maxHp=ehp; e.hp=Math.min(e.hp,ehp);});
    }
    $('barter-overlay').classList.add('hidden');
    this._barterChosenUpgrade=null;
    this._barterChosenPenalty=null;
    this.paused=false;
    this.startMs=performance.now();
    showLevelFlash(this.level, true);
    showToast('⚔ BARTER! Musuh makin kuat!');
    this._updateHUD();
  }

  _closeUpgradeMenu(){
    $('upgrade-overlay').classList.add('hidden');
    this.paused=false;
    this.startMs=performance.now();
    showLevelFlash(this.level,this.isChaos);
    this._updateHUD();
  }

  // ── HUD ──────────────────────────────────────────
  _updateHUD(){
    $('h-level').textContent=this.level;
    $('h-score').textContent=this.score;
    $('h-time').textContent=Math.ceil(this.timeLeft);
    $('h-oil').textContent=this._oilCount();

    const hpEl=$('h-hp');
    if(hpEl){
      hpEl.innerHTML='';
      for(let i=0;i<this.maxHp;i++){
        const d=document.createElement('div');
        d.className='hp-px'+(i<this.hp?'':' empty');
        hpEl.appendChild(d);
      }
    }

    const now=performance.now();

    // Skill C
    const cdC=this.skillCCd-(now-this.skillCUsedMs);
    const pC=cdC<=0?1:1-cdC/this.skillCCd;
    const bC=$('skill-bar'),lC=$('skill-label'),spC=$('sp-c');
    if(bC){bC.style.width=`${pC*100}%`;bC.classList.toggle('cd',cdC>0);}
    if(spC)spC.classList.toggle('cd',cdC>0);
    if(lC){
      lC.classList.toggle('cd',cdC>0);
      const d=this.skillArea*2;
      lC.textContent=cdC<=0?`AREA ${d}x${d} READY!`:`AREA CLEAR ${Math.ceil(cdC/1000)}s`;
    }

    // Skill V
    const cdV=this.skillVCd-(now-this.skillVUsedMs);
    const pV=cdV<=0?1:1-cdV/this.skillVCd;
    const boosted=now-this.skillVUsedMs<this.skillVDur;
    const bV=$('skill-bar-v'),lV=$('skill-label-v'),spV=$('sp-v');
    if(bV){bV.style.width=`${pV*100}%`;bV.classList.toggle('cd',cdV>0&&!boosted);bV.classList.toggle('active',boosted);}
    if(spV)spV.classList.toggle('cd',cdV>0&&!boosted);
    if(lV){
      lV.classList.toggle('cd',cdV>0&&!boosted);lV.classList.toggle('active',boosted);
      if(boosted)lV.textContent=`BOOSTING! ${Math.ceil((this.skillVDur-(now-this.skillVUsedMs))/1000)}s`;
      else if(cdV<=0)lV.textContent='SPEED BOOST READY!';
      else lV.textContent=`BOOST ${Math.ceil(cdV/1000)}s`;
    }

    // Roll skill (Normal only)
    if(!this.isChaos){
      const cdR=this.rollCd-(now-this.rollUsedMs);
      const pR=cdR<=0?1:1-cdR/this.rollCd;
      const bR=$('skill-bar-r'),lR=$('skill-label-r');
      if(bR){bR.style.width=`${pR*100}%`;}
      if(lR)lR.textContent=cdR<=0?'ROLL READY!': `ROLL ${Math.ceil(cdR/1000)}s`;
    }

    // Chaos enemy power pill
    const cpPill=$('chaos-power-pill');
    const cpVal=$('h-enemy-pwr');
    if(cpPill){
      cpPill.style.display=this.isChaos?'flex':'none';
      if(cpVal) cpVal.textContent=this.enemyPowerLabel;
    }
    const bw=$('boss-hp-wrap');
    if(bw){
      bw.style.display=this.boss?'flex':'none';
      if(this.boss){
        $('boss-hp-bar').style.width=`${(this.boss.hp/this.boss.maxHp)*100}%`;
        $('boss-hp-text').textContent=`${this.boss.hp}/${this.boss.maxHp}`;
      }
    }

    // Upgrade badges
    const bdg=$('upgrade-badges');
    if(bdg){
      bdg.innerHTML='';
      for(const[id,cnt]of Object.entries(this.upgrades)){
        if(cnt<=0)continue;
        const u=UPGRADE_DB.find(x=>x.id===id);if(!u)continue;
        const b=document.createElement('div');
        b.className='upg-badge';
        b.style.borderColor=u.color;b.style.color=u.color;
        b.title=u.name;b.textContent=cnt>1?`${u.icon}x${cnt}`:u.icon;
        bdg.appendChild(b);
      }
    }
  }

  // ══════════════════════════════════════════════════
  //  DRAW
  // ══════════════════════════════════════════════════
  _draw(now){
    const ctx=this.ctx;
    ctx.putImageData(this.bgSnap,0,0);

    // Wave lines
    this.waveT+=0.02;
    ctx.fillStyle=PC.waveFoam;ctx.globalAlpha=0.1;
    for(let r=3;r<ROWS-1;r+=6){
      const shift=Math.round(Math.sin(this.waveT+r*0.25)*3);
      for(let c=1;c<COLS-1;c++)
        if(!this.land[r][c]) ctx.fillRect((c*CS)+shift,r*CS,CS*2,1);
    }
    ctx.globalAlpha=1;

    // Oil
    ctx.fillStyle=PC.oil;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(this.grid[r][c]) ctx.fillRect(c*CS,r*CS,CS,CS);
    ctx.fillStyle=PC.oilMid;
    for(let r=1;r<ROWS;r++) for(let c=0;c<COLS;c++) if(this.grid[r][c]&&!this.grid[r-1]?.[c]) ctx.fillRect(c*CS,r*CS,CS,2);
    ctx.fillStyle=PC.oilHighlight;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(this.grid[r][c]&&(r*7+c*3)%13===0) ctx.fillRect(c*CS+1,r*CS+1,CS-2,CS-2);

    // Skill C flash
    if(this.skillCFlashMs){
      const age=now-this.skillCFlashMs;
      if(age<500){
        const a=(1-age/500)*0.45;
        const half=this._skillCHalf;
        const cr=this.pr+PLAYER_CELLS/2,cc=this.pc+PLAYER_CELLS/2;
        ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#22ff88';
        ctx.fillRect((cc-half)*CS,(cr-half)*CS,half*2*CS,half*2*CS);
        ctx.globalAlpha=Math.min(1,a*3);ctx.strokeStyle='#22ff88';ctx.lineWidth=2;
        ctx.setLineDash([4,4]);ctx.strokeRect((cc-half)*CS,(cr-half)*CS,half*2*CS,half*2*CS);
        ctx.setLineDash([]);ctx.restore();
      } else this.skillCFlashMs=null;
    }

    // Heal orbs
    for(const o of this.orbs){
      if(!o.alive)continue;
      const pulse=Math.floor((now-o.t)/200)%2===0;
      const x=o.c*CS-CS,y=o.r*CS-CS;
      ctx.fillStyle=pulse?PC.healBright:PC.heal;
      ctx.fillRect(x+CS,y,CS,CS*3);ctx.fillRect(x,y+CS,CS*3,CS);
      ctx.fillStyle='#ffffff';ctx.fillRect(x+CS,y+CS,CS,CS);
    }

    // Bullets
    for(const b of this.bullets){
      if(b.isPlayer){
        ctx.fillStyle=PC.bPlayer;
        const bx=Math.floor(b.c)*CS,by=Math.floor(b.r)*CS;
        const isVert=Math.abs(b.dr)>Math.abs(b.dc);
        if(isVert)ctx.fillRect(bx+1,by,CS-2,CS*2);else ctx.fillRect(bx,by+1,CS*2,CS-2);
        ctx.fillStyle=PC.bPlayerGlow;ctx.fillRect(bx+1,by+1,2,2);
      } else if(b.isBoss){
        ctx.fillStyle=PC.bBoss;ctx.fillRect(Math.floor(b.c)*CS-1,Math.floor(b.r)*CS-1,CS+2,CS+2);
        ctx.fillStyle='#ff88ff';ctx.fillRect(Math.floor(b.c)*CS,Math.floor(b.r)*CS,CS,CS);
      } else {
        ctx.fillStyle=PC.bEnemy;ctx.fillRect(Math.floor(b.c)*CS,Math.floor(b.r)*CS,CS,CS);
      }
    }

    // Enemies
    for(const e of this.enemies) this._drawEnemyPx(ctx,e.c*CS,e.r*CS,e);

    // Boss
    if(this.boss) this._drawBossPx(ctx,this.boss);

    // Player
    const boosted=now-this.skillVUsedMs<this.skillVDur;
    this._drawPlayerPx(ctx,this.pc*CS,this.pr*CS,boosted,[this.facingDr,this.facingDc]);

    // Boost aura
    if(boosted){
      const age=now-this.skillVUsedMs;
      const a=0.5*(1-age/this.skillVDur)+0.15;
      ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='#00ccff';ctx.lineWidth=2;
      ctx.setLineDash([2,2]);ctx.strokeRect(this.pc*CS-3,this.pr*CS-3,PLAYER_CELLS*CS+6,PLAYER_CELLS*CS+6);
      ctx.setLineDash([]);ctx.restore();
    }

    // Chaos mode border pulse
    if(this.isChaos){
      const pulse=Math.sin(now*0.004)*0.5+0.5;
      ctx.save();ctx.globalAlpha=pulse*0.15;ctx.fillStyle='#ff2255';
      ctx.fillRect(0,0,W,4);ctx.fillRect(0,H-4,W,4);
      ctx.fillRect(0,0,4,H);ctx.fillRect(W-4,0,4,H);
      ctx.restore();
    }
  }

  // ── PLAYER SPRITE ────────────────────────────────
  _drawPlayerPx(ctx,px,py,boosted,facing){
    const S=CS,P=PLAYER_CELLS;
    const cx=px+P*S/2,cy=py+P*S/2;
    ctx.save();ctx.translate(cx,cy);
    ctx.rotate(Math.atan2(facing[1],facing[0])+Math.PI/2);
    ctx.translate(-P*S/2,-P*S/2);
    const bx=0,by=0;

    // Wake
    if(boosted){
      const f=Math.floor(performance.now()/80)%2;
      ctx.fillStyle=f?'#aaffff':'#44ccff';ctx.globalAlpha=0.7;
      ctx.fillRect(bx+CS,by+P*S,CS,CS*2);ctx.fillRect(bx+P*S-CS*2,by+P*S,CS,CS*2);
      ctx.globalAlpha=0.4;
      ctx.fillRect(bx,by+P*S+CS,CS,CS);ctx.fillRect(bx+P*S-CS,by+P*S+CS,CS,CS);
      ctx.globalAlpha=1;
    } else {
      ctx.fillStyle=PC.pWake;ctx.globalAlpha=0.35;
      ctx.fillRect(bx+CS,by+P*S,CS,CS);ctx.fillRect(bx+P*S-CS*2,by+P*S,CS,CS);
      ctx.globalAlpha=1;
    }

    // Outline
    ctx.fillStyle=PC.pOutline;
    ctx.fillRect(bx+CS,by,P*S-2*S,S);ctx.fillRect(bx,by+S,P*S,P*S-S);

    // Hull
    ctx.fillStyle=boosted?'#005577':PC.pHull;
    ctx.fillRect(bx+S,by+S,P*S-2*S,P*S-S);
    ctx.fillStyle=boosted?'#007799':PC.pHullMid;
    ctx.fillRect(bx+CS,by,P*S-2*CS,CS);
    ctx.fillStyle=boosted?'#008899':PC.pHullLight;
    ctx.fillRect(bx+S,by+S,P*S-2*S,S*2);

    // Deck rails
    ctx.fillStyle=PC.pDeck;
    ctx.fillRect(bx,by+S,S,P*S-2*S);ctx.fillRect(bx+P*S-S,by+S,S,P*S-2*S);
    ctx.fillStyle=boosted?'#00ddaa':PC.pStripe;
    ctx.fillRect(bx+2*S,by+S,P*S-4*S,S);

    // Cabin
    ctx.fillStyle=PC.pCabin;ctx.fillRect(bx+S,by+S*2,P*S-2*S,S*2);
    ctx.fillStyle=PC.pOutline;
    ctx.fillRect(bx+S,by+S*2,S,S*2);ctx.fillRect(bx+P*S-2*S,by+S*2,S,S*2);

    // Windows
    ctx.fillStyle=PC.pWindow;
    ctx.fillRect(bx+S*2,by+S*2,S,S);ctx.fillRect(bx+P*S-S*3,by+S*2,S,S);
    ctx.fillStyle=PC.pWindowDark;
    ctx.fillRect(bx+S*2+2,by+S*2+2,S-2,S-2);ctx.fillRect(bx+P*S-S*3+2,by+S*2+2,S-2,S-2);

    // Gun turret
    ctx.fillStyle=PC.pGun;ctx.fillRect(bx+2*S,by+S*3,S*2,S);
    ctx.fillStyle=PC.pGunBarrel;ctx.fillRect(bx+2*S+S/2,by+S*2,S/2,S);

    // Stern
    ctx.fillStyle=PC.pHull;ctx.fillRect(bx+S,by+P*S-S,P*S-2*S,S);
    ctx.fillStyle=PC.pDeck;ctx.fillRect(bx+2*S,by+P*S-S,P*S-4*S,S);

    if(boosted){
      const f=Math.floor(performance.now()/60)%3;
      ctx.fillStyle=['#ffffff','#00ffff','#44ffff'][f];
      ctx.fillRect(bx+S,by+P*S-S,S,S);ctx.fillRect(bx+P*S-2*S,by+P*S-S,S,S);
    }
    ctx.restore();
  }

  // ── ENEMY SPRITE ─────────────────────────────────
  _drawEnemyPx(ctx,px,py,e){
    const S=CS,P=ENEMY_CELLS;
    const cx=px+P*S/2,cy=py+P*S/2;
    ctx.save();ctx.translate(cx,cy);
    ctx.rotate(Math.atan2(e.facingDc||1,e.facingDr||0)+Math.PI/2);
    ctx.translate(-P*S/2,-P*S/2);
    const bx=0,by=0;

    // Outline
    ctx.fillStyle=PC.eOutline;ctx.fillRect(bx+S,by,P*S-2*S,S);ctx.fillRect(bx,by+S,P*S,P*S-S);

    // Hull
    ctx.fillStyle=PC.eHull;ctx.fillRect(bx+S,by+S,P*S-2*S,P*S-2*S);
    ctx.fillStyle=PC.eHullLight;
    ctx.fillRect(bx+2*S,by,S*2,S);ctx.fillRect(bx+S,by+S,P*S-2*S,S);
    ctx.fillStyle=PC.eHullDark;
    ctx.fillRect(bx,by+S,S,P*S-2*S);ctx.fillRect(bx+P*S-S,by+S,S,P*S-2*S);
    ctx.fillStyle=PC.eAccent;ctx.fillRect(bx+S,by+2*S,P*S-2*S,S);

    // Turret
    ctx.fillStyle=PC.eTurret;ctx.fillRect(bx+S,by+S*2,P*S-2*S,S*2);
    ctx.fillStyle=PC.eTurretLight;ctx.fillRect(bx+2*S,by+2*S,P*S-4*S,S);
    ctx.fillStyle='#880000';ctx.fillRect(bx+2*S,by,S,S*2);ctx.fillRect(bx+P*S-3*S,by,S,S*2);
    ctx.fillStyle=PC.eWindow;ctx.fillRect(bx+2*S,by+2*S,S,S);ctx.fillRect(bx+P*S-3*S,by+2*S,S,S);

    // HP indicator dots above ship
    const dotY=by-S*2;
    for(let i=0;i<e.maxHp;i++){
      ctx.fillStyle=i<e.hp?'#ff2255':'#330011';
      ctx.fillRect(bx+(i*(S+1)),dotY,S,S);
    }

    if(Math.floor(performance.now()/400)%2===0){
      ctx.fillStyle='#ff0000';ctx.fillRect(bx+P*S-S,by,S,S);
    }
    ctx.fillStyle=PC.eHullDark;ctx.fillRect(bx+S,by+P*S-S,P*S-2*S,S);

    ctx.restore();
  }

  // ── BOSS SPRITE ──────────────────────────────────
  _drawBossPx(ctx,b){
    const S=CS,P=BOSS_CELLS;
    const px=b.c*CS,py=b.r*CS;
    const cx=px+P*S/2,cy=py+P*S/2;
    ctx.save();ctx.translate(cx,cy);
    ctx.rotate(Math.atan2(b.facingDc||0,b.facingDr||1)+Math.PI/2);
    ctx.translate(-P*S/2,-P*S/2);
    const bx=0,by=0;

    // Glow aura
    const gf=Math.floor(performance.now()/150)%2;
    ctx.fillStyle=gf?PC.bGlow:PC.bAccent;ctx.globalAlpha=0.18;
    ctx.fillRect(bx-S*2,by-S*2,P*S+S*4,P*S+S*4);ctx.globalAlpha=1;

    // Main hull
    ctx.fillStyle=PC.bDark;ctx.fillRect(bx,by,P*S,P*S);

    // Core
    ctx.fillStyle=PC.bCore;ctx.fillRect(bx+S*3,by+S*3,P*S-S*6,P*S-S*6);

    // Armor plates
    ctx.fillStyle=PC.bArmor;
    ctx.fillRect(bx+S*2,by+S,P*S-S*4,S*2);ctx.fillRect(bx+S*2,by+P*S-S*3,P*S-S*4,S*2);
    ctx.fillRect(bx+S,by+S*2,S*2,P*S-S*4);ctx.fillRect(bx+P*S-S*3,by+S*2,S*2,P*S-S*4);

    // Accent border
    ctx.fillStyle=PC.bAccent;
    for(let i=S*2;i<P*S-S*2;i+=S){
      ctx.fillRect(bx+i,by+S,S,S);ctx.fillRect(bx+i,by+P*S-S*2,S,S);
      ctx.fillRect(bx+S,by+i,S,S);ctx.fillRect(bx+P*S-S*2,by+i,S,S);
    }

    // Bow
    ctx.fillStyle=PC.bMid;ctx.fillRect(bx+S*3,by,P*S-S*6,S*3);
    ctx.fillStyle=PC.bAccent;ctx.fillRect(bx+S*4,by,P*S-S*8,S);

    // Turrets
    const mid=Math.floor(P/2);
    for(const[tc,tr]of[[-3,1],[0,mid-1],[3,1]]){
      ctx.fillStyle=PC.bTurret;ctx.fillRect(bx+(mid+tc-1)*S,by+tr*S,S*2,S*2);
      ctx.fillStyle=PC.bAccent;ctx.fillRect(bx+(mid+tc-1)*S,by+tr*S,S*2,S);
      ctx.fillStyle=PC.bDetail;ctx.fillRect(bx+(mid+tc-1)*S+S/2,by+tr*S-S,S/2,S);
    }

    // Bow cannons
    ctx.fillStyle=PC.bDetail;
    ctx.fillRect(bx+S*3,by,S,S*3);ctx.fillRect(bx+P*S-S*4,by,S,S*3);

    // Core glow
    const cf=Math.floor(performance.now()/200)%3;
    ctx.fillStyle=['#aa44ff','#cc66ff','#ff88ff'][cf];
    ctx.fillRect(bx+(mid-1)*S,by+(mid-1)*S,S*2,S*2);

    // Corner lights
    const bl=Math.floor(performance.now()/300)%2===0;
    ctx.fillStyle=bl?'#ff44ff':'#cc00cc';
    ctx.fillRect(bx+S*2,by+S*2,S,S);ctx.fillRect(bx+P*S-S*3,by+S*2,S,S);
    ctx.fillRect(bx+S*2,by+P*S-S*3,S,S);ctx.fillRect(bx+P*S-S*3,by+P*S-S*3,S,S);

    // Stern exhaust
    const ef=Math.floor(performance.now()/100)%2;
    ctx.fillStyle=ef?'#8800ff':'#5500aa';
    ctx.fillRect(bx+S*3,by+P*S-S,S*2,S);ctx.fillRect(bx+P*S-S*5,by+P*S-S,S*2,S);

    ctx.restore();

    // HP bar above boss (axis-aligned)
    const hf=b.hp/b.maxHp;
    const barW=P*CS,barX=b.c*CS,barY=b.r*CS-CS*4;
    ctx.fillStyle='#000';ctx.fillRect(barX,barY,barW,CS*2);
    ctx.fillStyle=hf>0.5?'#cc44ff':hf>0.25?'#ff8800':'#ff2244';
    ctx.fillRect(barX,barY,Math.round(barW*hf),CS*2);
    ctx.strokeStyle=PC.bAccent;ctx.lineWidth=1;ctx.strokeRect(barX,barY,barW,CS*2);
  }

  // ── Misc ─────────────────────────────────────────
  _flashDmg(){
    const w=$('canvas-wrap');
    w.classList.remove('dmg-flash');void w.offsetWidth;w.classList.add('dmg-flash');
    setTimeout(()=>w.classList.remove('dmg-flash'),300);
  }
  _showGameOver(){
    $('ov-title').textContent='GAME OVER';
    $('ov-score').textContent=this.score;
    $('ov-lvl').textContent=this.level;
    $('ov-mode').textContent=this.isChaos?'CHAOS':'NORMAL';
    $('overlay').classList.remove('hidden');
  }
  restart(){
    $('overlay').classList.add('hidden');
    $('upgrade-overlay').classList.add('hidden');
    $('barter-overlay').classList.add('hidden');
    for(const k of Object.keys(this.upgrades))this.upgrades[k]=0;
    // Reset chaos enemy scaling
    this.enemyStats = {
      chaosHpBonus:0, chaosMovBonus:0, chaosShotBonus:0,
      chaosSpawnBonus:0, chaosSpreadBonus:0
    };
    this.level=1;this._init();
  }
  backToMenu(){
    $('overlay').classList.add('hidden');
    $('upgrade-overlay').classList.add('hidden');
    $('game-ui').classList.add('hidden');
    $('mode-select').classList.remove('hidden');
    window._game=null;
  }

  // ── Main Loop ────────────────────────────────────
  _tick(now){
    const dt=Math.min(now-(this._prev||now),50);
    this._prev=now;
    if(!this.gameOver&&!this.paused){
      this._updateTime(now);
      this._processMove(dt);
      this._spreadOil(now);
      this._updateEnemies(now);
      this._enemyShoot(now);
      this._bossShoot(now);
      this._updateBullets();
      this._updateHUD();
    }
    this._draw(now);
    if(this.gameOver)this._showGameOver();
    requestAnimationFrame(this._tick);
  }
}

// ─── HELPERS ─────────────────────────────────────────
function showLevelFlash(level, isChaos){
  const el=$('lvl-flash');
  const isBoss=level%10===0;
  if(isBoss) el.textContent=`!! BOSS LVL ${level} !!`;
  else if(isChaos) el.textContent=`CHAOS LVL ${level}! 💥`;
  else el.textContent=`LEVEL ${level}!`;
  el.style.color=isBoss?'#cc44ff':isChaos?'#ff2255':'#22ff88';
  el.classList.remove('hidden');
  el.style.animation='none';void el.offsetWidth;el.style.animation='';
  setTimeout(()=>el.classList.add('hidden'),1600);
}

let _toastTimer=null;
function showToast(msg){
  let t=$('toast-el');
  if(!t){
    t=document.createElement('div');t.id='toast-el';
    Object.assign(t.style,{
      position:'fixed',top:'20%',left:'50%',transform:'translateX(-50%)',
      background:'#1a1a2e',border:'2px solid #4aeeff',color:'#4aeeff',
      fontFamily:"'Press Start 2P',monospace",fontSize:'9px',letterSpacing:'2px',
      padding:'8px 14px',zIndex:'400',pointerEvents:'none',
      boxShadow:'3px 3px 0 #4aeeff'
    });
    document.body.appendChild(t);
  }
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>{t.style.opacity='0';},1500);
}

// ─── BOOT ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  function fitCanvas(){
    const canvas=$('gc');if(!canvas)return;
    const wrap=$('canvas-wrap');
    const ww=wrap.clientWidth,wh=wrap.clientHeight;
    const scale=Math.min(ww/W,wh/H);
    const dw=Math.floor(W*scale),dh=Math.floor(H*scale);
    canvas.style.width=dw+'px';canvas.style.height=dh+'px';
    canvas.style.marginLeft=Math.floor((ww-dw)/2)+'px';
    canvas.style.marginTop=Math.floor((wh-dh)/2)+'px';
  }
  window.addEventListener('resize',fitCanvas);

  function startGame(mode){
    $('mode-select').classList.add('hidden');
    $('game-ui').classList.remove('hidden');
    setTimeout(()=>{fitCanvas();window._game=new Game(mode);},50);
  }

  $('btn-normal').addEventListener('click',()=>startGame('normal'));
  $('btn-chaos').addEventListener('click',()=>startGame('chaos'));
});
