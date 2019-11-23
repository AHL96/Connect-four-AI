"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Piece;
(function (Piece) {
    Piece["WHITE"] = "\u25CB";
    Piece["BLACK"] = "\u25CF";
    Piece["EMPTY"] = " ";
})(Piece || (Piece = {}));
var Game = /** @class */ (function () {
    function Game(g) {
        this._board = [];
        this._width = 7;
        this._height = 6;
        this._turn = true;
        if (g) {
            for (var i = 0; i < g._board.length; i++) {
                this._board.push(g._board[i]);
            }
            this._turn = g._turn;
            this._width = g._width;
            this._height = g._height;
        }
        else {
            for (var i = 0; i < this._width * this._height; i++) {
                this._board.push(Piece.EMPTY);
            }
        }
    }
    Object.defineProperty(Game.prototype, "width", {
        //#region getters
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
    Object.defineProperty(Game.prototype, "board", {
        get: function () {
            return this._board;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "turn", {
        get: function () {
            return this._turn;
        },
        enumerable: true,
        configurable: true
    });
    //#endregion getters
    //#region private methods
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
    //#endregion private methods
    //#region public methods
    Game.prototype.toString = function () {
        var builder = [];
        var r = [];
        var temp;
        for (var i = 0; i < this._width * this._height; i += this._width) {
            temp = this._board.slice(i, i + this._width);
            // padding to make the edge columns have "|" on them
            builder.push(__spreadArrays([Piece.EMPTY], temp, [Piece.EMPTY]));
            r[i / this._width] = builder[i / this._width].join("|");
        }
        return r.reverse().join("\n");
    };
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
                this._turn = !this._turn; // Next players turn
            }
        }
    };
    Game.prototype.canPlaceInCol = function (col) {
        // see if you can place a piece in that column
        return this._board[this.index(col, this.height - 1)] === Piece.EMPTY;
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
    AI.prototype.minimax = function (node, depth) {
        if (depth === void 0) { depth = 6; }
        if (depth == 0 || node.checkWin() !== Piece.EMPTY) {
            return this.heuristic(node);
        }
        var score = 0;
        var newNode = new Game(node);
        var maximizingPlayer = newNode.turn;
        if (maximizingPlayer) {
            score = -Infinity;
            for (var possibleMove = 0; possibleMove < newNode.width; possibleMove++) {
                if (newNode.canPlaceInCol(possibleMove)) {
                    newNode.placePiece(possibleMove);
                    score = this.heuristic(newNode) + Math.max(score, this.minimax(newNode, depth - 1));
                }
            }
        }
        else {
            score = Infinity;
            for (var possibleMove = 0; possibleMove < newNode.width; possibleMove++) {
                if (newNode.canPlaceInCol(possibleMove)) {
                    newNode.placePiece(possibleMove);
                    score = this.heuristic(newNode) + Math.min(score, this.minimax(newNode, depth - 1));
                }
            }
        }
        return score;
    };
    AI.prototype.think = function (node) {
        var bestMove = -1;
        var bestScore = -Infinity;
        for (var move = 0; move < node.width; move++) {
            var possibleNextMove = new Game(node);
            possibleNextMove.placePiece(move);
            var score = this.minimax(possibleNextMove);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            console.log(score);
        }
        return bestMove;
    };
    AI.prototype.heuristic = function (node) {
        // heuristic is for when the AI is playing with the black pieces
        var p = node.checkWin();
        switch (p) {
            case Piece.BLACK:
                return 1;
            case Piece.WHITE:
                return 2;
            case Piece.EMPTY:
                return -1;
        }
    };
    return AI;
}());
var readlinesync = require("readline-sync");
// Player is white. Player goes first
var game = new Game();
var answer;
var computer = new AI();
for (var i = 0; i < game.width * game.height; i++) {
    console.log(game.toString());
    if (i % 2 == 0) {
        var res = readlinesync.question("Where would you like to place a piece? (0-" + (game.width - 1) + ")\n");
        answer = Number.parseInt(res);
        // answer = Math.floor(Math.random() * game.width);
        if (0 <= answer && answer < game.width && game.canPlaceInCol(answer)) {
            console.log("placing your piece");
            game.placePiece(answer);
        }
        else {
            console.log("Pick a number between 0 and " + (game.width - 1));
            i--;
        }
    }
    else {
        console.log("AI is thinking");
        answer = computer.think(game);
        console.log("done thinking. AI chose " + answer);
        game.placePiece(answer);
        console.log("your turn!");
    }
    var winner = game.checkWin();
    if (winner !== Piece.EMPTY) {
        console.log("THE WINNER IS " + winner);
        console.log(game.toString());
        break;
    }
}
