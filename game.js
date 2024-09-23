document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const displayMessage = (param) => {
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.75;
    ctx.fillRect(
      0,
      canvas.height / 2 - canvas.height / 20,
      canvas.width,
      canvas.height / 10
    );

    ctx.globalAlpha = 1;
    ctx.fillStyle = "White";
    ctx.font = "1vw monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(param, canvas.width / 2, canvas.height / 2);
  };
  displayMessage("Press space to start!");

  const grid = canvas.width / 10;
  const rows = 20;
  const columns = 10;
  const board = Array.from({ length: rows }, () => Array(columns).fill(0));

  console.log(board);

  let isGameRunning = false;
  let isGamePaused = false;
  let timerId;
  let gameSpeed = 500;
  let delay = gameSpeed * 0.4;
  let score = 0;
  let lines = 0;

  window.addEventListener("keydown", (e) => {
    console.log(e.key);
    if (
      (e.key === " " || e.code == "Space") &&
      !isGameRunning &&
      !isGamePaused
    ) {
      isGameRunning = true;

      score = 0;
      updateScore();
      newTetrimino();
      board.forEach((row) => row.fill(0));

      timerId = setInterval(gameLoop, gameSpeed);
    } else if ((e.key === "p" || e.code == "KeyP") && isGameRunning) {
      isGameRunning = false;
      isGamePaused = true;
      displayMessage("Game Paused.");
    } else if ((e.key === "p" || e.code == "KeyP") && !isGameRunning) {
      isGameRunning = true;
      isGamePaused = false;
    }
  });

  function newTetrimino() {
    const types = Object.keys(tetrominoes);
    const type = types[Math.floor(Math.random() * types.length)];

    currentTetromino = {
      shape: tetrominoes[type],
      x: Math.floor(columns / 2) - Math.floor(tetrominoes[type][0].length / 2),
      y: 0,
      type,
    };
    console.log(columns, currentTetromino);
  }

  function gameLoop() {
    if (isGameRunning) {
      draw();
      moveDown();
    }
  }

  function draw() {
    if (isGameRunning) {
      drawBoard();
      drawGrid();

      drawTetromino(
        currentTetromino.shape,
        currentTetromino.x,
        currentTetromino.y
      );
    }
  }

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (board[y][x]) {
          drawSquare(x, y, board[y][x]);
        }
      }
    }
  }

  function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * grid, y * grid, grid, grid);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(x * grid, y * grid, grid, grid);
  }

  function drawTetromino(tetromino, offSetX, offSetY) {
    tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawSquare(x + offSetX, y + offSetY, colors[currentTetromino.type]);
        }
      });
    });
  }

  let isKeyEnabled = true;
  let keysPressed = {};

  document.addEventListener("keydown", (e) => {
    if (isGameRunning && isKeyEnabled && !keysPressed[e.key]) {
      keysPressed[e.key] = true; // Mark the key as pressed

      if (e.key === "ArrowLeft") {
        moveLeft();
      } else if (e.key === "ArrowRight") {
        moveRight();
      } else if (e.key === "ArrowDown") {
        moveDown();
      } else if (e.key === "ArrowUp") {
        rotateTetromino();
      }

      isKeyEnabled = false;
      setTimeout(() => {
        isKeyEnabled = true;
      }, delay);
    }
  });

  document.addEventListener("keyup", (e) => {
    keysPressed[e.key] = false;
  });

  function collisionDetection(tetromino, offSetX, offSetY) {
    return tetromino.some((row, y) => {
      return row.some((value, x) => {
        if (value) {
          const newX = x + offSetX;
          const newY = y + offSetY;
          return (
            newX < 0 ||
            newX >= columns ||
            newY < 0 ||
            newY >= rows ||
            board[newY][newX]
          );
        }
        return false;
      });
    });
  }

  function moveLeft() {
    if (
      !collisionDetection(
        currentTetromino.shape,
        currentTetromino.x - 1,
        currentTetromino.y
      )
    ) {
      currentTetromino.x--;
    }
  }

  function moveRight() {
    if (
      !collisionDetection(
        currentTetromino.shape,
        currentTetromino.x + 1,
        currentTetromino.y
      )
    ) {
      currentTetromino.x++;
    }
  }

  function moveDown() {
    if (
      !collisionDetection(
        currentTetromino.shape,
        currentTetromino.x,
        currentTetromino.y + 1
      )
    ) {
      currentTetromino.y++;
    } else {
      mergeTetromino();
      newTetrimino();

      if (
        collisionDetection(
          currentTetromino.shape,
          currentTetromino.x,
          currentTetromino.y
        )
      ) {
        isGameRunning = false;
        clearInterval(timerId);
        displayMessage("Game Over!");
      }
    }
  }

  function rotateMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
  }

  function rotateTetromino() {
    const tempShape = currentTetromino.shape;
    currentTetromino.shape = rotateMatrix(tempShape);

    if (
      collisionDetection(
        currentTetromino.shape,
        currentTetromino.x,
        currentTetromino.y
      )
    ) {
      currentTetromino.shape = tempShape;
    }
  }

  function mergeTetromino() {
    currentTetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          board[y + currentTetromino.y][x + currentTetromino.x] =
            colors[currentTetromino.type];
        }
      });
    });
    checkLines();
  }

  function checkLines() {
    for (let y = rows - 1; y >= 0; y--) {
      if (board[y].every((cell) => cell)) {
        board.splice(y, 1);
        board.unshift(Array(columns).fill(0));
        score += 100;
        lines += 1;
        updateScore();
        y = rows;
      }
    }
  }

  function updateScore() {
    document.getElementById("score").textContent = score;
    document.getElementById("lines").textContent = lines;
  }

  function drawGrid() {
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "#232332";
    ctx.shadowBlur = 0;

    for (let i = 0; i < rows; i++) {
      let f = (canvas.width / columns) * i;
      ctx.beginPath();
      ctx.moveTo(f, 0);
      ctx.lineTo(f, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, f);
      ctx.lineTo(canvas.width, f);
      ctx.stroke();
      ctx.closePath();
    }
  }
});
