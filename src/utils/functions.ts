import { RefObject } from 'react'
// @ts-ignore
import amaze from 'amazejs';
import { GyroscopeData2D, Direction } from '@limbus-mini-apps';


export const generateNewMaze = (size = 55) => {
  const maze = new amaze.Backtracker(size, size);

  maze.reset();
  maze.generate();

  return maze;
};


export const doGenerate = (maze: amaze.Backtracker, cellSize: number, ref: RefObject<HTMLCanvasElement>) => {
  if (ref.current) {
    ref.current.width = maze.width * cellSize;
    ref.current.height = maze.height * cellSize;

    const ctx = ref.current.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'rgba(255,255,255,1)';

      for (let i = 0; i < maze.width; i++) {
        for (let j = 0; j < maze.height; j++) {
          if (maze.get(i, j)) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }
};

export const doSolve = (maze: amaze.Backtracker, cellSize: number, ref: RefObject<HTMLCanvasElement>) => {
  if (ref.current) {
    const ctx = ref.current.getContext('2d');
    const sln = maze.solve([1, 1], [maze.height - 2, maze.width - 2]);

    if (ctx) {
      ctx.fillStyle = 'rgba(100, 149, 237, 0.5)';

      for (let i = 0; i < sln.length; i++) {
        ctx.fillRect(sln[i][0] * cellSize, sln[i][1] * cellSize, cellSize, cellSize);
      }

      ctx.fillStyle = 'rgba(0,0,255,1)';
      ctx.fillRect(cellSize, cellSize, cellSize, cellSize);

      ctx.fillStyle = 'rgba(255,0,0,1)';
      ctx.fillRect(cellSize * (maze.width - 2), cellSize * (maze.height - 2), cellSize, cellSize);
    }
  }
};

export const changePosition = (position: GyroscopeData2D, sign: number, direction: Direction, maze: amaze.Backtracker): number => {
  switch (direction) {
    case 'x': {
      if (sign < 0 && maze.get(position.x - 1, position.y)) {
        return position.x - 1;
      }
  
      if (sign > 0 && maze.get(position.x + 1, position.y)) {
        return position.x + 1;
      }
  
      return position.x;
    }

    case 'y': {
      if (sign < 0 && maze.get(position.x, position.y - 1)) {
        return position.y - 1;
      }
  
      if (sign > 0 && maze.get(position.x, position.y + 1)) {
        return position.y + 1;
      }
  
      return position.y;
    }
  }
}

export const getDirection = (x: number, y: number): Direction => Math.abs(x) > Math.abs(y) ? 'y' : 'x';

export const getNegativeDirection = (x: Direction): Direction => x === 'x' ? 'y' : 'x';
