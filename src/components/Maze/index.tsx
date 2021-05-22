import React, { useRef, useEffect, useMemo, RefObject } from 'react';
import styled from 'styled-components';
import { useAdaptivity, ViewWidth, Group } from '@vkontakte/vkui';
// @ts-ignore
import amaze from 'amazejs';

import { COLORS } from '../../utils/constants';

const Container = styled.div`
  display: flex;
  padding: 1rem 0;
  margin-top: 1rem;
  justify-content: center;
`;

const Canvas = styled.canvas`
  background-color: ${COLORS.black};
`;

export const Maze: React.FC = () => {
  const { viewWidth } = useAdaptivity();

  const ref = useRef<HTMLCanvasElement>(null);

  const cellSize = useMemo(() => {
    switch (viewWidth) {
      case ViewWidth.SMALL_MOBILE:
      case ViewWidth.MOBILE:
        return 4;
      case ViewWidth.SMALL_TABLET:
      case ViewWidth.TABLET:
        return 8;
      default:
        return 16;
    }
  }, [viewWidth]);

  useEffect(() => {
    if (ref.current) {
      const ctx = ref.current.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, ref.current.width, ref.current.height);
      }
    }

    const maze = new amaze.Backtracker(55, 55);

    doGenerate(maze, cellSize, ref);

    setTimeout(() => {
      doSolve(maze, cellSize, ref);
    }, 1000);
  }, [ref, cellSize]);

  return (
    <Group>
      <Container>
        <Canvas ref={ref} />
      </Container>
    </Group>
  );
};

const doGenerate = (maze: any, cellSize: number, ref: RefObject<HTMLCanvasElement>) => {
  if (ref.current) {
    console.log('doGenerate if 1');

    ref.current.width = maze.width * cellSize;
    ref.current.height = maze.height * cellSize;

    const ctx = ref.current.getContext('2d');

    if (ctx) {
      console.log('doGenerate if 2');

      ctx.fillStyle = 'rgba(255,255,255,1)';

      maze.reset();
      maze.generate();

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

const doSolve = (maze: any, cellSize: number, ref: RefObject<HTMLCanvasElement>) => {
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
