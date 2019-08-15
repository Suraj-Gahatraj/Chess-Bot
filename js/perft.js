var perft_leafNodes;

function perft(depth) { 	

	if(depth == 0) {
        perft_leafNodes++;
        return;
    }	
    
    GenerateMoves();
    
	var index;
	var move;
	
	for(index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
	
		move = gameBoard.moveList[index];	
		if(MakeMove(move) == false) {
			continue;
		}		
		perft(depth-1);
		TakeMove();
	}
    
    return;
}

function perftTest(depth) {    

	gameBoard.PrintBoard();
	console.log("Starting Test To Depth:" + depth);	
	perft_leafNodes = 0;

	var index;
	var move;
	var moveNum = 0;
	for(index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
	
		move = gameBoard.moveList[index];	
		if(MakeMove(move) == false) {
			continue;
		}	
		moveNum++;	
        var cumnodes = perft_leafNodes;
		perft(depth-1);
		TakeMove();
		var oldnodes = perft_leafNodes - cumnodes;
        console.log("move:" + moveNum + " " + PrMove(move) + " " + oldnodes);
	}
    
	console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");      

    return;

}



















































