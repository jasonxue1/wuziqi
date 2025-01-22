const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const stepsDisplay = document.getElementById('steps');
const restartButton = document.getElementById('restart');
const undoButton = document.getElementById('undo');

// 棋盘配置
const size = 19; // 棋盘格数
let boardSize = Math.min(window.innerWidth * 0.9, 600); // 棋盘大小随屏幕宽度自适应，最大600px
canvas.width = canvas.height = boardSize;
const cellSize = boardSize / size;

let board = Array.from({ length: size }, () => Array(size).fill(0));
let moveHistory = []; // 记录每一步的落子
let currentPlayer = 1; // 1代表黑棋，2代表白棋
let gameOver = false;

// 步数计数
let steps = 0;

// 绘制棋盘
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    for (let i = 0; i < size; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
    }
    // 重绘棋子
    for (let { x, y, player } of moveHistory) {
        drawPiece(x, y, player);
    }
}

// 绘制棋子
function drawPiece(x, y, player) {
    ctx.beginPath();
    ctx.arc(
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        2 * Math.PI
    );
    ctx.fillStyle = player === 1 ? 'black' : 'white';
    ctx.fill();
}

// 棋子落下
canvas.addEventListener('click', (e) => {
    if (gameOver) return; // 如果游戏结束，不允许继续落子
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (board[y][x] === 0) {
        board[y][x] = currentPlayer;
        moveHistory.push({ x, y, player: currentPlayer }); // 记录落子历史
        drawPiece(x, y, currentPlayer);
        steps++;
        stepsDisplay.textContent = `当前步数：${steps}`;

        if (checkWin(x, y, currentPlayer)) {
            info.textContent = `玩家${currentPlayer}获胜！🎉`;
            gameOver = true;
        } else {
            currentPlayer = 3 - currentPlayer; // 切换玩家
            info.textContent = `轮到玩家${currentPlayer}（${currentPlayer === 1 ? '黑棋' : '白棋'}）`;
        }
    }
});

// 检查胜负
function checkWin(x, y, player) {
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1] // 四个方向
    ];

    for (let [dx, dy] of directions) {
        let count = 1;
        for (let step = 1; step < 5; step++) {
            const nx = x + dx * step;
            const ny = y + dy * step;
            if (nx >= 0 && ny >= 0 && nx < size && ny < size && board[ny][nx] === player) {
                count++;
            } else {
                break;
            }
        }
        for (let step = 1; step < 5; step++) {
            const nx = x - dx * step;
            const ny = y - dy * step;
            if (nx >= 0 && ny >= 0 && nx < size && ny < size && board[ny][nx] === player) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) return true;
    }
    return false;
}

// 悔棋功能
undoButton.addEventListener('click', () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory.pop(); // 移除最后一步
    board[lastMove.y][lastMove.x] = 0; // 清空棋盘对应位置
    currentPlayer = lastMove.player; // 恢复到悔棋前的玩家
    steps--;
    stepsDisplay.textContent = `当前步数：${steps}`;
    gameOver = false; // 恢复游戏状态
    info.textContent = `轮到玩家${currentPlayer}（${currentPlayer === 1 ? '黑棋' : '白棋'}）`;
    drawBoard(); // 重绘棋盘和棋子
});

// 重新开始游戏
restartButton.addEventListener('click', () => {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    moveHistory = [];
    currentPlayer = 1;
    steps = 0;
    gameOver = false;
    info.textContent = '轮到玩家1（黑棋）';
    stepsDisplay.textContent = '当前步数：0';
    drawBoard();
});

// 初始化
drawBoard();