
//var gameController=new GameController();

document.getElementById("SetFen").addEventListener("click",()=>{
	var fenStr = document.getElementById("fenIn").value;
	document.getElementById("gamefinish").style.display="none";
	newGame(fenStr);
});

document.getElementById("TakeButton").addEventListener("click",()=>{
	if(gameBoard.hisPly > 0) {
		TakeMove();
		gameBoard.ply = 0;
		setInitialBoardPieces();
	}
});

document.getElementById("NewGameButton").addEventListener("click",()=>{
	newGame(START_FEN);
});


document.getElementById("PlayAgain").addEventListener("click",()=>{
	document.getElementById("gamefinish").style.display="none";
	newGame(START_FEN);

});

document.getElementById("exitgame").addEventListener("click",()=>{
	var win = window.open("about:blank", "_self");
    win.close(); 	 
});



function newGame(fenStr) {
	gameBoard.ParseFen(fenStr);
	gameBoard.PrintBoard();
	setInitialBoardPieces();
	checkAndSet();
	var src=document.getElementById("TurnTime");
		src.innerHTML="your turn";	
}

function clearAllPieces() {
	const elements=document.getElementsByClassName("Piece");

	while (elements.length > 0) elements[0].remove();
}

function setInitialBoardPieces() {

	var sq;
	var sq120;
	var file,rank;
	var rankName;
	var fileName;
	var imageString;
	var pieceFileName;
	var pce;
	
	clearAllPieces();
	
	for(sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = gameBoard.pieces[sq120];
		if(pce >= PIECES.wP && pce <= PIECES.bK) {
			addGUIPiece(sq120, pce);
		}
	}
}


function deSelectSq(sq) {
	var Square=document.getElementsByClassName('Square');
	for(var i=0;i<Square.length;i++)
	{
		var x=Square[i];
		 if(pieceIsOnSq(sq, x.offsetTop,x.offsetLeft) == BOOL.TRUE) {

						console.log(" hey checking ",x.classList);
						x.classList.remove("SqSelected");
				}
	}
}


function setSqSelected(sq) {
	var Square=document.getElementsByClassName('Square');
	for(var i=0;i<Square.length;i++)
	{
		var x=Square[i];
	
		 if(pieceIsOnSq(sq, x.offsetTop,x.offsetLeft) == BOOL.TRUE) {
						x.classList.add("SqSelected");
				}
	}
}


function clickedSquare(pageX, pageY) {
	console.log('ClickedSquare() at ' + pageX + ',' + pageY);
	
	var position=document.getElementById("Board");
	
	var workedX = Math.floor(position.offsetLeft);
	var workedY = Math.floor(position.offsetTop);
	
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);
	
	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);
	
	var sq = FR2SQ(file,rank);
	
	console.log('Clicked sq:' + PrSq(sq));
	
	setSqSelected(sq);	
	var src=document.getElementById("TurnTime");
	src.innerHTML="";	
	
	
	return sq;
}

document.addEventListener("click",function(e)
{

	if(e.target && e.target.classList.contains("Piece"))
	{
		if(userMove.from == SQUARES.NO_SQ) {
			userMove.from = clickedSquare(e.pageX, e.pageY);
		} else {
			userMove.to = clickedSquare(e.pageX, e.pageY);
		}
		
		makeuserMove();
		
	}
}

)


document.addEventListener("click",function(e)
{
	
	if(e.target && e.target.classList.contains("Square"))
	{
		if(userMove.from != SQUARES.NO_SQ) {
			userMove.to = clickedSquare(e.pageX, e.pageY);
			makeuserMove();
		}
	}
}

)


