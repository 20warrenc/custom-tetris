package custom-tetris/js

import org.junit.Before;
import org.junit.Test;

import java.util.Comparator;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

describe("Score Test", function() {
  new Game.App();
  new Game.Engine();
  it("should be able to compute correct score", function() {
    var rowsRemoved = Math.random() * (100 - 1) + 1;
    var correctScore = rowsRemoved * 100;

    expect(Game.Engine._computeScore(rowsRemoved)).toEqual(correctScore);
  });

});

describe("Shift Test", function() {
  new Game.App();
  new Game.Engine();
  it("should be able to shift piece in both directions", function() {
    var direction = Math.random() * (1 - (-1)) - 1;
    var xy = new XY(direction, 0);
    this._piece.xy = this._piece.xy.plus(xy);
    if(!this._piece.fits(this.pit)) { this._piece.xy.minus(xy); }
    expect(Game.Engine.shift(direction)).toEqual(this);
  });
});
    
