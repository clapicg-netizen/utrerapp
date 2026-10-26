// src/pages/Pasatiempos.jsx
import React, { useState, useEffect, useRef } from 'react';
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

  const spawnPiece = () => {
    const SHAPES = [
      [[1, 1, 1, 1]], // I
      [[1, 1], [1, 1]], // O
      [[0, 1, 0], [1, 1, 1]], // T
      [[1, 0, 0], [1, 1, 1]], // L
      [[0, 0, 1], [1, 1, 1]], // J
      [[0, 1, 1], [1, 1, 0]], // S
      [[1, 1, 0], [0, 1, 1]]  // Z
    ];
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
  };

  const redibujar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const BLOCK_SIZE = 20;
    const COLORS = ['', '#38bdf8', '#fbbf24', '#c084fc', '#fb923c', '#60a5fa', '#4ade80', '#f87171'];

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
  };

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
  }, [jugandoTetris, enPausa, gameOver]);

  // Sudoku
  const [sudokuBoard, setSudokuBoard] = useState([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],