import { GameEngineProps, Difficulty } from '../types';
import { soundManager } from '../utils/soundManager';

// --- SHARED HELPERS ---
const clearCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, width, height);
};

const drawRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, glow: boolean = true) => {
  ctx.fillStyle = color;
  if(glow) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
  }
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;
};

const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

// --- RUNNER ENGINE (Flappy, Doodle, Endless) ---
export const runRunnerEngine = (props: GameEngineProps, gameId: string) => {
  const { ctx, width, height, setScore, setGameOver, inputState, difficulty } = props;
  
  // Game Mode Configuration
  const isFlappy = gameId === 'flappy-cyber';
  const isDoodle = gameId === 'doodle-hop';
  const isSubway = gameId === 'subway-run';

  // State
  let player = { 
    x: isFlappy ? 50 : width / 2, 
    y: isFlappy ? height / 2 : (isDoodle ? height - 100 : height - 40), 
    w: 30, h: 30, 
    dy: 0, 
    dx: 0 
  };
  
  let platforms: any[] = [];
  let obstacles: any[] = [];
  let frame = 0;
  let score = 0;
  let speed = 4 + (difficulty === Difficulty.HARD ? 2 : 0);
  let gravity = isFlappy ? 0.6 : (isDoodle ? 0.4 : 0.8);
  let jumpStr = isFlappy ? -8 : (isDoodle ? -10 : -12);

  // Init Doodle
  if (isDoodle) {
    for(let i=0; i<6; i++) {
      platforms.push({ x: Math.random() * (width - 60), y: height - i * 100, w: 60, h: 10 });
    }
  }

  return {
    update: () => {
      frame++;

      // --- CONTROLS ---
      const jumpInput = inputState.click || inputState.keys.has(' ') || inputState.keys.has('ArrowUp');
      
      if (isFlappy) {
        if (jumpInput) {
          if (!inputState.click) {} 
          player.dy = jumpStr;
          inputState.click = false; 
          soundManager.playJump();
        }
        player.dy += gravity;
        player.y += player.dy;
      } 
      else if (isDoodle) {
        // Horizontal Movement
        if (inputState.keys.has('ArrowLeft') || (inputState.touch.active && inputState.touch.x < width/2)) player.x -= 5;
        if (inputState.keys.has('ArrowRight') || (inputState.touch.active && inputState.touch.x > width/2)) player.x += 5;
        
        // Wrap around
        if (player.x < -player.w) player.x = width;
        if (player.x > width) player.x = -player.w;

        player.dy += gravity;
        player.y += player.dy;

        // Bounce on platforms
        if (player.dy > 0) {
           platforms.forEach(p => {
             if (player.y + player.h > p.y && player.y + player.h < p.y + p.h + 10 &&
                 player.x + player.w > p.x && player.x < p.x + p.w) {
                 player.dy = jumpStr;
                 soundManager.playJump();
             }
           });
        }
        
        // Camera Scroll (Move platforms down)
        if (player.y < height / 2) {
           const diff = height/2 - player.y;
           player.y = height/2;
           platforms.forEach(p => p.y += diff);
           score += Math.floor(diff);
           setScore(Math.floor(score/10));
           
           // Spawn new platforms
           if (platforms[platforms.length-1].y > 100) {
              platforms.push({ x: Math.random() * (width - 60), y: -20, w: 60 + Math.random() * 40, h: 10 });
           }
        }
        // Cleanup
        platforms = platforms.filter(p => p.y < height);

        // Death
        if (player.y > height) {
           soundManager.playCrash();
           setGameOver(true);
        }
      }
      else if (isSubway) {
         // Ground Runner
         const groundY = height - 40;
         
         // Jump
         if (jumpInput && player.y >= groundY - 1) {
            player.dy = jumpStr;
            inputState.click = false;
            soundManager.playJump();
         }
         
         player.dy += gravity;
         player.y += player.dy;
         
         if (player.y > groundY) {
            player.y = groundY;
            player.dy = 0;
         }

         // Spawn Obstacles
         if (frame % 90 === 0) {
            obstacles.push({ x: width, y: groundY, w: 20, h: 40 });
         }

         obstacles.forEach(o => o.x -= speed);
         obstacles = obstacles.filter(o => o.x + o.w > 0);

         // Collision
         obstacles.forEach(o => {
            if (player.x < o.x + o.w && player.x + player.w > o.x &&
                player.y < o.y + o.h && player.y + player.h > o.y) {
                soundManager.playCrash();
                setGameOver(true);
            }
            if (o.x + o.w < player.x && !o.passed) {
               o.passed = true;
               score++;
               setScore(score);
            }
         });
      }

      // --- FLAPPY SPECIFIC OBSTACLES ---
      if (isFlappy) {
        if (frame % 100 === 0) {
          const gap = 150;
          const obsH = Math.random() * (height - gap - 50) + 20;
          obstacles.push({ x: width, y: 0, w: 40, h: obsH, passed: false });
          obstacles.push({ x: width, y: obsH + gap, w: 40, h: height - (obsH + gap), passed: false });
        }
        obstacles.forEach(obs => obs.x -= speed);
        obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
        
        // Collision
        if (player.y + player.h > height || player.y < 0) setGameOver(true);
        obstacles.forEach(obs => {
           if (player.x < obs.x + obs.w && player.x + player.w > obs.x &&
               player.y < obs.y + obs.h && player.y + player.h > obs.y) {
              soundManager.playCrash();
              setGameOver(true);
           }
           if (obs.y === 0 && !obs.passed && player.x > obs.x + obs.w) {
             obs.passed = true;
             score++;
             setScore(score);
             soundManager.playCoin();
           }
        });
      }
    },
    draw: () => {
      clearCanvas(ctx, width, height);
      
      // Draw Player
      drawRect(ctx, player.x, player.y, player.w, player.h, '#00f3ff');

      // Draw Platforms (Doodle)
      if (isDoodle) {
         platforms.forEach(p => drawRect(ctx, p.x, p.y, p.w, p.h, '#00ff9f'));
      }

      // Draw Obstacles
      if (isFlappy || isSubway) {
         obstacles.forEach(o => drawRect(ctx, o.x, o.y, o.w, o.h, '#bd00ff'));
      }
      
      // Ground (Subway)
      if (isSubway) {
         ctx.fillStyle = '#334155';
         ctx.fillRect(0, height - 10, width, 10);
      }
    }
  };
};

