window.onload = function() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var drag = false;
    var level = {
        x: 550,
        y: 113,
        columns: 8,
        rows: 8,
        tilewidth: 100,
        tileheight: 100,
        tiles: [],
        selectedtile: { selected: false, column: 0, row: 0 }
    };
    var tilecolors = [[255, 128, 128],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255],
                      [255, 255, 255]];
    var clusters = [];
    var moves = [];
    var currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };
    var gamestates = { init: 0, ready: 1, resolve: 2 };
    var gamestate = gamestates.init;
    var score = 0;
    var animationstate = 0;
    var animationtime = 0;
    var animationtimetotal = 0.3;
    var showmoves = false;
    var aibot = false;
    var gameover = false;
    var buttons = [ { x: 80, y: 240, width: 350, height: 50, text: "New Game"}];

    function init() {
        for (var i=0; i<level.columns; i++) {
            level.tiles[i] = [];
            for (var j=0; j<level.rows; j++) {
                level.tiles[i][j] = { type: 0, shift:0 }
            }
        }
        main(0);
    }
    function main(tframe) {
        window.requestAnimationFrame(main);
        render();
    }

    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }

    function render() {
      drawFrame();
        context.fillStyle = "#000000";
        context.font = "24px Verdana";
        drawCenterText("Score:", 180, level.y+40, 150);
        drawCenterText(score, 180, level.y+70, 150);
        drawButtons();
        var levelwidth = level.columns * level.tilewidth;
        var levelheight = level.rows * level.tileheight;
        context.fillStyle = "#000000";
        context.fillRect(level.x - 4, level.y - 4, levelwidth + 8, levelheight + 8);
        renderTiles();
        if (showmoves && clusters.length <= 0 && gamestate == gamestates.ready) {
            renderMoves();
        }
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(level.x, level.y, levelwidth, levelheight);
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Game Over!", level.x, level.y + levelheight / 2 + 10, levelwidth);
        }
    }
    function drawFrame() {
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#2F4F4F";
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);
    }
    function drawButtons() {
        for (var i=0; i<buttons.length; i++) {
            context.fillStyle = "#000000";
            context.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
            context.fillStyle = "#ffffff";
            context.font = "18px impact";
            var textdim = context.measureText(buttons[i].text);
            context.fillText(buttons[i].text, buttons[i].x + (buttons[i].width-textdim.width)/2, buttons[i].y+30);
        }
    }
    function renderTiles() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                var shift = level.tiles[i][j].shift;
                if (level.tiles[i][j].type >= 0) {
                    var col = tilecolors[level.tiles[i][j].type];
                }
                if (level.selectedtile.selected) {
                    if (level.selectedtile.column == i && level.selectedtile.row == j) {
                        drawTile(coord.tilex, coord.tiley, 255, 0, 0);
                    }
                }
            }
        }
        if (gamestate == gamestates.resolve && (animationstate == 2 || animationstate == 3)) {
            var shiftx = currentmove.column2 - currentmove.column1;
            var shifty = currentmove.row2 - currentmove.row1;
            var coord1 = getTileCoordinate(currentmove.column1, currentmove.row1, 0, 0);
            var coord1shift = getTileCoordinate(currentmove.column1, currentmove.row1, (animationtime / animationtimetotal) * shiftx, (animationtime / animationtimetotal) * shifty);
            var col1 = tilecolors[level.tiles[currentmove.column1][currentmove.row1].type];
            var coord2 = getTileCoordinate(currentmove.column2, currentmove.row2, 0, 0);
            var coord2shift = getTileCoordinate(currentmove.column2, currentmove.row2, (animationtime / animationtimetotal) * -shiftx, (animationtime / animationtimetotal) * -shifty);
            var col2 = tilecolors[level.tiles[currentmove.column2][currentmove.row2].type];
            drawTile(coord1.tilex, coord1.tiley, 0, 0, 0);
            drawTile(coord2.tilex, coord2.tiley, 0, 0, 0);
            if (animationstate == 2) {
                drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
                drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
            } else {
                drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
                drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
            }
        }
    }
    init();
};
