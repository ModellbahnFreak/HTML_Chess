class Board {

    static CHECK_PLAYER_TURNS = true;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.pieces = [];
        this.board = [];
        this.kings = [];
        this.gameState = 1;
        this.playerActive = "l";
        this.capturedBlack = document.getElementById("capturedBlack");
        this.capturedWhite = document.getElementById("capturedWhite");
        this.currentMoving = null;
        this.field = document.getElementById("chessField");
        const clickCallback = ((e) => {
            if (this.gameState == 1) {
                if (this.currentMoving == null) {
                    this.currentMoving = this.board[e.currentTarget.y][e.currentTarget.x];
                    if (this.currentMoving != null) {
                        if ((!Board.CHECK_PLAYER_TURNS || this.playerActive == this.currentMoving.color)) {
                            this.cells[e.currentTarget.y][e.currentTarget.x].classList.add("selected");
                            for (var y = height - 1; y >= 0; y--) {
                                for (var x = 0; x < width; x++) {
                                    if (this.currentMoving.canMoveTo(x, y)) {
                                        this.cells[y][x].classList.add("reachable");
                                    } else {
                                        this.cells[y][x].classList.remove("reachable");
                                    }
                                }
                            }
                        } else {
                            this.currentMoving = null;
                            alert("It's the other player's turn");
                        }
                    }
                } else {
                    if (this.currentMoving.moveTo(e.currentTarget.x, e.currentTarget.y)) {
                        if (this.playerActive == "d") {
                            this.playerActive = "l";
                        } else {
                            this.playerActive = "d";
                        }
                        for (var i = 0; i < this.pieces.length; i++) {
                            if (this.pieces[i].color == this.playerActive) {
                                this.pieces[i].specialMovement = null;
                            }
                        }
                    }
                    for (var y = height - 1; y >= 0; y--) {
                        for (var x = 0; x < width; x++) {
                            this.cells[y][x].classList.remove("reachable");
                            this.cells[y][x].classList.remove("selected");
                            this.cells[y][x].classList.remove("check");
                        }
                    }
                    for (var i = 0; i < this.kings.length; i++) {
                        const king = this.kings[i];
                        const state = king.testCheck();
                        if (state == 0) {
                            this.cells[king.posY][king.posX].classList.remove("check");
                        } else if (state == 1) {
                            this.cells[king.posY][king.posX].classList.add("check");
                        } else if (state == 2) {
                            this.gameState = 2;
                            console.log("end");
                        }
                    }
                    this.currentMoving = null;
                }
            }
        }).bind(this);

        for (var y = height - 1; y >= 0; y--) {
            this.cells[y] = [];
            this.board[y] = [];
            var newRow = document.createElement("div");
            newRow.classList = "row";
            for (var x = 0; x < width; x++) {
                var newCell = document.createElement("div");
                newCell.classList.add("field");
                if ((x + y) % 2 == 0) {
                    newCell.classList.add("black");
                } else {
                    newCell.classList.add("white");
                }
                newCell.id = "cell" + y + x;
                newCell.x = x;
                newCell.y = y;
                newCell.addEventListener("click", clickCallback);
                newRow.appendChild(newCell);
                this.cells[y][x] = newCell;
                this.board[y][x] = null;
            }
            this.field.appendChild(newRow);
        }

        for (var i = 0; i < width; i++) {
            this.pieces.push(new Pawn("d", this, i));
            this.pieces.push(new Pawn("l", this, i));
        }
        this.pieces.push(new Rook("d", this, 0));
        this.pieces.push(new Rook("d", this, 1));
        this.pieces.push(new Rook("l", this, 0));
        this.pieces.push(new Rook("l", this, 1));

        this.pieces.push(new Knight("d", this, 0));
        this.pieces.push(new Knight("d", this, 1));
        this.pieces.push(new Knight("l", this, 0));
        this.pieces.push(new Knight("l", this, 1));

        this.pieces.push(new Bishop("d", this, 0));
        this.pieces.push(new Bishop("d", this, 1));
        this.pieces.push(new Bishop("l", this, 0));
        this.pieces.push(new Bishop("l", this, 1));

        this.pieces.push(new Queen("d", this));
        this.kings[0] = new King("d", this);
        this.pieces.push(this.kings[0]);
        this.pieces.push(new Queen("l", this));
        this.kings[1] = new King("l", this);
        this.pieces.push(this.kings[1]);

        this.selectPiecePopup = document.getElementById("selectPiecePopup");
        this.selectPiecePopup.append("Figur wählen:");

        for (var col = "d"; col != ""; col = col == "d" ? "l" : "") {
            var pieces = [];
            var container = [];
            const colorPieces = document.createElement("div");
            colorPieces.classList.add("row");
            colorPieces.classList.add(col + "PiecesDiv");
            this.selectPiecePopup.appendChild(colorPieces);

            const bishopDiv = document.createElement("div");
            container.push(bishopDiv);
            const bishop = document.createElement("img");
            bishop.src = "images/Chess_p" + col + "t45.svg"
            pieces.push(bishop);
            bishopDiv.appendChild(bishop);

            const knightDiv = document.createElement("div");
            container.push(knightDiv);
            const knight = document.createElement("img");
            knight.src = "images/Chess_n" + col + "t45.svg";
            pieces.push(knight);
            knightDiv.appendChild(knight);

            const rookDiv = document.createElement("div");
            container.push(rookDiv);
            const rook = document.createElement("img");
            rook.src = "images/Chess_r" + col + "t45.svg";
            pieces.push(rook);
            rookDiv.appendChild(rook);

            const queenDiv = document.createElement("div");
            container.push(queenDiv);
            const queen = document.createElement("img");
            queen.src = "images/Chess_q" + col + "t45.svg";
            pieces.push(queen);
            queenDiv.appendChild(queen);

            const kingDiv = document.createElement("div");
            container.push(kingDiv);
            const king = document.createElement("img");
            king.src = "images/Chess_k" + col + "t45.svg";
            pieces.push(king);
            kingDiv.appendChild(king);

            pieces.forEach(piece => {
                piece.classList.add("chessPiece");
            });
            container.forEach(cont => {
                cont.classList.add("field5");
                colorPieces.appendChild(cont);
            });
        }
    }

    isFree(x, y) {
        return this.board[y][x] == null && this.isInBounds(x, y);
    }

    getColorAt(x, y) {
        if (this.board[y][x] == null) {
            return null;
        } else {
            return this.board[y][x].color;
        }
    }

    isInBounds(x, y) {
        return x < this.width && x >= 0 && y < this.height && y >= 0;
    }
}