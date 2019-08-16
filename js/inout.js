function prSq(sq) {
	return (fileChar[filesBrd[sq]] + rankChar[ranksBrd[sq]]);
}

function prMove(move) {
	var mvStr;

	var ff = filesBrd[FROMSQ(move)];
	var rf = ranksBrd[FROMSQ(move)];
	var ft = filesBrd[TOSQ(move)];
	var rt = ranksBrd[TOSQ(move)];

	mvStr = fileChar[ff] + rankChar[rf] + fileChar[ft] + rankChar[rt];

	var promoted = PROMOTED(move);

	if (promoted != PIECES.EMPTY) {
		var pchar = 'q';
		if (PieceKnight[promoted] == true) {
			pchar = 'n';
		} else if (PieceRookQueen[promoted] == true && PieceBishopQueen[promoted] == false) {
			pchar = 'r';
		} else if (PieceRookQueen[promoted] == false && PieceBishopQueen[promoted] == true) {
			pchar = 'b';
		}
		mvStr += pchar;
	}
	return mvStr;
}

function printMoveList() {

	var index;
	var move;
	var num = 1;
	console.log('MoveList:');

	for (index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
		move = gameBoard.moveList[index];
		console.log('IMove:' + num + ':(' + index + '):' + prMove(move) + ' Score:' + gameBoard.moveScores[index]);
		num++;
	}
	console.log('End MoveList');
}

function parseMove(from, to) {

	generateMoves();

	var Move = NOMOVE;
	var PromPce = PIECES.EMPTY;
	var found = false;

	for (index = gameBoard.moveListStart[gameBoard.ply];
		index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
		Move = gameBoard.moveList[index];
		if (FROMSQ(Move) == from && TOSQ(Move) == to) {
			PromPce = PROMOTED(Move);
			if (PromPce != PIECES.EMPTY) {
				if ((PromPce == PIECES.wQ && gameBoard.side == COLOURS.WHITE) ||
					(PromPce == PIECES.bQ && gameBoard.side == COLOURS.BLACK)) {
					found = true;
					break;
				}
				continue;
			}
			found = true;
			break;
		}
	}

	if (found != false) {
		if (makeMove(Move) == false) {
			return NOMOVE;
		}
		takeMove();
		return Move;
	}

	return NOMOVE;
}
