class GameBoard {

	constructor()
	{
		this.pieces = new Array(BRD_SQ_NUM);
		this.side = COLOURS.WHITE;
		this.fiftyMove = 0;
		this.hisPly = 0;
		this.history = [];
		this.ply = 0;
		this.enPas = 0;
		this.castlePerm = 0;
		this.material = new Array(2); // WHITE,BLACK material of pieces
		this.pceNum = new Array(13); // indexed by Pce
		this.pList = new Array(14 * 10);
		this.posKey = 0;
		this.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
		this.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
		this.moveListStart = new Array(MAXDEPTH);
		this.PvTable = [];
		this.PvArray = new Array(MAXDEPTH);
		this.searchHistory = new Array( 14 * BRD_SQ_NUM);
		this.searchKillers = new Array(3 * MAXDEPTH);
	}



 checkBoard() {   

	var t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [ 0, 0];
	var sq64, t_piece, t_pce_num, sq120, colour, pcount;
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		for(t_pce_num = 0; t_pce_num < this.pceNum[t_piece]; ++t_pce_num) {
			sq120 = this.pList[PCEINDEX(t_piece,t_pce_num)];
			if(this.pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return BOOL.FALSE;
			}
		}	
	}
	
	for(sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = SQ120(sq64);
		t_piece = this.pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[PieceCol[t_piece]] += pieceVal[t_piece];
	}
	
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		if(t_pceNum[t_piece] != this.pceNum[t_piece]) {
				console.log('Error t_pceNum');
				return BOOL.FALSE;
			}	
	}
	
	if(t_material[COLOURS.WHITE] != this.material[COLOURS.WHITE] ||
			 t_material[COLOURS.BLACK] != this.material[COLOURS.BLACK]) {
				console.log('Error t_material');
				return BOOL.FALSE;
	}	
	
	if(this.side!=COLOURS.WHITE && this.side!=COLOURS.BLACK) {
				console.log('Error this.side');
				return BOOL.FALSE;
	}
	
	if(GeneratePosKey()!=this.posKey) {
				console.log('Error this.posKey');
				return BOOL.FALSE;
	}	
	return BOOL.TRUE;
}

 printBoard() {
	
	var sq,file,rank,piece;

	console.log("\nGame Board:\n");
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =(rankChar[rank] + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = this.pieces[sq];
			line += (" " + pceChar[piece] + " ");
		}
		console.log(line);
	}
	
	console.log("");
	var line = "   ";
	for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + fileChar[file] + ' ');	
	}
	
	console.log(line);
	console.log("side:" + sideChar[this.side] );
	console.log("enPas:" + this.enPas);
	line = "";	
	
	if(this.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(this.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(this.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(this.castlePerm & CASTLEBIT.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + this.posKey.toString(16));
}

 generatePosKey() {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.EMPTY;

	for(sq = 0; sq < BRD_SQ_NUM; ++sq) {
		piece = this.pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {			
			finalKey ^= pieceKeys[(piece * 120) + sq];
		}		
	}

	if(this.side == COLOURS.WHITE) {
		finalKey ^= sideKey;
	}
	
	if(this.enPas != SQUARES.NO_SQ) {		
		finalKey ^= pieceKeys[this.enPas];
	}
	
	finalKey ^= castleKeys[this.castlePerm];
	
	return finalKey;

}

 printPieceLists() {

	var piece, pceNum;
	
	for(piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
		for(pceNum = 0; pceNum < this.pceNum[piece]; ++pceNum) {
			console.log('Piece ' + pceChar[piece] + ' on ' + PrSq( this.pList[PCEINDEX(piece,pceNum)] ));
		}
	}

}

 updateListsMaterial() {	
	
	var piece,sq,index,colour;
	
	for(index = 0; index < 14 * 120; ++index) {
		this.pList[index] = PIECES.EMPTY;
	}
	
	for(index = 0; index < 2; ++index) {		
		this.material[index] = 0;		
	}	
	
	for(index = 0; index < 13; ++index) {
		this.pceNum[index] = 0;
	}
	
	for(index = 0; index < 64; ++index) {
		sq = SQ120(index);
		piece = this.pieces[sq];
		if(piece != PIECES.EMPTY) {
			
			colour = PieceCol[piece];		
			
			this.material[colour] += pieceVal[piece];
			
			this.pList[PCEINDEX(piece,this.pceNum[piece])] = sq;
			this.pceNum[piece]++;			
		}
	}
	
}

 resetBoard() {
	
	var index = 0;
	
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		this.pieces[index] = SQUARES.OFFBOARD;
	}
	
	for(index = 0; index < 64; ++index) {
		this.pieces[SQ120(index)] = PIECES.EMPTY;
	}
	
	this.side = COLOURS.BOTH;
	this.enPas = SQUARES.NO_SQ;
	this.fiftyMove = 0;	
	this.ply = 0;
	this.hisPly = 0;	
	this.castlePerm = 0;	
	this.posKey = 0;
	this.moveListStart[this.ply] = 0;
	
}

//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

 parseFen(fen) {

	this.resetBoard();
	
	var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;  
	var sq120 = 0;
	var fenCnt = 0; // fen[fenCnt]
	
	while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
	    count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;  
            default:
                console.log("FEN error");
                return;

		}
		
		for (i = 0; i < count; i++) {	
			sq120 = FR2SQ(file,rank);            
            this.pieces[sq120] = piece;
			file++;
        }
		fenCnt++;
	} // while loop end
	
	//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
	this.side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK;
	fenCnt += 2;
	
	for (i = 0; i < 4; i++) {
        if (fen[fenCnt] == ' ') {
            break;
        }		
		switch(fen[fenCnt]) {
			case 'K': this.castlePerm |= CASTLEBIT.WKCA; break;
			case 'Q': this.castlePerm |= CASTLEBIT.WQCA; break;
			case 'k': this.castlePerm |= CASTLEBIT.BKCA; break;
			case 'q': this.castlePerm |= CASTLEBIT.BQCA; break;
			default:	     break;
        }
		fenCnt++;
	}
	fenCnt++;	
	
	if (fen[fenCnt] != '-') {        
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();	
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);	
		this.enPas = FR2SQ(file,rank);		
    }
	
	this.posKey = this.generatePosKey();	
	this.updateListsMaterial();
}

 printSqAttacked() {
	
	var sq,file,rank,piece;

	console.log("\nAttacked:\n");
	
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =((rank+1) + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			if(SqAttacked(sq, this.side^1) == BOOL.TRUE) piece = "X";
			else piece = "-";
			line += (" " + piece + " ");
		}
		console.log(line);
	}
	
	console.log("");
	
}

 sqAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;
	
	if(side == COLOURS.WHITE) {
		if(this.pieces[sq - 11] == PIECES.wP || this.pieces[sq - 9] == PIECES.wP) {
			return BOOL.TRUE;
		}
	} else {
		if(this.pieces[sq + 11] == PIECES.bP || this.pieces[sq + 9] == PIECES.bP) {
			return BOOL.TRUE;
		}	
	}
	
	for(index = 0; index < 8; index++) {
		pce = this.pieces[sq + knDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKnight[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		var dir = rkDir[index];
		t_sq = sq + dir;
		pce = this.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(pieceRookQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = this.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = biDir[index];
		t_sq = sq + dir;
		pce = this.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(pieceBishopQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = this.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 8; index++) {
		pce = this.pieces[sq + kiDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && pieceKing[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	return BOOL.FALSE;
	

}

}


var gameBoard=new GameBoard();