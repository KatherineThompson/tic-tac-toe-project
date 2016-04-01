/* global window */
(function($) {
    "use strict";
    const view = createView();
    const model = createModel();
    const controller = createController();
    
    $(function() {
        controller.init(view, model);
    });
    
    function createView() {
        
        let isFrozen = false;
        function onSquareClick(callback) {
            $("#board .row div").on("click", function(event) {
                const $clickedSquare = $(event.target);
                if (isFrozen || $clickedSquare.hasClass("x") || $clickedSquare.hasClass("o")) {
                    return;
                }
                $clickedSquare.removeClass("x-hover").removeClass("o-hover");
                const row = parseInt($clickedSquare.attr("row"));
                const column = parseInt($clickedSquare.attr("column"));
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
            const $square = $("#board div").filter("[row=" + row + "]").filter("[column=" + column +"]");            
            const className = isPlayerOne ? "x" : "o";
            $square.addClass(className);
        }
        
        function freezeBoard() {
            isFrozen = true;
        }
        
        function onResetButtonClick(callback) {
            $("#reset-button").click(callback);
        }
        
        function onLuckyButtonClick(callback) {
            $("#lucky-button").click(function() {
                if (isFrozen === true) {
                    return;
                }
                callback();
            });
        }
        
        function resetBoard() {
            isFrozen = false;
            $("#board div").filter("[row]").filter("[column]").each(function(index, square) {
                $(square).removeClass("x").removeClass("o").removeClass("winning-square");
            });
            $("#board .row div").removeClass("game-over");
        }
        
        function drawBoard(board) {
            board.forEach(function(rowValue, rowIndex) {
                rowValue.forEach(function(columnValue, columnIndex) {
                    if (columnValue !== null) {
                        addMark(columnValue, rowIndex, columnIndex);
                    }
                });
            });
        }
        
        function addWinEffects(winningSquares) {
            winningSquares.forEach(function(square) {
                const $square = $("#board div")
                    .filter("[row=" + square.row + "]")
                    .filter("[column=" + square.column +"]");
                $square.addClass("winning-square");
            });
            
        }
        
        function addEndState() {
            $("#board .row div").addClass("game-over");
            $("#lucky-button").attr("disbled", "true");
        }
        
        function updateTallies(currentTallies) {
            $("#player-one-wins").text(currentTallies.playerOne);
            $("#player-two-wins").text(currentTallies.playerTwo);
            $("#tied-games").text(currentTallies.ties);
        }
        
        function onSquareHover(callback) {  
            $("#board .row div").hover(function(event) {
                const isPlayerOne = callback();
                const $hoveredSquare = $(event.target);
                if ($hoveredSquare.hasClass("x") || $hoveredSquare.hasClass("o") || $hoveredSquare.hasClass("game-over")){
                    return;
                }
                if (isPlayerOne) {
                    $hoveredSquare.addClass("x-hover");
                } else {
                    $hoveredSquare.addClass("o-hover");
                }
            }, function(event) {
                const $hoveredSquare = $(event.target);
                $hoveredSquare.removeClass("x-hover").removeClass("o-hover");
            });
        }
        return {onSquareClick,
                changePlayerMessage,
                addMark,
                freezeBoard,
                setTieMessage,
                onResetButtonClick,
                resetBoard,
                drawBoard,
                addWinEffects,
                updateTallies,
                onLuckyButtonClick,
                addEndState,
                onSquareHover
        };
    }


    function createModel() {
        
        const sideLength = 3;
        
        let gameState = {
            isPlayerOne: true,
            board: undefined,
            playerOneWins: 0,
            playerTwoWins: 0,
            ties: 0
        }; 
        
        function initBoard() {
            flipCoin();
            gameState.board = [];
            for (let i = 0; i < sideLength; i++) {
                const row = [];
                for (let j = 0; j < sideLength; j++) {
                    row.push(null);
                }
                gameState.board.push(row);
            }
        }
        
       function flipCoin() {
            const player = [true, false];
            const index = Math.floor(Math.random() * 2);
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
            const winner = isPlayerOne ? "playerOneWins" : "playerTwoWins";
            
            function save() {
                if (shouldUpdateTallies) {
                    gameState[winner]++;
                    saveGame();
                }
            }
            
            let winningSquares = [];
            for (let i = 0; i < sideLength; i++) {
                if (gameState.board[row][i] !== isPlayerOne) {
                     winningSquares = null;
                    break;
                } else {
                    const square = {row: row, column: i};
                    winningSquares.push(square);
                }
            }
            
            if (winningSquares) {
                save();
                return winningSquares;
            } else {
                winningSquares = [];
            }
            
            for (let j = 0; j < sideLength; j++) {
                if (gameState.board[j][column] !== isPlayerOne) {
                    winningSquares = null;
                    break;
                } else {
                    const square = {row: j, column: column};
                    winningSquares.push(square);
                }
            }
                        
            if (row === column) {
                if (winningSquares) {
                    save();
                    return winningSquares;
                } else {
                    winningSquares = [];
                }                
                for (let k = 0; k < sideLength; k++) {
                    if (gameState.board[k][k] !== isPlayerOne) {
                        winningSquares = null;
                        break;
                    } else {
                        const square = {row: k, column: k};
                        winningSquares.push(square);
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
                for (let i = 0; i < sideLength; i++) {
                    if (gameState.board[sideLength - 1 - i][i] !== isPlayerOne) {
                        winningSquares = null;
                        break;
                    } else {
                        const square = {row:sideLength - 1 - i, column: i};
                        winningSquares.push(square);
                    }
                }
            }
            if (winningSquares) {
                save();
            }
            return winningSquares;
        }
        
        function checkForNull(array) {
            return array.some(elem => elem === null);
        }
        
        function checkTie(shouldUpdateTallies) {
            for (let i = 0; i < sideLength; i++) {
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
            return {playerOne: gameState.playerOneWins, playerTwo: gameState.playerTwoWins, ties: gameState.ties};
        }
        
        function getAvailableSquares() {
            const availableSquares = [];
            for (let rowIndex = 0; rowIndex < sideLength; rowIndex++) {
                for (let colIndex = 0; colIndex < sideLength; colIndex++) {
                    if (gameState.board[rowIndex][colIndex] === null) {
                        availableSquares.push({row: rowIndex, column: colIndex});
                    }
                }
            }
            return availableSquares;
        }
        
        function findWinningSpaces(isPlayerOne) {
            const possibleWins = [];
            
            for (let rowIndex = 0; rowIndex < sideLength; rowIndex++) {
                const openSpaces = [];
                let opposingPlayerSpaces = false;
                
                for (let colIndex = 0; colIndex < sideLength; colIndex++) {
                    if (gameState.board[rowIndex][colIndex] === null) {
                        openSpaces.push({row: rowIndex, column: colIndex});
                    } else if (gameState.board[rowIndex][colIndex] === !isPlayerOne) { //jshint ignore:line
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
            
            for (let colIndex = 0; colIndex < sideLength; colIndex++) {
                const openSpaces = [];
                let opposingPlayerSpaces = false;
                
                for (let rowIndex = 0; rowIndex < sideLength; rowIndex++) {
                    if (gameState.board[rowIndex][colIndex] === null) {
                        openSpaces.push({row: rowIndex, column: colIndex});
                    } else if (gameState.board[rowIndex][colIndex] === !isPlayerOne) { //jshint ignore:line
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

            const openSpacesDiagonal = [];
            let opposingPlayerSpacesDiagonal = false;
            
            for (let rowColIndex = 0; rowColIndex < sideLength; rowColIndex++) {
                
                if (gameState.board[rowColIndex][rowColIndex] === null) {
                    openSpacesDiagonal.push({row: rowColIndex, column: rowColIndex});
                } else if (gameState.board[rowColIndex][rowColIndex] === !isPlayerOne) { //jshint ignore:line
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
            
            const openSpacesReverseDiagonal = [];
            let opposingPlayerSpacesReverseDiagonal = false;
            
            for (let rowIndex = 0; rowIndex < sideLength; rowIndex++) {
                if (gameState.board[rowIndex][sideLength - 1 - rowIndex] === null) {
                    openSpacesReverseDiagonal.push({row: rowIndex, column: sideLength - 1 - rowIndex});
                } else if (gameState.board[rowIndex][sideLength - 1 - rowIndex] === !isPlayerOne) { //jshint ignore:line
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
            const sortedArrays = [];
            arrays.forEach(function(elem) {
                if (!sortedArrays[elem.length]) {
                    sortedArrays[elem.length] = [];
                }
                sortedArrays[elem.length].push(elem);
            });
            return sortedArrays;
        }
        
        function getBestSpace(isPlayerOne) {
            const sortedArrays = groupArrays(findWinningSpaces(isPlayerOne));
            if (!sortedArrays.length) {
                const available = getAvailableSquares();
                return available[Math.floor(Math.random() * available.length)];
            }
            for (let i = 0; i < sortedArrays.length; i++) {
                if (sortedArrays[i]) {
                    const sameLengthArrays = sortedArrays[i];
                    if (sameLengthArrays.length === 1 && sameLengthArrays[0].length === 1) {
                        return sameLengthArrays[0][0];
                    } else {
                        const indexOfList = Math.floor(Math.random() * sameLengthArrays.length);
                        const indexOfElem = Math.floor(Math.random() * sameLengthArrays[indexOfList].length);
                        return sameLengthArrays[indexOfList][indexOfElem];
                    }
                }
            }
        }

        return {changePlayer,
                getPlayer,
                checkWin,
                updateBoard,
                checkTie,
                resetGame,
                loadGame,
                getBoard,
                getLastRow,
                getLastColumn,
                getTallies,
                getBestSpace
              };
    }
    
    function createController() {
        function init(view, model) {

            const isInProgess = model.loadGame();
            view.drawBoard(model.getBoard());
            if (isInProgess) {
                restoreBoard();
            }

            view.onSquareHover(model.getPlayer);

            view.onSquareClick(takeTurn);
               
            view.onResetButtonClick(function() {
                model.resetGame();
                view.resetBoard();
                view.changePlayerMessage(model.getPlayer(), "Pick a square");               
            });
            
            view.onLuckyButtonClick(function() {
                let currentSquare = model.getBestSpace(model.getPlayer());
                takeTurn(currentSquare.row, currentSquare.column);                
            });
        }
        
        function takeTurn(row, column) {
            const currentPlayer = model.getPlayer();
            view.addMark(currentPlayer, row, column);
            model.updateBoard(currentPlayer, row, column);
            if(!updateViewIfGameOver(currentPlayer, row, column, true)) {
                endTurn();
            }                      
        }
        
        function restoreBoard() {

            const previousPlayer = model.getPlayer();
            const lastRow = model.getLastRow();
            const lastColumn = model.getLastColumn();
            const hasLastRowAndColumn = lastRow >= 0 && lastColumn >= 0;
            const isEnded = hasLastRowAndColumn && updateViewIfGameOver(previousPlayer, lastRow, lastColumn, false);
            
            if (!isEnded) {
                view.changePlayerMessage(model.getPlayer(), "Pick a square");
            }
        }

        function updateViewIfGameOver(player, row, column, shouldUpdateTallies) {
            const winningSquares = model.checkWin(player, row, column, shouldUpdateTallies);
            
            if (winningSquares) {
                view.changePlayerMessage(player, "You've won!");
                view.addEndState();
                view.addWinEffects(winningSquares);
                view.updateTallies(model.getTallies());
                view.freezeBoard();
                return true;
            } else if (model.checkTie(shouldUpdateTallies)){
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
        
        return {init};
    }

})(window.$);