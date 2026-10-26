// src/pages/Pasatiempos.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Sparkles, ArrowLeft, RotateCw, Play, Pause } from 'lucide-react';

export default function Pasatiempos({ setPaginaActual }) {
  const [juegoActivo, setJuegoActivo] = useState(null);

  // Estados y lógica del Tetris
  const canvasRef = useRef(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [enPausa, setEnPausa] = useState(false);
  const [jugandoTetris, setJugandoTetris] = useState(false);
  
  const tetrisRef = useRef({
    board: Array.from({ length: 20 }, () => Array(10).fill(0)),
    currentPiece: null
  });

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

  const checkCollision = (piece, board) => {
    return piece.shape.some((row, r) => {
      return row.some((value, c) => {
        if (!value) return false;
        let newX = piece.x + c;
        let newY = piece.y + r;
        return newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && board[newY][newX]);
      });
    });
  };

  const spawnPiece = useCallback(() => {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    tetrisRef.current.currentPiece = {
      shape: randomShape,
      color: Math.floor(Math.random() * 7) + 1,
      x: 3,
      y: 0
    };
    if (checkCollision(tetrisRef.current.currentPiece, tetrisRef.current.board)) {
      setGameOver(true);
      setJugandoTetris(false);
    }
  }, []);

  const redibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const BLOCK_SIZE = 20;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const board = tetrisRef.current.board;
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (board[r][c]) {
          ctx.fillStyle = COLORS[board[r][c]];
          ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }

    const piece = tetrisRef.current.currentPiece;
    if (piece) {
      ctx.fillStyle = COLORS[piece.color];
      piece.shape.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value) {
            ctx.fillRect((piece.x + c) * BLOCK_SIZE, (piece.y + r) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          }
        });
      });
    }
  }, []);

  const iniciarTetris = () => {
    tetrisRef.current.board = Array.from({ length: 20 }, () => Array(10).fill(0));
    spawnPiece();
    setPuntuacion(0);
    setGameOver(false);
    setEnPausa(false);
    setJugandoTetris(true);
    setJuegoActivo('tetris');
  };

  const fusionar = () => {
    const { currentPiece, board } = tetrisRef.current;
    currentPiece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value && currentPiece.y + r >= 0) {
          board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
        }
      });
    });
  };

  const limpiarLineas = () => {
    let board = tetrisRef.current.board;
    let lines = 0;
    tetrisRef.current.board = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        lines++;
        return false;
      }
      return true;
    });
    while (tetrisRef.current.board.length < 20) {
      tetrisRef.current.board.unshift(Array(10).fill(0));
    }
    if (lines > 0) setPuntuacion(prev => prev + lines * 100);
  };

  const bajarRapido = () => {
    if (!jugandoTetris || enPausa || gameOver) return;
    const piece = tetrisRef.current.currentPiece;
    if (!piece) return;
    piece.y++;
    if (checkCollision(piece, tetrisRef.current.board)) {
      piece.y--;
      fusionar();
      limpiarLineas();
      spawnPiece();
    }
    redibujar();
  };

  const mover = (dir) => {
    if (!jugandoTetris || enPausa || gameOver) return;
    const piece = tetrisRef.current.currentPiece;
    if (!piece) return;
    piece.x += dir;
    if (checkCollision(piece, tetrisRef.current.board)) {
      piece.x -= dir;
    }
    redibujar();
  };

  const girarPieza = () => {
    if (!jugandoTetris || enPausa || gameOver) return;
    const piece = tetrisRef.current.currentPiece;
    if (!piece) return;
    const rotated = piece.shape[0].map((_, index) => piece.shape.map(row => row[index]).reverse());
    const originalShape = piece.shape;
    piece.shape = rotated;
    if (checkCollision(piece, tetrisRef.current.board)) {
      piece.shape = originalShape;
    }
    redibujar();
  };

  useEffect(() => {
    if (!jugandoTetris || enPausa || gameOver) return;
    const interval = setInterval(() => {
      const piece = tetrisRef.current.currentPiece;
      if (!piece) return;
      piece.y++;
      if (checkCollision(piece, tetrisRef.current.board)) {
        piece.y--;
        fusionar();
        limpiarLineas();
        spawnPiece();
      }
      redibujar();
    }, 600);
    return () => clearInterval(interval);
  }, [jugandoTetris, enPausa, gameOver, spawnPiece, redibujar]);

  // Sudoku
  const [sudokuBoard, setSudokuBoard] = useState([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ]);
  const [mensajeSudoku, setMensajeSudoku] = useState("");

  const handleSudokuChange = (r, c, val) => {
    const num = parseInt(val) || 0;
    const nuevo = sudokuBoard.map((row, rowIndex) =>
      row.map((cell, colIndex) => (rowIndex === r && colIndex === c ? num : cell))
    );
    setSudokuBoard(nuevo);
  };

  const comprobarSudoku = () => {
    setMensajeSudoku("¡Buen intento! Sigue rellenando las celdas vacías.");
  };

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
            Ideal para salas de espera, ratos libres o desconectar un rato. ¡Elige tu juego!
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        
        {juegoActivo === null ? (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Elige un Pasatiempo</h2>

            {/* Tarjeta Tetris */}
            <div 
              onClick={iniciarTetris}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🧱
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Tetris Clásico</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encaja las piezas geométricas y consigue puntos.</p>
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
                <p className="text-xs text-slate-500 mt-0.5">Ejercita la mente rellenando la cuadrícula.</p>
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
                <p className="text-xs text-slate-500 mt-0.5">Encuentra palabras ocultas de nuestra tierra.</p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

          </div>
        ) : juegoActivo === 'tetris' ? (
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

            <div className="grid grid-cols-4 gap-2 pt-2">
              <button 
                onClick={() => mover(-1)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-base shadow cursor-pointer"
              >
                ⬅️
              </button>
              <button 
                onClick={girarPieza} 
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow cursor-pointer"
              >
                <RotateCw size={14} /> Girar
              </button>
              <button 
                onClick={bajarRapido} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-base shadow cursor-pointer"
              >
                🔽
              </button>
              <button 
                onClick={() => mover(1)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-base shadow cursor-pointer"
              >
                ➡️
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setEnPausa(!enPausa)} 
                className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-1 cursor-pointer"
              >
                {enPausa ? <Play size={14} /> : <Pause size={14} />} {enPausa ? 'Seguir' : 'Pausa'}
              </button>
              <button
                onClick={() => setJuegoActivo(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Salir al menú
              </button>
            </div>
          </div>
        ) : juegoActivo === 'sudoku' ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <h3 className="font-black text-slate-900 text-base">🔢 Sudoku Clásico</h3>
            <p className="text-xs text-slate-500">Rellena los números del 1 al 9 sin repetir en filas ni columnas.</p>

            <div className="grid grid-cols-9 gap-1 bg-slate-200 p-2 rounded-2xl max-w-[320px] mx-auto">
              {sudokuBoard.map((row, r) =>
                row.map((cell, c) => (
                  <input
                    key={`${r}-${c}`}
                    type="number"
                    min="1"
                    max="9"
                    value={cell === 0 ? '' : cell}
                    onChange={(e) => handleSudokuChange(r, c, e.target.value)}
                    className="w-8 h-8 text-center text-xs font-bold bg-white rounded border border-slate-300 focus:bg-amber-50 focus:outline-none"
                  />
                ))
              )}
            </div>

            {mensajeSudoku && (
              <p className="text-xs font-bold text-indigo-600 bg-indigo-50 p-2 rounded-xl">{mensajeSudoku}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={comprobarSudoku}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow cursor-pointer"
              >
                Comprobar
              </button>
              <button
                onClick={() => setJuegoActivo(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-3 rounded-xl cursor-pointer"
              >
                Menú de Juegos
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <h3 className="font-black text-slate-900 text-base">🔠 Sopa de Letras Utrerana</h3>
            <div className="grid grid-cols-6 gap-1 bg-slate-100 p-3 rounded-2xl max-w-[260px] mx-auto text-xs font-bold text-slate-700">
              {['M','O','S','T','A','C','H','O','N','F','E','I','R','A','L','V','E','R','O','S','U','T','R','E','R','A','P','P','G','H'].map((letra, i) => (
                <div key={i} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                  {letra}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">Busca palabras: MOSTACHON, FERIA, UTRERA</p>
            <button
              onClick={() => setJuegoActivo(null)}
              className="w-full bg-purple-900 text-white font-bold text-xs py-3 rounded-xl shadow hover:bg-purple-800 transition-colors cursor-pointer"
            >
              Volver al menú de juegos
            </button>
          </div>
        )}

      </div>
    </div>
  );
}