function GetPvLine(depth) {
	
	var move = ProbePvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( MoveExists(move) == BOOL.TRUE) {
			MakeMove(move);
			gameBoard.PvArray[count++] = move;			
		} else {
			break;
		}		
		move = ProbePvTable();	
	}
	
	while(gameBoard.ply > 0) {
		TakeMove();
	}
	
	return count;
	
}

function ProbePvTable() {
	var index = gameBoard.posKey % PVENTRIES;
	
	if(gameBoard.PvTable[index].posKey == gameBoard.posKey) {
		return gameBoard.PvTable[index].move;
	}
	
	return NOMOVE;
}

function StorePvMove(move) {
	var index = gameBoard.posKey % PVENTRIES;
	gameBoard.PvTable[index].posKey = gameBoard.posKey;
	gameBoard.PvTable[index].move = move;
}