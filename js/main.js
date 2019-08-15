
init();
newGame(START_FEN);

function initFilesRanksBrd() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;

	for (index = 0; index < BRD_SQ_NUM; ++index) {
		filesBrd[index] = SQUARES.OFFBOARD;
		ranksBrd[index] = SQUARES.OFFBOARD;
	}

	for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file, rank);
			filesBrd[sq] = file;
			ranksBrd[sq] = rank;
		}
	}
}

function initHashKeys() {
	var index = 0;

	for (index = 0; index < 14 * 120; ++index) {
		pieceKeys[index] = RAND_32();
	}

	SideKey = RAND_32();

	for (index = 0; index < 16; ++index) {
		castleKeys[index] = RAND_32();
	}
}

function initSq120To64() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq64 = 0;

	for (index = 0; index < BRD_SQ_NUM; ++index) {
		sq120ToSq64[index] = 65;
	}

	for (index = 0; index < 64; ++index) {
		sq64ToSq120[index] = 120;
	}

	for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file, rank);
			sq64ToSq120[sq64] = sq;
			sq120ToSq64[sq] = sq64;
			sq64++;
		}
	}

}

function initBoardVars() {

	var index = 0;
	for (index = 0; index < MAXGAMEMOVES; ++index) {
		gameBoard.history.push({
			move: NOMOVE,
			castlePerm: 0,
			enPas: 0,
			fiftyMove: 0,
			posKey: 0
		});
	}

	for (index = 0; index < PVENTRIES; ++index) {
		gameBoard.PvTable.push({
			move: NOMOVE,
			posKey: 0
		});
	}
}

function initBoardSquares() {
	var light = 1;
	var rankName;
	var fileName;
	var divString;
	var rankIter;
	var fileIter;
	var lightString;

	for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
		light ^= 1;
		rankName = "rank" + (rankIter + 1);
		for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
			fileName = "file" + (fileIter + 1);
			if (light == 0) lightString = "Light";
			else lightString = "Dark";
			light ^= 1;
			var src = document.getElementById("Board");
			var div = document.createElement("div");
			div.className = "Square " + rankName + " " + fileName + " " + lightString;
			src.appendChild(div);

		}
	}

}

function init() {
	initFilesRanksBrd();
	initHashKeys();
	initSq120To64();
	initBoardVars();
	initMvvLva();
	initBoardSquares();
}















































