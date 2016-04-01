"use strict";

/* global window */
(function ($) {
    "use strict";

    var view = createView();
    var model = createModel();
    var controller = createController();

    $(function () {
        controller.init(view, model);
    });

    function createView() {

        var isFrozen = false;
        function onSquareClick(callback) {
            $("#board .row div").on("click", function (event) {
                var $clickedSquare = $(event.target);
                if (isFrozen || $clickedSquare.hasClass("x") || $clickedSquare.hasClass("o")) {
                    return;
                }
                $clickedSquare.removeClass("x-hover").removeClass("o-hover");
                var row = parseInt($clickedSquare.attr("row"));
                var column = parseInt($clickedSquare.attr("column"));
                callback(row, column);
            });
        }

        function changePlayerMessage(isPlayerOne, message) {
            if (isPlayerOne) {
                $("#player-num").text("1");
            } else {
                $("#player-num").text("2");
            }

            $("#message").text(message);
        }

        function setTieMessage() {
            $("#player-num").text("1 & Player 2");
            $("#message").text("It's a tie!");
        }

        function addMark(isPlayerOne, row, column) {
            var $square = $("#board div").filter("[row=" + row + "]").filter("[column=" + column + "]");
            var className = isPlayerOne ? "x" : "o";
            $square.addClass(className);
        }

        function freezeBoard() {
            isFrozen = true;
        }

        function onResetButtonClick(callback) {
            $("#reset-button").click(callback);
        }

        function onLuckyButtonClick(callback) {
            $("#lucky-button").click(callback);
        }

        function resetBoard() {
            isFrozen = false;
            $("#board div").filter("[row]").filter("[column]").each(function (index, square) {
                $(square).removeClass("x").removeClass("o").removeClass("winning-square");
            });
            $("#board .row div").removeClass("game-over");
            $("#lucky-button").removeAttr("disabled");
        }

        function drawBoard(board) {
            board.forEach(function (rowValue, rowIndex) {
                rowValue.forEach(function (columnValue, columnIndex) {
                    if (columnValue !== null) {
                        addMark(columnValue, rowIndex, columnIndex);
                    }
                });
            });
        }

        function addWinEffects(winningSquares) {
            winningSquares.forEach(function (square) {
                var $square = $("#board div").filter("[row=" + square.row + "]").filter("[column=" + square.column + "]");
                $square.addClass("winning-square");
            });
        }

        function addEndState() {
            $("#board .row div").addClass("game-over");
            $("#lucky-button").attr("disabled", "disabled");
        }

        function updateTallies(currentTallies) {
            $("#player-one-wins").text(currentTallies.playerOne);
            $("#player-two-wins").text(currentTallies.playerTwo);
            $("#tied-games").text(currentTallies.ties);
        }

        function onSquareHover(callback) {
            $("#board .row div").hover(function (event) {
                var isPlayerOne = callback();

                var $hoveredSquare = $(event.target);
                if ($hoveredSquare.hasClass("x") || $hoveredSquare.hasClass("o") || $hoveredSquare.hasClass("game-over")) {
                    return;
                }
                if (isPlayerOne) {
                    $hoveredSquare.addClass("x-hover");
                } else {
                    $hoveredSquare.addClass("o-hover");
                }
            }, function (event) {
                var $hoveredSquare = $(event.target);
                $hoveredSquare.removeClass("x-hover").removeClass("o-hover");
            });
        }
        return { onSquareClick: onSquareClick,
            changePlayerMessage: changePlayerMessage,
            addMark: addMark,
            freezeBoard: freezeBoard,
            setTieMessage: setTieMessage,
            onResetButtonClick: onResetButtonClick,
            resetBoard: resetBoard,
            drawBoard: drawBoard,
            addWinEffects: addWinEffects,
            updateTallies: updateTallies,
            onLuckyButtonClick: onLuckyButtonClick,
            addEndState: addEndState,
            onSquareHover: onSquareHover
        };
    }

    function createModel() {

        var sideLength = 3;

        var gameState = {
            isPlayerOne: true,
            board: undefined,
            playerOneWins: 0,
            playerTwoWins: 0,
            ties: 0
        };

        function initBoard() {
            flipCoin();
            gameState.board = [];
            for (var i = 0; i < sideLength; i++) {
                var row = [];
                for (var j = 0; j < sideLength; j++) {
                    row.push(null);
                }
                gameState.board.push(row);
            }
        }

        function flipCoin() {
            var player = [true, false];
            var index = Math.floor(Math.random() * 2);
            gameState.isPlayerOne = player[index];
        }

        function getBoard() {
            return gameState.board;
        }

        function loadGame() {
            if (window.localStorage.gameState) {
                gameState = JSON.parse(window.localStorage.gameState);
                return true;
            } else {
                initBoard();
                saveGame();
                return false;
            }
        }

        function saveGame() {
            window.localStorage.gameState = JSON.stringify(gameState);
        }

        function resetGame() {
            initBoard();
            saveGame();
        }

        function getPlayer() {
            return gameState.isPlayerOne;
        }

        function changePlayer() {
            gameState.isPlayerOne = !gameState.isPlayerOne;
            saveGame();
        }

        function updateBoard(isPlayerOne, row, column) {
            gameState.board[row][column] = isPlayerOne;
            gameState.lastRow = row;
            gameState.lastColumn = column;
            saveGame();
        }

        function checkWin(isPlayerOne, row, column, shouldUpdateTallies) {
            var winner = isPlayerOne ? "playerOneWins" : "playerTwoWins";

            function save() {
                if (shouldUpdateTallies) {
                    gameState[winner]++;
                    saveGame();
                }
            }

            var winningSquares = [];
            for (var i = 0; i < sideLength; i++) {
                if (gameState.board[row][i] !== isPlayerOne) {
                    winningSquares = null;
                    break;
                } else {
                    var square = { row: row, column: i };
                    winningSquares.push(square);
                }
            }

            if (winningSquares) {
                save();
                return winningSquares;
            } else {
                winningSquares = [];
            }

            for (var j = 0; j < sideLength; j++) {
                if (gameState.board[j][column] !== isPlayerOne) {
                    winningSquares = null;
                    break;
                } else {
                    var _square = { row: j, column: column };
                    winningSquares.push(_square);
                }
            }

            if (row === column) {
                if (winningSquares) {
                    save();
                    return winningSquares;
                } else {
                    winningSquares = [];
                }
                for (var k = 0; k < sideLength; k++) {
                    if (gameState.board[k][k] !== isPlayerOne) {
                        winningSquares = null;
                        break;
                    } else {
                        var _square2 = { row: k, column: k };
                        winningSquares.push(_square2);
                    }
                }
            }

            if (sideLength - 1 === row + column) {
                if (winningSquares) {
                    save();
                    return winningSquares;
                } else {
                    winningSquares = [];
                }
                for (var _i = 0; _i < sideLength; _i++) {
                    if (gameState.board[sideLength - 1 - _i][_i] !== isPlayerOne) {
                        winningSquares = null;
                        break;
                    } else {
                        var _square3 = { row: sideLength - 1 - _i, column: _i };
                        winningSquares.push(_square3);
                    }
                }
            }
            if (winningSquares) {
                save();
            }
            return winningSquares;
        }

        function checkForNull(array) {
            return array.some(function (elem) {
                return elem === null;
            });
        }

        function checkTie(shouldUpdateTallies) {
            for (var i = 0; i < sideLength; i++) {
                if (checkForNull(gameState.board[i])) {
                    return false;
                }
            }

            if (shouldUpdateTallies) {
                gameState.ties++;
                saveGame();
            }
            return true;
        }

        function getLastRow() {
            return gameState.lastRow;
        }

        function getLastColumn() {
            return gameState.lastColumn;
        }

        function getTallies() {
            return { playerOne: gameState.playerOneWins, playerTwo: gameState.playerTwoWins, ties: gameState.ties };
        }

        function getAvailableSquares() {
            var availableSquares = [];
            for (var rowIndex = 0; rowIndex < sideLength; rowIndex++) {
                for (var colIndex = 0; colIndex < sideLength; colIndex++) {
                    if (gameState.board[rowIndex][colIndex] === null) {
                        availableSquares.push({ row: rowIndex, column: colIndex });
                    }
                }
            }
            return availableSquares;
        }

        function findWinningSpaces(isPlayerOne) {
            var possibleWins = [];

            for (var rowIndex = 0; rowIndex < sideLength; rowIndex++) {
                var openSpaces = [];
                var opposingPlayerSpaces = false;

                for (var colIndex = 0; colIndex < sideLength; colIndex++) {
                    if (gameState.board[rowIndex][colIndex] === null) {
                        openSpaces.push({ row: rowIndex, column: colIndex });
                    } else if (gameState.board[rowIndex][colIndex] === !isPlayerOne) {
                        //jshint ignore:line
                        opposingPlayerSpaces = true;
                        break;
                    }
                }

                if (!opposingPlayerSpaces) {
                    if (openSpaces.length === 1) {
                        return [openSpaces];
                    } else {
                        possibleWins.push(openSpaces);
                    }
                }
            }

            for (var _colIndex = 0; _colIndex < sideLength; _colIndex++) {
                var _openSpaces = [];
                var _opposingPlayerSpaces = false;

                for (var _rowIndex = 0; _rowIndex < sideLength; _rowIndex++) {
                    if (gameState.board[_rowIndex][_colIndex] === null) {
                        _openSpaces.push({ row: _rowIndex, column: _colIndex });
                    } else if (gameState.board[_rowIndex][_colIndex] === !isPlayerOne) {
                        //jshint ignore:line
                        _opposingPlayerSpaces = true;
                        break;
                    }
                }

                if (!_opposingPlayerSpaces) {
                    if (_openSpaces.length === 1) {
                        return [_openSpaces];
                    } else {
                        possibleWins.push(_openSpaces);
                    }
                }
            }

            var openSpacesDiagonal = [];
            var opposingPlayerSpacesDiagonal = false;

            for (var rowColIndex = 0; rowColIndex < sideLength; rowColIndex++) {

                if (gameState.board[rowColIndex][rowColIndex] === null) {
                    openSpacesDiagonal.push({ row: rowColIndex, column: rowColIndex });
                } else if (gameState.board[rowColIndex][rowColIndex] === !isPlayerOne) {
                    //jshint ignore:line
                    opposingPlayerSpacesDiagonal = true;
                    break;
                }
            }

            if (!opposingPlayerSpacesDiagonal) {
                if (openSpacesDiagonal.length === 1) {
                    return [openSpacesDiagonal];
                } else {
                    possibleWins.push(openSpacesDiagonal);
                }
            }

            var openSpacesReverseDiagonal = [];
            var opposingPlayerSpacesReverseDiagonal = false;

            for (var _rowIndex2 = 0; _rowIndex2 < sideLength; _rowIndex2++) {
                if (gameState.board[_rowIndex2][sideLength - 1 - _rowIndex2] === null) {
                    openSpacesReverseDiagonal.push({ row: _rowIndex2, column: sideLength - 1 - _rowIndex2 });
                } else if (gameState.board[_rowIndex2][sideLength - 1 - _rowIndex2] === !isPlayerOne) {
                    //jshint ignore:line
                    opposingPlayerSpacesReverseDiagonal = true;
                    break;
                }
            }

            if (!opposingPlayerSpacesReverseDiagonal) {
                if (openSpacesReverseDiagonal.length === 1) {
                    return [openSpacesReverseDiagonal];
                } else {
                    possibleWins.push(openSpacesReverseDiagonal);
                }
            }

            return possibleWins;
        }

        function groupArrays(arrays) {
            var sortedArrays = [];
            arrays.forEach(function (elem) {
                if (!sortedArrays[elem.length]) {
                    sortedArrays[elem.length] = [];
                }
                sortedArrays[elem.length].push(elem);
            });
            return sortedArrays;
        }

        function getBestSpace(isPlayerOne) {
            var sortedArrays = groupArrays(findWinningSpaces(isPlayerOne));
            if (!sortedArrays.length) {
                var available = getAvailableSquares();
                return available[Math.floor(Math.random() * available.length)];
            }
            for (var i = 0; i < sortedArrays.length; i++) {
                if (sortedArrays[i]) {
                    var sameLengthArrays = sortedArrays[i];
                    if (sameLengthArrays.length === 1 && sameLengthArrays[0].length === 1) {
                        return sameLengthArrays[0][0];
                    } else {
                        var indexOfList = Math.floor(Math.random() * sameLengthArrays.length);
                        var indexOfElem = Math.floor(Math.random() * sameLengthArrays[indexOfList].length);
                        return sameLengthArrays[indexOfList][indexOfElem];
                    }
                }
            }
        }

        return { changePlayer: changePlayer,
            getPlayer: getPlayer,
            checkWin: checkWin,
            updateBoard: updateBoard,
            checkTie: checkTie,
            resetGame: resetGame,
            loadGame: loadGame,
            getBoard: getBoard,
            getLastRow: getLastRow,
            getLastColumn: getLastColumn,
            getTallies: getTallies,
            getBestSpace: getBestSpace
        };
    }

    function createController() {
        function init(view, model) {

            var isInProgess = model.loadGame();
            view.drawBoard(model.getBoard());
            if (isInProgess) {
                restoreBoard();
            }

            view.onSquareHover(model.getPlayer);

            view.onSquareClick(takeTurn);

            view.onResetButtonClick(function () {
                model.resetGame();
                view.resetBoard();
                view.changePlayerMessage(model.getPlayer(), "Pick a square");
            });

            view.onLuckyButtonClick(function () {
                var currentSquare = model.getBestSpace(model.getPlayer());
                takeTurn(currentSquare.row, currentSquare.column);
            });
        }

        function takeTurn(row, column) {
            var currentPlayer = model.getPlayer();
            view.addMark(currentPlayer, row, column);
            model.updateBoard(currentPlayer, row, column);
            if (!updateViewIfGameOver(currentPlayer, row, column, true)) {
                endTurn();
            }
        }

        function restoreBoard() {

            var previousPlayer = model.getPlayer();
            var lastRow = model.getLastRow();
            var lastColumn = model.getLastColumn();
            var hasLastRowAndColumn = lastRow >= 0 && lastColumn >= 0;
            var isEnded = hasLastRowAndColumn && updateViewIfGameOver(previousPlayer, lastRow, lastColumn, false);

            if (!isEnded) {
                view.changePlayerMessage(model.getPlayer(), "Pick a square");
            }
        }

        function updateViewIfGameOver(player, row, column, shouldUpdateTallies) {
            var winningSquares = model.checkWin(player, row, column, shouldUpdateTallies);

            if (winningSquares) {
                view.changePlayerMessage(player, "You've won!");
                view.addEndState();
                view.addWinEffects(winningSquares);
                view.updateTallies(model.getTallies());
                view.freezeBoard();
                return true;
            } else if (model.checkTie(shouldUpdateTallies)) {
                view.setTieMessage();
                view.addEndState();
                view.updateTallies(model.getTallies());
                return true;
            }
            view.updateTallies(model.getTallies());
            return false;
        }

        function endTurn() {
            model.changePlayer();
            view.changePlayerMessage(model.getPlayer());
        }

        return { init: init };
    }
})(window.$);
