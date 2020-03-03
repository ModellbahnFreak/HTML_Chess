class Piece {
    constructor(color, board, imgPath, x, y) {
        this.image = document.createElement("img");
        this.image.src = "images/" + imgPath;
        this.image.classList = "chessPiece";
        board.cells[y][x].appendChild(this.image);
        board.board[y][x] = this;
        this.color = color;
        this.x = x;
        this.y = y;
        this.board = board;
        this.living = true;
        this.moves = 0;
        this.specialMovement = null; //type: 0: nothing, 1: casteling, 2: en passant
    }

    get posX() {
        return this.x;
    }

    get posY() {
        return this.y;
    }

    get type() {
        throw "Not implemented";
    }

    canMoveTo(x, y) {
        if (this.living) {
            if (this.board.isFree(x, y)) {
                return true;
            } else {
                if (this.board.getColorAt(x, y) != this.color) {
                    return true;
                }
            }
        }
        return false;
    }

    moveWithoutTest(x, y) {
        this.image.remove();
        this.board.board[this.y][this.x] = null;
        this.x = x;
        this.y = y;
        this.board.cells[y][x].appendChild(this.image);
        this.board.board[y][x] = this;
        this.moves++;
    }

    moveTo(x, y) {
        if (this.canMoveTo(x, y)) {
            if (!this.board.isFree(x, y)) {
                this.board.board[y][x].capture();
            }
            this.moveWithoutTest(x, y);
            if (this.specialMovement != null && this.specialMovement.destination.x == x && this.specialMovement.destination.y == y) {
                if (this.specialMovement.type == 1) {
                    this.specialMovement.otherPiece.moveWithoutTest(this.specialMovement.otherDestination.x, this.specialMovement.otherDestination.y);
                } else if (this.specialMovement.type == 2) {
                    if (this.specialMovement.otherPiece != undefined && this.specialMovement.otherPiece != null) {
                        this.specialMovement.otherPiece.capture();
                    }
                }
            }
            return true;
        }
        return false;
    }

    capture() {
        this.image.remove();
        this.board.board[this.y][this.x] = null;
        this.x = null;
        this.y = null;
        this.living = false;
        this.image.classList.add("captured");
        if (this.color == "d") {
            this.board.capturedBlack.appendChild(this.image);
        } else {
            this.board.capturedWhite.appendChild(this.image);
        }
    }
}

//Bauer
class Pawn extends Piece {
    constructor(color, board, num) {
        var y = 1;
        if (color == "d") {
            y = 6;
        }
        super(color, board, "Chess_p" + color + "t45.svg", num, y);
    }

    get type() {
        return "pawn";
    }

