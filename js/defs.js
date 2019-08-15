
var PIECES =  { EMPTY : 0, wP : 1, wN : 2, wB : 3,wR : 4, wQ : 5, wK : 6, 
              bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12  };
              
var BRD_SQ_NUM = 120;

var FILES =  { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, 
	FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
	
var RANKS =  { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, 
	RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, RANK_NONE:8 };
	
var COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

var SQUARES = {
  A1:21, B1:22, C1:23, D1:24, E1:25, F1:26, G1:27, H1:28,  
  A8:91, B8:92, C8:93, D8:94, E8:95, F8:96, G8:97, H8:98, 
  NO_SQ:99, OFFBOARD:100
};

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;
var INFINITE = 30000;
var MATE = 29000;
var PVENTRIES = 10000;

var filesBrd = new Array(BRD_SQ_NUM);
var ranksBrd = new Array(BRD_SQ_NUM);
var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var pceChar = ".PNBRQKpnbrqk";
var sideChar = "wb-";
var rankChar = "12345678";
var fileChar = "abcdefgh";
var pieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
var pieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
var pieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
var pieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
var piecePawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ];	
var PieceKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ];
var pieceKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ];
var pieceRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
var pieceBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
var pieceSlides = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

var knDir = [ -8, -19,	-21, -12, 8, 19, 21, 12 ];
var rkDir = [ -1, -10,	1, 10 ];
var biDir = [ -9, -11, 11, 9 ];
var kiDir = [ -1, -10,	1, 10, -9, -11, 11, 9 ];

var dirNum = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
var pceDir = [ 0, 0, knDir, biDir, rkDir, kiDir, kiDir, 0, knDir, biDir, rkDir, kiDir, kiDir ];
var loopNonSlidePce = [ PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0 ];
var loopNonSlideIndex = [ 0, 3 ];
var loopSlidePce = [ PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0 ];
var loopSlideIndex = [ 0, 4];

var pieceKeys = new Array(14 * 120);
var sideKey;
var castleKeys = new Array(16);

var sq120ToSq64 = new Array(BRD_SQ_NUM);
var sq64ToSq120 = new Array(64);

var mirror64 = [
56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,
48	,	49	,	50	,	51	,	52	,	53	,	54	,	55	,
40	,	41	,	42	,	43	,	44	,	45	,	46	,	47	,
32	,	33	,	34	,	35	,	36	,	37	,	38	,	39	,
24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,
16	,	17	,	18	,	19	,	20	,	21	,	22	,	23	,
8	,	9	,	10	,	11	,	12	,	13	,	14	,	15	,
0	,	1	,	2	,	3	,	4	,	5	,	6	,	7
];

var Kings = [PIECES.wK, PIECES.bK];

var castlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];


var MFLAGEP = 0x40000;
var MFLAGPS = 0x80000;
var MFLAGCA = 0x1000000;
var MFLAGCAP = 0x7C000;
var MFLAGPROM = 0xF00000;
var NOMOVE = 0;

function hashPce(pce, sq) {
	gameBoard.posKey ^= pieceKeys[(pce * 120) + sq];
}

function hashCa() { gameBoard.posKey ^= castleKeys[gameBoard.castlePerm]; }
function hashSide() { gameBoard.posKey ^= sideKey; }
function hashEp() { gameBoard.posKey ^= pieceKeys[gameBoard.enPas]; }
