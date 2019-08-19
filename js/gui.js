
//var gameController=new GameController();


guiComponentsEngine();

function guiComponentsEngine() {
	setFenButton();
	takeButton();
	newGameButton();
	playAgainButton();
	exitGameButton();
}

function setFenButton() {
	document.getElementById("SetFen").addEventListener("click", () => {
		var fenStr = document.getElementById("fenIn").value;
		document.getElementById("gamefinish").style.display = "none";
		newGame(fenStr);
	});
}

function takeButton() {
	document.getElementById("TakeButton").addEventListener("click", () => {
		if (gameBoard.hisPly > 0) {
			takeMove();
			gameBoard.ply = 0;
			setInitialBoardPieces();
		}
	});
}


function newGameButton() {
	document.getElementById("NewGameButton").addEventListener("click", () => {
		var list = document.getElementById("deadPiece");
		if (list.hasChildNodes) {
			list.parentNode.removeChild(list);
		}

		newGame(START_FEN);


	});
}

function playAgainButton() {
	document.getElementById("PlayAgain").addEventListener("click", () => {
		document.getElementById("gamefinish").style.display = "none";
		newGame(START_FEN);

	});
}

function exitGameButton() {
	document.getElementById("exitgame").addEventListener("click", () => {
		var win = window.open("about:blank", "_self");
		win.close();
	});
}

function newGame(fenStr) {
	gameBoard.parseFen(fenStr);
	gameBoard.printBoard();
	setInitialBoardPieces();
	checkAndSet();
	var src = document.getElementById("TurnTime");
	src.innerHTML = "your turn";
}

function clearAllPieces() {
	const elements = document.getElementsByClassName("Piece");

	while (elements.length > 0) elements[0].remove();
}

function setInitialBoardPieces() {
	var sq;
	var sq120;
	var pce;
	clearAllPieces();

	for (sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = gameBoard.pieces[sq120];
		if (pce >= PIECES.wP && pce <= PIECES.bK) {
			addGUIPiece(sq120, pce);
		}
	}
}

function deSelectSq(sq) {
	var Square = document.getElementsByClassName('Square');
	for (var i = 0; i < Square.length; i++) {
		var x = Square[i];
		if (pieceIsOnSq(sq, x.offsetTop, x.offsetLeft) == true) {


			x.classList.remove("SqSelected");
		}
	}
}

function setSqSelected(sq) {
	var Square = document.getElementsByClassName('Square');
	for (var i = 0; i < Square.length; i++) {
		var x = Square[i];

		if (pieceIsOnSq(sq, x.offsetTop, x.offsetLeft) == true) {
			x.classList.add("SqSelected");
		}
	}
}

function clickedSquare(pageX, pageY) {

	var position = document.getElementById("Board");

	var workedX = Math.floor(position.offsetLeft);
	var workedY = Math.floor(position.offsetTop);

	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);

	var file = Math.floor((pageX - workedX) / 60);
	var rank = 7 - Math.floor((pageY - workedY) / 60);

	var sq = FR2SQ(file, rank);



	setSqSelected(sq);
	var src = document.getElementById("TurnTime");
	src.innerHTML = "";
	return sq;
}

document.addEventListener("click", function (e) {

	if (e.target && e.target.classList.contains("Piece")) {
		if (userMove.from == SQUARES.NO_SQ) {
			userMove.from = clickedSquare(e.pageX, e.pageY);
		} else {
			userMove.to = clickedSquare(e.pageX, e.pageY);
		}

		makeuserMove();
	}
});


document.addEventListener("click", function (e) {

	if (e.target && e.target.classList.contains("Square")) {
		if (userMove.from != SQUARES.NO_SQ) {
			userMove.to = clickedSquare(e.pageX, e.pageY);
			makeuserMove();
		}
	}
}

);

function makeuserMove() {

	if (userMove.from != SQUARES.NO_SQ && userMove.to != SQUARES.NO_SQ) {

		var parsed = parseMove(userMove.from, userMove.to);
		if (parsed != NOMOVE) {
			makeMove(parsed);
			gameBoard.printBoard();
			moveGUIPiece(parsed);
			checkAndSet();
			preSearch();
		}
		deSelectSq(userMove.from);
		deSelectSq(userMove.to);
		userMove.from = SQUARES.NO_SQ;
		userMove.to = SQUARES.NO_SQ;
	}

}

function pieceIsOnSq(sq, top, left) {
	if ((ranksBrd[sq] == 7 - Math.round(top / 60)) &&
		filesBrd[sq] == Math.round(left / 60)) {
		return true;
	}
	return false;

}

function removeGUIPiece(sq) {
	var Piece = document.getElementsByClassName("Piece");
	for (var i = 0; i < Piece.length; i++) {
		let thisPiece = Piece[i];
		if (pieceIsOnSq(sq, thisPiece.offsetTop, thisPiece.offsetLeft) == true) {

			var src = document.getElementById("deadPiece");
			var img = document.createElement("img");
			img.src = thisPiece.src;
			src.appendChild(img);
			thisPiece.parentNode.removeChild(thisPiece);
		}
	}
}


function addGUIPiece(sq, pce) {

	var file = filesBrd[sq];
	var rank = ranksBrd[sq];
	var rankName = "rank" + (rank + 1);
	var fileName = "file" + (file + 1);
	var pieceFileName = "images/" + sideChar[PieceCol[pce]] + pceChar[pce].toUpperCase() + ".png";
	var src = document.getElementById("Board");
	var image = document.createElement("img");
	image.src = pieceFileName;
	image.className = "Piece " + rankName + " " + fileName;
	src.appendChild(image);
}

