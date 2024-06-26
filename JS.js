window.onload = function() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var lastframe = 0;
    var drag = false;
    var lvl = {
        x: 550,
        y: 113,
        columns: 7,
        rows: 7,
        tilewidth: 100,
        tileheight: 100,
        tiles: [],
        selectedtile: {
            selected: false,
            column: 0,
            row: 0
        }
    };
    var tilecolors = [
        [0, 0, 0],
        [128, 255, 128],
        [105, 105, 105],
        [255, 255, 0],
        [255, 0, 255],
        [210, 105, 30],
        [25, 25, 112],
        [255, 228, 225]
    ];
    var clusters = [];
    var hod = [];
    var tekysh_hod = {
        column1: 0,
        row1: 0,
        column2: 0,
        row2: 0
    };
    var states = {
        init: 0,
        ready: 1,
        resolve: 2
    };
    var ga = false;
    var state = states.init;
    var score = 0;
    var animationstate = 0;
    var animationtime = 0;
    var animationtimetotal = 0.3;
    var showhod = false;
    var aibot = false;
    var gameover = false;
    var buttons = [{
        x: 80,
        y: 240,
        width: 350,
        height: 50,
        text: "Новая игра"
    }, {
        x: 80,
        y: 300,
        width: 350,
        height: 50,
        text: "Показывать ходы"
    }, {
        x: 80,
        y: 360,
        width: 350,
        height: 50,
        text: "Включить бота"
    }];

    //----------------------------------------------------------------------------------

    //----------------------------------------------------------------------------------
    function init() {
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);
        for (var i = 0; i < lvl.columns; i++) {
            lvl.tiles[i] = [];
            for (var j = 0; j < lvl.rows; j++) {
                lvl.tiles[i][j] = {
                    type: 0,
                    shift: 0
                }
            }
        }
        newGame();
        main(0);
    }

    function main(tframe) {
        window.requestAnimationFrame(main);
        update(tframe);
        render();
    }

    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        if (state == states.ready) {
            if (hod.length <= 0) {
                gameover = true;
                for (var i = 0; i < ms.length; i++) {
                clearInterval(ms[i]);
                }
            }
            if (aibot) {
                animationtime += dt;
                if (animationtime > animationtimetotal) {
                    findhod();
                    if (hod.length > 0) {
                        var move = hod[Math.floor(Math.random() * hod.length)];
                        mouseSwap(move.column1, move.row1, move.column2, move.row2);
                    } else {}
                    animationtime = 0;
                }
            }
        } else if (state == states.resolve) {
            animationtime += dt;
            if (animationstate == 0) {
                if (animationtime > animationtimetotal) {
                    findClusters();
                    if (clusters.length > 0) {
                        for (var i = 0; i < clusters.length; i++) {
                            score += 100 * (clusters[i].length - 2);;
                        }
                        removeClusters();
                        animationstate = 1;
                    } else {
                        state = states.ready;
                    }
                    animationtime = 0;
                }
            } else if (animationstate == 1) {
                if (animationtime > animationtimetotal) {
                    shiftTiles();
                    animationstate = 0;
                    animationtime = 0;
                    findClusters();
                    if (clusters.length <= 0) {
                        state = states.ready;
                    }
                }
            } else if (animationstate == 2) {
                if (animationtime > animationtimetotal) {
                    swap(tekysh_hod.column1, tekysh_hod.row1, tekysh_hod.column2, tekysh_hod.row2);
                    findClusters();
                    if (clusters.length > 0) {
                        animationstate = 0;
                        animationtime = 0;
                        state = states.resolve;
                    } else {
                        animationstate = 3;
                        animationtime = 0;
                    }
                    findhod();
                    findClusters();
                }
            } else if (animationstate == 3) {
                if (animationtime > animationtimetotal) {
                    swap(tekysh_hod.column1, tekysh_hod.row1, tekysh_hod.column2, tekysh_hod.row2);
                    state = states.ready;
                }
            }
            findhod();
            findClusters();
        }
    }

    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width - textdim.width) / 2, y);
    }
      //-------------------------------------------------------
