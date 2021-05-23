import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import '@vkontakte/vkui/dist/vkui.css';
import bridge, { VKBridgeEvent, AnyReceiveMethodName, ErrorData } from '@vkontakte/vk-bridge';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  SplitLayout,
  Panel,
  Group,
  Title,
  Headline,
  PanelHeader,
  withAdaptivity,
} from '@vkontakte/vkui';
import amaze from 'amazejs';
import { GyroscopeData2D, GyroscopeData3D, Direction } from '@limbus-mini-apps';

import { PanelWrapper } from './utils/wrappers';
import { generateNewMaze, getDirection, getNegativeDirection, changePosition } from './utils/functions';
import { GlobalStyles } from './utils/globalStyles';
import { Maze } from './components/Maze';

const Container = styled.main`
  width: 100%;
`;

type GyroscopeOperation = {
  position: GyroscopeData2D;
  velocity: GyroscopeData2D;
  previousPosition: GyroscopeData2D;
  previousVelocity: GyroscopeData2D;
} & Partial<{
  sign: number; // 0 | -1 | 1
  direction: Direction;
}>;

const MAX_DIFF = 0.05;
const MIN_DIFF = 0.001;
const INITIAL_LEVEL = 1;
const INITIAL_MAZE_SIZE = 5;
const CELL_SIZE_BY_LEVEL = 6;
const INITIAL_GYROSCOPE_DATA: GyroscopeData3D = {
  x: 0,
  y: 0,
  z: 0,
};
const INITIAL_GYROSCOPE_OPERATION: GyroscopeOperation = {
  position: { x: 1, y: 1 },
  velocity: { x: 0, y: 0 },
  previousPosition: { x: 1, y: 1 },
  previousVelocity: { x: 0, y: 0 },
};

