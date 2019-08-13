var Piece;
(function (Piece) {
    Piece["WHITE"] = "\u25CB";
    Piece["BLACK"] = "\u25CF";
    Piece["EMPTY"] = " ";
})(Piece || (Piece = {}));
var Game = /** @class */ (function () {
    function Game() {
        this._width = 10;
        this._height = 8;
        this._turn = true;
        this._board = [];
        for (var i = 0; i < this._width * this._height; i++) {
            this._board.push(Piece.EMPTY);
        }
    }
    Object.defineProperty(Game.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Game.prototype.index = function (col, row) {
        if (0 <= col && col < this._width && 0 <= row && row < this._height) {
            return (row * this._width) + col;
        }
        return -1; // not on board
    };
    Game.prototype.indexes = function (index) {
        if (0 <= index && index < this._board.length) {
            var row = Math.floor(index / this._width);
            var col = index % this._width;
            return [col, row];
        }
        else {
            return [-1, -1]; // not on board
        }
    };
    Game.prototype.printBoard = function () {
        var builder = [];
        var r = [];
        var temp;
        for (var i = 0; i < this._width * this._height; i += this._width) {
            temp = this._board.slice(i, i + this._width);
            // padding to make the edge columns have "|" on them
            builder.push([Piece.EMPTY].concat(temp, [Piece.EMPTY]));
            r[i / this._width] = builder[i / this._width].join("|");
        }
        return r.reverse().join("\n");
    };
    Object.defineProperty(Game.prototype, "board", {
        get: function () {
            return this._board;
        },
        set: function (b) {
            // setting board by value. not by reference
            this._board = [];
            for (var i = 0; i < b.length; i++) {
                this._board.push(b[i]);
            }
        },
        enumerable: true,
        configurable: true
    });
    Game.prototype.placePiece = function (col) {
        // make sure choice is in range
        if (0 <= col && col < this._width) {
            // find the lowest spot on this row
            var lowestSpot = 0;
            for (var row = 0; row < this._height; row++) {
                if (this._board[this.index(col, row)] !== Piece.EMPTY) {
                    lowestSpot = row + 1;
                }
            }
            var i = this.index(col, lowestSpot);
            if (0 <= i && i < this._board.length) {
                this._board[i] = this._turn ? Piece.BLACK : Piece.WHITE;
            }
            this._turn = !this._turn; // Next players turn
        }
    };
    Game.prototype.lookFor4 = function (col, row) {
        var _this = this;
        var count = 0;
        var firstPiece = this._board[this.index(col, row)];
        // let coords: Array<[number, number]> = []
        if (firstPiece === Piece.EMPTY) {
            return Piece.EMPTY;
        }
        var COORD_EQ = [
            function (i) { return _this.index(col, row + i); },
            function (i) { return _this.index(col + i, row + i); },
            function (i) { return _this.index(col + i, row); },
            function (i) { return _this.index(col - i, row + i); } // left up
        ];
        for (var dir = 0; dir < COORD_EQ.length; dir++) {
            // coords = [];
            for (var i = 0; i < 4; i++) {
                var currentPiece = this._board[COORD_EQ[dir](i)];
                // coords.push(this.indexes(coord_eq[dir](i)));
                if (currentPiece !== Piece.EMPTY && currentPiece === firstPiece) {
                    count++;
                    if (count === 4) {
                        // console.log(`Winner found with dir:${dir}\nstarting at: ${[col, row]}\nwith ${firstPiece}`);
                        // console.log(coords);
                        return firstPiece;
                    }
                }
                else {
                    count = 0;
                    break;
                }
            }
        }
        return Piece.EMPTY;
    };
    Game.prototype.checkWin = function () {
        var _a;
        var win = false;
        var p;
        for (var i = 0; i < this._board.length; i++) {
            var col = void 0, row = void 0;
            _a = this.indexes(i), col = _a[0], row = _a[1];
            p = this.lookFor4(col, row);
            if (col >= 0 && row >= 0 && p !== Piece.EMPTY) {
                return p;
            }
        }
        return Piece.EMPTY;
    };
    return Game;
}());
var AI = /** @class */ (function () {
    function AI() {
    }
    AI.prototype.think = function (node, maximizingPlayer) {
        if (maximizingPlayer === void 0) { maximizingPlayer = true; }
        // Given a game returns the best move to make in the form of a column
        var g = new Game();
        g.board = node.board; // make a copy so the original game doesn't get changed
        var bestscore = -Infinity, bestmove;
        if (g.checkWin()) {
            return this.heuristic(node);
        }
        var score;
        if (maximizingPlayer) {
            score = -Infinity;
            for (var choice = 0; choice < node.width; choice++) {
                g.placePiece(choice);
                score = this.heuristic(g) + Math.max(score, this.think(g, false));
                if (!bestscore || score > bestscore) {
                    bestscore = score;
                    bestmove = choice;
                }
            }
        }
        else {
            score = Infinity;
            for (var choice = 0; choice < node.width; choice++) {
                g.placePiece(choice);
                score = this.heuristic(g) + Math.min(score, this.think(g, true));
            }
        }
        return score;
    };
    AI.prototype.heuristic = function (node) {
        // Question? is the AI black or white?
        var value = 0;
        var p = node.checkWin();
        switch (p) {
            case Piece.BLACK:
                return -1;
            case Piece.WHITE:
                return 1;
            case Piece.EMPTY:
                return 0;
        }
        return value;
    };
    return AI;
}());
var readlinesync = require("readline-sync");
var game = new Game();
var answer;
var computer = new AI();
for (var i = 0; i < 80; i++) {
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
    }
    else {
        console.log("no winner yet!");
    }
}
