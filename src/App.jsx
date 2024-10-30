import React, { useState, useEffect } from 'react';
import './App.css';

const MazeVisualizer = () => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [maze, setMaze] = useState(createMaze(5, 5));
  const [path, setPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState([0, 0]);
  const [speedSlider, setSpeedSlider] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const maxSpeed = 300; 

  const speed = maxSpeed - speedSlider * 30; 

  useEffect(() => {
    resetMaze();
  }, [rows, cols]);

  function createMaze(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  const isSafe = (x, y, visited) => x >= 0 && y >= 0 && x < rows && y < cols && maze[x][y] === 0 && !visited[x][y];

  const findPath = async (x, y, visited) => {
    setCurrentPosition([x, y]);

    if (x === rows - 1 && y === cols - 1) {
      setPath((prev) => [...prev, [x, y]]);
      setMessage("Path found! 🏆"); 
      return true;
    }

    if (isSafe(x, y, visited)) {
      setPath((prev) => [...prev, [x, y]]);
      visited[x][y] = true;

      await new Promise((resolve) => setTimeout(resolve, speed));

      const moves = [
        [1, 0], [0, 1], [-1, 0], [0, -1]
      ];

      for (const [dx, dy] of moves) {
        if (await findPath(x + dx, y + dy, visited)) return true;
      }

      setPath((prev) => prev.slice(0, -1));
      visited[x][y] = false;

      await new Promise((resolve) => setTimeout(resolve, speed / 2)); 
    }

    return false;
  };

  const startVisualization = async () => {
    setIsRunning(true);
    setMessage('');
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    resetMaze(false);
    const found = await findPath(0, 0, visited);
    if (!found) setMessage("No path found. 😞");
    setIsRunning(false);
  };

  const resetMaze = (clearMaze = true) => {
    setPath([]);
    setCurrentPosition([0, 0]);
    setIsRunning(false);
    setMessage('');
    if (clearMaze) setMaze(createMaze(rows, cols));
  };

  const toggleWall = (x, y) => {
    if (isRunning) return;
    setMaze((prev) => {
      const newMaze = prev.map((row) => [...row]);
      newMaze[x][y] = newMaze[x][y] === 0 ? 1 : 0;
      return newMaze;
    });
  };

  const addRandomHurdles = () => {
    setMaze((prev) => {
      const newMaze = prev.map((row) => [...row]);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.random() < 0.3) newMaze[i][j] = 1;
        }
      }
      newMaze[0][0] = 0;
      newMaze[rows - 1][cols - 1] = 0;
      return newMaze;
    });
  };

  return (
    <div>
      <h1 className='title text-center text-3xl font-bold mt-4 mb-8 text-gray-800'>Maze Visualizer</h1>
      <div className="controls">
        <label>
          Rows:
          <input type="number" value={rows} onChange={(e) => setRows(Number(e.target.value))} min="2" disabled={isRunning} />
        </label>
        <label>
          Columns:
          <input type="number" value={cols} onChange={(e) => setCols(Number(e.target.value))} min="2" disabled={isRunning} />
        </label>
        <button onClick={startVisualization} disabled={isRunning}>Start</button>
        <button onClick={() => resetMaze()} disabled={isRunning}>Reset</button>
        <button onClick={addRandomHurdles} disabled={isRunning}>Random Hurdles</button>
        <label>
          Speed:
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={speedSlider}
            onChange={(e) => setSpeedSlider(Number(e.target.value))}
            disabled={isRunning}
          />
          Speed Level: {speedSlider}
        </label>
      </div>
      <div className="message">{message}</div>
      <div className="maze">
        {maze.map((row, i) => (
          <div key={i} className="maze-row">
            {row.map((cell, j) => {
              const isCurrent = currentPosition[0] === i && currentPosition[1] === j;
              return (
                <div
                  key={`${i}-${j}`}
                  className={`maze-cell ${cell === 1 ? 'wall' : ''} ${path.some(([x, y]) => x === i && y === j) ? 'path' : ''} ${isCurrent ? 'rat' : ''}`}
                  onClick={() => toggleWall(i, j)}
                >
                  {isCurrent ? '🐭' : i === rows - 1 && j === cols - 1 ? '🏁' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MazeVisualizer;
