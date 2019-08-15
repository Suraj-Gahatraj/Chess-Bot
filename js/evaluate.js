var BishopPair = 40;
function evalPosition() {
	var score = gameBoard.material[COLOURS.WHITE] - gameBoard.material[COLOURS.BLACK];
	var pce;
	var sq;
	var pceNum;
	pce = PIECES.wP;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score += pawnTable[SQ64(sq)];
	}

	pce = PIECES.bP;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score -= pawnTable[MIRROR64(SQ64(sq))];
	}

	pce = PIECES.wN;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score += knightTable[SQ64(sq)];
	}

	pce = PIECES.bN;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score -= knightTable[MIRROR64(SQ64(sq))];
	}

	pce = PIECES.wB;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score += bishopTable[SQ64(sq)];
	}

	pce = PIECES.bB;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score -= bishopTable[MIRROR64(SQ64(sq))];
	}

	pce = PIECES.wR;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score += rookTable[SQ64(sq)];
	}

	pce = PIECES.bR;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score -= rookTable[MIRROR64(SQ64(sq))];
	}

	pce = PIECES.wQ;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score += rookTable[SQ64(sq)];
	}

	pce = PIECES.bQ;
	for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
		sq = gameBoard.pList[PCEINDEX(pce, pceNum)];
		score -= rookTable[MIRROR64(SQ64(sq))];
	}

	if (gameBoard.pceNum[PIECES.wB] >= 2) {
		score += BishopPair;
	}

	if (gameBoard.pceNum[PIECES.bB] >= 2) {
		score -= BishopPair;
	}

	if (gameBoard.side == COLOURS.WHITE) {
		return score;
	} else {
		return -score;
	}

}






















































