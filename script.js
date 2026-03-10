'use strict';
// ═══════════════════════════════════════════════════════
//  Oil Spill Cleanup — v4
//  NEW: Full Upgrade / Perk System
//  • Every 2 levels → pick 1 of 3 random upgrades
//  • Upgrade database with stackable/non-stackable flags
//  • All gameplay params driven by upgrade state
// ═══════════════════════════════════════════════════════

const ROWS = 150, COLS = 200, CS = 3;
const W = COLS * CS, H = ROWS * CS;
const BASE_TIME_SEC  = 60;
const BASE_SPREAD_MS = 3500;
const BASE_SPREAD_CH = 0.12;
const CLEAN_SCORE    = 1;
const ENEMY_SCORE    = 10;
const BOSS_SCORE     = 50;
const PLAYER_CELLS   = 5;
const ENEMY_CELLS    = 6;
const BOSS_CELLS     = 14;
const BOSS_HP_BASE   = 20;

// ─── UPGRADE DATABASE ────────────────────────────────
// stackable: true  → dapat diambil berkali-kali (efek bertumpuk)
// stackable: false → hanya bisa diambil 1x (jika sudah punya, tidak muncul lagi)
const UPGRADE_DB = [
  {
    id: 'cooldownReduction',
    name: 'Faster Cleaning',
    icon: '⏱',
    desc: 'Kurangi cooldown Area Clear sebesar 0.2 detik',
    stackable: true,
    color: '#00d4f5',
  },
  {
    id: 'areaExpansion',
    name: 'Wider Cleanup',
    icon: '🌊',
    desc: 'Perbesar radius Area Clear +2 sel',
    stackable: true,
    color: '#00ff99',
  },
  {
    id: 'boostDuration',
    name: 'Sustained Boost',
    icon: '💨',
    desc: 'Tambah durasi Speed Boost +1 detik',
    stackable: true,
    color: '#00ccff',
  },
  {
    id: 'doubleShot',
    name: 'Double Shot',
    icon: '🔫',
    desc: 'Tembakkan 2 peluru sekaligus (paralel)',
    stackable: false,   // hanya 1x
    color: '#ffee44',
  },
  {
    id: 'tripleShot',
    name: 'Triple Shot',
    icon: '💥',
    desc: 'Tembakkan 3 peluru (butuh Double Shot)',
    stackable: false,
    requires: 'doubleShot',
    color: '#ff8844',
  },
  {
    id: 'slowSpread',
    name: 'Containment',
    icon: '🛑',
    desc: 'Perlambat penyebaran minyak -2%',
    stackable: true,
    color: '#ff4488',
  },
  {
    id: 'extraHp',
    name: 'Reinforced Hull',
    icon: '❤️',
    desc: 'Tambah 1 HP maksimum (dan pulihkan 1)',
    stackable: true,
    color: '#ff3355',
  },
  {
    id: 'boostCooldown',
    name: 'Nitro Refuel',
    icon: '⚡',
    desc: 'Kurangi cooldown Speed Boost -2 detik',
    stackable: true,
    color: '#aaddff',
  },
  {
    id: 'bulletSpeed',
    name: 'High Velocity',
    icon: '🎯',
    desc: 'Tingkatkan kecepatan peluru +30%',
    stackable: true,
    color: '#ffff88',
  },
  {
    id: 'moveSpeed',
    name: 'Engine Upgrade',
    icon: '🚀',
    desc: 'Tingkatkan kecepatan gerak kapal +15%',
    stackable: true,
    color: '#44ffcc',
  },
];

// ─── COLORS ──────────────────────────────────────────
const C = {
  oil:'#8b4e0a', oilSheen:'rgba(200,120,20,0.45)',
  playerFill:'#00e5c0', playerCabin:'#e8f8f5',
  enemyFill:'#cc1133', enemyLight:'#ff8844',
  bossFill:'#6600cc', bossAccent:'#cc44ff', bossGlow:'#aa00ff',
  bulletP:'#ffe800', bulletE:'#ff5544', bulletB:'#dd00ff',
  healOrb:'#44ff88', gridLine:'rgba(0,40,70,0.45)', land:'#5a4228',
  skillAura:'rgba(0,255,153,0.18)', skillBorder:'#00ff99',
  boostBorder:'#00ccff',
};

function waterColor(r){
  const t=r/ROWS;
  return `rgb(${Math.round(8+t*10)},${Math.round(28+t*55)},${Math.round(80+t*90)})`;
}

const $     = id=>document.getElementById(id);
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rand  = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function rrect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ─── CLASSES ─────────────────────────────────────────
class Bullet {
  constructor(row,col,dr,dc,isPlayer,speed,isBoss=false){
    this.r=row;this.c=col;this.dr=dr;this.dc=dc;
    this.isPlayer=isPlayer;this.speed=speed;this.isBoss=isBoss;this.alive=true;
  }
  update(){
    this.r+=this.dr*this.speed;this.c+=this.dc*this.speed;
    if(this.r<0||this.r>=ROWS||this.c<0||this.c>=COLS) this.alive=false;
  }
  px(){return Math.floor(this.c)*CS+CS*0.5;}
  py(){return Math.floor(this.r)*CS+CS*0.5;}
}

class HealOrb {
  constructor(r,c){this.r=r;this.c=c;this.alive=true;this.spawnMs=performance.now();}
}

