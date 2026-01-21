import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameMetadata, GameEngineProps, InputState, Difficulty } from '../types';
import { runRunnerEngine, runGridEngine, runShooterEngine, runPhysicsEngine, runClickerEngine } from '../engines/gameLogic';
import { Play, RotateCcw, X, Pause, LogOut } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

interface GameRunnerProps {
  game: GameMetadata;
  onExit: () => void;
  onGameOver: (score: number) => void;
}

const GameRunner: React.FC<GameRunnerProps> = ({ game, onExit, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const engineRef = useRef<{ update: () => void; draw: () => void } | null>(null);
  const scoreRef = useRef(0); // Ref to track score without closure staleness
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Input State Ref to avoid re-renders on every input
  const inputState = useRef<InputState>({
    keys: new Set(),
    touch: { x: 0, y: 0, active: false },
    click: false
  });

  // Handle Score Updates
  const handleSetScore = useCallback((newScore: number) => {
    scoreRef.current = newScore;
    setScore(newScore);
  }, []);

  // Handle Game Over
  const handleSetGameOver = useCallback((isOver: boolean) => {
    setGameOver(isOver);
    if (isOver) {
      onGameOver(scoreRef.current);
    }
  }, [onGameOver]);

  // Initialize Engine (Only once per game session)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size initially
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy previous engine if any (though usually component remounts)
    engineRef.current = null;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(false);

    const engineProps: GameEngineProps = {
      canvas,
      ctx,
      width: canvas.width,
      height: canvas.height,
      setScore: handleSetScore,
      setGameOver: handleSetGameOver,
      inputState: inputState.current,
      difficulty: game.difficulty
    };

    let newEngine;
    switch (game.engineType) {
      case 'runner': newEngine = runRunnerEngine(engineProps, game.id); break;
      case 'grid': newEngine = runGridEngine(engineProps, game.id); break;
      case 'shooter': newEngine = runShooterEngine(engineProps, game.id); break;
      case 'physics': newEngine = runPhysicsEngine(engineProps, game.id); break;
      case 'clicker': newEngine = runClickerEngine(engineProps, game.id); break;
      default: newEngine = runRunnerEngine(engineProps, game.id); break;
    }
    
    engineRef.current = newEngine;

    // We do NOT add handleSetScore/handleSetGameOver to dependency array as they are stable (or should be)
    // but to be safe we depend on 'game' which changes when a new game is selected.
  }, [game]); // Removed handleSetScore, handleSetGameOver to prevent re-init if they change (they are useCallback'd anyway)

  // Game Loop
  useEffect(() => {
    if (!gameStarted || isPaused || gameOver) {
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
       return;
    }

    const loop = () => {
      if (engineRef.current) {
        engineRef.current.update();
        engineRef.current.draw();
      }
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameStarted, isPaused, gameOver]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Escape') setIsPaused(prev => !prev);
       inputState.current.keys.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => inputState.current.keys.delete(e.key);
    
    const getPos = (e: MouseEvent | Touch) => {
       const rect = canvasRef.current?.getBoundingClientRect();
       if (!rect) return { x: 0, y: 0 };
       return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
       };
    };

    const handleMouseDown = (e: MouseEvent) => {
       const pos = getPos(e);
       inputState.current.touch = { ...pos, active: true };
       inputState.current.click = true;
    };
    const handleMouseUp = () => inputState.current.touch.active = false;
    const handleMouseMove = (e: MouseEvent) => {
       const pos = getPos(e);
       inputState.current.touch = { ...pos, active: inputState.current.touch.active };
    };
    
    const handleTouchStart = (e: TouchEvent) => {
       const pos = getPos(e.touches[0]);
       inputState.current.touch = { ...pos, active: true };
       inputState.current.click = true;
       // Prevent scroll on mobile while playing
       // e.preventDefault(); 
    };
    const handleTouchEnd = () => inputState.current.touch.active = false;
    const handleTouchMove = (e: TouchEvent) => {
       const pos = getPos(e.touches[0]);
       inputState.current.touch = { ...pos, active: true };
       e.preventDefault(); 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const c = canvasRef.current;
    if (c) {
      c.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      c.addEventListener('mousemove', handleMouseMove);
      c.addEventListener('touchstart', handleTouchStart, {passive: false});
      window.addEventListener('touchend', handleTouchEnd);
      c.addEventListener('touchmove', handleTouchMove, {passive: false});
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (c) {
        c.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        c.removeEventListener('mousemove', handleMouseMove);
        c.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
        c.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 glass-panel border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-neon-pink" />
          </button>
          <h2 className="text-xl font-display text-white">{game.name}</h2>
        </div>
        <div className="font-mono text-2xl text-neon-blue">
          SCORE: {score}
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="p-2 hover:bg-white/10 rounded-full">
          {isPaused ? <Play className="w-6 h-6 text-neon-green" /> : <Pause className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Canvas */}
      <div className="w-full h-full max-w-4xl max-h-[80vh] relative">
        <canvas ref={canvasRef} className="w-full h-full border border-neon-blue/30 shadow-2xl shadow-neon-blue/20 rounded-lg bg-[#050510]" />
        
        {/* Start Overlay */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 animate-fade-in z-20">
             <h1 className="text-5xl font-display text-white mb-4 animate-pulse-fast">READY?</h1>
             <p className="text-gray-300 mb-8 font-body text-xl">Tap or Press SPACE to Start</p>
             <button 
                onClick={() => { setGameStarted(true); soundManager.playCoin(); }} 
                className="px-8 py-4 bg-neon-blue text-black font-bold text-xl rounded shadow-[0_0_20px_rgba(0,243,255,0.6)] hover:scale-105 transition-transform"
             >
                START GAME
             </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && gameStarted && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
              <h1 className="text-5xl font-display text-white mb-8 tracking-widest">PAUSED</h1>
              <div className="flex flex-col gap-4 w-64">
                <button 
                   onClick={() => setIsPaused(false)}
                   className="px-6 py-4 bg-neon-blue text-black font-bold text-lg rounded flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                >
                   <Play className="w-5 h-5 fill-current" /> RESUME
                </button>
                <button 
                   onClick={onExit}
                   className="px-6 py-4 bg-white/10 border border-white/20 text-white font-bold text-lg rounded flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                   <LogOut className="w-5 h-5" /> EXIT GAME
                </button>
              </div>
           </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30">
             <h1 className="text-6xl font-display text-neon-pink mb-2">GAME OVER</h1>
             <p className="text-3xl text-white font-mono mb-8">Score: {score}</p>
             <div className="flex gap-4">
                <button 
                  onClick={() => {
                     // Reset game logic
                     const canvas = canvasRef.current;
                     if(canvas && engineRef.current) {
                        // Re-init engine for restart
                        const parent = canvas.parentElement;
                        if (parent) {
                            canvas.width = parent.clientWidth;
                            canvas.height = parent.clientHeight;
                        }
                        const ctx = canvas.getContext('2d')!;
                        const engineProps: GameEngineProps = {
                          canvas,
                          ctx,
                          width: canvas.width,
                          height: canvas.height,
                          setScore: handleSetScore,
                          setGameOver: handleSetGameOver,
                          inputState: inputState.current,
                          difficulty: game.difficulty
                        };
                        
                        let newEngine;
                        switch (game.engineType) {
                          case 'runner': newEngine = runRunnerEngine(engineProps, game.id); break;
                          case 'grid': newEngine = runGridEngine(engineProps, game.id); break;
                          case 'shooter': newEngine = runShooterEngine(engineProps, game.id); break;
                          case 'physics': newEngine = runPhysicsEngine(engineProps, game.id); break;
                          case 'clicker': newEngine = runClickerEngine(engineProps, game.id); break;
                          default: newEngine = runRunnerEngine(engineProps, game.id); break;
                        }
                        engineRef.current = newEngine;
                     }
                     
                     setGameOver(false); 
                     setScore(0); 
                     scoreRef.current = 0;
                     setGameStarted(true); 
                  }}
                  className="px-6 py-3 bg-white text-black font-bold rounded flex items-center gap-2 hover:bg-gray-200"
                >
                  <RotateCcw className="w-5 h-5" /> RESTART
                </button>
                <button 
                  onClick={onExit}
                  className="px-6 py-3 border border-white text-white font-bold rounded hover:bg-white/10"
                >
                  EXIT
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-4 text-center text-white/50 text-sm pointer-events-none">
        Use Arrows / Space / Touch to play
      </div>
    </div>
  );
};

export default GameRunner;