const App: React.FC = () => {
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [maze, setMaze] = useState<amaze.Backtracker>(generateNewMaze(INITIAL_MAZE_SIZE + CELL_SIZE_BY_LEVEL * level));
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [operation, setOperation] = useState<GyroscopeOperation>(INITIAL_GYROSCOPE_OPERATION);
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeData3D>(INITIAL_GYROSCOPE_DATA);
  const [gyroscopeStatus, setGyroscopeStatus] = useState<string>();
  const [gyroscopeError, setGyroscopeError] = useState<ErrorData>();

  useEffect(() => {
    const size = INITIAL_MAZE_SIZE + CELL_SIZE_BY_LEVEL * level;
    if (size !== maze.width) {
      console.log('generating new maze!');
      setMaze(() => generateNewMaze(INITIAL_MAZE_SIZE + CELL_SIZE_BY_LEVEL * level));
    }
  }, [maze.width, level, setMaze]);

  useEffect(() => {
    const increaseLevel = async () => {
      if (maze && operation.position.x === maze.width - 2 && operation.position.y === maze.height - 2) {
        console.log('level up!');

        await bridge.send('VKWebAppGyroscopeStop');

        setTimeout(() => {
          setLevel((prev) => prev + 1);
          setOperation(() => INITIAL_GYROSCOPE_OPERATION);
        }, 1000);
      }
    };

    increaseLevel();
  }, [maze, operation, setLevel]);

  useEffect(() => {
    console.log('maze', maze);

    bridge.send('VKWebAppGyroscopeStart');

    bridge.subscribe(({ detail }: VKBridgeEvent<AnyReceiveMethodName>) => {
      switch (detail.type) {
        case 'VKWebAppUpdateConfig': {
          console.log('VKWebAppUpdateConfig', detail.data);

          const schemeAttribute = document.createAttribute('scheme');

          schemeAttribute.value = detail.data.scheme ? detail.data.scheme : 'client_light';

          document.body.attributes.setNamedItem(schemeAttribute);

          break;
        }

        case 'VKWebAppGyroscopeStartResult': {
          console.log('VKWebAppGyroscopeStartResult', detail.data);
          setIsAvailable(() => detail.data.result);
          break;
        }

        case 'VKWebAppGyroscopeStartFailed': {
          console.log('VKWebAppGyroscopeStartFailed', detail.data);
          setGyroscopeError(() => detail.data);
          break;
        }

        case 'VKWebAppGyroscopeChanged': {
          console.log('VKWebAppGyroscopeChanged', detail.data);

          if (maze === undefined) {
            return console.log('Maze is undefined!');
          }

          const data = {
            x: parseFloat(detail.data.x),
            y: parseFloat(detail.data.y),
            z: parseFloat(detail.data.z),
          };

          setGyroscopeData(() => data);

          setOperation((p) => {
            if (p.sign && p.direction) {
              const oppositeDir = getNegativeDirection(p.direction);
              const oppositeSign = Math.sign(data[oppositeDir]);

              const diff = Math.abs(data[oppositeDir] - p.velocity[oppositeDir]);

              if (diff <= MAX_DIFF || (diff > MIN_DIFF && p.sign === oppositeSign)) {
                setGyroscopeStatus(() => `same: ${p.sign}${p.direction}`);

                return {
                  sign: p.sign,
                  direction: p.direction,
                  previousPosition: p.position,
                  previousVelocity: p.velocity,
                  position: {
                    [oppositeDir]: p.position[oppositeDir],
                    [p.direction]: changePosition(p.position, p.sign, p.direction, maze),
                  } as GyroscopeData2D,
                  velocity: { x: data.x, y: data.y },
                };
              }
            }

            if (Math.abs(data.x) > MIN_DIFF || Math.abs(data.y) > MIN_DIFF) {
              const mainDirection = getDirection(data.x, data.y);
              const secondaryDirection = getNegativeDirection(mainDirection);

              const sign = Math.abs(data.x) > Math.abs(data.y) ? Math.sign(data.x) : Math.sign(data.y);

              setGyroscopeStatus(() => `${sign}${mainDirection}`);

              return {
                sign,
                direction: mainDirection,
                position: {
                  [secondaryDirection]: p.position[secondaryDirection],
                  [mainDirection]: changePosition(p.position, Math.sign(data.x), mainDirection, maze),
                } as GyroscopeData2D,
                velocity: { x: data.x, y: data.y },
                previousPosition: p.position,
                previousVelocity: p.velocity,
              };
            }

            setGyroscopeStatus(() => 'default');

            return p;
          });
          break;
        }
      }

      return () => {
        bridge.send('VKWebAppGyroscopeStop');
      };
    });
  }, [maze]);

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout>
            <Container>
              <GlobalStyles />

              <PanelWrapper id="home">
                <Panel id="home">
                  <PanelHeader>Maze app</PanelHeader>

                  <Group
                    header={
                      <Title level="2" weight="regular">
                        Is gyroscope available
                      </Title>
                    }
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <Headline weight="regular">{`${isAvailable}`}</Headline>
                  </Group>

                  <Group
                    header={
                      <Title level="2" weight="regular">
                        Gyroscope data
                      </Title>
                    }
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <Headline weight="regular">
                      {`x: ${gyroscopeData.x.toFixed(4)}, y: ${gyroscopeData.y.toFixed(
                        4,
                      )}, z: ${gyroscopeData.z.toFixed(4)}`}
                    </Headline>
                  </Group>

                  <Group
                    header={
                      <Title level="2" weight="regular">
                        Current position
                      </Title>
                    }
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <Headline weight="regular">
                      {`x: ${operation.position.x}, y: ${operation.position.y}, status: ${gyroscopeStatus}`}
                    </Headline>
                  </Group>

                  {gyroscopeError && (
                    <Group
                      header={
                        <Title level="2" weight="regular">
                          Gyroscope error
                        </Title>
                      }
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Headline weight="regular">{`${gyroscopeError.error_type}`}</Headline>
                      <Headline weight="regular">Error data: {JSON.stringify(gyroscopeError.error_data)}</Headline>
                    </Group>
                  )}

                  {!!maze && (
                    <Group style={{ padding: '0.5rem 1rem' }}>
                      <Maze maze={maze} position={operation.position} prevPosition={operation.previousPosition} />
                    </Group>
                  )}
                </Panel>
              </PanelWrapper>
            </Container>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default withAdaptivity(App, { viewWidth: true });
