var mvvLvaValue = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
var mvvLvaScores = new Array(14 * 14);

function initMvvLva() {
	var Attacker;
	var Victim;

	for (Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for (Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			mvvLvaScores[Victim * 14 + Attacker] = mvvLvaValue[Victim] + 6 - (mvvLvaValue[Attacker] / 100);
		}
	}

}

function moveExists(move) {

	generateMoves();

	var index;
	var moveFound = NOMOVE;
	for (index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {

		moveFound = gameBoard.moveList[index];
		if (makeMove(moveFound) == false) {
			continue;
		}
		takeMove();
		if (move == moveFound) {
			return true;
		}
	}
	return false;
}

function move(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function addCaptureMove(move) {
	gameBoard.moveList[gameBoard.moveListStart[gameBoard.ply + 1]] = move;
	gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]++] =
		mvvLvaScores[CAPTURED(move) * 14 + gameBoard.pieces[FROMSQ(move)]] + 1000000;
}

function addQuietMove(move) {
	gameBoard.moveList[gameBoard.moveListStart[gameBoard.ply + 1]] = move;
	gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]] = 0;

	if (move == gameBoard.searchKillers[gameBoard.ply]) {
		gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]] = 900000;
	} else if (move == gameBoard.searchKillers[gameBoard.ply + MAXDEPTH]) {
		gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]] = 800000;
	} else {
		gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]] =
			gameBoard.searchHistory[gameBoard.pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
	}

	gameBoard.moveListStart[gameBoard.ply + 1]++
}

function addEnPassantMove(move) {
	gameBoard.moveList[gameBoard.moveListStart[gameBoard.ply + 1]] = move;
	gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]++] = 105 + 1000000;
}

function addWhitePawnCaptureMove(from, to, cap) {
	if (ranksBrd[from] == RANKS.RANK_7) {
		addCaptureMove(move(from, to, cap, PIECES.wQ, 0));
		addCaptureMove(move(from, to, cap, PIECES.wR, 0));
		addCaptureMove(move(from, to, cap, PIECES.wB, 0));
		addCaptureMove(move(from, to, cap, PIECES.wN, 0));
	} else {
		addCaptureMove(move(from, to, cap, PIECES.EMPTY, 0));
	}
}

function addBlackPawnCaptureMove(from, to, cap) {
	if (ranksBrd[from] == RANKS.RANK_2) {
		addCaptureMove(move(from, to, cap, PIECES.bQ, 0));
		addCaptureMove(move(from, to, cap, PIECES.bR, 0));
		addCaptureMove(move(from, to, cap, PIECES.bB, 0));
		addCaptureMove(move(from, to, cap, PIECES.bN, 0));
	} else {
		addCaptureMove(move(from, to, cap, PIECES.EMPTY, 0));
	}
}

function addWhitePawnQuietMove(from, to) {
	if (ranksBrd[from] == RANKS.RANK_7) {
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.wQ, 0));
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.wR, 0));
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.wB, 0));
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.wN, 0));
	} else {
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}

