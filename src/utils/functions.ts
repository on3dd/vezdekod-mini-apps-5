import { RefObject } from 'react'
// @ts-ignore
import amaze from 'amazejs';
import { GyroscopeData2D, Direction } from '@limbus-mini-apps';


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

      ctx.fillStyle = 'rgba(255, 255, 0, 1)';
      ctx.fillRect(cellSize, cellSize, cellSize, cellSize);

      ctx.fillStyle = 'rgba(255, 0, 0, 1)';
      ctx.fillRect(cellSize * (maze.width - 2), cellSize * (maze.height - 2), cellSize, cellSize);
    }
  }
};

export const changePosition = (position: GyroscopeData2D, sign: number, direction: Direction, maze: any): number => {
  // const position: GyroscopeData2D = { x: pos.x + 1, y: pos.y + 1 };

  if (direction === 'x') {
    if (sign < 0) {
      if (position.x <= 1) {
        return position.x;
      };

      // if (maze.get(position.x - 1, position.y)) {
      //   return position.x - 1;
      // }

      // return position.x;

      return position.x - 1;

    }

    if (sign > 0) {
      if (position.x >= maze.width - 2) {
        return position.x;
      };

      // if (maze.get(position.x + 1, position.y)) {
      //   return position.x + 1;
      // }

      // return position.x;

      return position.x + 1;
    }

    return position.x;
  } else {
    if (sign < 0) {
      if (position.y <= 1) {
        return position.y;
      };

      // if (maze.get(position.x, position.y - 1)) {
      //   return position.y - 1;
      // }

      // return position.y;

      return position.y - 1;

    }

    if (sign > 0) {
      if (position.y >= maze.height - 2) {
        return position.y;
      };

      // if (maze.get(position.x, position.y + 1)) {
      //   return position.y + 1;
      // }

      // return position.y;

      return position.y + 1;
    }

    return position.y;
  }
}

export const getDirection = (x: number, y: number) => Math.abs(x) > Math.abs(y) ? 'y' : 'x';

export const getNegativeDirection = (x: Direction) => x === 'x' ? 'y' : 'x';