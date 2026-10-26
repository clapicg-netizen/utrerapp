// src/pages/Pasatiempos.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Sparkles, Brain, ArrowLeft, RotateCw, Play, Pause, RefreshCw } from 'lucide-react';

export default function Pasatiempos({ setPaginaActual }) {
  const [juegoActivo, setJuegoActivo] = useState(null);

  // Estados y lógica para el Tetris clásico integrado
  const canvasRef = useRef(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [enPausa, setEnPausa] = useState(false);
  const [jugandoTetris, setJugandoTetris] = useState(false);

  // Lógica del Tetris
  useEffect(() => {
    if (juegoActivo !== 'tetris' || !jugandoTetris) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const BLOCK_SIZE = 20;
    const COLS = 10;
    const ROWS = 20;
    
    let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    const SHAPES = [
      [[1, 1, 1, 1]], // I
      [[1, 1], [1, 1]], // O
      [[0, 1, 0], [1, 1, 1]], // T
      [[1, 0, 0], [1, 1, 1]], // L
      [[0, 0, 1], [1, 1, 1]], // J
      [[0, 1, 1], [1, 1, 0]], // S
      [[1, 1, 0], [0, 1, 1]]  // Z
    ];

    const COLORS = ['', '#38bdf8', '#fbbf24', '#c084fc', '#fb923c', '#60a5fa', '#4ade80', '#f87171'];

    let currentPiece = {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: Math.floor(Math.random() * 7) + 1,
      x: 3,
      y: 0
    };

    function drawBoard() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c]) {
            ctx.fillStyle = COLORS[board[r][c]];
            ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          }
        }
      }
    }

    function drawPiece() {
      ctx.fillStyle = COLORS[currentPiece.color];
      currentPiece.shape.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value) {
            ctx.fillRect((currentPiece.x + c) * BLOCK_SIZE, (currentPiece.y + r) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          }
        });
      });
    }

    function moveDown() {
      currentPiece.y++;
      if (checkCollision()) {
        currentPiece.y--;
        mergePiece();
        clearLines();
        spawnPiece();
      }
    }

    function checkCollision() {
      return currentPiece.shape.some((row, r) => {
        return row.some((value, c) => {
          if (!value) return false;
          let newX = currentPiece.x + c;
          let newY = currentPiece.y + r;
          return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
        });
      });
    }

    function mergePiece() {
      currentPiece.shape.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value && currentPiece.y + r >= 0) {
            board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
          }
        });
      });
    }

    function clearLines() {
      let linesCleared = 0;
      board = board.filter(row => {
        if (row.every(cell => cell !== 0)) {
          linesCleared++;
          return false;
        }
        return true;
      });

      while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
      }

      if (linesCleared > 0) {
        setPuntuacion(prev => prev + linesCleared * 100);
      }
    }

    function spawnPiece() {
      currentPiece = {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: Math.floor(Math.random() * 7) + 1,
        x: 3,
        y: 0
      };
      if (checkCollision()) {
        setGameOver(true);
        setJugandoTetris(false);
      }
    }

    const interval = setInterval(() => {
      if (!enPausa && !gameOver) {
        moveDown();
        drawBoard();
        drawPiece();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [juegoActivo, jugandoTetris, enPausa, gameOver]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* CABECERA HERO */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white p-6 shadow-xl relative overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl"></div>
        <div className="max-w-md mx-auto relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setPaginaActual('home')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Zona Relax
            </span>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Gamepad2 className="text-amber-400" size={28} /> Pasatiempos Utrerapp
          </h1>
          <p className="text-xs text-purple-100 leading-relaxed">
            Ideal para salas de espera, ratos libres o para desconectar un rato. ¡Elige tu juego y a pasar el rato!
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        
        {juegoActivo === null ? (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Elige un Pasatiempo</h2>

            {/* Tarjeta Tetris */}
            <div 
              onClick={() => { setJuegoActivo('tetris'); setJugandoTetris(true); setGameOver(false); setPuntuacion(0); }}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🧱
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Tetris Clásico</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encaja las piezas geométricas y consigue la máxima puntuación.</p>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

            {/* Tarjeta Sudoku */}
            <div 
              onClick={() => setJuegoActivo('sudoku')}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🔢
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Sudoku clásico</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ejercita la mente rellenando la cuadrícula numérica.</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

            {/* Tarjeta Sopa de Letras */}
            <div 
              onClick={() => setJuegoActivo('sopa')}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🔠
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Sopa de Letras Utrerana</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encuentra palabras ocultas relacionadas con nuestra tierra.</p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

          </div>
        ) : juegoActivo === 'tetris' ? (
          /* JUEGO DE TETRIS FUNCIONAL */
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-base">🧱 Tetris Utrerapp</h3>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Puntos: {puntuacion}</span>
            </div>

            <div className="flex justify-center bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
              <canvas ref={canvasRef} width={200} height={400} className="rounded-lg bg-slate-900 border border-slate-800" />
            </div>

            {gameOver && (
              <p className="text-xs font-bold text-red-600 animate-bounce">¡Game Over! Fin de la partida.</p>
            )}

            {/* Controles táctiles en pantalla */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button 
                onClick={() => {}} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-sm"
              >
                ◀️
              </button>
              <button 
                onClick={() => setEnPausa(!enPausa)} 
                className="bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1"
              >
                {enPausa ? <Play size={14} /> : <Pause size={14} />} {enPausa ? 'Seguir' : 'Pausa'}
              </button>
              <button 
                onClick={() => {}} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-sm"
              >
                ▶️
              </button>
            </div>

            <button
              onClick={() => setJuegoActivo(null)}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Salir al menú de juegos
            </button>
          </div>
        ) : (
          /* AVISO PARA OTROS JUEGOS EN DESARROLLO */
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="text-4xl">🚧</div>
            <h3 className="text-lg font-black text-slate-900">
              {juegoActivo === 'sudoku' && 'Sudoku clásico'}
              {juegoActivo === 'sopa' && 'Sopa de Letras Utrerana'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Este pasatiempo estará disponible en la próxima actualización con paneles interactivos. ¡Prueba el Tetris mientras tanto!
            </p>
            <button
              onClick={() => setJuegoActivo(null)}
              className="w-full bg-purple-900 text-white font-bold text-xs py-3 rounded-xl shadow hover:bg-purple-800 transition-colors cursor-pointer"
            >
              Volver a la lista de juegos
            </button>
          </div>
        )}

      </div>
    </div>
  );
}