function makeuserMove() {

	if(userMove.from != SQUARES.NO_SQ && userMove.to != SQUARES.NO_SQ) {
	
		console.log("User Move:" + PrSq(userMove.from) + PrSq(userMove.to));	
		
		var parsed = ParseMove(userMove.from,userMove.to);
		
		if(parsed != NOMOVE) {
			MakeMove(parsed);
			gameBoard.PrintBoard();
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

	if( (RanksBrd[sq] == 7 - Math.round(top/60) ) && 
		FilesBrd[sq] == Math.round(left/60) ) {
		return BOOL.TRUE;
	}
		
	return BOOL.FALSE;

}

function removeGUIPiece(sq)
{
	var Piece=document.getElementsByClassName("Piece");
	for(var i=0;i<Piece.length;i++)
	{
		let thisPiece=Piece[i];
		if(pieceIsOnSq(sq, thisPiece.offsetTop, thisPiece.offsetLeft) == BOOL.TRUE) {
			thisPiece.parentNode.removeChild(thisPiece);
		}
	}
}


function addGUIPiece(sq, pce) {

	var file = FilesBrd[sq];
	var rank = RanksBrd[sq];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	var pieceFileName = "images/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png";
	var src=document.getElementById("Board");
	var image=document.createElement("img");
	image.src=pieceFileName;
	image.className="Piece "+rankName+ " "+fileName;
	src.appendChild(image);
}

function moveGUIPiece(move) {
	
	var from = FROMSQ(move);
	var to = TOSQ(move);	
	
	if(move & MFLAGEP) {
		var epRemove;
		if(gameBoard.side == COLOURS.BLACK) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		removeGUIPiece(epRemove);
	} else if(CAPTURED(move)) {
		removeGUIPiece(to);
	}
	
	var file = FilesBrd[to];
	var rank = RanksBrd[to];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	

	var Piece=document.getElementsByClassName("Piece");
	for(var i=0;i<Piece.length;i++)
	 {
	 	var x=Piece[i];

	 	if(pieceIsOnSq(from, x.offsetTop, x.offsetLeft) == BOOL.TRUE) {
				 x.classList="";
				 x.classList="Piece "+rankName+ " " + fileName;
	 		 	}

	 }
	
	if(move & MFLAGCA) {
		switch(to) {
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

	if (gameBoard.pceNum[PIECES.wP]!=0 || gameBoard.pceNum[PIECES.bP]!=0) return BOOL.FALSE;
	if (gameBoard.pceNum[PIECES.wQ]!=0 || gameBoard.pceNum[PIECES.bQ]!=0 ||
					gameBoard.pceNum[PIECES.wR]!=0 || gameBoard.pceNum[PIECES.bR]!=0) return BOOL.FALSE;
	if (gameBoard.pceNum[PIECES.wB] > 1 || gameBoard.pceNum[PIECES.bB] > 1) {return BOOL.FALSE;}
    if (gameBoard.pceNum[PIECES.wN] > 1 || gameBoard.pceNum[PIECES.bN] > 1) {return BOOL.FALSE;}
	
	if (gameBoard.pceNum[PIECES.wN]!=0 && gameBoard.pceNum[PIECES.wB]!=0) {return BOOL.FALSE;}
	if (gameBoard.pceNum[PIECES.bN]!=0 && gameBoard.pceNum[PIECES.bB]!=0) {return BOOL.FALSE;}
	 
	return BOOL.TRUE;
}

function threeFoldRep() {
	var i = 0, r = 0;
	
	for(i = 0; i < gameBoard.hisPly; ++i) {
		if (gameBoard.history[i].posKey == gameBoard.posKey) {
		    r++;
		}
	}
	return r;
}

function checkResult() {
	if(gameBoard.fiftyMove >= 100) {
		document.getElementById("GameStatus").innerHTML="GAME DRAWN {Fifty Move Rule}";
		 return BOOL.TRUE;
	}
	
	if (threeFoldRep() >= 2) {
		 document.getElementById("GameStatus").innerHTML="GAME DRAWN {3- fold -repetition}";
     	return BOOL.TRUE;
    }
	
	if (drawMaterial() == BOOL.TRUE) {
		 document.getElementById("GameStatus").innerHTML="GAME DRAWN {insufficient material to mate}";
     	return BOOL.TRUE;
    }
    
    GenerateMoves();
      
    var MoveNum = 0;
	var found = 0;
	
	for(MoveNum = gameBoard.moveListStart[gameBoard.ply]; MoveNum < gameBoard.moveListStart[gameBoard.ply + 1]; ++MoveNum)  {	
       
        if ( MakeMove(gameBoard.moveList[MoveNum]) == BOOL.FALSE)  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }
	
	if(found != 0) return BOOL.FALSE;
	
	var InCheck = gameBoard.SqAttacked(gameBoard.pList[PCEINDEX(Kings[gameBoard.side],0)], gameBoard.side^1);
	
	if(InCheck == BOOL.TRUE) {
		if(gameBoard.side == COLOURS.WHITE) {
		
		
		var src=document.getElementById("GameStatus");
		var h1=document.createElement("H1");
		var t = document.createTextNode("Black Wins! White Mates"); 
		document.getElementById("gamefinish").style.display="block";
		h1.appendChild(t);
		src.appendChild(h1);
	      return BOOL.TRUE;
        } else {
		  
		  document.getElementById("GameStatus")
		  var h1=document.createElement("H1");
		var t = document.createTextNode("Black Wins! White Mates"); 
		document.getElementById("gamefinish").style.display="block";
		h1.appendChild(t);
		src.appendChild(h1);
	      return BOOL.TRUE;
        }
	} else {
		
		document.getElementById("GameStatus").innerHTML=" Game Drawn Stale Mate";
	}
	
	return BOOL.FALSE;	
}

function checkAndSet() {
	if(checkResult() == BOOL.TRUE) {
		gameController.GameOver = BOOL.TRUE;
	} else {
		gameController.GameOver = BOOL.FALSE;
		
		document.getElementById("GameStatus").innerHTML="";
	}
}

function preSearch() {
	if(gameController.GameOver == BOOL.FALSE) {
		searchController.thinking = BOOL.TRUE;
		setTimeout( function() { startSearch(); }, 200 );
		
	
	}
}


document.getElementById("SearchButton").addEventListener("click",()=>
{	
	 	gameController.PlayerSide = gameController.side ^ 1;
		preSearch();

});


function startSearch() {
	searchController.depth = MAXDEPTH;
	var t = Date.now();
	var el=document.getElementById("ThinkTimeChoice");
	var tt=el.options[el.selectedIndex].text;
	searchController.time = parseInt(tt) * 1000;
	searchController.SearchPosition();
	MakeMove(searchController.best);
	moveGUIPiece(searchController.best);
	checkAndSet();
	var src=document.getElementById("TurnTime");
		src.innerHTML="your turn";	
}