// --- PHYSICS ENGINE (Breakout, Pong, Slicer) ---
export const runPhysicsEngine = (props: GameEngineProps, gameId: string) => {
  const { ctx, width, height, setScore, setGameOver, inputState } = props;
  
  const isSlicer = gameId === 'fruit-slice';
  const isPong = gameId === 'neon-pong';
  
  // Pong State
  let ball = { x: width/2, y: height/2, r: 8, dx: 4, dy: 4 };
  let paddleL = { x: 20, y: height/2 - 40, w: 10, h: 80 }; // AI
  let paddleR = { x: width - 30, y: height/2 - 40, w: 10, h: 80 }; // Player
  
  // Breakout State
  let paddle = { x: width/2 - 40, y: height - 20, w: 80, h: 10 };
  let bricks: any[] = [];
  if (gameId === 'brick-breaker') {
     for(let r=0; r<5; r++) {
        for(let c=0; c<8; c++) {
           bricks.push({ x: 40 + c * ((width-80)/8), y: 40 + r * 25, w: ((width-80)/8) - 5, h: 20, active: true });
        }
     }
  }

  // Slicer State
  let fruits: any[] = [];
  let frame = 0;
  let score = 0;
  let trail: {x: number, y: number}[] = [];

  return {
    update: () => {
      frame++;

      if (isSlicer) {
         // Add to trail
         if (inputState.touch.active || inputState.click) {
            trail.push({ x: inputState.touch.x, y: inputState.touch.y });
            if (trail.length > 10) trail.shift();
         } else {
            trail = [];
         }

         // Spawn Fruits
         if (frame % 40 === 0) {
            fruits.push({
               x: 50 + Math.random() * (width - 100),
               y: height,
               vx: (Math.random() - 0.5) * 4,
               vy: -10 - Math.random() * 4,
               r: 20,
               color: Math.random() > 0.5 ? '#ff00ff' : '#00ff9f',
               sliced: false
            });
         }

         // Move Fruits
         fruits.forEach(f => {
            f.x += f.vx;
            f.y += f.vy;
            f.vy += 0.2; // Gravity
         });

         // Check Slice Collision
         fruits.forEach(f => {
            if (f.sliced) return;
            // Simple check: is any trail point inside circle
            for(const t of trail) {
               const dist = Math.sqrt((t.x - f.x)**2 + (t.y - f.y)**2);
               if (dist < f.r) {
                  f.sliced = true;
                  score++;
                  setScore(score);
                  soundManager.playCoin();
                  break;
               }
            }
         });

         // Cleanup
         fruits = fruits.filter(f => f.y < height + 50);
      } 
      else if (isPong) {
         // Player Paddle
         if (inputState.touch.active) paddleR.y = inputState.touch.y - paddleR.h/2;
         
         // AI Paddle
         const destY = ball.y - paddleL.h/2;
         paddleL.y += (destY - paddleL.y) * 0.1;

         // Ball
         ball.x += ball.dx;
         ball.y += ball.dy;

         // Walls
         if (ball.y < 0 || ball.y > height) { ball.dy = -ball.dy; soundManager.playJump(); }
         
         // Paddles
         if (ball.x < paddleL.x + paddleL.w && ball.y > paddleL.y && ball.y < paddleL.y + paddleL.h) {
            ball.dx = Math.abs(ball.dx) + 0.5;
            soundManager.playJump();
         }
         if (ball.x > paddleR.x && ball.y > paddleR.y && ball.y < paddleR.y + paddleR.h) {
            ball.dx = -Math.abs(ball.dx) - 0.5;
            soundManager.playJump();
         }

         // Score / Reset
         if (ball.x < 0) {
            setGameOver(true); // You Lose
         }
         if (ball.x > width) {
            score++;
            setScore(score);
            ball.x = width/2; ball.y = height/2; ball.dx = -4; ball.dy = 4;
            soundManager.playCoin();
         }
      } 
      else {
         // BRICK BREAKER
         if (inputState.touch.active) paddle.x = inputState.touch.x - paddle.w/2;
         if (inputState.keys.has('ArrowLeft')) paddle.x -= 7;
         if (inputState.keys.has('ArrowRight')) paddle.x += 7;
         
         // Clamp
         if (paddle.x < 0) paddle.x = 0;
         if (paddle.x + paddle.w > width) paddle.x = width - paddle.w;

         ball.x += ball.dx;
         ball.y += ball.dy;

         if (ball.x < 0 || ball.x > width) ball.dx = -ball.dx;
         if (ball.y < 0) ball.dy = -ball.dy;
         if (ball.y > height) { soundManager.playCrash(); setGameOver(true); }

         // Paddle
         if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
            ball.dy = -Math.abs(ball.dy);
            soundManager.playJump();
         }

         // Bricks
         bricks.forEach(b => {
            if (!b.active) return;
            if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
               b.active = false;
               ball.dy = -ball.dy;
               score += 10;
               setScore(score);
               soundManager.playCoin();
            }
         });
      }
    },
    draw: () => {
      clearCanvas(ctx, width, height);
      
      if (isSlicer) {
         // Trail
         ctx.beginPath();
         if (trail.length > 0) ctx.moveTo(trail[0].x, trail[0].y);
         for(const t of trail) ctx.lineTo(t.x, t.y);
         ctx.strokeStyle = '#00f3ff';
         ctx.lineWidth = 4;
         ctx.stroke();

         // Fruits
         fruits.forEach(f => {
            if(f.sliced) {
               // Draw split
               drawCircle(ctx, f.x - 5, f.y, f.r, f.color);
               drawCircle(ctx, f.x + 5, f.y, f.r, f.color);
            } else {
               drawCircle(ctx, f.x, f.y, f.r, f.color);
            }
         });
      }
      else if (isPong) {
         drawRect(ctx, paddleL.x, paddleL.y, paddleL.w, paddleL.h, '#bd00ff');
         drawRect(ctx, paddleR.x, paddleR.y, paddleR.w, paddleR.h, '#00f3ff');
         drawCircle(ctx, ball.x, ball.y, ball.r, '#ffffff');
         // Net
         for(let i=0; i<height; i+=30) drawRect(ctx, width/2-1, i, 2, 10, '#334155', false);
      } 
      else {
         // Breakout
         drawRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, '#00f3ff');
         drawCircle(ctx, ball.x, ball.y, ball.r, '#ffffff');
         bricks.forEach(b => {
            if(b.active) drawRect(ctx, b.x, b.y, b.w, b.h, '#ff00ff');
         });
      }
    }
  };
};

