export default function move(gameState) {
    const myHead = gameState.you.body[0];
    const myTail = gameState.you.body[gameState.you.body.length - 1];
    const myLength = gameState.you.body.length;
    const food = gameState.board.food;
    const snakes = gameState.board.snakes;
    const maxFloodDepth = gameState.you.body.length * 2;

    const possibleMoves = {
        up: { x: myHead.x, y: myHead.y + 1 },
        down: { x: myHead.x, y: myHead.y - 1 },
        left: { x: myHead.x - 1, y: myHead.y },
        right: { x: myHead.x + 1, y: myHead.y },
    };

    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    // Prevent moving backward
    const myNeck = gameState.you.body[1];
    if (myNeck.x < myHead.x) moveSafety.left = false;
    if (myNeck.x > myHead.x) moveSafety.right = false;
    if (myNeck.y < myHead.y) moveSafety.down = false;
    if (myNeck.y > myHead.y) moveSafety.up = false;

    // Prevent moving out of bounds
    if (myHead.y === gameState.board.height - 1) moveSafety.up = false;
    if (myHead.y === 0) moveSafety.down = false;
    if (myHead.x === gameState.board.width - 1) moveSafety.right = false;
    if (myHead.x === 0) moveSafety.left = false;

    // Prevent collisions with own body
    gameState.you.body.forEach(segment => {
        for (const [move, pos] of Object.entries(possibleMoves)) {
            if (segment.x === pos.x && segment.y === pos.y) {
                moveSafety[move] = false;
            }
        }
    });

    // Prevent collisions with other snakes
    snakes.forEach(snake => {
        snake.body.forEach(segment => {
            for (const [move, pos] of Object.entries(possibleMoves)) {
                if (segment.x === pos.x && segment.y === pos.y) {
                    moveSafety[move] = false;
                }
            }
        });
    });

    // Avoid predicted enemy moves
    snakes.forEach(snake => {
        if (snake.id !== gameState.you.id) {
            const enemyHead = snake.body[0];
            const enemyPossibleMoves = [
                { x: enemyHead.x, y: enemyHead.y + 1 },
                { x: enemyHead.x, y: enemyHead.y - 1 },
                { x: enemyHead.x - 1, y: enemyHead.y },
                { x: enemyHead.x + 1, y: enemyHead.y },
            ];
            enemyPossibleMoves.forEach(pos => {
                for (const [move, myPos] of Object.entries(possibleMoves)) {
                    if (myPos.x === pos.x && myPos.y === pos.y) {
                        moveSafety[move] = false;
                    }
                }
            });
        }
    });

    // Safe moves
    const safeMoves = Object.keys(moveSafety).filter(move => moveSafety[move]);

    if (safeMoves.length === 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }

    // Helper functions
    const calculateSafeArea = (position) => {
        const queue = [position];
        const visited = new Set();
        let areaSize = 0;

        while (queue.length > 0) {
            const pos = queue.shift();
            const key = `${pos.x},${pos.y}`;
            if (visited.has(key)) continue;
            visited.add(key);

            areaSize++;
            const neighbors = [
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x - 1, y: pos.y },
                { x: pos.x + 1, y: pos.y },
            ];
            neighbors.forEach(neighbor => {
                const isWithinBounds = neighbor.x >= 0 && neighbor.x < gameState.board.width &&
                                       neighbor.y >= 0 && neighbor.y < gameState.board.height;
                const isEmpty = !snakes.some(snake =>
                    snake.body.some(segment => segment.x === neighbor.x && segment.y === neighbor.y)
                );
                if (isWithinBounds && isEmpty) queue.push(neighbor);
            });
        }
        return areaSize;
    };

    const distanceToFood = (pos) => food.length > 0
        ? Math.min(...food.map(f => Math.abs(f.x - pos.x) + Math.abs(f.y - pos.y)))
        : Infinity;

    const distanceToCenter = (pos) => {
        const center = { x: Math.floor(gameState.board.width / 2), y: Math.floor(gameState.board.height / 2) };
        return Math.abs(center.x - pos.x) + Math.abs(center.y - pos.y);
    };

    // Scoring moves
    let bestMove = safeMoves[0];
    let maxScore = -Infinity;

    for (const move of safeMoves) {
        const pos = possibleMoves[move];
        const safeAreaSize = calculateSafeArea(pos);
        const toFood = distanceToFood(pos);
        const toCenter = distanceToCenter(pos);

        let score = 0;
        score += safeAreaSize * 2; // Reward open spaces
        score -= toFood * 3; // Reward moves closer to food
        score -= toCenter; // Bias toward the center of the board

        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }

        console.log(`Move "${move}" scored ${score}:`, { pos, safeAreaSize, toFood, toCenter });
    }

    console.log(`MOVE ${gameState.turn}: ${bestMove}`);
    return { move: bestMove };
}