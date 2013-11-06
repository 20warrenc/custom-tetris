Game.Pit = function() {
	this.cells = {};
	this.cols = []; /* maximum values per-column */
	this.rows = []; /* non-empty cells per-row */
	this.node = null;

	for (var i=0;i<Game.WIDTH;i++) { this.cols.push(0); }
	for (var i=0;i<Game.DEPTH;i++) { this.rows.push(0); }
}

Game.Pit.prototype.clone = function() {
	var clone = new this.constructor();
	clone.cells = JSON.parse(JSON.stringify(this.cells));
	clone.cols = JSON.parse(JSON.stringify(this.cols));
	clone.rows = JSON.parse(JSON.stringify(this.rows));
	return clone;
}

Game.Pit.prototype.build = function() {
	this.node = document.createElement("div");
	this.node.className = "pit";
	this.node.style.width = (Game.WIDTH * Game.CELL) + "px";
	this.node.style.height = (Game.DEPTH * Game.CELL) + "px";
	return this;
}

Game.Pit.prototype.getScore = function() {
	/* FIXME */
}

Game.Pit.prototype.drop = function(piece) {
	var gravity = new XY(0, -1);
	while (piece.fits(this)) {
		piece.setXY(piece.getXY().plus(gravity));
	}
	piece.setXY(piece.getXY().minus(gravity));

	for (var p in piece.cells) {
		var cell = piece.cells[p];
		var xy = piece.getXY().plus(cell.getXY());

		if (this.node && cell.node) {
			this.node.appendChild(cell.node);
		}

		cell.setXY(xy);
		this.cells[xy] = cell;

		this.rows[xy.y]++;
		this.cols[xy.x] = Math.max(this.cols[xy.x], xy.y+1);
	}

	if (this.node && piece.node) { this.node.removeChild(piece.node); }

	return this._cleanup();
}

/**
 * @returns {number} of cleaned rows
 */
Game.Pit.prototype._cleanup = function() {
	var result = 0;

	for (var j=0;j<Game.DEPTH;j++) {
		if (this.rows[j] < Game.WIDTH) { continue; }

		/* remove this row, adjust all other values, update cols/rows accordingly */

		this.rows.splice(j, 1);
		this.rows.push(0);
		this.cols = this.cols.map(function(col) { return 0; });

		var cells = {};
		for (var p in this.cells) {
			var cell = this.cells[p];
			var xy = cell.getXY();

			if (xy.y == j) { /* removed row */
				if (this.node && cell.node) { this.node.removeChild(cell.node); }
				continue;
			} 
			if (xy.y > j) { xy = new XY(xy.x, xy.y-1); } /* lower xy */

			cell.setXY(xy);
			cells[xy] = cell;
			this.cols[xy.x] = Math.max(this.cols[xy.x], xy.y+1);
		}
		this.cells = cells;

		result++;
		j--;
	}

	return result;
}