function addBlackPawnQuietMove(from, to) {
	if (ranksBrd[from] == RANKS.RANK_2) {
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.bQ, 0));
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.bR, 0));
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.bB, 0));
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.bN, 0));
	} else {
		addQuietMove(move(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}

function generateMoves() {
	gameBoard.moveListStart[gameBoard.ply + 1] = gameBoard.moveListStart[gameBoard.ply];

	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;

	if (gameBoard.side == COLOURS.WHITE) {
		pceType = PIECES.wP;

		for (pceNum = 0; pceNum < gameBoard.pceNum[pceType]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pceType, pceNum)];
			if (gameBoard.pieces[sq + 10] == PIECES.EMPTY) {
				addWhitePawnQuietMove(sq, sq + 10);
				if (ranksBrd[sq] == RANKS.RANK_2 && gameBoard.pieces[sq + 20] == PIECES.EMPTY) {
					addQuietMove(move(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
				}
			}

			if (SQOFFBOARD(sq + 9) == false && PieceCol[gameBoard.pieces[sq + 9]] == COLOURS.BLACK) {
				addWhitePawnCaptureMove(sq, sq + 9, gameBoard.pieces[sq + 9]);
			}

			if (SQOFFBOARD(sq + 11) == false && PieceCol[gameBoard.pieces[sq + 11]] == COLOURS.BLACK) {
				addWhitePawnCaptureMove(sq, sq + 11, gameBoard.pieces[sq + 11]);
			}

			if (gameBoard.enPas != SQUARES.NO_SQ) {
				if (sq + 9 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}

				if (sq + 11 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}

		}

		if (gameBoard.castlePerm & CASTLEBIT.WKCA) {
			if (gameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && gameBoard.pieces[SQUARES.G1] == PIECES.EMPTY) {
				if (gameBoard.sqAttacked(SQUARES.F1, COLOURS.BLACK) == false && gameBoard.sqAttacked(SQUARES.E1, COLOURS.BLACK) == false) {
					addQuietMove(move(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

		if (gameBoard.castlePerm & CASTLEBIT.WQCA) {
			if (gameBoard.pieces[SQUARES.D1] == PIECES.EMPTY && gameBoard.pieces[SQUARES.C1] == PIECES.EMPTY && gameBoard.pieces[SQUARES.B1] == PIECES.EMPTY) {
				if (gameBoard.sqAttacked(SQUARES.D1, COLOURS.BLACK) == false && gameBoard.sqAttacked(SQUARES.E1, COLOURS.BLACK) == false) {
					addQuietMove(move(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

	} else {
		pceType = PIECES.bP;

		for (pceNum = 0; pceNum < gameBoard.pceNum[pceType]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pceType, pceNum)];
			if (gameBoard.pieces[sq - 10] == PIECES.EMPTY) {
				addBlackPawnQuietMove(sq, sq - 10);
				if (ranksBrd[sq] == RANKS.RANK_7 && gameBoard.pieces[sq - 20] == PIECES.EMPTY) {
					addQuietMove(move(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
				}
			}

			if (SQOFFBOARD(sq - 9) == false && PieceCol[gameBoard.pieces[sq - 9]] == COLOURS.WHITE) {
				addBlackPawnCaptureMove(sq, sq - 9, gameBoard.pieces[sq - 9]);
			}

			if (SQOFFBOARD(sq - 11) == false && PieceCol[gameBoard.pieces[sq - 11]] == COLOURS.WHITE) {
				addBlackPawnCaptureMove(sq, sq - 11, gameBoard.pieces[sq - 11]);
			}

			if (gameBoard.enPas != SQUARES.NO_SQ) {
				if (sq - 9 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}

				if (sq - 11 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}
		if (gameBoard.castlePerm & CASTLEBIT.BKCA) {
			if (gameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && gameBoard.pieces[SQUARES.G8] == PIECES.EMPTY) {
				if (gameBoard.sqAttacked(SQUARES.F8, COLOURS.WHITE) == false && gameBoard.sqAttacked(SQUARES.E8, COLOURS.WHITE) == false) {
					addQuietMove(move(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

		if (gameBoard.castlePerm & CASTLEBIT.BQCA) {
			if (gameBoard.pieces[SQUARES.D8] == PIECES.EMPTY && gameBoard.pieces[SQUARES.C8] == PIECES.EMPTY && gameBoard.pieces[SQUARES.B8] == PIECES.EMPTY) {
				if (gameBoard.sqAttacked(SQUARES.D8, COLOURS.WHITE) == false && gameBoard.sqAttacked(SQUARES.E8, COLOURS.WHITE) == false) {
					addQuietMove(move(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}
	}

	pceIndex = loopNonSlideIndex[gameBoard.side];
	pce = loopNonSlidePce[pceIndex++];

	while (pce != 0) {
		for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < dirNum[pce]; index++) {
				dir = pceDir[pce][index];
				t_sq = sq + dir;

				if (SQOFFBOARD(t_sq) == true) {
					continue;
				}

				if (gameBoard.pieces[t_sq] != PIECES.EMPTY) {
					if (PieceCol[gameBoard.pieces[t_sq]] != gameBoard.side) {
						addCaptureMove(move(sq, t_sq, gameBoard.pieces[t_sq], PIECES.EMPTY, 0));
					}
				} else {
					addQuietMove(move(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
				}
			}
		}
		pce = loopNonSlidePce[pceIndex++];
	}

	pceIndex = loopSlideIndex[gameBoard.side];
	pce = loopSlidePce[pceIndex++];

	while (pce != 0) {
		for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < dirNum[pce]; index++) {
				dir = pceDir[pce][index];
				t_sq = sq + dir;

				while (SQOFFBOARD(t_sq) == false) {

					if (gameBoard.pieces[t_sq] != PIECES.EMPTY) {
						if (PieceCol[gameBoard.pieces[t_sq]] != gameBoard.side) {
							addCaptureMove(move(sq, t_sq, gameBoard.pieces[t_sq], PIECES.EMPTY, 0));
						}
						break;
					}
					addQuietMove(move(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
					t_sq += dir;
				}
			}
		}
		pce = loopSlidePce[pceIndex++];
	}
}

function generateCaptures() {
	gameBoard.moveListStart[gameBoard.ply + 1] = gameBoard.moveListStart[gameBoard.ply];

	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;

	if (gameBoard.side == COLOURS.WHITE) {
		pceType = PIECES.wP;

		for (pceNum = 0; pceNum < gameBoard.pceNum[pceType]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pceType, pceNum)];

			if (SQOFFBOARD(sq + 9) == false && PieceCol[gameBoard.pieces[sq + 9]] == COLOURS.BLACK) {
				addWhitePawnCaptureMove(sq, sq + 9, gameBoard.pieces[sq + 9]);
			}

			if (SQOFFBOARD(sq + 11) == false && PieceCol[gameBoard.pieces[sq + 11]] == COLOURS.BLACK) {
				addWhitePawnCaptureMove(sq, sq + 11, gameBoard.pieces[sq + 11]);
			}

			if (gameBoard.enPas != SQUARES.NO_SQ) {
				if (sq + 9 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}

				if (sq + 11 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}

		}

	} else {
		pceType = PIECES.bP;

		for (pceNum = 0; pceNum < gameBoard.pceNum[pceType]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pceType, pceNum)];

			if (SQOFFBOARD(sq - 9) == false && PieceCol[gameBoard.pieces[sq - 9]] == COLOURS.WHITE) {
				addBlackPawnCaptureMove(sq, sq - 9, gameBoard.pieces[sq - 9]);
			}

			if (SQOFFBOARD(sq - 11) == false && PieceCol[gameBoard.pieces[sq - 11]] == COLOURS.WHITE) {
				addBlackPawnCaptureMove(sq, sq - 11, gameBoard.pieces[sq - 11]);
			}

			if (gameBoard.enPas != SQUARES.NO_SQ) {
				if (sq - 9 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}

				if (sq - 11 == gameBoard.enPas) {
					addEnPassantMove(move(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}
	}

	pceIndex = loopNonSlideIndex[gameBoard.side];
	pce = loopNonSlidePce[pceIndex++];

	while (pce != 0) {
		for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < dirNum[pce]; index++) {
				dir = pceDir[pce][index];
				t_sq = sq + dir;

				if (SQOFFBOARD(t_sq) == true) {
					continue;
				}

				if (gameBoard.pieces[t_sq] != PIECES.EMPTY) {
					if (PieceCol[gameBoard.pieces[t_sq]] != gameBoard.side) {
						addCaptureMove(move(sq, t_sq, gameBoard.pieces[t_sq], PIECES.EMPTY, 0));
					}
				}
			}
		}
		pce = loopNonSlidePce[pceIndex++];
	}

	pceIndex = loopSlideIndex[gameBoard.side];
	pce = loopSlidePce[pceIndex++];

	while (pce != 0) {
		for (pceNum = 0; pceNum < gameBoard.pceNum[pce]; ++pceNum) {
			sq = gameBoard.pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < dirNum[pce]; index++) {
				dir = pceDir[pce][index];
				t_sq = sq + dir;

				while (SQOFFBOARD(t_sq) == false) {

					if (gameBoard.pieces[t_sq] != PIECES.EMPTY) {
						if (PieceCol[gameBoard.pieces[t_sq]] != gameBoard.side) {
							addCaptureMove(move(sq, t_sq, gameBoard.pieces[t_sq], PIECES.EMPTY, 0));
						}
						break;
					}
					t_sq += dir;
				}
			}
		}
		pce = loopSlidePce[pceIndex++];
	}
}