function moveGUIPiece(move) {

	var from = FROMSQ(move);
	var to = TOSQ(move);
	if (move & MFLAGEP) {
		var epRemove;
		if (gameBoard.side == COLOURS.BLACK) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		removeGUIPiece(epRemove);
	} else if (CAPTURED(move)) {
		removeGUIPiece(to);
	}

	var file = filesBrd[to];
	var rank = ranksBrd[to];
	var rankName = "rank" + (rank + 1);
	var fileName = "file" + (file + 1);
	var Piece = document.getElementsByClassName("Piece");
	for (var i = 0; i < Piece.length; i++) {
		var x = Piece[i];

		if (pieceIsOnSq(from, x.offsetTop, x.offsetLeft) == true) {
			x.classList = "";
			x.classList = "Piece " + rankName + " " + fileName;
		}

	}

	if (move & MFLAGCA) {
		switch (to) {
			case SQUARES.G1: RemoveGUIPiece(SQUARES.H1); addGUIPiece(SQUARES.F1, PIECES.wR); break;
			case SQUARES.C1: RemoveGUIPiece(SQUARES.A1); addGUIPiece(SQUARES.D1, PIECES.wR); break;
			case SQUARES.G8: RemoveGUIPiece(SQUARES.H8); addGUIPiece(SQUARES.F8, PIECES.bR); break;
			case SQUARES.C8: RemoveGUIPiece(SQUARES.A8); addGUIPiece(SQUARES.D8, PIECES.bR); break;
		}
	} else if (PROMOTED(move)) {
		removeGUIPiece(to);
		addGUIPiece(to, PROMOTED(move));
	}

}

function drawMaterial() {

	if (gameBoard.pceNum[PIECES.wP] != 0 || gameBoard.pceNum[PIECES.bP] != 0) return false;
	if (gameBoard.pceNum[PIECES.wQ] != 0 || gameBoard.pceNum[PIECES.bQ] != 0 ||
		gameBoard.pceNum[PIECES.wR] != 0 || gameBoard.pceNum[PIECES.bR] != 0) return false;
	if (gameBoard.pceNum[PIECES.wB] > 1 || gameBoard.pceNum[PIECES.bB] > 1) { return false; }
	if (gameBoard.pceNum[PIECES.wN] > 1 || gameBoard.pceNum[PIECES.bN] > 1) { return false; }
	if (gameBoard.pceNum[PIECES.wN] != 0 && gameBoard.pceNum[PIECES.wB] != 0) { return false; }
	if (gameBoard.pceNum[PIECES.bN] != 0 && gameBoard.pceNum[PIECES.bB] != 0) { return false; }

	return true;
}

function threeFoldRep() {
	var i = 0, r = 0;
	for (i = 0; i < gameBoard.hisPly; ++i) {
		if (gameBoard.history[i].posKey == gameBoard.posKey) {
			r++;
		}
	}
	return r;
}

function checkResult() {
	if (gameBoard.fiftyMove >= 100) {
		document.getElementById("GameStatus").innerHTML = "GAME DRAWN {Fifty Move Rule}";
		return true;
	}

	if (threeFoldRep() >= 2) {
		document.getElementById("GameStatus").innerHTML = "GAME DRAWN {3- fold -repetition}";
		return true;
	}

	if (drawMaterial() == true) {
		document.getElementById("GameStatus").innerHTML = "GAME DRAWN {insufficient material to mate}";
		return true;
	}

	generateMoves();
	var MoveNum = 0;
	var found = 0;
	for (MoveNum = gameBoard.moveListStart[gameBoard.ply]; MoveNum < gameBoard.moveListStart[gameBoard.ply + 1]; ++MoveNum) {

		if (makeMove(gameBoard.moveList[MoveNum]) == false) {
			continue;
		}
		found++;
		takeMove();
		break;
	}

	if (found != 0) return false;

	var InCheck = gameBoard.sqAttacked(gameBoard.pList[PCEINDEX(Kings[gameBoard.side], 0)], gameBoard.side ^ 1);

	if (InCheck == true) {
		if (gameBoard.side == COLOURS.WHITE) {
			var src = document.getElementById("GameStatus");
			var h1 = document.createElement("H1");
			var t = document.createTextNode("Black Wins! White Mates");
			document.getElementById("gamefinish").style.display = "block";
			h1.appendChild(t);
			src.appendChild(h1);
			return true;
		} else {

			document.getElementById("GameStatus")
			var h1 = document.createElement("H1");
			var t = document.createTextNode("Black Wins! White Mates");
			document.getElementById("gamefinish").style.display = "block";
			h1.appendChild(t);
			src.appendChild(h1);
			return true;
		}
	} else {

		document.getElementById("GameStatus").innerHTML = " Game Drawn Stale Mate";
	}

	return false;
}

function checkAndSet() {
	if (checkResult() == true) {
		gameController.gameOver = true;
	} else {
		gameController.gameOver = false;
		document.getElementById("GameStatus").innerHTML = "";
	}
}

function preSearch() {
	if (gameController.gameOver == false) {
		searchController.thinking = true;
		setTimeout(function () { startSearch(); }, 200);


	}
}


document.getElementById("SearchButton").addEventListener("click", () => {
	gameController.playerSide = gameController.side ^ 1;
	preSearch();

});


function startSearch() {
	searchController.depth = MAXDEPTH;
	var t = Date.now();
	var el = document.getElementById("ThinkTimeChoice");
	var tt = el.options[el.selectedIndex].text;
	searchController.time = parseInt(tt) * 1000;
	searchController.searchPosition();
	makeMove(searchController.best);
	moveGUIPiece(searchController.best);
	checkAndSet();
	var src = document.getElementById("TurnTime");
	src.innerHTML = "your turn";
}