function clearPiece(sq) {

    var pce = gameBoard.pieces[sq];
    var col = PieceCol[pce];
    var index;
    var t_pceNum = -1;

    hashPce(pce, sq);

    gameBoard.pieces[sq] = PIECES.EMPTY;
    gameBoard.material[col] -= pieceVal[pce];

    for (index = 0; index < gameBoard.pceNum[pce]; ++index) {
        if (gameBoard.pList[PCEINDEX(pce, index)] == sq) {
            t_pceNum = index;
            break;
        }
    }

    gameBoard.pceNum[pce]--;
    gameBoard.pList[PCEINDEX(pce, t_pceNum)] = gameBoard.pList[PCEINDEX(pce, gameBoard.pceNum[pce])];

}

function addPiece(sq, pce) {

    var col = PieceCol[pce];

    hashPce(pce, sq);

    gameBoard.pieces[sq] = pce;
    gameBoard.material[col] += pieceVal[pce];
    gameBoard.pList[PCEINDEX(pce, gameBoard.pceNum[pce])] = sq;
    gameBoard.pceNum[pce]++;

}

function movePiece(from, to) {

    var index = 0;
    var pce = gameBoard.pieces[from];

    hashPce(pce, from);
    gameBoard.pieces[from] = PIECES.EMPTY;

    hashPce(pce, to);
    gameBoard.pieces[to] = pce;

    for (index = 0; index < gameBoard.pceNum[pce]; ++index) {
        if (gameBoard.pList[PCEINDEX(pce, index)] == from) {
            gameBoard.pList[PCEINDEX(pce, index)] = to;
            break;
        }
    }

}

function makeMove(move) {

    var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = gameBoard.side;

    gameBoard.history[gameBoard.hisPly].posKey = gameBoard.posKey;

    if ((move & MFLAGEP) != 0) {
        if (side == COLOURS.WHITE) {
            clearPiece(to - 10);
        } else {
            clearPiece(to + 10);
        }
    } else if ((move & MFLAGCA) != 0) {
        switch (to) {
            case SQUARES.C1:
                movePiece(SQUARES.A1, SQUARES.D1);
                break;
            case SQUARES.C8:
                movePiece(SQUARES.A8, SQUARES.D8);
                break;
            case SQUARES.G1:
                movePiece(SQUARES.H1, SQUARES.F1);
                break;
            case SQUARES.G8:
                movePiece(SQUARES.H8, SQUARES.F8);
                break;
            default: break;
        }
    }

    if (gameBoard.enPas != SQUARES.NO_SQ) hashEp();
    hashCa();

    gameBoard.history[gameBoard.hisPly].move = move;
    gameBoard.history[gameBoard.hisPly].fiftyMove = gameBoard.fiftyMove;
    gameBoard.history[gameBoard.hisPly].enPas = gameBoard.enPas;
    gameBoard.history[gameBoard.hisPly].castlePerm = gameBoard.castlePerm;

    gameBoard.castlePerm &= castlePerm[from];
    gameBoard.castlePerm &= castlePerm[to];
    gameBoard.enPas = SQUARES.NO_SQ;

    hashCa();

    var captured = CAPTURED(move);
    gameBoard.fiftyMove++;

    if (captured != PIECES.EMPTY) {
        clearPiece(to);
        gameBoard.fiftyMove = 0;
    }

    gameBoard.hisPly++;
    gameBoard.ply++;

    if (piecePawn[gameBoard.pieces[from]] == true) {
        gameBoard.fiftyMove = 0;
        if ((move & MFLAGPS) != 0) {
            if (side == COLOURS.WHITE) {
                gameBoard.enPas = from + 10;
            } else {
                gameBoard.enPas = from - 10;
            }
            hashEp();
        }
    }

    movePiece(from, to);

    var prPce = PROMOTED(move);
    if (prPce != PIECES.EMPTY) {
        clearPiece(to);
        addPiece(to, prPce);
    }

    gameBoard.side ^= 1;
    hashSide();

    if (gameBoard.sqAttacked(gameBoard.pList[PCEINDEX(Kings[side], 0)], gameBoard.side)) {
        takeMove();
        return false;
    }

    return true;
}

function takeMove() {

    gameBoard.hisPly--;
    gameBoard.ply--;

    var move = gameBoard.history[gameBoard.hisPly].move;
    var from = FROMSQ(move);
    var to = TOSQ(move);

    if (gameBoard.enPas != SQUARES.NO_SQ) hashEp();
    hashCa();

    gameBoard.castlePerm = gameBoard.history[gameBoard.hisPly].castlePerm;
    gameBoard.fiftyMove = gameBoard.history[gameBoard.hisPly].fiftyMove;
    gameBoard.enPas = gameBoard.history[gameBoard.hisPly].enPas;

    if (gameBoard.enPas != SQUARES.NO_SQ) hashEp();
    hashCa();

    gameBoard.side ^= 1;
    hashSide();

    if ((MFLAGEP & move) != 0) {
        if (gameBoard.side == COLOURS.WHITE) {
            addPiece(to - 10, PIECES.bP);
        } else {
            addPiece(to + 10, PIECES.wP);
        }
    } else if ((MFLAGCA & move) != 0) {
        switch (to) {
            case SQUARES.C1: movePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: movePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: movePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: movePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }

    movePiece(to, from);

    var captured = CAPTURED(move);
    if (captured != PIECES.EMPTY) {
        addPiece(to, captured);
    }

    if (PROMOTED(move) != PIECES.EMPTY) {
        clearPiece(from);
        addPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }

}


