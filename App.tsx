import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Game, Gamepad2, Search, Zap, Trophy, Dice5, Volume2, VolumeX, User, BarChart3, Palette, Settings } from 'lucide-react';
import { GAMES_LIST, AVATARS, MOCK_LEADERBOARD } from './constants';
import { GameMetadata, GameCategory, Theme, PlayerProfile } from './types';
import GameRunner from './components/GameRunner';
import { soundManager } from './utils/soundManager';

// --- COMPONENTS ---

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {x: number, y: number, vx: number, vy: number, life: number}[] = [];
    let mouse = { x: -100, y: -100 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Add particles on move
      for(let i=0; i<2; i++) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1.0
        });
      }
    };
    window.addEventListener('mousemove', handleMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
      });
      particles = particles.filter(p => p.life > 0);

      // Draw
      const color = getComputedStyle(document.body).getPropertyValue('--color-primary').trim();
      ctx.fillStyle = color || '#00f3ff';
      
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />;
};

function App() {
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [filter, setFilter] = useState<GameCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<Theme>('neon');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState<PlayerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('neon_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('neonArcade_scores') || '{}');
    } catch { return {}; }
  });

  // Effects
  useEffect(() => {
    soundManager.toggle(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    // Apply theme
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Prompt for profile if none exists
    if (!profile) {
      const timer = setTimeout(() => setShowProfileModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const filteredGames = useMemo(() => {
    return GAMES_LIST.filter(game => {
      const matchesFilter = filter === 'All' || game.category === filter;
      const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const handleGameStart = (game: GameMetadata) => {
    setActiveGame(game);
  };

  const handleGameOver = (score: number) => {
    if (activeGame) {
      const currentHigh = highScores[activeGame.id] || 0;
      if (score > currentHigh) {
        const newScores = { ...highScores, [activeGame.id]: score };
        setHighScores(newScores);
        localStorage.setItem('neonArcade_scores', JSON.stringify(newScores));
        
        // Update total score in profile
        if (profile) {
          const diff = score - currentHigh;
          const newProfile = { 
            ...profile, 
            totalScore: profile.totalScore + diff,
            gamesPlayed: profile.gamesPlayed + 1
          };
          setProfile(newProfile);
          localStorage.setItem('neon_profile', JSON.stringify(newProfile));
        }
      } else if (profile) {
         // Just games played increment
         const newProfile = { ...profile, gamesPlayed: profile.gamesPlayed + 1 };
         setProfile(newProfile);
         localStorage.setItem('neon_profile', JSON.stringify(newProfile));
      }
    }
  };

  const createProfile = (name: string, avatar: string) => {
    const newProfile: PlayerProfile = {
      username: name || 'Player 1',
      avatar: avatar,
      totalScore: 0,
      gamesPlayed: 0
    };
    setProfile(newProfile);
    localStorage.setItem('neon_profile', JSON.stringify(newProfile));
    setShowProfileModal(false);
  };

  const surpriseMe = () => {
    const random = GAMES_LIST[Math.floor(Math.random() * GAMES_LIST.length)];
    handleGameStart(random);
  };

  const toggleTheme = () => {
    if (theme === 'neon') setTheme('retro');
    else if (theme === 'retro') setTheme('zen');
    else setTheme('neon');
  };

  return (
    <div className="min-h-screen font-body text-theme-text selection:bg-theme-primary selection:text-theme-bg transition-colors duration-500">
      <Particles />

      {/* --- PROFILE MODAL --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full animate-float">
            <h2 className="text-3xl font-display font-bold text-center mb-6 text-theme-primary">CREATE IDENTITY</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {AVATARS.map(char => (
                <button 
                  key={char}
                  onClick={() => {
                    const nameInput = document.getElementById('username-input') as HTMLInputElement;
                    createProfile(nameInput.value, char);
                  }}
                  className="text-4xl p-4 hover:bg-white/10 rounded-xl transition-transform hover:scale-110"
                >
                  {char}
                </button>
              ))}
            </div>
            <input 
              id="username-input"
              type="text" 
              placeholder="Enter Codename..." 
              className="w-full bg-black/40 border-2 border-theme-primary/30 rounded-lg px-4 py-3 text-lg focus:border-theme-primary outline-none mb-6 text-center font-bold"
              onKeyDown={(e) => {
                 if(e.key === 'Enter') createProfile(e.currentTarget.value, AVATARS[0]);
              }}
            />
            <p className="text-center text-sm text-theme-muted">Select an avatar to start</p>
          </div>
        </div>
      )}

      {/* --- LEADERBOARD MODAL --- */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full relative">
            <button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 hover:text-theme-primary"><VolumeX className="w-6 h-6 rotate-45" /></button>
            <h2 className="text-3xl font-display font-bold text-center mb-6 flex items-center justify-center gap-3">
              <Trophy className="text-yellow-400" /> GLOBAL RANKINGS
            </h2>
            
            <div className="space-y-3">
              {/* User Rank */}
              {profile && (
                <div className="bg-theme-primary/20 border border-theme-primary p-4 rounded-xl flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <span className="text-2xl">{profile.avatar}</span>
                      <div>
                        <div className="font-bold text-lg">{profile.username}</div>
                        <div className="text-xs text-theme-muted">YOU</div>
                      </div>
                   </div>
                   <div className="font-mono text-xl font-bold">{profile.totalScore.toLocaleString()}</div>
                </div>
              )}

              {/* Global List */}
              {MOCK_LEADERBOARD.map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="font-display font-bold text-theme-muted w-6">#{idx + 1}</div>
                      <div className="text-xl">{entry.avatar}</div>
                      <div className="font-bold">{entry.username}</div>
                   </div>
                   <div className="font-mono text-theme-primary">{entry.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeGame ? (
        <GameRunner 
          game={activeGame} 
          onExit={() => setActiveGame(null)} 
          onGameOver={handleGameOver}
        />
      ) : (
        <>
          {/* Navbar */}
          <nav className="sticky top-0 z-40 glass-panel border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-8 h-8 text-theme-primary animate-pulse-fast" />
                <span className="font-display text-2xl font-bold tracking-wider">
                  NEON<span className="text-theme-secondary">ARCADE</span>
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                 <button onClick={toggleTheme} className="p-2 hover:bg-white/10 rounded-full transition text-theme-muted hover:text-theme-primary" title="Switch Theme">
                   <Palette className="w-5 h-5" />
                 </button>
                 <button onClick={() => setShowLeaderboard(true)} className="p-2 hover:bg-white/10 rounded-full transition text-theme-muted hover:text-yellow-400" title="Leaderboard">
                   <BarChart3 className="w-5 h-5" />
                 </button>
                 <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 hover:bg-white/10 rounded-full transition text-theme-muted hover:text-theme-primary">
                   {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                 </button>
                 
                 {profile ? (
                   <div onClick={() => setShowProfileModal(true)} className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition">
                     <span className="text-lg">{profile.avatar}</span>
                     <div className="flex flex-col items-start leading-none">
                       <span className="text-xs font-bold">{profile.username}</span>
                       <span className="text-[10px] text-theme-primary">{profile.totalScore} PTS</span>
                     </div>
                   </div>
                 ) : (
                   <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 text-sm font-bold bg-theme-primary text-theme-bg px-4 py-2 rounded-full hover:opacity-90">
                     <User className="w-4 h-4" /> LOGIN
                   </button>
                 )}
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <header className="relative pt-20 pb-32 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-theme-primary/20 via-theme-bg to-theme-bg z-0 pointer-events-none"></div>
             <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-5xl md:text-7xl font-display font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-theme-primary via-white to-theme-secondary drop-shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
                  LEVEL UP YOUR REALITY
                </h1>
                <p className="text-xl text-theme-muted max-w-2xl mx-auto mb-10 font-body">
                  Dive into the ultimate collection of retro classics and viral hits. 
                  Zero load times. Pure skill.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                   <button onClick={surpriseMe} className="group relative px-8 py-4 bg-theme-secondary text-white font-bold rounded overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative flex items-center gap-2 font-display">
                        <Dice5 className="w-5 h-5" /> SURPRISE ME
                      </span>
                   </button>
                </div>
             </div>
          </header>

          {/* Game Grid */}
          <main className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
             
             {/* Controls */}
             <div className="glass-panel p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg shadow-black/20">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                   {['All', ...Object.values(GameCategory)].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                          filter === cat 
                          ? 'bg-theme-primary text-theme-bg shadow-[0_0_15px_rgba(var(--color-primary),0.4)]' 
                          : 'bg-white/5 text-theme-muted hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                   ))}
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                   <input 
                      type="text" 
                      placeholder="Search games..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-theme-bg border border-theme-muted/20 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-theme-primary text-sm text-theme-text"
                   />
                </div>
             </div>

             {/* Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game, idx) => (
                   <div 
                      key={game.id} 
                      className="group relative bg-theme-card rounded-xl overflow-hidden border border-white/5 hover:border-theme-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.2)] hover:-translate-y-1"
                   >
                      <div className="aspect-video relative overflow-hidden">
                         <img 
                           src={game.thumbnailUrl} 
                           alt={game.name} 
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500"
                         />
                         <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur rounded text-xs font-bold text-white border border-white/10">
                            {game.difficulty}
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-theme-card to-transparent"></div>
                      </div>
                      
                      <div className="p-5">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <h3 className="font-display text-lg font-bold group-hover:text-theme-primary transition-colors">{game.name}</h3>
                               <p className="text-xs text-theme-muted">{game.category}</p>
                            </div>
                            {highScores[game.id] !== undefined && (
                               <div className="text-right">
                                  <div className="text-[10px] text-theme-muted uppercase tracking-widest">Best</div>
                                  <div className="font-mono text-theme-secondary">{highScores[game.id]}</div>
                               </div>
                            )}
                         </div>
                         <p className="text-theme-muted text-sm mb-4 line-clamp-2">{game.description}</p>
                         
                         <button 
                            onClick={() => handleGameStart(game)}
                            className="w-full py-2 bg-white/5 hover:bg-theme-primary hover:text-theme-bg border border-white/10 hover:border-transparent rounded font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]"
                         >
                            <Zap className="w-4 h-4" /> PLAY NOW
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             {filteredGames.length === 0 && (
                <div className="text-center py-20 text-theme-muted">
                   <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p>No games found matching your search.</p>
                </div>
             )}

          </main>

          <footer className="border-t border-white/5 bg-theme-bg py-12 text-center text-theme-muted text-sm relative z-10">
             <p>© 2024 NEON ARCADE. All Rights Reserved.</p>
             <p className="mt-2 opacity-50">Built for the future.</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;