    canMoveTo(x, y) {
        if (super.canMoveTo(x, y)) {
            const dX = x - this.x;
            const dY = y - this.y;
            if (dX == 0) {
                if (this.color == "d") {
                    if (dY < 0 && dY >= -2 && (this.moves == 0 || dY >= -1)) {
                        if (this.board.isFree(this.x, this.y - 1) && (this.board.isFree(this.x, this.y - 2) || dY == -1)) {
                            return true;
                        }
                    }
                } else {
                    if (dY > 0 && dY <= 2 && (this.moves == 0 || dY <= 1)) {
                        if (this.board.isFree(this.x, this.y + 1) && (this.board.isFree(this.x, this.y + 2) || dY == 1)) {
                            return true;
                        }
                    }
                }
            } else if (Math.abs(dX) == 1 && !this.board.isFree(x, y) && this.board.getColorAt(x, y) != this.color) {
                if ((this.color == "d" && dY == -1) || dY == 1) {
                    return true;
                }
            } else if (Math.abs(dX) == 1 && this.board.isFree(x, y)) {
                if (this.color == "d") {
                    const otherPiece = this.board.board[y + 1][x];
                    if (dY == -1 && otherPiece != null && otherPiece.color != this.color && otherPiece.type == this.type && otherPiece.moves == 1) {
                        if (otherPiece.specialMovement != null && otherPiece.specialMovement.type == 2 && otherPiece.specialMovement.hasMoved == 2) {
                            this.specialMovement = { //Can capture another piece by en passant
                                type: 2,
                                otherPiece: otherPiece,
                                destination: { x: x, y: y }
                            };
                            return true;
                        }
                    }
                } else {
                    const otherPiece = this.board.board[y - 1][x];
                    if (dY == 1 && otherPiece != null && otherPiece.color != this.color && otherPiece.type == this.type && otherPiece.moves == 1) {
                        if (otherPiece.specialMovement != null && otherPiece.specialMovement.type == 2 && otherPiece.specialMovement.hasMoved == 2) {
                            this.specialMovement = { //Can capture another piece by en passant
                                type: 2,
                                otherPiece: otherPiece,
                                destination: { x: x, y: y }
                            };
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }

    moveTo(x, y) {
        const dX = x - this.x;
        const dY = y - this.y;
        if (super.moveTo(x, y)) {
            if (Math.abs(dY) == 2 && this.moves == 1) {
                this.specialMovement = { //Can be captured via en passant
                    type: 2,
                    hasMoved: 2
                };
            }
            return true;
        }
        return false;
    }

}

//Läufer
class Bishop extends Piece {
    constructor(color, board, num) {
        var x = 2;
        if (num == 1) {
            x = 5;
        }
        var y = 0;
        if (color == "d") {
            y = 7;
        }
        super(color, board, "Chess_b" + color + "t45.svg", x, y);
    }

    get type() {
        return "bishop";
    }

    canMoveTo(x, y) {
        return super.canMoveTo(x, y) && Queen.diagonalMovePossible(this.x, this.y, x, y, this.board);
    }
}

//Springer
class Knight extends Piece {
    constructor(color, board, num) {
        var x = 1;
        if (num == 1) {
            x = 6;
        }
        var y = 0;
        if (color == "d") {
            y = 7;
        }
        super(color, board, "Chess_n" + color + "t45.svg", x, y);
    }

    get type() {
        return "knight";
    }

    canMoveTo(x, y) {
        const dX = x - this.x;
        const dY = y - this.y;
        if (super.canMoveTo(x, y)) {
            if ((Math.abs(dX) == 1 && Math.abs(dY) == 2) || (Math.abs(dX) == 2 && Math.abs(dY) == 1)) {
                return true;
            }
        }
    }
}

//Turm
class Rook extends Piece {
    constructor(color, board, num) {
        var x = 0;
        if (num == 1) {
            x = 7;
        }
        var y = 0;
        if (color == "d") {
            y = 7;
        }
        super(color, board, "Chess_r" + color + "t45.svg", x, y);
    }

    get type() {
        return "rook";
    }

    canMoveTo(x, y) {
        return super.canMoveTo(x, y) && Queen.straightMovePossible(this.x, this.y, x, y, this.board);
    }
}

//Dame
class Queen extends Piece {
    constructor(color, board) {
        if (color == "d") {
            super(color, board, "Chess_q" + color + "t45.svg", 3, 7);
        } else {
            super(color, board, "Chess_q" + color + "t45.svg", 3, 0);
        }
    }

    get type() {
        return "queen";
    }

    static straightMovePossible(startX, startY, endX, endY, board) {
        const dX = endX - startX;
        const dY = endY - startY;
        if (dX == 0 && dY > 0) { //Moved up
            for (var i = startY + 1; i < endY; i++) {
                if (!board.isFree(endX, i)) {
                    return false;
                }
            }
            return true;
        } else if (dX == 0 && dY < 0) { //Moved down
            for (var i = startY - 1; i > endY; i--) {
                if (!board.isFree(endX, i)) {
                    return false;
                }
            }
            return true;
        } else if (dY == 0 && dX > 0) { //Moved right
            for (var i = startX + 1; i < endX; i++) {
                if (!board.isFree(i, endY)) {
                    return false;
                }
            }
            return true;
        } else if (dY == 0 && dX < 0) { //Moved left
            for (var i = startX - 1; i > endX; i--) {
                if (!board.isFree(i, endY)) {
                    return false;
                }
            }
            return true;
        }
    }

    static diagonalMovePossible(startX, startY, endX, endY, board) {
        const dX = endX - startX;
        const dY = endY - startY;
        if (Math.abs(dX) == Math.abs(dY) && dX != 0) {
            for (var i = 1; i < Math.abs(dX); i++) {
                if (dX < 0 && dY < 0 && !board.isFree(startX - i, startY - i)) {
                    return false
                } else if (dX < 0 && dY > 0 && !board.isFree(startX - i, startY + i)) {
                    return false
                } else if (dX > 0 && dY < 0 && !board.isFree(startX + i, startY - i)) {
                    return false
                } else if (dX > 0 && dY > 0 && !board.isFree(startX + i, startY + i)) {
                    return false
                }
            }
            return true;
        }
    }

    canMoveTo(x, y) {
        return super.canMoveTo(x, y) && (Queen.diagonalMovePossible(this.x, this.y, x, y, this.board) || Queen.straightMovePossible(this.x, this.y, x, y, this.board));
    }
}

//König
class King extends Piece {
    constructor(color, board) {
        if (color == "d") {
            super(color, board, "Chess_k" + color + "t45.svg", 4, 7);
        } else {
            super(color, board, "Chess_k" + color + "t45.svg", 4, 0);
        }
    }

    get type() {
        return "king";
    }

    canMoveTo(x, y) {
        const dX = x - this.x;
        const dY = y - this.y;
        if (super.canMoveTo(x, y) && Math.abs(dX) <= 1 && Math.abs(dY) <= 1 && (dX != 0 || dY != 0) && this.testCheckAt(x, y) == 0) {
            return true;
        } else if (this.moves == 0 && dY == 0 && this.living && this.testCheckAt(x, y) == 0 && this.testCheckAt(this.x, this.y) == 0) { //Casteling/Rochade !!Hard coded Locations!!!!!
            const col = this.color;
            const yPos = this.y;
            if (x == 2) {
                var leftRook = null;
                this.board.pieces.forEach(piece => {
                    if (piece != null && piece.type == "rook" && piece.color == col && piece.posX == 0 && piece.posY == yPos) {
                        leftRook = piece;
                    }
                });
                if (leftRook != null && leftRook.living && leftRook.moves == 0 && this.testCheckAt(3, y) == 0 && this.board.isFree(1, y) && this.board.isFree(2, y) && this.board.isFree(3, y)) {
                    this.specialMovement = {
                        type: 1,
                        otherPiece: leftRook,
                        otherDestination: { x: 3, y: y },
                        destination: { x: x, y: y }
                    };
                    return true;
                }
            } else if (x == 6) {
                var rightRook = null;
                this.board.pieces.forEach(piece => {
                    if (piece != null && piece.type == "rook" && piece.color == col && piece.posX == 7 && piece.posY == yPos) {
                        rightRook = piece;
                    }
                });
                if (rightRook != null && rightRook.living && rightRook.moves == 0 && this.testCheckAt(5, y) == 0 && this.board.isFree(5, y) && this.board.isFree(6, y)) {
                    this.specialMovement = {
                        type: 1,
                        otherPiece: rightRook,
                        otherDestination: { x: 5, y: y },
                        destination: { x: x, y: y }
                    };
                    return true;
                }
            }
        }
        return false;
    }

    testCheck() {
        return this.testCheckAt(this.x, this.y);
    }

    testCheckAt(x, y) {
        var check = false;
        var canMoveUp = true;
        var canMoveDown = true;
        var canMoveLeft = true;
        var canMoveRight = true;
        if (!this.board.isInBounds(x, y + 1)) {
            canMoveUp = false;
        }
        if (!this.board.isInBounds(x, y - 1)) {
            canMoveDown = false;
        }
        if (!this.board.isInBounds(x - 1, y)) {
            canMoveLeft = false;
        }
        if (!this.board.isInBounds(x + 1, y)) {
            canMoveRight = false;
        }
        for (var i = 0; i < this.board.pieces.length; i++) {
            const piece = this.board.pieces[i];
            if (piece != null && piece.color != this.color) {
                if (piece.canMoveTo(x, y)) {
                    check = true;
                }
                if (canMoveUp && piece.canMoveTo(x, y + 1)) {
                    canMoveUp = false;
                }
                if (canMoveDown && piece.canMoveTo(x, y - 1)) {
                    canMoveDown = false;
                }
                if (canMoveLeft && piece.canMoveTo(x - 1, y)) {
                    canMoveLeft = false;
                }
                if (canMoveRight && piece.canMoveTo(x + 1, y)) {
                    canMoveRight = false;
                }
            }
        }
        if (check) {
            if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
                return 2;
            } else {
                return 1;
            }
        }
        return 0;
    }
}