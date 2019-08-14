class  SearchController  {

	constructor()
	{
		this.nodes;
		this.fh;
		this.fhf;
		this.depth;
		this.time;
		this.start;
		this.stop;
		this.best;
		this.thinking;
	}
	
PickNextMove(MoveNum) {

	var index = 0;
	var bestScore = -1;
	var bestNum = MoveNum;
	
	for(index = MoveNum; index < gameBoard.moveListStart[gameBoard.ply+1]; ++index) {
		if(gameBoard.moveScores[index] > bestScore) {
			bestScore = gameBoard.moveScores[index];
			bestNum = index;			
		}
	} 
	
	if(bestNum != MoveNum) {
		var temp = 0;
		temp = gameBoard.moveScores[MoveNum];
		gameBoard.moveScores[MoveNum] = gameBoard.moveScores[bestNum];
		gameBoard.moveScores[bestNum] = temp;
		
		temp = gameBoard.moveList[MoveNum];
		gameBoard.moveList[MoveNum] = gameBoard.moveList[bestNum];
		gameBoard.moveList[bestNum] = temp;
	}

}

ClearPvTable() {
	
	for(index = 0; index < PVENTRIES; index++) {
			gameBoard.PvTable[index].move = NOMOVE;
			gameBoard.PvTable[index].posKey = 0;		
	}
}

CheckUp() {
	if (( Date.now() - this.start ) > this.time) {
		this.stop = BOOL.TRUE;
	}
}
 IsRepetition() {
	var index = 0;
	
	for(index = gameBoard.hisPly - gameBoard.fiftyMove; index < gameBoard.hisPly - 1; ++index) {
		if(gameBoard.posKey == gameBoard.history[index].posKey) {
			return BOOL.TRUE;
		}
	}
	
	return BOOL.FALSE;
}
 Quiescence(alpha, beta) {

	if ((this.nodes & 2047) == 0) {
		this.CheckUp();
	}
	
	this.nodes++;
	
	if( (this.IsRepetition() || gameBoard.fiftyMove >= 100) && gameBoard.ply != 0) {
		return 0;
	}
	
	if(gameBoard.ply > MAXDEPTH -1) {
		return EvalPosition();
	}	
	
	var Score = EvalPosition();
	
	if(Score >= beta) {
		return beta;
	}
	
	if(Score > alpha) {
		alpha = Score;
	}
	
	GenerateCaptures();
	
	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	var Move = NOMOVE;	
	
	for(MoveNum = gameBoard.moveListStart[gameBoard.ply]; MoveNum < gameBoard.moveListStart[gameBoard.ply + 1]; ++MoveNum) {
	
		this.PickNextMove(MoveNum);
		
		Move = gameBoard.moveList[MoveNum];	

		if(MakeMove(Move) == BOOL.FALSE) {
			continue;
		}		
		Legal++;
		Score = -this.Quiescence( -beta, -alpha);
		
		TakeMove();
		
		if(this.stop == BOOL.TRUE) {
			return 0;
		}
		
		if(Score > alpha) {
			if(Score >= beta) {
				if(Legal == 1) {
					this.fhf++;
				}
				this.fh++;	
				return beta;
			}
			alpha = Score;
			BestMove = Move;
		}		
	}
	
	if(alpha != OldAlpha) {
		StorePvMove(BestMove);
	}
	
	return alpha;

}

 AlphaBeta(alpha, beta, depth) {

	
	if(depth <= 0) {
		return this.Quiescence(alpha, beta);
	}
	
	if ((this.nodes & 2047) == 0) {
		this.CheckUp();
	}
	
	this.nodes++;
	
	if( (this.IsRepetition() || gameBoard.fiftyMove >= 100) && gameBoard.ply != 0) {
		return 0;
	}
	
	if(gameBoard.ply > MAXDEPTH -1) {
		return EvalPosition();
	}	
	
	var InCheck = gameBoard.SqAttacked(gameBoard.pList[PCEINDEX(Kings[gameBoard.side],0)], gameBoard.side^1);
	if(InCheck == BOOL.TRUE)  {
		depth++;
	}	
	
	var Score = -INFINITE;
	
	GenerateMoves();
	
	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	var Move = NOMOVE;	
	
	var PvMove = ProbePvTable();
	if(PvMove != NOMOVE) {
		for(MoveNum = gameBoard.moveListStart[gameBoard.ply]; MoveNum < gameBoard.moveListStart[gameBoard.ply + 1]; ++MoveNum) {
			if(gameBoard.moveList[MoveNum] == PvMove) {
				gameBoard.moveScores[MoveNum] = 2000000;
				break;
			}
		}
	}
	
	for(MoveNum = gameBoard.moveListStart[gameBoard.ply]; MoveNum < gameBoard.moveListStart[gameBoard.ply + 1]; ++MoveNum) {
	
		this.PickNextMove(MoveNum);	
		
		Move = gameBoard.moveList[MoveNum];	
		
		if(MakeMove(Move) == BOOL.FALSE) {
			continue;
		}		
		Legal++;
		Score = -this.AlphaBeta( -beta, -alpha, depth-1);
		
		TakeMove();
		
		if(this.stop == BOOL.TRUE) {
			return 0;
		}
		
		if(Score > alpha) {
			if(Score >= beta) {
				if(Legal == 1) {
					this.fhf++;
				}
				this.fh++;		
				if((Move & MFLAGCAP) == 0) {
					gameBoard.searchKillers[MAXDEPTH + gameBoard.ply] = 
						gameBoard.searchKillers[gameBoard.ply];
					gameBoard.searchKillers[gameBoard.ply] = Move;
				}					
				return beta;
			}
			if((Move & MFLAGCAP) == 0) {
				gameBoard.searchHistory[gameBoard.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move)]
						 += depth * depth;
			}
			alpha = Score;
			BestMove = Move;				
		}		
	}	
	
	if(Legal == 0) {
		if(InCheck == BOOL.TRUE) {
			return -MATE + gameBoard.ply;
		} else {
			return 0;
		}
	}	
	
	if(alpha != OldAlpha) {
		StorePvMove(BestMove);
	}
	
	return alpha;
}

 ClearForSearch() {

	var index = 0;
	var index2 = 0;
	
	for(index = 0; index < 14 * BRD_SQ_NUM; ++index) {				
		gameBoard.searchHistory[index] = 0;	
	}
	
	for(index = 0; index < 3 * MAXDEPTH; ++index) {
		gameBoard.searchKillers[index] = 0;
	}	
	
	this.ClearPvTable();
	gameBoard.ply = 0;
	this.nodes = 0;
	this.fh = 0;
	this.fhf = 0;
	this.start = Date.now();
	this.stop = BOOL.FALSE;
}

 SearchPosition() {

	var bestMove = NOMOVE;
	var bestScore = -INFINITE;
	var Score = -INFINITE;
	var currentDepth = 0;
	var line;
	var PvNum;
	var c;
	this.ClearForSearch();
	
	for( currentDepth = 1; currentDepth <= this.depth; ++currentDepth) {	
	
		Score = this.AlphaBeta(-INFINITE, INFINITE, currentDepth);
					
		if(this.stop == BOOL.TRUE) {
			break;
		}
		
		bestScore = Score; 
		bestMove = ProbePvTable();
		line = 'D:' + currentDepth + ' Best:' + PrMove(bestMove) + ' Score:' + bestScore + 
				' nodes:' + this.nodes;
				
		PvNum = GetPvLine(currentDepth);
		line += ' Pv:';
		for( c = 0; c < PvNum; ++c) {
			line += ' ' + PrMove(gameBoard.PvArray[c]);
		}
		if(currentDepth!=1) {
			line += (" Ordering:" + ((this.fhf/this.fh)*100).toFixed(2) + "%");
		}
		console.log(line);
						
	}	

	this.best = bestMove;
	this.thinking = BOOL.FALSE;
	this.UpdateDOMStats(bestScore, currentDepth);
}

 UpdateDOMStats(dom_score, dom_depth) {

	var scoreText = "Score: " + (dom_score / 100).toFixed(2);
	if(Math.abs(dom_score) > MATE - MAXDEPTH) {
		scoreText = "Score: Mate In " + (MATE - (Math.abs(dom_score))-1) + " moves";
	}
	

	document.getElementById("DepthOut").innerHTML="Depth: " + dom_depth;
	document.getElementById("DepthOut").innerHTML="Depth: " + dom_depth;
	document.getElementById("ScoreOut").innerHTML=scoreText;
	document.getElementById("NodesOut").innerHTML="Nodes: " + this.nodes;
	document.getElementById("TimeOut").innerHTML="Time: " + ((Date.now()-this.start)/1000).toFixed(1) + "s";
	document.getElementById("BestOut").innerHTML="BestMove: " + PrMove(this.best);
}





}


var searchController=new SearchController();










































