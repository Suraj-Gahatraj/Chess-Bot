function ClearPiece(sq) {

	var pce = gameBoard.pieces[sq];
	var col = PieceCol[pce];
	var index;
	var t_pceNum = -1;
	
	HASH_PCE(pce, sq);
	
	gameBoard.pieces[sq] = PIECES.EMPTY;
	gameBoard.material[col] -= PieceVal[pce];
	
	for(index = 0; index < gameBoard.pceNum[pce]; ++index) {
		if(gameBoard.pList[PCEINDEX(pce,index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	
	gameBoard.pceNum[pce]--;
	gameBoard.pList[PCEINDEX(pce, t_pceNum)] = gameBoard.pList[PCEINDEX(pce, gameBoard.pceNum[pce])];	

}

function AddPiece(sq, pce) {

	var col = PieceCol[pce];
	
	HASH_PCE(pce, sq);
	
	gameBoard.pieces[sq] = pce;
	gameBoard.material[col] += PieceVal[pce];
	gameBoard.pList[PCEINDEX(pce, gameBoard.pceNum[pce])] = sq;
	gameBoard.pceNum[pce]++;

}

function MovePiece(from, to) {
	
	var index = 0;
	var pce = gameBoard.pieces[from];
	
	HASH_PCE(pce, from);
	gameBoard.pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(pce,to);
	gameBoard.pieces[to] = pce;
	
	for(index = 0; index < gameBoard.pceNum[pce]; ++index) {
		if(gameBoard.pList[PCEINDEX(pce,index)] == from) {
			gameBoard.pList[PCEINDEX(pce,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
	
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = gameBoard.side;	

	gameBoard.history[gameBoard.hisPly].posKey = gameBoard.posKey;

	if( (move & MFLAGEP) != 0) {
		if(side == COLOURS.WHITE) {
			ClearPiece(to-10);
		} else {
			ClearPiece(to+10);
		}
	} else if( (move & MFLAGCA) != 0) {
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}
	
	if(gameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();
	
	gameBoard.history[gameBoard.hisPly].move = move;
    gameBoard.history[gameBoard.hisPly].fiftyMove = gameBoard.fiftyMove;
    gameBoard.history[gameBoard.hisPly].enPas = gameBoard.enPas;
    gameBoard.history[gameBoard.hisPly].castlePerm = gameBoard.castlePerm;
    
    gameBoard.castlePerm &= CastlePerm[from];
    gameBoard.castlePerm &= CastlePerm[to];
    gameBoard.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    var captured = CAPTURED(move);
    gameBoard.fiftyMove++;
    
    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        gameBoard.fiftyMove = 0;
    }
    
    gameBoard.hisPly++;
	gameBoard.ply++;
	
	if(PiecePawn[gameBoard.pieces[from]] == BOOL.TRUE) {
        gameBoard.fiftyMove = 0;
        if( (move & MFLAGPS) != 0) {
            if(side==COLOURS.WHITE) {
                gameBoard.enPas=from+10;
            } else {
                gameBoard.enPas=from-10;
            }
            HASH_EP();
        }
    }
    
    MovePiece(from, to);
    
    var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)   {       
        ClearPiece(to);
        AddPiece(to, prPce);
    }
    
    gameBoard.side ^= 1;
    HASH_SIDE();
    
    if(gameBoard.SqAttacked(gameBoard.pList[PCEINDEX(Kings[side],0)], gameBoard.side))  {
         TakeMove();
    	return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
}

function TakeMove() {
	
	gameBoard.hisPly--;
    gameBoard.ply--;
    
    var move = gameBoard.history[gameBoard.hisPly].move;
	var from = FROMSQ(move);
    var to = TOSQ(move);
    
    if(gameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    gameBoard.castlePerm = gameBoard.history[gameBoard.hisPly].castlePerm;
    gameBoard.fiftyMove = gameBoard.history[gameBoard.hisPly].fiftyMove;
    gameBoard.enPas = gameBoard.history[gameBoard.hisPly].enPas;
    
    if(gameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    gameBoard.side ^= 1;
    HASH_SIDE();
    
    if( (MFLAGEP & move) != 0) {
        if(gameBoard.side == COLOURS.WHITE) {
            AddPiece(to-10, PIECES.bP);
        } else {
            AddPiece(to+10, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }
    
    MovePiece(to, from);
    
    var captured = CAPTURED(move);
    if(captured != PIECES.EMPTY) {      
        AddPiece(to, captured);
    }
    
    if(PROMOTED(move) != PIECES.EMPTY)   {        
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
}























































































