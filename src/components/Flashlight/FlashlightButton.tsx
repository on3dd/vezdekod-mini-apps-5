import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Button, SizeType } from '@vkontakte/vkui';
import { Icon16Minus, Icon16Add } from '@vkontakte/icons';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const CurrentIndicator = styled.div`
  width: 8px;
  height: 8px;
  margin-bottom: 8px;
  border-radius: 50%;
  background-color: var(--button_primary_background);
`;

type FlashlightButtonProps = {
  active: boolean;
  current: boolean;
  onClick: () => void;
};

export const FlashlightButton: React.FC<FlashlightButtonProps> = ({ active, current, onClick }) => {
  const { mode, IconComponent } = useMemo(() => {
    return active
      ? {
          mode: 'destructive' as const,
          IconComponent: Icon16Minus,
        }
      : {
          mode: 'primary' as const,
          IconComponent: Icon16Add,
        };
  }, [active]);

  return (
    <Container>
      {current && <CurrentIndicator />}

      <Button sizeY={SizeType.REGULAR} mode={mode} onClick={onClick}>
        {<IconComponent />}
      </Button>
    </Container>
  );
};
