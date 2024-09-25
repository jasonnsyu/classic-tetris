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

  calcValue();

  let isGameRunning = false;
  let isGamePaused = false;
  let timerId;
  let gameSpeed = 500;
  let delay = gameSpeed * 0.2;
  let score = 0;
  let lines = 0;

  document.addEventListener("updateGameSpeed", (event) => {
    gameSpeed = event.detail.gameSpeed;
    console.log(`Game speed updated to: ${gameSpeed}`);

    if (isGameRunning) {
      clearInterval(timerId);
      timerId = setInterval(gameLoop, gameSpeed);
    }
  });

  function gameLoop() {
    if (isGameRunning) {
      draw();
      moveDown();
    }
  }

  window.addEventListener("keydown", (e) => {
    console.log(e.key);

    // Start new game or restart after Game Over
    if (e.key === " " || e.code === "Space") {
      if (!isGameRunning) {
        // Reset game state
        isGameRunning = true;
        score = 0;
        lines = 0;
        updateScore();
        newTetrimino();
        board.forEach((row) => row.fill(0));

        // Start game loop
        timerId = setInterval(gameLoop, gameSpeed);
        displayMessage("Game Started!");
      }
    } else if ((e.key === "p" || e.code === "KeyP") && isGameRunning) {
      isGameRunning = false;
      isGamePaused = true;
      displayMessage("Game Paused.");
    } else if ((e.key === "p" || e.code === "KeyP") && !isGameRunning) {
      isGameRunning = true;
      isGamePaused = false;
      displayMessage("Game Resumed.");
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
    if (isGameRunning && !keysPressed[e.key]) {
      keysPressed[e.key] = true; // Mark the key as pressed

      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowDown"
      ) {
        if (isKeyEnabled) {
          if (e.key === "ArrowLeft") {
            moveLeft();
          } else if (e.key === "ArrowRight") {
            moveRight();
          } else if (e.key === "ArrowDown") {
            moveDown();
          }

          // Disable other keys temporarily after action
          isKeyEnabled = false;
          setTimeout(() => {
            isKeyEnabled = true;
          }, delay);
        }
      } else if (e.key === "z") {
        // Rotation keys are "spammable" (no delay)
        rotateTetrominoClockwise();
        console.log("Rotated Clockwise");
      } else if (e.key === "x") {
        // Rotation keys are "spammable" (no delay)
        rotateTetrominoCounterclockwise();
        console.log("Rotated Counterclockwise");
      }
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

  // Rotate matrix 90 degrees clockwise
  function rotateMatrixClockwise(matrix) {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
  }

  // Rotate matrix 90 degrees counterclockwise
  function rotateMatrixCounterclockwise(matrix) {
    return matrix[0].map((_, i) =>
      matrix.map((row) => row[row.length - 1 - i])
    );
  }

  // Rotate the tetromino clockwise
  function rotateTetrominoClockwise() {
    const tempShape = currentTetromino.shape;
    currentTetromino.shape = rotateMatrixClockwise(tempShape);

    // Check for collision, and revert to previous shape if collision is detected
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

  // Rotate the tetromino counterclockwise
  function rotateTetrominoCounterclockwise() {
    const tempShape = currentTetromino.shape;
    currentTetromino.shape = rotateMatrixCounterclockwise(tempShape);

    // Check for collision, and revert to previous shape if collision is detected
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