// ─── GAME ────────────────────────────────────────────
class Game {
  constructor(){
    this.canvas=$('gc');
    this.ctx=this.canvas.getContext('2d');
    this.canvas.width=W;this.canvas.height=H;
    this.offCtx=document.createElement('canvas');
    this.offCtx.width=W;this.offCtx.height=H;
    this.wCtx=this.offCtx.getContext('2d');
    this.keys=new Set();
    this.level=1;
    this.paused=false;          // paused during upgrade screen
    this.pendingUpgrade=false;  // upgrade pending but not shown yet

    // ── Upgrade state ──────────────────────────────
    this.upgrades={
      cooldownReduction: 0,
      areaExpansion:     0,
      boostDuration:     0,
      doubleShot:        0,
      tripleShot:        0,
      slowSpread:        0,
      extraHp:           0,
      boostCooldown:     0,
      bulletSpeed:       0,
      moveSpeed:         0,
    };

    this._buildWorld();
    this._bindInput();
    this._init();
    this._tick=this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  // ── Derived stats from upgrades ──────────────────
  get skillCCd()  { return Math.max(2000, 10000 - this.upgrades.cooldownReduction * 200); }
  get skillArea() {
    const base = 10 + Math.floor((this.level-1)/2);
    return base + this.upgrades.areaExpansion * 2;
  }
  get skillVDur() { return 3000 + this.upgrades.boostDuration * 1000; }
  get skillVCd()  { return Math.max(5000, 15000 - this.upgrades.boostCooldown * 2000); }
  get effectiveSpreadChance() {
    return Math.max(0.01, BASE_SPREAD_CH - this.upgrades.slowSpread * 0.02);
  }
  get bulletSpd() { return 2.0 * (1 + this.upgrades.bulletSpeed * 0.3); }
  get movDelay()  { return Math.max(10, Math.round(35 / (1 + this.upgrades.moveSpeed * 0.15))); }

  // ── World build ──────────────────────────────────
  _buildWorld(){
    this.land=Array.from({length:ROWS},(_,r)=>
      new Uint8Array(COLS).map((_,c)=>(r===0||r===ROWS-1||c===0||c===COLS-1)?1:0)
    );
    const ctx=this.wCtx;
    for(let r=0;r<ROWS;r++){
      const col=waterColor(r);
      for(let c=0;c<COLS;c++){
        ctx.fillStyle=this.land[r][c]?C.land:col;
        ctx.fillRect(c*CS,r*CS,CS,CS);
      }
    }
    ctx.strokeStyle=C.gridLine;ctx.lineWidth=0.5;ctx.globalAlpha=0.4;
    for(let r=0;r<=ROWS;r+=5){ctx.beginPath();ctx.moveTo(0,r*CS);ctx.lineTo(W,r*CS);ctx.stroke();}
    for(let c=0;c<=COLS;c+=5){ctx.beginPath();ctx.moveTo(c*CS,0);ctx.lineTo(c*CS,H);ctx.stroke();}
    ctx.globalAlpha=1;
    this.waterSnap=ctx.getImageData(0,0,W,H);
  }

  // ── State init ───────────────────────────────────
  _init(){
    this.grid=Array.from({length:ROWS},()=>new Uint8Array(COLS));
    this.bullets=[];this.enemies=[];this.healOrbs=[];this.boss=null;

    this.maxHp=5+Math.floor((this.level-1)/2)+this.upgrades.extraHp;
    this.hp=this.maxHp;
    this.score=0;
    this.gameOver=false;
    this.paused=false;
    this.pendingUpgrade=false;

    this.pr=Math.floor(ROWS/2);this.pc=Math.floor(COLS/2);
    this.totalTime=BASE_TIME_SEC+(this.level-1)*20;
    this.timeLeft=this.totalTime;
    this.startMs=performance.now();

    this.lastSpreadMs=performance.now();
    this.enemyMoveMs=performance.now();
    this.lastEnemyShotMs=performance.now();
    this.lastBossShotMs=performance.now();
    this.bossMoveMs=performance.now();

    this.skillCUsedMs=-999999;
    this.skillVUsedMs=-999999;
    this.moveAccMs=0;
    this.wavePhase=0;
    this.skillCFlashMs=null;

    this._placeOil();
    this._spawnEnemies();
    this._updateHUD();
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
    const sz=rand(15,50);
    const stack=[[r,c]];const visited=new Set();
    while(stack.length&&visited.size<sz){
      const[rr,cc]=stack.pop();
      if(rr<1||rr>ROWS-2||cc<1||cc>COLS-2) continue;
      const k=rr*COLS+cc;
      if(visited.has(k)) continue;
      this.grid[rr][cc]=1;visited.add(k);
      const ns=shuffle([[rr+1,cc],[rr-1,cc],[rr,cc+1],[rr,cc-1]]);
      for(let i=0;i<rand(1,3);i++) stack.push(ns[i]);
    }
  }

  // ── Enemies ──────────────────────────────────────
  _spawnEnemies(){
    this.enemies=[];this.boss=null;
    if(this.level%10===0){
      this.boss={
        r:rand(20,ROWS-20-BOSS_CELLS),c:rand(20,COLS-20-BOSS_CELLS),
        hp:BOSS_HP_BASE*(this.level/10),maxHp:BOSS_HP_BASE*(this.level/10),phase:0
      };
      return;
    }
    const n=this.level<5?0:this.level===5?1:Math.max(1,Math.floor((this.level-4)/2));
    for(let i=0;i<n;i++)
      this.enemies.push({r:rand(10,ROWS-10-ENEMY_CELLS),c:rand(10,COLS-10-ENEMY_CELLS)});
  }

  _anyOil(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c])return true;return false;}
  _oilCount(){let n=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c])n++;return n;}

  // ── Input ────────────────────────────────────────
  _bindInput(){
    document.addEventListener('keydown',e=>{
      if(this.paused) return; // block all game input when upgrade screen open
      this.keys.add(e.key);
      if((e.key==='c'||e.key==='C')&&!this.gameOver) this._skillC();
      if((e.key==='v'||e.key==='V')&&!this.gameOver) this._skillV();
      if(e.key===' '){e.preventDefault();if(!this.gameOver)this._shoot();}
      if((e.key==='r'||e.key==='R')&&this.gameOver) this.restart();
    });
    document.addEventListener('keyup',e=>this.keys.delete(e.key));
    $('btn-restart')?.addEventListener('click',()=>this.restart());
  }

  _getDir(){
    if(this.keys.has('ArrowUp')   ||this.keys.has('w')) return[-1,0];
    if(this.keys.has('ArrowDown') ||this.keys.has('s')) return[1,0];
    if(this.keys.has('ArrowLeft') ||this.keys.has('a')) return[0,-1];
    if(this.keys.has('ArrowRight')||this.keys.has('d')) return[0,1];
    return null;
  }

  // ── Movement ─────────────────────────────────────
  _processMove(dt){
    if(this.gameOver||this.paused) return;
    const now=performance.now();
    const boosted=now-this.skillVUsedMs<this.skillVDur;
    const delay=boosted?Math.round(this.movDelay*0.35):this.movDelay;

    this.moveAccMs+=dt;
    if(this.moveAccMs<delay) return;
    this.moveAccMs=0;
    const dir=this._getDir();
    if(!dir) return;

    this.pr=clamp(this.pr+dir[0],1,ROWS-1-PLAYER_CELLS);
    this.pc=clamp(this.pc+dir[1],1,COLS-1-PLAYER_CELLS);
    const cleaned=this._cleanArea(this.pr,this.pc,PLAYER_CELLS);
    if(cleaned){this.score+=cleaned*CLEAN_SCORE;if(!this._anyOil())this._nextLevel();}
    this._checkHealOrbs();
  }

  _cleanArea(row,col,size){
    let n=0;
    for(let r=row;r<row+size;r++)
      for(let c=col;c<col+size;c++)
        if(r>0&&r<ROWS-1&&c>0&&c<COLS-1&&this.grid[r][c]){this.grid[r][c]=0;n++;}
    return n;
  }

  // ── Skill C — Area Clear ─────────────────────────
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
    this.skillCFlashMs=now;
    this._skillCHalf=half;
  }

  // ── Skill V — Speed Boost ────────────────────────
  _skillV(){
    const now=performance.now();
    if(now-this.skillVUsedMs<this.skillVCd) return;
    this.skillVUsedMs=now;
  }

  // ── Shooting (affected by doubleShot / tripleShot) ──
  _shoot(){
    const dir=this._getDir()||[-1,0];
    const cr=this.pr+Math.floor(PLAYER_CELLS/2);
    const cc=this.pc+Math.floor(PLAYER_CELLS/2);
    const spd=this.bulletSpd;

    // Determine number of shots
    let count=1;
    if(this.upgrades.tripleShot>=1) count=3;
    else if(this.upgrades.doubleShot>=1) count=2;

    if(count===1){
      this.bullets.push(new Bullet(cr,cc,dir[0],dir[1],true,spd));
    } else if(count===2){
      // Two parallel bullets, offset perpendicular to direction
      const perp=[-dir[1],dir[0]];
      this.bullets.push(new Bullet(cr+perp[0]*1.5,cc+perp[1]*1.5,dir[0],dir[1],true,spd));
      this.bullets.push(new Bullet(cr-perp[0]*1.5,cc-perp[1]*1.5,dir[0],dir[1],true,spd));
    } else {
      // Triple: centre + angled left/right
      this.bullets.push(new Bullet(cr,cc,dir[0],dir[1],true,spd));
      const ang=Math.atan2(dir[0],dir[1]);
      for(const da of[-0.22,0.22]){
        const a=ang+da;
        this.bullets.push(new Bullet(cr,cc,Math.sin(a),Math.cos(a),true,spd));
      }
    }
  }

  _enemyShoot(now){
    if(!this.enemies.length||this.gameOver||this.paused) return;
    if(now-this.lastEnemyShotMs<1500) return;
    this.lastEnemyShotMs=now;
    for(const e of this.enemies){
      const dRow=this.pr-e.r,dCol=this.pc-e.c;
      let dr=0,dc=0;
      if(Math.abs(dRow)>=Math.abs(dCol)) dr=Math.sign(dRow); else dc=Math.sign(dCol);
      if(!dr&&!dc) dr=1;
      const cr=e.r+Math.floor(ENEMY_CELLS/2),cc=e.c+Math.floor(ENEMY_CELLS/2);
      this.bullets.push(new Bullet(cr,cc,dr,dc,false,1.1));
    }
  }

  _bossShoot(now){
    if(!this.boss||this.gameOver||this.paused) return;
    if(now-this.lastBossShotMs<800) return;
    this.lastBossShotMs=now;
    const b=this.boss;
    const cr=b.r+Math.floor(BOSS_CELLS/2),cc=b.c+Math.floor(BOSS_CELLS/2);
    const ang=Math.atan2(this.pr-b.r,this.pc-b.c);
    for(const da of[0,-0.3,0.3]){
      const a=ang+da;
      this.bullets.push(new Bullet(cr,cc,Math.sin(a),Math.cos(a),false,1.4,true));
    }
  }

  // ── Bullets ──────────────────────────────────────
  _updateBullets(){
    for(const b of this.bullets){
      if(!b.alive) continue;
      b.update();
      const r=Math.floor(b.r),c=Math.floor(b.c);
      if(r<0||r>=ROWS||c<0||c>=COLS){b.alive=false;continue;}
      if(b.isPlayer){
        if(this.grid[r][c]){this.grid[r][c]=0;this.score+=CLEAN_SCORE;}
        for(let i=this.enemies.length-1;i>=0;i--){
          const e=this.enemies[i];
          if(r>=e.r&&r<e.r+ENEMY_CELLS&&c>=e.c&&c<e.c+ENEMY_CELLS){
            this.enemies.splice(i,1);b.alive=false;this.score+=ENEMY_SCORE;
            this.healOrbs.push(new HealOrb(e.r+Math.floor(ENEMY_CELLS/2),e.c+Math.floor(ENEMY_CELLS/2)));
            break;
          }
        }
        if(b.alive&&this.boss){
          const bs=this.boss;
          if(r>=bs.r&&r<bs.r+BOSS_CELLS&&c>=bs.c&&c<bs.c+BOSS_CELLS){
            bs.hp--;b.alive=false;
            if(bs.hp<=0){
              this.score+=BOSS_SCORE;
              this.healOrbs.push(new HealOrb(bs.r+BOSS_CELLS/2-1,bs.c+BOSS_CELLS/2));
              this.healOrbs.push(new HealOrb(bs.r+BOSS_CELLS/2+1,bs.c+BOSS_CELLS/2));
              this.boss=null;
              if(!this._anyOil()) this._nextLevel();
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
    this.healOrbs=this.healOrbs.filter(o=>o.alive&&now-o.spawnMs<8000);
  }

  _checkHealOrbs(){
    const cr=this.pr+Math.floor(PLAYER_CELLS/2),cc=this.pc+Math.floor(PLAYER_CELLS/2);
    for(const o of this.healOrbs){
      if(!o.alive) continue;
      if(Math.abs(cr-o.r)<=3&&Math.abs(cc-o.c)<=3){o.alive=false;this.hp=Math.min(this.maxHp,this.hp+1);}
    }
  }

  // ── Enemies ──────────────────────────────────────
  _updateEnemies(now){
    if(this.gameOver||this.paused) return;
    if(this.enemies.length&&now-this.enemyMoveMs>500){
      this.enemyMoveMs=now;
      for(const e of this.enemies){
        if(e.r<this.pr) e.r++; else if(e.r>this.pr) e.r--;
        if(e.c<this.pc) e.c++; else if(e.c>this.pc) e.c--;
        e.r=clamp(e.r,1,ROWS-1-ENEMY_CELLS);e.c=clamp(e.c,1,COLS-1-ENEMY_CELLS);
      }
    }
    if(this.boss&&now-this.bossMoveMs>700){
      this.bossMoveMs=now;
      const b=this.boss;
      if(b.r<this.pr) b.r++; else if(b.r>this.pr) b.r--;
      if(b.c<this.pc) b.c++; else if(b.c>this.pc) b.c--;
      b.r=clamp(b.r,1,ROWS-1-BOSS_CELLS);b.c=clamp(b.c,1,COLS-1-BOSS_CELLS);
      b.phase=(b.phase||0)+0.08;
    }
  }

  // ── Oil spread (affected by slowSpread upgrade) ──
  _spreadOil(now){
    if(this.paused) return;
    if(now-this.lastSpreadMs<BASE_SPREAD_MS) return;
    this.lastSpreadMs=now;
    const chance=this.effectiveSpreadChance;
    const newOil=[];
    for(let r=1;r<ROWS-1;r++)
      for(let c=1;c<COLS-1;c++){
        if(!this.grid[r][c]) continue;
        const ns=[[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
        for(const[nr,nc]of ns)
          if(nr>0&&nr<ROWS-1&&nc>0&&nc<COLS-1&&!this.grid[nr][nc]&&Math.random()<chance)
            newOil.push([nr,nc]);
      }
    for(const[nr,nc]of newOil) this.grid[nr][nc]=1;
  }

  // ── Level ────────────────────────────────────────
  _nextLevel(){
    this.level++;
    // HP growth from levels
    const newBase=5+Math.floor((this.level-1)/2)+this.upgrades.extraHp;
    if(newBase>this.maxHp){const d=newBase-this.maxHp;this.maxHp=newBase;this.hp=Math.min(this.maxHp,this.hp+d);}

    this.totalTime=BASE_TIME_SEC+(this.level-1)*20;
    this.startMs=performance.now();
    this._placeOil();
    this._spawnEnemies();

    // Every 2 levels → upgrade (but not on level 1 start)
    if(this.level>=2&&this.level%2===0){
      this.pendingUpgrade=true;
      this.paused=true;
      this._showUpgradeMenu();
    } else {
      showLevelFlash(this.level);
    }
  }

  // ── Time ─────────────────────────────────────────
  _updateTime(now){
    if(this.gameOver||this.paused) return;
    this.timeLeft=Math.max(0,this.totalTime-(now-this.startMs)/1000);
    if(this.timeLeft<=0) this.gameOver=true;
  }

  // ═══════════════════════════════════════════════════
  //  UPGRADE SYSTEM
  // ═══════════════════════════════════════════════════

  // Build 3 random upgrade choices (respecting stackable / requires rules)
  _getUpgradeChoices(){
    const available=UPGRADE_DB.filter(u=>{
      if(!u.stackable&&this.upgrades[u.id]>=1) return false; // already have non-stackable
      if(u.requires&&this.upgrades[u.requires]<1) return false; // missing prerequisite
      return true;
    });
    shuffle(available);
    return available.slice(0,Math.min(3,available.length));
  }

  _applyUpgrade(id){
    this.upgrades[id]=(this.upgrades[id]||0)+1;

    // extraHp has an immediate effect: grow maxHp and restore 1
    if(id==='extraHp'){
      this.maxHp++;
      this.hp=Math.min(this.maxHp,this.hp+1);
    }
  }

  _showUpgradeMenu(){
    const choices=this._getUpgradeChoices();
    if(choices.length===0){
      // No upgrades available → just unpause
      this.paused=false;
      this.pendingUpgrade=false;
      showLevelFlash(this.level);
      return;
    }

    const overlay=$('upgrade-overlay');
    const cardsEl=$('upgrade-cards');
    const lvlEl=$('upgrade-lvl-text');
    lvlEl.textContent=`LEVEL ${this.level} — PILIH UPGRADE`;
    cardsEl.innerHTML='';

    choices.forEach(u=>{
      const card=document.createElement('div');
      card.className='upg-card';
      card.style.setProperty('--card-color',u.color);
      const stackCount=this.upgrades[u.id];
      const stackBadge=u.stackable&&stackCount>0
        ?`<span class="upg-stack">×${stackCount+1}</span>`:'';
      card.innerHTML=`
        <div class="upg-icon">${u.icon}</div>
        <div class="upg-name">${u.name}${stackBadge}</div>
        <div class="upg-desc">${u.desc}</div>
        ${u.stackable?'<div class="upg-tag">STACKABLE</div>':'<div class="upg-tag one">SEKALI</div>'}
      `;
      card.addEventListener('click',()=>this._selectUpgrade(u.id));
      cardsEl.appendChild(card);
    });

    overlay.classList.remove('hidden');
  }

  _selectUpgrade(id){
    this._applyUpgrade(id);
    $('upgrade-overlay').classList.add('hidden');
    this.paused=false;
    this.pendingUpgrade=false;
    // Reset timer so player doesn't lose time during pick
    this.startMs=performance.now();
    showLevelFlash(this.level);
    this._updateHUD();
  }

  // ── HUD ──────────────────────────────────────────
  _updateHUD(){
    $('h-level').textContent=this.level;
    $('h-score').textContent=this.score;
    $('h-time').textContent=Math.ceil(this.timeLeft);
    $('h-oil').textContent=this._oilCount();

    const CIRC=150.8,frac=this.timeLeft/this.totalTime;
    const ring=$('timer-ring');
    if(ring){ring.style.strokeDashoffset=`${CIRC*(1-frac)}`;ring.classList.toggle('low',frac<0.25);}

    const hpEl=$('h-hp');
    if(hpEl){
      hpEl.innerHTML='';
      for(let i=0;i<this.maxHp;i++){
        const d=document.createElement('div');
        d.className='hp-heart'+(i<this.hp?'':' empty');
        hpEl.appendChild(d);
      }
    }

    // Skill C
    const now=performance.now();
    const cdC=this.skillCCd-(now-this.skillCUsedMs);
    const pctC=cdC<=0?1:1-cdC/this.skillCCd;
    const barC=$('skill-bar'),lblC=$('skill-label'),icoC=$('skill-icon');
    if(barC){barC.style.width=`${pctC*100}%`;barC.classList.toggle('cd',cdC>0);}
    if(icoC) icoC.classList.toggle('cd',cdC>0);
    if(lblC){
      const d=this.skillArea*2;
      lblC.classList.toggle('cd',cdC>0);
      lblC.textContent=cdC<=0?`[C] AREA CLEAR ${d}×${d} — READY`:`[C] CLEAR — ${Math.ceil(cdC/1000)}s`;
    }

    // Skill V
    const cdV=this.skillVCd-(now-this.skillVUsedMs);
    const pctV=cdV<=0?1:1-cdV/this.skillVCd;
    const boosted=now-this.skillVUsedMs<this.skillVDur;
    const barV=$('skill-bar-v'),lblV=$('skill-label-v'),icoV=$('skill-icon-v');
    if(barV){barV.style.width=`${pctV*100}%`;barV.classList.toggle('cd',cdV>0&&!boosted);barV.classList.toggle('active',boosted);}
    if(icoV) icoV.classList.toggle('cd',cdV>0&&!boosted);
    if(lblV){
      lblV.classList.toggle('cd',cdV>0&&!boosted);
      if(boosted) lblV.textContent=`[V] BOOST ACTIVE — ${Math.ceil((this.skillVDur-(now-this.skillVUsedMs))/1000)}s`;
      else if(cdV<=0) lblV.textContent='[V] SPEED BOOST — READY';
      else lblV.textContent=`[V] BOOST — ${Math.ceil(cdV/1000)}s`;
    }

    // Boss bar
    const bossWrap=$('boss-hp-wrap');
    if(bossWrap){
      if(this.boss){
        bossWrap.style.display='flex';
        $('boss-hp-bar').style.width=`${(this.boss.hp/this.boss.maxHp)*100}%`;
        $('boss-hp-text').textContent=`BOSS HP: ${this.boss.hp} / ${this.boss.maxHp}`;
      } else bossWrap.style.display='none';
    }

    // Upgrade badges in HUD
    this._updateUpgradeBadges();
  }

  _updateUpgradeBadges(){
    const el=$('upgrade-badges');
    if(!el) return;
    el.innerHTML='';
    for(const[id,cnt]of Object.entries(this.upgrades)){
      if(cnt<=0) continue;
      const u=UPGRADE_DB.find(x=>x.id===id);
      if(!u) continue;
      const b=document.createElement('div');
      b.className='upg-badge';
      b.style.borderColor=u.color;
      b.title=u.name;
      b.textContent=cnt>1?`${u.icon}×${cnt}`:u.icon;
      el.appendChild(b);
    }
  }

  // ── Draw ─────────────────────────────────────────
  _draw(now){
    const ctx=this.ctx;
    ctx.putImageData(this.waterSnap,0,0);

    this.wavePhase+=0.015;
    ctx.save();ctx.globalAlpha=0.05;ctx.fillStyle='#4ad8ff';
    for(let r=2;r<ROWS-2;r+=8){
      const offset=Math.sin(this.wavePhase+r*0.18)*4;
      for(let c=1;c<COLS-1;c++){
        if(!this.land[r][c]) ctx.fillRect(c*CS+offset,r*CS+1,CS*2,1);
      }
    }
    ctx.restore();

    // oil
    ctx.fillStyle=C.oil;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(this.grid[r][c]) ctx.fillRect(c*CS,r*CS,CS,CS);
    ctx.fillStyle=C.oilSheen;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(this.grid[r][c]&&(r+c)%4===0) ctx.fillRect(c*CS,r*CS,CS-1,1);

    // skill C flash
    if(this.skillCFlashMs){
      const age=now-this.skillCFlashMs;
      if(age<600){
        const alpha=(1-age/600)*0.4;
        const half=this._skillCHalf||10;
        const cr=this.pr+PLAYER_CELLS/2,cc=this.pc+PLAYER_CELLS/2;
        ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=C.skillAura;
        ctx.fillRect((cc-half)*CS,(cr-half)*CS,half*2*CS,half*2*CS);
        ctx.strokeStyle=C.skillBorder;ctx.lineWidth=1.5;ctx.globalAlpha=alpha*2;
        ctx.strokeRect((cc-half)*CS,(cr-half)*CS,half*2*CS,half*2*CS);
        ctx.restore();
      } else this.skillCFlashMs=null;
    }

    // boost aura
    const boosted=now-this.skillVUsedMs<this.skillVDur;
    if(boosted){
      const age=now-this.skillVUsedMs;
      ctx.save();ctx.globalAlpha=0.25*(1-age/this.skillVDur)+0.1;
      ctx.strokeStyle=C.boostBorder;ctx.lineWidth=2;ctx.shadowColor=C.boostBorder;ctx.shadowBlur=8;
      ctx.strokeRect(this.pc*CS-4,this.pr*CS-4,PLAYER_CELLS*CS+8,PLAYER_CELLS*CS+8);
      ctx.restore();
    }

    // heal orbs
    for(const o of this.healOrbs){
      if(!o.alive) continue;
      const pulse=0.7+0.3*Math.sin((now-o.spawnMs)*0.006);
      ctx.save();ctx.globalAlpha=pulse;ctx.shadowColor=C.healOrb;ctx.shadowBlur=8;
      ctx.fillStyle=C.healOrb;ctx.beginPath();ctx.arc(o.c*CS,o.r*CS,CS*1.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.globalAlpha=pulse*0.9;
      ctx.fillRect(o.c*CS-1,o.r*CS-CS,2,CS*2);ctx.fillRect(o.c*CS-CS,o.r*CS-1,CS*2,2);
      ctx.restore();
    }

    // bullets
    for(const b of this.bullets){
      ctx.save();
      if(b.isPlayer){
        ctx.shadowColor=C.bulletP;ctx.shadowBlur=4;ctx.fillStyle=C.bulletP;
        ctx.beginPath();ctx.ellipse(b.px(),b.py(),CS*0.8,CS*1.6,Math.atan2(b.dr,b.dc)+Math.PI/2,0,Math.PI*2);ctx.fill();
      } else if(b.isBoss){
        ctx.shadowColor=C.bulletB;ctx.shadowBlur=6;ctx.fillStyle=C.bulletB;
        ctx.beginPath();ctx.arc(b.px(),b.py(),CS*1.2,0,Math.PI*2);ctx.fill();
      } else {
        ctx.shadowColor=C.bulletE;ctx.shadowBlur=3;ctx.fillStyle=C.bulletE;
        ctx.beginPath();ctx.arc(b.px(),b.py(),CS*0.9,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    for(const e of this.enemies) this._drawEnemy(ctx,e.c*CS,e.r*CS,ENEMY_CELLS*CS);
    if(this.boss) this._drawBoss(ctx,this.boss);
    this._drawWake(ctx,this.pc*CS,this.pr*CS,PLAYER_CELLS*CS,boosted);
    this._drawPlayer(ctx,this.pc*CS,this.pr*CS,PLAYER_CELLS*CS,boosted);
  }

  // ── Draw: Player ─────────────────────────────────
  _drawPlayer(ctx,x,y,size,boosted){
    const s=size,hw=s*0.38,cx=x+s*0.5,cy=y+s*0.5;
    ctx.save();ctx.shadowColor=boosted?'#00ccff':C.playerFill;ctx.shadowBlur=boosted?14:8;
    ctx.beginPath();
    ctx.moveTo(cx,cy-s*0.48);ctx.lineTo(cx+hw,cy-s*0.18);ctx.lineTo(cx+hw,cy+s*0.30);
    ctx.quadraticCurveTo(cx+hw,cy+s*0.48,cx,cy+s*0.44);
    ctx.quadraticCurveTo(cx-hw,cy+s*0.48,cx-hw,cy+s*0.30);
    ctx.lineTo(cx-hw,cy-s*0.18);ctx.closePath();
    ctx.fillStyle=boosted?'#00ccff':C.playerFill;ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx,cy-s*0.40);ctx.lineTo(cx+hw*0.7,cy-s*0.12);ctx.lineTo(cx+hw*0.7,cy+s*0.22);ctx.lineTo(cx-hw*0.7,cy+s*0.22);ctx.lineTo(cx-hw*0.7,cy-s*0.12);ctx.closePath();
    ctx.fillStyle='rgba(0,255,200,0.18)';ctx.fill();
    const cw=s*0.34,ch=s*0.26;
    rrect(ctx,cx-cw/2,cy-ch*0.6,cw,ch,s*0.04);
    ctx.fillStyle=C.playerCabin;ctx.globalAlpha=0.85;ctx.fill();ctx.globalAlpha=1;
    ctx.beginPath();ctx.arc(cx,cy-ch*0.1,s*0.045,0,Math.PI*2);ctx.fillStyle='#aaf0ff';ctx.fill();
    ctx.strokeStyle=boosted?'#00eeff':'#00ffcc';ctx.lineWidth=0.8;
    ctx.beginPath();
    ctx.moveTo(cx,cy-s*0.48);ctx.lineTo(cx+hw,cy-s*0.18);ctx.lineTo(cx+hw,cy+s*0.30);
    ctx.quadraticCurveTo(cx+hw,cy+s*0.48,cx,cy+s*0.44);
    ctx.quadraticCurveTo(cx-hw,cy+s*0.48,cx-hw,cy+s*0.30);
    ctx.lineTo(cx-hw,cy-s*0.18);ctx.closePath();ctx.stroke();
    ctx.restore();
  }

  _drawWake(ctx,x,y,size,boosted){
    const cx=x+size*0.5,cy=y+size*0.5;
    ctx.save();ctx.globalAlpha=boosted?0.4:0.22;
    for(let i=1;i<=3;i++){
      ctx.beginPath();
      ctx.moveTo(cx-size*0.28,cy+size*(0.38+i*0.14));
      ctx.quadraticCurveTo(cx,cy+size*(0.55+i*0.1),cx+size*0.28,cy+size*(0.38+i*0.14));
      ctx.strokeStyle=boosted?'#88ddff':'#99eeff';ctx.lineWidth=1.5;ctx.stroke();
    }
    ctx.restore();
  }

  // ── Draw: Enemy ──────────────────────────────────
  _drawEnemy(ctx,x,y,size){
    const s=size,hw=s*0.40,cx=x+s*0.5,cy=y+s*0.5;
    ctx.save();ctx.shadowColor=C.enemyFill;ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(cx,cy-s*0.45);ctx.lineTo(cx+hw,cy-s*0.05);ctx.lineTo(cx+hw*0.85,cy+s*0.42);ctx.lineTo(cx-hw*0.85,cy+s*0.42);ctx.lineTo(cx-hw,cy-s*0.05);ctx.closePath();
    ctx.fillStyle=C.enemyFill;ctx.fill();ctx.strokeStyle='#ff6677';ctx.lineWidth=0.8;ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,cy-s*0.36);ctx.lineTo(cx+hw*0.7,cy);ctx.lineTo(cx+hw*0.65,cy+s*0.28);ctx.lineTo(cx-hw*0.65,cy+s*0.28);ctx.lineTo(cx-hw*0.7,cy);ctx.closePath();
    ctx.fillStyle='rgba(200,0,30,0.35)';ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,s*0.14,0,Math.PI*2);ctx.fillStyle='#220008';ctx.fill();ctx.strokeStyle=C.enemyLight;ctx.lineWidth=0.7;ctx.stroke();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-Math.PI*0.5);ctx.fillStyle=C.enemyLight;ctx.fillRect(-s*0.04,-s*0.28,s*0.08,s*0.18);ctx.restore();
    if(Math.sin(performance.now()*0.006)>0){ctx.beginPath();ctx.arc(cx+hw*0.5,cy-s*0.12,s*0.055,0,Math.PI*2);ctx.fillStyle='#ff4422';ctx.fill();}
    ctx.restore();
  }

  // ── Draw: Boss ───────────────────────────────────
  _drawBoss(ctx,b){
    const x=b.c*CS,y=b.r*CS,s=BOSS_CELLS*CS,cx=x+s*0.5,cy=y+s*0.5,phase=b.phase||0;
    ctx.save();ctx.shadowColor=C.bossGlow;ctx.shadowBlur=20+Math.sin(phase)*8;
    ctx.globalAlpha=0.3+0.1*Math.sin(phase*1.5);ctx.strokeStyle=C.bossAccent;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,cy,s*0.6,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    const pts=6;ctx.beginPath();
    for(let i=0;i<pts;i++){const a=(i/pts)*Math.PI*2-Math.PI/2,r2=s*0.48*(1+0.04*Math.sin(phase*2+i));i===0?ctx.moveTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2):ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);}
    ctx.closePath();
    const g=ctx.createRadialGradient(cx,cy-s*0.1,s*0.05,cx,cy,s*0.5);g.addColorStop(0,'#9900ee');g.addColorStop(1,'#330055');
    ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=C.bossAccent;ctx.lineWidth=1.5;ctx.stroke();
    rrect(ctx,cx-s*0.18,cy-s*0.28,s*0.36,s*0.30,s*0.04);ctx.fillStyle='#1a0033';ctx.fill();ctx.strokeStyle=C.bossAccent;ctx.lineWidth=0.8;ctx.stroke();
    for(const[tx,ty]of[[-0.28,0],[0,0],[0.28,0]]){
      const tx2=cx+tx*s,ty2=cy+ty*s;
      ctx.beginPath();ctx.arc(tx2,ty2,s*0.1,0,Math.PI*2);ctx.fillStyle='#0d0020';ctx.fill();ctx.strokeStyle=C.bossAccent;ctx.lineWidth=0.7;ctx.stroke();
      const ang=Math.atan2(this.pr-b.r,this.pc-b.c);
      ctx.save();ctx.translate(tx2,ty2);ctx.rotate(ang);ctx.fillStyle=C.bossAccent;ctx.fillRect(-s*0.03,-s*0.22,s*0.06,s*0.14);ctx.restore();
    }
    const hf=b.hp/b.maxHp,bw=s*0.9,bx=cx-bw/2,by=y-8;
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(bx,by,bw,5);
    const hg=ctx.createLinearGradient(bx,by,bx+bw,by);hg.addColorStop(0,'#ff2244');hg.addColorStop(1,'#ff88cc');
    ctx.fillStyle=hg;ctx.fillRect(bx,by,bw*hf,5);
    const blink=Math.sin(performance.now()*0.01)>0,lc=blink?'#ff44ff':'#ff00aa';
    for(const[tx,ty]of[[-0.38,-0.4],[0.38,-0.4],[0,-0.48]]){ctx.beginPath();ctx.arc(cx+tx*s,cy+ty*s,s*0.04,0,Math.PI*2);ctx.fillStyle=lc;ctx.fill();}
    ctx.restore();
  }

  // ── Misc ─────────────────────────────────────────
  _flashDmg(){
    const w=document.getElementById('canvas-wrap');
    w.classList.remove('dmg-flash');void w.offsetWidth;w.classList.add('dmg-flash');
    setTimeout(()=>w.classList.remove('dmg-flash'),400);
  }

  _showGameOver(){
    $('ov-title').textContent='GAME OVER';$('ov-title').className='';
    $('ov-score').textContent=this.score;$('ov-lvl').textContent=this.level;
    $('overlay').classList.remove('hidden');
  }

  restart(){
    $('overlay').classList.add('hidden');
    $('upgrade-overlay').classList.add('hidden');
    // Reset upgrades too
    for(const k of Object.keys(this.upgrades)) this.upgrades[k]=0;
    this.level=1;this._init();
  }

  // ── Loop ─────────────────────────────────────────
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

    if(this.gameOver) this._showGameOver();
    requestAnimationFrame(this._tick);
  }
}

// ─── HELPERS ─────────────────────────────────────────
function showLevelFlash(level){
  const el=$('lvl-flash');
  const isBoss=level%10===0;
  el.textContent=isBoss?`⚠ BOSS LEVEL ${level} ⚠`:`LEVEL ${level}`;
  el.style.color=isBoss?'#cc44ff':'#00ff99';
  el.style.textShadow=isBoss?'0 0 30px #aa00ff,0 0 80px rgba(170,0,255,0.4)':'0 0 30px #00ff99,0 0 80px rgba(0,255,100,0.3)';
  el.classList.remove('hidden');
  el.style.animation='none';void el.offsetWidth;el.style.animation='';
  setTimeout(()=>el.classList.add('hidden'),1800);
}

window.addEventListener('DOMContentLoaded',()=>{
  const canvas=$('gc');
  function fitCanvas(){
    const wrap=document.getElementById('canvas-wrap');
    const scale=Math.min(wrap.clientWidth/W,wrap.clientHeight/H,1);
    canvas.style.width=`${W*scale}px`;canvas.style.height=`${H*scale}px`;
  }
  fitCanvas();window.addEventListener('resize',fitCanvas);
  window._game=new Game();
});
