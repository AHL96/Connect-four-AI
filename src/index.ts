
enum Piece {
    WHITE = "\u25CB",
    BLACK = "\u25CF",
    EMPTY = " "
}

class Game {
    private _board: Array<Piece>;
    private _width: number = 10;
    private _height: number = 8;
    private _turn: boolean = true;

    constructor() {
        this._board = [];
        for (let i: number = 0; i < this._width * this._height; i++) {
            this._board.push(Piece.EMPTY);
        }

    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

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

    public printBoard() {
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

    set board(b: Array<Piece>) {
        // setting board by value. not by reference
        this._board = []
        for (let i = 0; i < b.length; i++) {
            this._board.push(b[i]);
        }
    }

    get board() {
        return this._board;
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
            }
            this._turn = !this._turn; // Next players turn
        }
    }

    public lookFor4(col: number, row: number): Piece {
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
}

class AI {

    public think(node: Game, maximizingPlayer: boolean = true): number {
        // Given a game returns the best move to make in the form of a column
        let g = new Game();
        g.board = node.board; // make a copy so the original game doesn't get changed
        let bestscore: number = -Infinity, bestmove: number;

        if (g.checkWin()) {
            return this.heuristic(node);
        }

        let score;

        if (maximizingPlayer) {
            score = -Infinity;
            for (let choice = 0; choice < node.width; choice++) {
                g.placePiece(choice);
                score = this.heuristic(g) + Math.max(score, this.think(g, false));
                if (!bestscore || score > bestscore) {
                    bestscore = score;
                    bestmove = choice;
                }
            }
        } else {
            score = Infinity;
            for (let choice = 0; choice < node.width; choice++) {
                g.placePiece(choice);
                score = this.heuristic(g) + Math.min(score, this.think(g, true));
            }
        }


        return score;
    }

    public heuristic(node: Game): number {
        // Question? is the AI black or white?

        let value = 0;
        let p = node.checkWin();
        switch (p) {
            case Piece.BLACK:
                return -1;
            case Piece.WHITE:
                return 1;
            case Piece.EMPTY:
                return 0;
        }

        return value;
    }

}

const readlinesync = require("readline-sync");


let game = new Game();
let answer: number;
let computer = new AI();

for (let i = 0; i < 80; i++) {

    console.log(game.printBoard());
    // game.placePiece(Math.floor(Math.random() * game.width));
    answer = Number.parseInt(readlinesync.question("Where would you like to place a piece? (1-10)\n"));
    game.placePiece(answer - 1);
    // if (i % 2 == 0) {
    //     answer = Number.parseInt(readlinesync.question("Where would you like to place a piece? (1-10)\n"));
    //     game.placePiece(answer - 1);
    // } else {
    //     answer = computer.think(game, 5, false);
    //     game.placePiece(answer)
    // }

    if (game.checkWin()) {
        console.log("WINNER");
        console.log(game.printBoard());
        break;
    } else {
        console.log("no winner yet!");
    }
}