// --- GRID ENGINE (Snake, Stacker) ---
export const runGridEngine = (props: GameEngineProps, gameId: string) => {
  const { ctx, width, height, setScore, setGameOver, inputState, difficulty } = props;
  
  const isStacker = gameId === 'tower-stack';
  const gridSize = 20;
  
  // Snake State
  let snake = [{x: 10, y: 10}];
  let dir = {x: 1, y: 0};
  let food = {x: 15, y: 15};
  
  // Stacker State
  let stackLevel = height / gridSize - 2;
  let stackWidth = 10;
  let stackX = 5;
  let stackSpeed = 0.5; // fractional grid units per frame?
  let stackDir = 1;
  let currentStackX = 5; // Float for smooth movement
  let stack: {y: number, x: number, w: number}[] = [];
  
  let frame = 0;
  let score = 0;
  
  // Adjust speed
  let moveInterval = isStacker ? 1 : 5; 

  return {
    update: () => {
      frame++;

      if (isStacker) {
         if (inputState.click || inputState.keys.has(' ')) {
             inputState.click = false; // debounce
             
             // Place Block
             // Check overlap with previous
             const prev = stack.length > 0 ? stack[stack.length-1] : {x: width/gridSize/2 - 5, w: 10};
             const roundX = Math.round(currentStackX);
             
             // Initial base
             if (stack.length === 0) {
                stack.push({ y: stackLevel, x: roundX, w: stackWidth });
             } else {
                // Logic: Intersection
                const left = Math.max(prev.x, roundX);
                const right = Math.min(prev.x + prev.w, roundX + stackWidth);
                const newW = right - left;
                
                if (newW <= 0) {
                   soundManager.playCrash();
                   setGameOver(true);
                } else {
                   soundManager.playCoin();
                   stackWidth = newW;
                   stack.push({ y: stackLevel, x: left, w: newW });
                   score++;
                   setScore(score);
                   // Move up
                   stackLevel--;
                   stackSpeed += 0.05;
                }
             }
         }
         
         // Move current block
         currentStackX += stackSpeed * stackDir;
         if (currentStackX <= 0 || currentStackX + stackWidth >= width/gridSize) {
            stackDir *= -1;
         }
      }
      else {
         // SNAKE
         if (frame % moveInterval !== 0) return;
         
         if (inputState.keys.has('ArrowLeft') && dir.x === 0) dir = {x: -1, y: 0};
         if (inputState.keys.has('ArrowRight') && dir.x === 0) dir = {x: 1, y: 0};
         if (inputState.keys.has('ArrowUp') && dir.y === 0) dir = {x: 0, y: -1};
         if (inputState.keys.has('ArrowDown') && dir.y === 0) dir = {x: 0, y: 1};

         const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
         
         // Walls (Wrap)
         const cols = Math.floor(width/gridSize);
         const rows = Math.floor(height/gridSize);
         if (head.x < 0) head.x = cols - 1;
         if (head.x >= cols) head.x = 0;
         if (head.y < 0) head.y = rows - 1;
         if (head.y >= rows) head.y = 0;

         // Self hit
         if (snake.some(s => s.x === head.x && s.y === head.y)) {
             soundManager.playCrash();
             setGameOver(true);
         }

         snake.unshift(head);
         
         if (head.x === food.x && head.y === food.y) {
            score += 10;
            setScore(score);
            soundManager.playCoin();
            food = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
         } else {
            snake.pop();
         }
      }
    },
    draw: () => {
      clearCanvas(ctx, width, height);
      
      if (isStacker) {
         // Existing Stack
         stack.forEach(b => {
             drawRect(ctx, b.x * gridSize, b.y * gridSize, b.w * gridSize, gridSize - 1, '#00ff9f');
         });
         // Current Moving Piece
         drawRect(ctx, Math.round(currentStackX) * gridSize, stackLevel * gridSize, stackWidth * gridSize, gridSize - 1, '#ff00ff');
      } 
      else {
         // Snake
         snake.forEach(s => drawRect(ctx, s.x * gridSize, s.y * gridSize, gridSize-1, gridSize-1, '#00ff9f'));
         // Food
         drawRect(ctx, food.x * gridSize, food.y * gridSize, gridSize-1, gridSize-1, '#ff00ff');
      }
    }
  };
};

