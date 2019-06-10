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
	clone.cols = JSON.parse(JSON.stringify(this.cols));
	clone.rows = JSON.parse(JSON.stringify(this.rows));
	for (var p in this.cells) { clone.cells[p] = this.cells[p].clone(); }

	return clone;
}

Game.Pit.prototype.build = function() {
	this.node = document.createElement("div");
	this.node.classList.add("pit");
	this.node.style.width = (Game.WIDTH * Game.CELL) + "px";
	this.node.style.height = (Game.DEPTH * Game.CELL) + "px";
	return this;
}

Game.Pit.prototype.toJSON = function() {
	var data = {
		cols: this.cols,
		rows: this.rows,
		cells: {}
	};
	for (var p in this.cells) {
		data.cells[p] = this.cells[p].type;
	}
	return data;
}

Game.Pit.prototype.fromJSON = function(data) {
	this.cols = data.cols;
	this.rows = data.rows;
	for (var p in data.cells) {
		if (p in this.cells) { continue; }
		var cell = new Game.Cell(XY.fromString(p), data.cells[p]);
		this.cells[p] = cell;
		if (this.node) { cell.build(this.node); }
	}
	for (var p in this.cells) {
		if (p in data.cells) { continue; }
		if (this.node) { this.node.removeChild(this.cells[p].node); }
		delete this.cells[p];
	}
}

Game.Pit.prototype.drop = function(piece) {
	var gravity = new XY(0, -1);
	while (piece.fits(this)) {
		piece.xy = piece.xy.plus(gravity);
	}
	piece.xy = piece.xy.minus(gravity);

	for (var p in piece.cells) {
		var cell = piece.cells[p];
		var xy = piece.xy.plus(cell.xy);

		if (this.node && cell.node) {
			this.node.appendChild(cell.node);
		}

		cell.xy = xy;
		this.cells[xy] = cell;

		if (xy.y < Game.DEPTH) { 
			this.rows[xy.y]++; 
			this.cols[xy.x] = Math.max(this.cols[xy.x], xy.y+1);
		}
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
			var xy = cell.xy;

			if (xy.y == j) { /* removed row */
				if (this.node && cell.node) { this.node.removeChild(cell.node); }
				continue;
			} 
			if (xy.y > j) { xy = new XY(xy.x, xy.y-1); } /* lower xy */

			cell.xy = xy;
			cells[xy] = cell;
			this.cols[xy.x] = Math.max(this.cols[xy.x], xy.y+1);
		}
		this.cells = cells;

		result++;
		j--;
	}

	return result;
}
