// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com
import express from 'express';
import move from './moveLogic.js'

const app = express();
app.use(express.json());
const config = {
  apiversion: "1",
  author: "Q",       // TODO: Your Battlesnake Username
  color: "#0e45eb", // TODO: Choose color
  head: "dead",  // TODO: Choose head, see https://play.battlesnake.com/customizations/ for options unlocked in your account
  tail: "present",  // TODO: Choose tail, see https://play.battlesnake.com/customizations/ for options unlocked in your account
}

//TODO: respond to GET requests on "/" with the config object above
app.get('/', (req, res) => {
  res.status(200);
  res.json(config);
  res.end();
})
//TODO: respond to POST requests on "/start". Your response itself is ignored, but must have status code "200"
//      the request body will contain objects representing the game instance, game board state, and your snake
//      https://docs.battlesnake.com/api/requests/start
app.post('/start', (req, res) => {
res.status(200);
res.json({
  board: req.body.board,
  turn: req.body.turn,
  game: req.body.game,
  you: req.body.you,
});
res.end();
})


//TODO: respond to POST requests on "/move". Your response should be an object with a "move" property and optionally
//      a "shout" property. The request body again contains objects representing the game state
//      https://docs.battlesnake.com/api/requests/move\
app.post('/move', (req, res) => {
  const gameState = req.body  
  res.status(200);
  const nextMoves = move(gameState);
  console.log("Next Moves: ", nextMoves);
  let moves = {
    move: nextMoves.move,
    shout: "hello",
  };
  res.json(moves);
  res.end();
})

//TODO: respond to POST requests on "/end", which signals the end of a game. Your response itself is ignored, 
//      but must have status code "200" the request body will contain objects representing the game
//      https://docs.battlesnake.com/api/requests/end
app.post('/end', (req, res) => {
res.status(200);
res.json(req.body)
})

const host = '0.0.0.0';
const port = process.env.PORT || 8000;

app.listen(port, host, () => {
  console.log(`Running Battlesnake at http://${host}:${port}...`)
});