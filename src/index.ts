
enum Piece {
    WHITE = "\u25CB",
    BLACK = "\u25CF",
    EMPTY = " "
}

class Game {
    private _board: Array<Piece> = [];
    private _width: number = 7;
    private _height: number = 6;
    private _turn: boolean = true;

    constructor();
    constructor(g: Game);
    constructor(g?: any) {
        if (g) {
            for (let i = 0; i < g._board.length; i++) {
                this._board.push(g._board[i]);
            }
            this._turn = g._turn;
            this._width = g._width;
            this._height = g._height;
        } else {
            for (let i: number = 0; i < this._width * this._height; i++) {
                this._board.push(Piece.EMPTY);
            }
        }
    }

    //#region getters
    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get board() {
        return this._board;
    }

    get turn() {
        return this._turn;
    }
    //#endregion getters

    //#region private methods
    private index(col: number, row: number): number {
        if (0 <= col && col < this._width && 0 <= row && row < this._height) {
            return (row * this._width) + col;
        }
        return -1; // not on board
    }

    private indexes(index: number): [number, number] {
        if (0 <= index && index < this._board.length) {
            let row = Math.floor(index / this._width);
            let col = index % this._width;
            return [col, row];
        } else {
            return [-1, -1]; // not on board
        }
    }

    private lookFor4(col: number, row: number): Piece {
        let count: number = 0;
        let firstPiece: Piece = this._board[this.index(col, row)]
        // let coords: Array<[number, number]> = []
        if (firstPiece === Piece.EMPTY) {
            return Piece.EMPTY;
        }

        const COORD_EQ: Array<(i: number) => number> = [
            (i) => this.index(col, row + i), // up
            (i) => this.index(col + i, row + i), // right up
            (i) => this.index(col + i, row), // right
            (i) => this.index(col - i, row + i) // left up
        ]

        for (let dir = 0; dir < COORD_EQ.length; dir++) {
            // coords = [];
            for (let i = 0; i < 4; i++) {
                let currentPiece = this._board[COORD_EQ[dir](i)];
                // coords.push(this.indexes(coord_eq[dir](i)));
                if (currentPiece !== Piece.EMPTY && currentPiece === firstPiece) {
                    count++;
                    if (count === 4) {
                        // console.log(`Winner found with dir:${dir}\nstarting at: ${[col, row]}\nwith ${firstPiece}`);
                        // console.log(coords);
                        return firstPiece
                    }
                } else {
                    count = 0;
                    break;
                }
            }
        }

        return Piece.EMPTY;
    }
    //#endregion private methods

    //#region public methods
    public toString() {
        let builder: Array<Array<Piece>> = [];
        let r: Array<string> = [];
        let temp;
        for (let i = 0; i < this._width * this._height; i += this._width) {
            temp = this._board.slice(i, i + this._width);
            // padding to make the edge columns have "|" on them
            builder.push([Piece.EMPTY, ...temp, Piece.EMPTY]);
            r[i / this._width] = builder[i / this._width].join("|")
        }
        return r.reverse().join("\n");
    }

    public placePiece(col: number): void {
        // make sure choice is in range
        if (0 <= col && col < this._width) {
            // find the lowest spot on this row
            let lowestSpot = 0
            for (let row = 0; row < this._height; row++) {
                if (this._board[this.index(col, row)] !== Piece.EMPTY) {
                    lowestSpot = row + 1;
                }
            }
            let i = this.index(col, lowestSpot)
            if (0 <= i && i < this._board.length) {
                this._board[i] = this._turn ? Piece.BLACK : Piece.WHITE;
                this._turn = !this._turn; // Next players turn
            }
        }
    }

    public canPlaceInCol(col: number): boolean {
        // see if you can place a piece in that column
        return this._board[this.index(col, this.height - 1)] === Piece.EMPTY;
    }

    public checkWin(): Piece {
        let win: boolean = false;
        let p: Piece;
        for (let i = 0; i < this._board.length; i++) {
            let col: number, row: number;
            [col, row] = this.indexes(i);
            p = this.lookFor4(col, row)
            if (col >= 0 && row >= 0 && p !== Piece.EMPTY) {
                return p;
            }
        }
        return Piece.EMPTY;
    }
    //#endregion public methods

}

class AI {

    private minimax(node: Game, depth: number = 6): number {
        if (depth == 0 || node.checkWin() !== Piece.EMPTY) {
            return this.heuristic(node);
        }

        let score = 0;
        const newNode = new Game(node);
        let maximizingPlayer: boolean = newNode.turn;

        if (maximizingPlayer) {
            score = -Infinity;
            for (var possibleMove = 0; possibleMove < newNode.width; possibleMove++) {
                if (newNode.canPlaceInCol(possibleMove)) {
                    newNode.placePiece(possibleMove);
                    score = this.heuristic(newNode) + Math.max(score, this.minimax(newNode, depth - 1));
                }
            }
        } else {
            score = Infinity;
            for (var possibleMove = 0; possibleMove < newNode.width; possibleMove++) {
                if (newNode.canPlaceInCol(possibleMove)) {
                    newNode.placePiece(possibleMove);
                    score = this.heuristic(newNode) + Math.min(score, this.minimax(newNode, depth - 1));
                }
            }
        }

        return score;
    }

    public think(node: Game): number {
        let bestMove: number = -1;
        let bestScore: number = -Infinity;

        for (let move = 0; move < node.width; move++) {
            let possibleNextMove = new Game(node);
            possibleNextMove.placePiece(move);
            let score = this.minimax(possibleNextMove);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            console.log(score);
        }

        return bestMove;

    }

    public heuristic(node: Game): number {
        // heuristic is for when the AI is playing with the black pieces
        let p = node.checkWin();
        switch (p) {
            case Piece.BLACK:
                return 1;
            case Piece.WHITE:
                return 2;
            case Piece.EMPTY:
                return -1;
        }

    }

}

const readlinesync = require("readline-sync");

// Player is white. Player goes first
let game = new Game();
let answer: number;
let computer = new AI();

for (let i = 0; i < game.width * game.height; i++) {

    console.log(game.toString());

    if (i % 2 == 0) {
        var res = readlinesync.question(`Where would you like to place a piece? (0-${game.width - 1})\n`);

        answer = Number.parseInt(res);
        // answer = Math.floor(Math.random() * game.width);

        if (0 <= answer && answer < game.width && game.canPlaceInCol(answer)) {
            console.log("placing your piece");
            game.placePiece(answer);
        } else {
            console.log(`Pick a number between 0 and ${game.width - 1}`);
            i--;
        }
    } else {
        console.log("AI is thinking");
        answer = computer.think(game);
        console.log(`done thinking. AI chose ${answer}`);
        game.placePiece(answer)
        console.log(`your turn!`);

    }

    let winner: Piece = game.checkWin();
    if (winner !== Piece.EMPTY) {
        console.log(`THE WINNER IS ${winner}`);
        console.log(game.toString());
        break;
    }
}

