class Engine
{
    constructor()
    {
        this.game=new GameBoard();
    }

    start()
    {
        ChessUtils.InitFilesRanksBrd(FilesBrd,RanksBrd);
	    ChessUtils.InitHashKeys(PieceKeys,SideKey,CastleKeys);
        InitSq120To64();
        this.game.ParseFen(START_FEN);
        this.game.PrintBoard();
    }
}