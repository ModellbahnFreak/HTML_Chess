class Board {

    static CHECK_PLAYER_TURNS = false;
    static FILES = {
        "king0": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
        "queen0": "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
        "rook0": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
        "knight0": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
        "bishop0": "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
        "pawn0": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
        "king1": "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
        "queen1": "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
        "rook1": "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
        "bishop1": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
        "knight1": "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
        "pawn1": "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg"
    };
    static COLOR = {
        "Black": 0,
        "White": 1,
        0: "Black",
        1: "White",
        "next": (color) => {
            return (color + 1) % 2
        }
    };

    //TODO:
    //  - Aus Schach rausziehen + Selbeer nicht ins Schach ziehen
    //  - König kann bei Bauern ins Schach ziehen
    //  - Materialdifferenz statt geschlagenen Figuren

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.pieces = [];
        this.board = [];
        this.kings = [];
        this.gameStack = [];
        this.promotionClick = () => { };
        this.gameState = 1; //0: preparation, 1: running, 2: stopped, 3: waiting for input
        this.playerActive = "l";
        this.capturedBlack = document.getElementById("capturedBlack");
        this.capturedWhite = document.getElementById("capturedWhite");
        this.statusBox = document.getElementById("statusBox");
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
                    const oldX = this.currentMoving.posX,
                        oldY = this.currentMoving.posY;
                    if (this.currentMoving.moveTo(e.currentTarget.x, e.currentTarget.y)) {
                        this.gameStack.push({
                            piece: this.currentMoving,
                            from: { x: oldX, y: oldY },
                            to: { x: this.currentMoving.posX, y: this.currentMoving.posY },
                            newMovesNumber: this.currentMoving.moves
                        });
                        if (this.playerActive == "d") {
                            this.playerActive = "l";
                            this.log("White's turn");
                        } else {
                            this.playerActive = "d";
                            this.log("Black's turn");
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
                        if (!king.living) {
                            this.gameState = 2;
                            this.log("Game ended!\n Winner: " + (king.color == "d" ? "White" : "Black"));
                        } else {
                            const state = king.testCheck();
                            if (state == 0) {
                                this.cells[king.posY][king.posX].classList.remove("check");
                            } else if (state == 1) {
                                this.cells[king.posY][king.posX].classList.add("check");
                            } else if (state == 2) {
                                this.gameState = 2;
                                this.log("Game ended!\n Winner: " + (king.color == "d" ? "White" : "Black"));
                            } else if (state == 3) {
                                this.gameState = 2;
                                this.log("Game ended!\n Draw...");
                            }
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
            this.pieces.push(new Pawn(Board.COLOR.Black, this, i));
            this.pieces.push(new Pawn(Board.COLOR.White, this, i));
        }
        this.pieces.push(new Rook(Board.COLOR.Black, this, 0));
        this.pieces.push(new Rook(Board.COLOR.Black, this, 1));
        this.pieces.push(new Rook(Board.COLOR.White, this, 0));
        this.pieces.push(new Rook(Board.COLOR.White, this, 1));

        this.pieces.push(new Knight(Board.COLOR.Black, this, 0));
        this.pieces.push(new Knight(Board.COLOR.Black, this, 1));
        this.pieces.push(new Knight(Board.COLOR.White, this, 0));
        this.pieces.push(new Knight(Board.COLOR.White, this, 1));

        this.pieces.push(new Bishop(Board.COLOR.Black, this, 0));
        this.pieces.push(new Bishop(Board.COLOR.Black, this, 1));
        this.pieces.push(new Bishop(Board.COLOR.White, this, 0));
        this.pieces.push(new Bishop(Board.COLOR.White, this, 1));

        this.pieces.push(new Queen(Board.COLOR.Black, this));
        this.kings[0] = new King(Board.COLOR.Black, this);
        this.pieces.push(this.kings[0]);
        this.pieces.push(new Queen(Board.COLOR.White, this));
        this.kings[1] = new King(Board.COLOR.White, this);
        this.pieces.push(this.kings[1]);

        this.selectPiecePopup = document.getElementById("selectPiecePopup");
        this.selectPiecePopup.className = "popup hidden";
        this.selectPiecePopup.append("Figur wählen:");

        const popupPieceOnclick = ((e) => {
            this.promotionClick(e.currentTarget.type);
        }).bind(this);

        for (var col = Board.COLOR.Black; col <= Board.COLOR.White; col++) {
            var pieces = [];
            var container = [];
            const colorPieces = document.createElement("div");
            colorPieces.classList.add("row");
            colorPieces.classList.add("PiecesDiv" + col);
            this.selectPiecePopup.appendChild(colorPieces);

            const bishopDiv = document.createElement("div");
            container.push(bishopDiv);
            bishopDiv.type = "bishop";
            const bishop = document.createElement("img");
            bishop.src = Board.FILES["bishop" + col];
            pieces.push(bishop);
            bishopDiv.appendChild(bishop);

            const knightDiv = document.createElement("div");
            container.push(knightDiv);
            knightDiv.type = "knight";
            const knight = document.createElement("img");
            knight.src = Board.FILES["knight" + col];
            pieces.push(knight);
            knightDiv.appendChild(knight);

            const rookDiv = document.createElement("div");
            container.push(rookDiv);
            rookDiv.type = "rook";
            const rook = document.createElement("img");
            rook.src = Board.FILES["rook" + col];
            pieces.push(rook);
            rookDiv.appendChild(rook);

            const queenDiv = document.createElement("div");
            container.push(queenDiv);
            queenDiv.type = "queen";
            const queen = document.createElement("img");
            queen.src = Board.FILES["queen" + col];
            pieces.push(queen);
            queenDiv.appendChild(queen);

            pieces.forEach(piece => {
                piece.classList.add("chessPiece");
            });
            container.forEach(cont => {
                cont.classList.add("field5");
                colorPieces.appendChild(cont);
                cont.addEventListener("click", popupPieceOnclick);
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

    promote(piece) {
        if (piece instanceof Pawn) {
            this.gameState = 3;
            this.selectPiecePopup.className = "popup Pieces" + piece.color;
            const pieceIndex = this.pieces.indexOf(piece);
            this.promotionClick = ((type) => {
                var newPiece = null;
                switch (type) {
                    case "bishop":
                        newPiece = new Bishop(piece.color, this, piece.posX, piece.posY);
                        break;
                    case "knight":
                        newPiece = new Knight(piece.color, this, piece.posX, piece.posY);
                        break;
                    case "rook":
                        newPiece = new Rook(piece.color, this, piece.posX, piece.posY);
                        break;
                    case "queen":
                        newPiece = new Queen(piece.color, this, piece.posX, piece.posY);
                        break;
                }
                if (newPiece != null) {
                    const x = piece.posX, y = piece.posY;
                    piece.capture();
                    this.pieces.splice(pieceIndex, 1);
                    this.pieces.push(newPiece);
                    this.board[y][x] = newPiece;
                    this.gameState = 1;
                    this.selectPiecePopup.className = "popup hidden";
                }
            }).bind(this);
        }
    }

    log(text) {
        this.statusBox.innerText = text;
        console.log(text);
    }
}