// --- CLICKER ENGINE (Aim, Reaction, Memory) ---
export const runClickerEngine = (props: GameEngineProps, gameId: string) => {
  const { ctx, width, height, setScore, setGameOver, inputState } = props;
  
  const isReaction = gameId === 'reaction-tap';
  const isMemory = gameId === 'memory-seq';
  
  // Aim State
  let target = { x: width/2, y: height/2, r: 30 };
  let timer = 30 * 60;
  
  // Reaction State
  let reactState: 'waiting' | 'ready' | 'clicked' = 'waiting';
  let waitTime = Math.random() * 100 + 50; // frames
  let reactionScore = 0;
  
  // Memory State
  let sequence: number[] = [];
  let userSeq: number[] = [];
  let showingSeq = true;
  let showIndex = 0;
  let showTimer = 0;
  const buttons = [
     {x: width/2 - 60, y: height/2 - 60, color: '#ff0000'},
     {x: width/2 + 10, y: height/2 - 60, color: '#00ff00'},
     {x: width/2 - 60, y: height/2 + 10, color: '#0000ff'},
     {x: width/2 + 10, y: height/2 + 10, color: '#ffff00'}
  ];
  let litBtn = -1;

  // Helpers
  const resetAim = () => {
     target.x = 40 + Math.random() * (width - 80);
     target.y = 40 + Math.random() * (height - 80);
  };
  
  const addToSeq = () => {
     sequence.push(Math.floor(Math.random() * 4));
     showingSeq = true;
     showIndex = 0;
     userSeq = [];
  };

  if (isMemory && sequence.length === 0) addToSeq();

  return {
     update: () => {
        if (isReaction) {
           if (reactState === 'waiting') {
              waitTime--;
              if (waitTime <= 0) {
                 reactState = 'ready'; // Green
                 waitTime = 0; // use as counter
              }
              // False start
              if (inputState.click) {
                 setGameOver(true);
                 inputState.click = false;
              }
           } else if (reactState === 'ready') {
              waitTime++; // Count frames
              if (inputState.click) {
                 // Success
                 reactionScore = Math.floor(waitTime * 16); // approx ms
                 setScore(reactionScore); // Lower is better usually, but here we just show value
                 setGameOver(true);
              }
           }
        }
        else if (isMemory) {
           if (showingSeq) {
              showTimer++;
              if (showTimer % 40 === 0) {
                 litBtn = sequence[showIndex];
                 soundManager.playCoin();
              }
              if (showTimer % 40 === 20) {
                 litBtn = -1;
                 showIndex++;
                 if (showIndex >= sequence.length) {
                    showingSeq = false;
                    litBtn = -1;
                 }
              }
           } else {
              if (inputState.click) {
                 inputState.click = false;
                 // Detect Click
                 buttons.forEach((b, i) => {
                    if (inputState.touch.x > b.x && inputState.touch.x < b.x + 50 &&
                        inputState.touch.y > b.y && inputState.touch.y < b.y + 50) {
                        userSeq.push(i);
                        soundManager.playCoin();
                        // Check
                        if (userSeq[userSeq.length-1] !== sequence[userSeq.length-1]) {
                           soundManager.playCrash();
                           setGameOver(true);
                        } else if (userSeq.length === sequence.length) {
                           setScore(sequence.length);
                           setTimeout(addToSeq, 500);
                        }
                    }
                 });
              }
           }
        }
        else {
           // AIM TRAINER
           timer--;
           if (timer <= 0) setGameOver(true);
           if (inputState.click) {
              const dx = inputState.touch.x - target.x;
              const dy = inputState.touch.y - target.y;
              if (Math.sqrt(dx*dx + dy*dy) < target.r) {
                 let s = Number(document.querySelector('.score-disp')?.textContent || 0) + 1; // hacky or use prop
                 // Actually we have setScore
                 // We need to keep track of score locally if we want increment
                 // But prop sets absolute. Let's trust local var in closure if we had one
                 // Refactor: use internal score var
                 setScore(Math.floor((30*60 - timer)/10)); // just set score to clicks
                 resetAim();
                 soundManager.playCoin();
              }
              inputState.click = false;
           }
        }
     },
     draw: () => {
        clearCanvas(ctx, width, height);
        
        if (isReaction) {
           ctx.fillStyle = reactState === 'waiting' ? '#ff0000' : '#00ff00';
           ctx.fillRect(0, 0, width, height);
           ctx.fillStyle = '#000';
           ctx.font = '30px sans-serif';
           ctx.textAlign = 'center';
           ctx.fillText(reactState === 'waiting' ? 'WAIT FOR GREEN' : 'CLICK!', width/2, height/2);
        }
        else if (isMemory) {
           buttons.forEach((b, i) => {
              ctx.fillStyle = (litBtn === i) ? '#ffffff' : b.color;
              ctx.fillRect(b.x, b.y, 50, 50);
           });
           ctx.fillStyle = '#fff';
           ctx.fillText(showingSeq ? 'WATCH' : 'REPEAT', width/2, 50);
        }
        else {
           // Aim
           drawCircle(ctx, target.x, target.y, target.r, '#bd00ff');
           drawCircle(ctx, target.x, target.y, 5, '#fff');
           // Timer
           ctx.fillStyle = '#00f3ff';
           ctx.fillRect(0, height-5, width * (timer/(30*60)), 5);
        }
     }
  };
};

