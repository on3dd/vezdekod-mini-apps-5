import { RefObject } from 'react'
// @ts-ignore
import amaze from 'amazejs';


export const getInitialMaze = () => {
  const maze = new amaze.Backtracker(55, 55);

  maze.reset();
  maze.generate();

  return maze;
};


export const doGenerate = (maze: any, cellSize: number, ref: RefObject<HTMLCanvasElement>) => {
  if (ref.current) {
    console.log('doGenerate if 1');

    ref.current.width = maze.width * cellSize;
    ref.current.height = maze.height * cellSize;

    const ctx = ref.current.getContext('2d');

    if (ctx) {
      console.log('doGenerate if 2');

      ctx.fillStyle = 'rgba(255,255,255,1)';

      console.log('maze', maze);

      for (let i = 0; i < maze.height; i++) {
        for (let j = 0; j < maze.width; j++) {
          if (maze.get(i, j)) {
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }
};

export const doSolve = (maze: any, cellSize: number, ref: RefObject<HTMLCanvasElement>) => {
  if (ref.current) {
    console.log('doSolve if 1');

    const ctx = ref.current.getContext('2d');
    const sln = maze.solve([1, 1], [maze.height - 2, maze.width - 2]);

    if (ctx) {
      console.log('doSolve if 2');

      ctx.fillStyle = 'rgba(100, 149, 237, 0.5)';

      for (let i = 0; i < sln.length; i++) {
        ctx.fillRect(sln[i][1] * cellSize, sln[i][0] * cellSize, cellSize, cellSize);
      }

      ctx.fillStyle = '#00FF00';
      ctx.fillRect(cellSize, cellSize, cellSize, cellSize);

      ctx.fillStyle = '#FF0000';
      ctx.fillRect(cellSize * (maze.width - 2), cellSize * (maze.height - 2), cellSize, cellSize);
    }
  }
};
