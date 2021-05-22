import React from 'react';
import styled from 'styled-components';
import { FixedLayout, Separator, HorizontalScroll } from '@vkontakte/vkui';
import { FlashlightState } from '@limbus-mini-apps';

import { FlashlightButton } from './FlashlightButton';

const Container = styled.div`
  display: flex;
  padding: 1rem;
  justify-content: center;
`;

const Row = styled.div`
  display: grid;
  column-gap: 16px;
  grid-auto-flow: row;
  align-items: flex-end;
  grid-template-columns: repeat(8, auto);
`;

type FlashLightProps = {
  currentIdx: number;
  buttonState: FlashlightState;
  onToggleButtonState: (idx: number) => void;
};

export const FlashLight: React.FC<FlashLightProps> = ({ currentIdx, buttonState, onToggleButtonState }) => {
  return (
    <FixedLayout filled vertical="bottom">
      <Separator wide />
      <Container>
        <HorizontalScroll showArrows getScrollToLeft={(i) => i - 120} getScrollToRight={(i) => i + 120}>
          <Row>
            {buttonState.map((el, idx) => (
              <FlashlightButton active={el} current={idx === currentIdx} onClick={() => onToggleButtonState(idx)} />
            ))}
          </Row>
        </HorizontalScroll>
      </Container>
    </FixedLayout>
  );
};