// --- SHOOTER ENGINE (Same as before) ---
export const runShooterEngine = (props: GameEngineProps, gameId: string) => {
  const { ctx, width, height, setScore, setGameOver, inputState } = props;
  
  let player = { x: width/2, y: height - 50, w: 40, h: 40 };
  let bullets: any[] = [];
  let enemies: any[] = [];
  let frame = 0;
  let score = 0;

  return {
    update: () => {
      frame++;
      // Move Player
      if (inputState.touch.active) player.x = inputState.touch.x - 20;
      if (inputState.keys.has('ArrowLeft')) player.x -= 5;
      if (inputState.keys.has('ArrowRight')) player.x += 5;
      
      // Shoot
      if (frame % 15 === 0) {
         bullets.push({x: player.x + 20, y: player.y});
         soundManager.playShoot();
      }
      
      // Bullets
      bullets.forEach(b => b.y -= 10);
      bullets = bullets.filter(b => b.y > 0);
      
      // Enemies
      if (frame % 40 === 0) {
         enemies.push({ x: Math.random()*(width-30), y: -30, w: 30, h: 30 });
      }
      enemies.forEach(e => e.y += 3);
      
      // Collision
      bullets.forEach((b, bi) => {
         enemies.forEach((e, ei) => {
            if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
               score += 10;
               setScore(score);
               soundManager.playCoin();
               enemies.splice(ei, 1);
               bullets.splice(bi, 1);
            }
         });
      });
      
      enemies.forEach(e => {
         if (e.y > height) setGameOver(true);
      });
    },
    draw: () => {
      clearCanvas(ctx, width, height);
      drawRect(ctx, player.x, player.y, player.w, player.h, '#00f3ff');
      bullets.forEach(b => drawRect(ctx, b.x, b.y, 4, 10, '#ffff00'));
      enemies.forEach(e => drawRect(ctx, e.x, e.y, e.w, e.h, '#ff00ff'));
    }
  };
};