var ms = [];

  var canvasss = document.getElementById("canvasTime");
  var ctx = canvasss.getContext('2d');
  ctx.font = "700 40px Matricha, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  function setCounter(min, sec) {


    ms.push( interval = setInterval(redraw, 1000));
    function redraw() {
        ctx.clearRect(0, 0, canvasss.width, canvasss.height);
        ctx.fillText(counter(), 100, 23);
    }

    function counter() {
      sec = (sec == 0) ? 59 : sec - 1;

      if (sec == 0) {
        if (min > 0) {
          min = min - 1;
        } else {
          clearInterval(interval);
          aibot =  false;
          buttons[2].text = (aibot ? "Выключить" : "Включить") + " бота";
          gameover = true;
        }

      }
      return addZero(min) + ':' + addZero(sec);
    }

    function addZero(n) {
      return n > 9 ? n : "0" + n;
    }
  }



    //-------------------------------------------------------
    function render() {
        drawFrame();
        context.fillStyle = "#FFFFFF";
        context.font = "24px impact";
        drawCenterText("Рекорд:", 180, lvl.y + 40, 150);
        drawCenterText(score, 180, lvl.y + 70, 150);
        drawButtons();
        var lvlwidth = lvl.columns * lvl.tilewidth;
        var lvlheight = lvl.rows * lvl.tileheight;
        context.fillStyle = "#FFFFFF";
        context.fillRect(lvl.x - 4, lvl.y - 4, lvlwidth + 8, lvlheight + 8);
        renderElment();
        renderClusters();
        if (showhod && clusters.length <= 0 && state == states.ready) {
            renderhod();
        }
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(lvl.x, lvl.y, lvlwidth, lvlheight);
            context.fillStyle = "#ffffff";
            context.font = "24px impact";
            drawCenterText("Конец Игры!", lvl.x, lvl.y + lvlheight / 2 - 300, lvlwidth);
            var img = document.getElementById("photo");
            context.drawImage(img, lvl.x + 100, lvl.y + lvlheight / 2 - 250, 500, 500);
        }
    }

    function drawFrame() {
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#2F4F4F";
        context.fillRect(1, 1, canvas.width - 2, canvas.height - 2);
    }

    function drawButtons() {
        for (var i = 0; i < buttons.length; i++) {
            context.fillStyle = "#000000";
            context.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
            context.fillStyle = "#ffffff";
            context.font = "18px impact";
            var textdim = context.measureText(buttons[i].text);
            context.fillText(buttons[i].text, buttons[i].x + (buttons[i].width - textdim.width) / 2, buttons[i].y + 30);
        }
    }

    function canSwap(x1, y1, x2, y2) {
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) || (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }
        return false;
    }

    function getTileCoordinate(column, row, columnoffset, rowoffset) {
        var tilex = lvl.x + (column + columnoffset) * lvl.tilewidth;
        var tiley = lvl.y + (row + rowoffset) * lvl.tileheight;
        return {
            tilex: tilex,
            tiley: tiley
        };
    }

    function drawTile(x, y, r, g, b) {
        context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        context.fillRect(x + 2, y + 2, lvl.tilewidth - 4, lvl.tileheight - 4);
    }

    function renderClusters() {
        for (var i = 0; i < clusters.length; i++) {
            var coord = getTileCoordinate(clusters[i].column, clusters[i].row, 0, 0);
            if (clusters[i].horizontal) {
                context.fillStyle = "#00ff00";
                context.fillRect(coord.tilex + lvl.tilewidth / 2, coord.tiley + lvl.tileheight / 2 - 4, (clusters[i].length - 1) * lvl.tilewidth, 8);
            } else {
                context.fillStyle = "#0000ff";
                context.fillRect(coord.tilex + lvl.tilewidth / 2 - 4, coord.tiley + lvl.tileheight / 2, 8, (clusters[i].length - 1) * lvl.tileheight);
            }
        }
    }

    function renderhod() {
        for (var i = 0; i < hod.length; i++) {
            var coord1 = getTileCoordinate(hod[i].column1, hod[i].row1, 0, 0);
            var coord2 = getTileCoordinate(hod[i].column2, hod[i].row2, 0, 0);
            context.strokeStyle = "#ff0000";
            context.beginPath();
            context.moveTo(coord1.tilex + lvl.tilewidth / 2, coord1.tiley + lvl.tileheight / 2);
            context.lineTo(coord2.tilex + lvl.tilewidth / 2, coord2.tiley + lvl.tileheight / 2);
            context.stroke();
        }
    }

    function newGame() {
        for (var i = 0; i < ms.length; i++) {
        clearInterval(ms[i]);
        }
        aibot =  false;
        buttons[2].text = (aibot ? "Выключить" : "Включить") + " бота";
        score = 0;
        state = states.ready;
        gameover = false;
        createlvl();
        findhod();
        findClusters();
        setCounter(1, 30);
        ga =false;
    }

    function getRandomTile() {
        return Math.floor(Math.random() * tilecolors.length);
    }

    function RClusters() {
        findClusters();
        while (clusters.length > 0) {
            removeClusters();
            shiftTiles();
            findClusters();
        }
    }

    function renderElment() {
        for (var i = 0; i < lvl.columns; i++) {
            for (var j = 0; j < lvl.rows; j++) {
                var shift = lvl.tiles[i][j].shift;
                var coord = getTileCoordinate(i, j, 0, (animationtime / animationtimetotal) * shift);
                if (lvl.tiles[i][j].type >= 0) {
                    var col = tilecolors[lvl.tiles[i][j].type];
                    drawTile(coord.tilex, coord.tiley, col[0], col[1], col[2]);
                }
                if (lvl.selectedtile.selected) {
                    if (lvl.selectedtile.column == i && lvl.selectedtile.row == j) {
                        drawTile(coord.tilex, coord.tiley, 255, 0, 0);
                    }
                }
            }
        }
        if (state == states.resolve && (animationstate == 2 || animationstate == 3)) {
            var shiftx = tekysh_hod.column2 - tekysh_hod.column1;
            var shifty = tekysh_hod.row2 - tekysh_hod.row1;
            var coord1 = getTileCoordinate(tekysh_hod.column1, tekysh_hod.row1, 0, 0);
            var coord1shift = getTileCoordinate(tekysh_hod.column1, tekysh_hod.row1, (animationtime / animationtimetotal) * shiftx, (animationtime / animationtimetotal) * shifty);
            var col1 = tilecolors[lvl.tiles[tekysh_hod.column1][tekysh_hod.row1].type];
            var coord2 = getTileCoordinate(tekysh_hod.column2, tekysh_hod.row2, 0, 0);
            var coord2shift = getTileCoordinate(tekysh_hod.column2, tekysh_hod.row2, (animationtime / animationtimetotal) * -shiftx, (animationtime / animationtimetotal) * -shifty);
            var col2 = tilecolors[lvl.tiles[tekysh_hod.column2][tekysh_hod.row2].type];
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

    function findClusters() {
        clusters = [];
        for (var j = 0; j < lvl.rows; j++) {
            var matchlength = 1;
            for (var i = 0; i < lvl.columns; i++) {
                var checkcluster = false;
                if (i == lvl.columns - 1) {
                    checkcluster = true;
                } else {
                    if (lvl.tiles[i][j].type == lvl.tiles[i + 1][j].type && lvl.tiles[i][j].type != -1) {
                        matchlength += 1;
                    } else {
                        checkcluster = true;
                    }
                }
                if (checkcluster) {
                    if (matchlength >= 3) {
                        clusters.push({
                            column: i + 1 - matchlength,
                            row: j,
                            length: matchlength,
                            horizontal: true
                        });
                    }
                    matchlength = 1;
                }
            }
        }
        for (var i = 0; i < lvl.columns; i++) {
            var matchlength = 1;
            for (var j = 0; j < lvl.rows; j++) {
                var checkcluster = false;
                if (j == lvl.rows - 1) {
                    checkcluster = true;
                } else {
                    if (lvl.tiles[i][j].type == lvl.tiles[i][j + 1].type && lvl.tiles[i][j].type != -1) {
                        matchlength += 1;
                    } else {
                        checkcluster = true;
                    }
                }
                if (checkcluster) {
                    if (matchlength >= 3) {
                        clusters.push({
                            column: i,
                            row: j + 1 - matchlength,
                            length: matchlength,
                            horizontal: false
                        });
                    }
                    matchlength = 1;
                }
            }
        }
    }

    function findhod() {
        hod = [];
        for (var j = 0; j < lvl.rows; j++) {
            for (var i = 0; i < lvl.columns - 1; i++) {
                swap(i, j, i + 1, j);
                findClusters();
                swap(i, j, i + 1, j);
                if (clusters.length > 0) {
                    hod.push({
                        column1: i,
                        row1: j,
                        column2: i + 1,
                        row2: j
                    });
                }
            }
        }
        for (var i = 0; i < lvl.columns; i++) {
            for (var j = 0; j < lvl.rows - 1; j++) {
                swap(i, j, i, j + 1);
                findClusters();
                swap(i, j, i, j + 1);
                if (clusters.length > 0) {
                    hod.push({
                        column1: i,
                        row1: j,
                        column2: i,
                        row2: j + 1
                    });
                }
            }
        }
        clusters = []
    }

    function loopClusters(func) {
        for (var i = 0; i < clusters.length; i++) {
            var cluster = clusters[i];
            var coffset = 0;
            var roffset = 0;
            for (var j = 0; j < cluster.length; j++) {
                func(i, cluster.column + coffset, cluster.row + roffset, cluster);
                if (cluster.horizontal) {
                    coffset++;
                } else {
                    roffset++;
                }
            }
        }
    }

    function removeClusters() {
        loopClusters(function(index, column, row, cluster) {
            lvl.tiles[column][row].type = -1;
        });
        for (var i = 0; i < lvl.columns; i++) {
            var shift = 0;
            for (var j = lvl.rows - 1; j >= 0; j--) {
                if (lvl.tiles[i][j].type == -1) {
                    shift++;
                    lvl.tiles[i][j].shift = 0;
                } else {
                    lvl.tiles[i][j].shift = shift;
                }
            }
        }
    }

    function shiftTiles() {
        for (var i = 0; i < lvl.columns; i++) {
            for (var j = lvl.rows - 1; j >= 0; j--) {
                if (lvl.tiles[i][j].type == -1) {
                    lvl.tiles[i][j].type = getRandomTile();
                } else {
                    var shift = lvl.tiles[i][j].shift;
                    if (shift > 0) {
                        swap(i, j, i, j + shift)
                    }
                }
                lvl.tiles[i][j].shift = 0;
            }
        }
    }

    function getMouseTile(pos) {
        var tx = Math.floor((pos.x - lvl.x) / lvl.tilewidth);
        var ty = Math.floor((pos.y - lvl.y) / lvl.tileheight);
        if (tx >= 0 && tx < lvl.columns && ty >= 0 && ty < lvl.rows) {
            return {
                valid: true,
                x: tx,
                y: ty
            };
        }
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }

    function createlvl() {
        var done = false;
        while (!done) {
            for (var i = 0; i < lvl.columns; i++) {
                for (var j = 0; j < lvl.rows; j++) {
                    lvl.tiles[i][j].type = getRandomTile();
                }
            }
            RClusters();
            findhod();
            if (hod.length > 0) {
                done = true;
            }
        }
    }

    function swap(x1, y1, x2, y2) {
        var typeswap = lvl.tiles[x1][y1].type;
        lvl.tiles[x1][y1].type = lvl.tiles[x2][y2].type;
        lvl.tiles[x2][y2].type = typeswap;
    }

    function mouseSwap(c1, r1, c2, r2) {
        tekysh_hod = {
            column1: c1,
            row1: r1,
            column2: c2,
            row2: r2
        };
        lvl.selectedtile.selected = false;
        animationstate = 2;
        animationtime = 0;
        state = states.resolve;
    }

    function onMouseMove(e) {
        var pos = getMousePos(canvas, e);
        if (drag && lvl.selectedtile.selected) {
            mt = getMouseTile(pos);
            if (mt.valid) {
                if (canSwap(mt.x, mt.y, lvl.selectedtile.column, lvl.selectedtile.row)) {
                    mouseSwap(mt.x, mt.y, lvl.selectedtile.column, lvl.selectedtile.row);
                }
            }
        }
    }

    function onMouseDown(e) {
        var pos = getMousePos(canvas, e);
        if (!drag) {
            mt = getMouseTile(pos);
            if (mt.valid) {
                var swapped = false;
                if (lvl.selectedtile.selected) {
                    if (mt.x == lvl.selectedtile.column && mt.y == lvl.selectedtile.row) {
                        lvl.selectedtile.selected = false;
                        drag = true;
                        return;
                    } else if (canSwap(mt.x, mt.y, lvl.selectedtile.column, lvl.selectedtile.row)) {
                        mouseSwap(mt.x, mt.y, lvl.selectedtile.column, lvl.selectedtile.row);
                        swapped = true;
                    }
                }
                if (!swapped) {
                    lvl.selectedtile.column = mt.x;
                    lvl.selectedtile.row = mt.y;
                    lvl.selectedtile.selected = true;
                }
            } else {
                lvl.selectedtile.selected = false;
                drag = true;
            }
            for (var i = 0; i < buttons.length; i++) {
                if (pos.x >= buttons[i].x && pos.x < buttons[i].x + buttons[i].width && pos.y >= buttons[i].y && pos.y < buttons[i].y + buttons[i].height) {
                    if (i == 0) {
                        newGame();
                    } else if (i == 1) {
                        showhod = !showhod;
                        buttons[i].text = (showhod ? "скрыть" : "Показать") + " ходы";
                    } else if (i == 2) {
                        aibot = !aibot;
                        buttons[i].text = (aibot ? "Выключить" : "Включить") + " бота";
                    }
                }
            }
        }
    }

    function onMouseUp(e) {
        drag = false;
    }

    function onMouseOut(e) {
        drag = false;
    }

    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    }
    init();
};
