import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAdaptivity, ViewWidth, Group } from '@vkontakte/vkui';
// @ts-ignore
import amaze from 'amazejs';

import { COLORS } from '../../utils/constants';
import { doGenerate, doSolve } from '../../utils/functions';

const Container = styled.div`
  display: flex;
  padding: 1rem 0;
  justify-content: center;
`;

const Canvas = styled.canvas`
  background-color: ${COLORS.black};
`;

type MazeProps = {
  maze: any;
};

export const Maze: React.FC<MazeProps> = ({ maze }) => {
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

    doGenerate(maze, cellSize, ref);

    setTimeout(() => {
      doSolve(maze, cellSize, ref);
    }, 1000);
  }, [maze, ref, cellSize]);

  return (
    <Group>
      <Container>
        <Canvas ref={ref} />
      </Container>
    </Group>
  );
};
