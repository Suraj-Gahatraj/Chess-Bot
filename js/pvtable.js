function getPvLine(depth) {
	
	var move = probePvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( moveExists(move) == BOOL.TRUE) {
			makeMove(move);
			gameBoard.PvArray[count++] = move;			
		} else {
			break;
		}		
		move = probePvTable();	
	}
	
	while(gameBoard.ply > 0) {
		takeMove();
	}
	
	return count;
	
}

function probePvTable() {
	var index = gameBoard.posKey % PVENTRIES;
	
	if(gameBoard.PvTable[index].posKey == gameBoard.posKey) {
		return gameBoard.PvTable[index].move;
	}
	
	return NOMOVE;
}

function storePvMove(move) {
	var index = gameBoard.posKey % PVENTRIES;
	gameBoard.PvTable[index].posKey = gameBoard.posKey;
	gameBoard.PvTable[index].move = move;
}