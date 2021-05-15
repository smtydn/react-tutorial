import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  const className = "square" + (props.highlight ? ' highlight' : '');
  return (
    <button 
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    const winningMoves = this.props.winningMoves;
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
        key={i}
        highlight={winningMoves && winningMoves.includes(i)}
      />
    );
  }

  render() {
    let board = []
    for (let i=0; i<3; i++) {
      let row = []
      for (let j=0; j<3; j++) {
        row.push(this.renderSquare(i * 3 + j))
      }
      board.push(<div key={i} className="board-row">{row}</div>)
    }
    return <div>{board}</div>
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      selectedButton: null,
      isAscending: true,
      isDraw: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const gameStatus = calculateWinner(squares);

    if (gameStatus.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      isDraw: !squares.includes(null)
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      selectedButton: step
    });
  }

  moveHistory(moveNumber) {
    const gameHistory = this.state.history
    let current = gameHistory[moveNumber].squares;
    let prev = moveNumber > 0 ? gameHistory[moveNumber - 1].squares : Array(9).fill(null);
    for (let j = 0; j < current.length; j++) {
      if (current[j] !== prev[j]) {
        return {
          row: Math.floor((j / 3) + 1),
          column: (j % 3) + 1,
          player: current[j]
        };
      };
    };
  }

  handleSortToggle() {
    this.setState({
      isAscending: !this.state.isAscending
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const gameStatus = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const moveHistory = this.moveHistory(move)
      const desc = move ?
        `Go to move (row: ${moveHistory.row}, column: ${moveHistory.column}, player: ${moveHistory.player})`:
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} style={this.state.selectedButton === move ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}>{desc}</button>
        </li>
      )
    })

    if (this.state.isAscending) {
      moves.sort();
    } else {
      moves.reverse();
    };

    let status;

    if (gameStatus.winner) {
      status = 'Winner: ' + gameStatus.winner;
    } else {
      if (this.state.isDraw) {
        status = 'Draw.'
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    };

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningMoves={gameStatus.winningMoves}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={() => this.handleSortToggle()}>Sort moves</button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// =========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winningMoves: [a, b, c],
        winner: squares[a]
      }
    }
  }
  return {
    winningMoves: null,
    winner: null,
  };
}
