function FR2SQ(f, r) {
	return ((21 + (f)) + ((r) * 10));
}

function RAND_32() {

	return (Math.floor((Math.random() * 255) + 1) << 23) | (Math.floor((Math.random() * 255) + 1) << 16)
		| (Math.floor((Math.random() * 255) + 1) << 8) | Math.floor((Math.random() * 255) + 1);

}


function SQ64(sq120) {
	return sq120ToSq64[(sq120)];
}

function SQ120(sq64) {
	return sq64ToSq120[(sq64)];
}

function PCEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}

function MIRROR64(sq) {
	return mirror64[sq];
}


function FROMSQ(m) { return (m & 0x7F); }
function TOSQ(m) { return ((m >> 7) & 0x7F); }
function CAPTURED(m) { return ((m >> 14) & 0xF); }
function PROMOTED(m) { return ((m >> 20) & 0xF); }

function SQOFFBOARD(sq) {
	if (filesBrd[sq] == SQUARES.OFFBOARD) return true;
	return false;
}


function PCEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}