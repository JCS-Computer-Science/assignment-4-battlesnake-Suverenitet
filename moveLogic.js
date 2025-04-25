export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };
    
    // We've included code to prevent your Battlesnake from moving backwards
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const food = gameState.board.food;
    const snakes = gameState.board.snakes
    const mySnake = gameState.you
    const possibleMoves = {
        up: { x: myHead.x, y: myHead.y + 1 },
        down: { x: myHead.x, y: myHead.y - 1 },
        left: { x: myHead.x - 1, y: myHead.y },
        right: { x: myHead.x + 1, y: myHead.y },
    };
    
    if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
        moveSafety.left = false;
        
    } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
        moveSafety.right = false;
        
    } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
        moveSafety.down = false;
        
    } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
        moveSafety.up = false;
    }
    
    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board
    if (myHead.y == gameState.board.height - 1) {
        moveSafety.up = false;
    }
    if (myHead.y == (gameState.board.height - gameState.board.height)) {
        moveSafety.down = false;
    }
    if (myHead.x == gameState.board.width - 1) {
        moveSafety.right = false;
    }
    if (myHead.x == gameState.board.width - gameState.board.width) {
        moveSafety.left = false;
    }
    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
   for (let i = 0; i < gameState.you.body.length; i++) {
    if (myHead.x == (gameState.you.body[i].x + 1) && myHead.y == gameState.you.body[i].y) {
        moveSafety.left = false;
    }
    if (myHead.x == (gameState.you.body[i].x - 1) && myHead.y == gameState.you.body[i].y) {
        moveSafety.right = false;
    }
    if (myHead.y == (gameState.you.body[i].y + 1) && myHead.x == gameState.you.body[i].x) {
        moveSafety.down = false;
    }
    if (myHead.y == (gameState.you.body[i].y - 1) && myHead.x == gameState.you.body[i].x) {
        moveSafety.up = false;
    }
   }
    
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    for (let i = 0; i < gameState.board.snakes.length; i++) {
        const snakess = gameState.board.snakes[i]
        for (let s = 0; s < snakess.body.length; s++) {
            const otherSnakePos = snakess.body[s]
        if (myHead.x - 1 === otherSnakePos.x && myHead.y == otherSnakePos.y) {
            moveSafety.left = false;
        }
        if (myHead.x + 1 === otherSnakePos.x && myHead.y == otherSnakePos.y) {
            moveSafety.right = false;
        }
        if (myHead.y - 1 === otherSnakePos.y && myHead.x == otherSnakePos.x) {
            moveSafety.down = false;
        }
        if (myHead.y + 1 === otherSnakePos.y && myHead.x == otherSnakePos.x) {
            moveSafety.up = false;
        }
    }
       }
    // Are there any safe moves left?
        const predictEnemyMoves = (snake) => {
        const enemyHead = snake.head;
        const enemyPossibleMoves = [
            { x: enemyHead.x, y: enemyHead.y + 1 },
            { x: enemyHead.x, y: enemyHead.y - 1 },
            { x: enemyHead.x - 1, y: enemyHead.y },
            { x: enemyHead.x + 1, y: enemyHead.y },
        ];
        return enemyPossibleMoves.filter(move => {
            return move.x >= 0 && move.x < gameState.board.height &&
                   move.y >= 0 && move.y < gameState.board.height &&
                   !snake.body.some(segment => segment.x === move.x && segment.y === move.y);
        });
    };

    snakes.forEach(snake => {
        if (snake.id !== mySnake.id) {
            const enemyFutureMoves = predictEnemyMoves(snake);
            enemyFutureMoves.forEach(pos => {
                for (const move in possibleMoves) {
                    const myPos = possibleMoves[move];
                    if (myPos.x === pos.x && myPos.y === pos.y) {
                        moveSafety[move] = false; // Avoid predicted enemy moves
                    }
                }
            });
        }
    });
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length == 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }
    
    
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    const distanceToEnemyHeads = (pos) => {
        const enemyHeads = snakes
            .filter(snake => snake.id !== mySnake.id) // Exclude yourself
            .map(snake => snake.head);

        if (enemyHeads.length === 0) return Infinity;
        return Math.min(...enemyHeads.map(h => Math.abs(h.x - pos.x) + Math.abs(h.y - pos.y)));
    };
    const distanceToFood = (pos) => {
        if (food.length === 0) return Infinity;
        return Math.min(...food.map(f=> Math.abs(f.x - pos.x) + Math.abs(f.y - pos.y)));

    }
    let bestMove = safeMoves[0];
    let minDistanceToEnemy = Infinity;
    let minDistanceToFood = Infinity;
     for (const move of safeMoves) {
        const nextPosition = possibleMoves[move];
        const distanceToEnemy = distanceToEnemyHeads(nextPosition);
        const distanceToFoodOption = distanceToFood(nextPosition);

        // Prioritize attacking smaller snakes
        if (distanceToEnemy < minDistanceToEnemy && mySnake.length > 1) {
            bestMove = move;
            minDistanceToEnemy = distanceToEnemy;
        }

        // If no aggressive option, prioritize food
        if (distanceToEnemy > distanceToFoodOption && distanceToFoodOption < minDistanceToFood) {
            bestMove = move;
            minDistanceToFood = distanceToFoodOption;
        }
    }

    console.log(`MOVE ${gameState.turn}: ${bestMove}`)
    return { move: bestMove };
} 