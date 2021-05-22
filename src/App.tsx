import React, { useState, useCallback, useEffect } from 'react';
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
import { GyroscopeData2D, GyroscopeData3D } from '@limbus-mini-apps';

import { PanelWrapper } from './utils/wrappers';
import { getInitialMaze } from './utils/functions';
import { GlobalStyles } from './utils/globalStyles';
import { Maze } from './components/Maze';

const Container = styled.main`
  width: 100%;
`;

const App: React.FC = () => {
  const [maze] = useState(getInitialMaze());
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [position, setPosition] = useState<GyroscopeData2D>({ x: 1, y: 1 });
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeData3D>({ x: 0, y: 0, z: 0 });
  const [gyroscopeError, setGyroscopeError] = useState<ErrorData>();

  useEffect(() => {
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

          const data = {
            x: parseFloat(detail.data.x),
            y: parseFloat(detail.data.y),
            z: parseFloat(detail.data.z),
          };

          setGyroscopeData(() => data);

          if (Math.abs(data.x) > 0.0005 || Math.abs(data.z) > 0.0005) {
            console.log('setPosition cond');

            setPosition((prev) =>
              Math.abs(data.x) > Math.abs(data.z)
                ? {
                    ...prev,
                    x: prev.x + 1 * Math.sign(data.x),
                  }
                : {
                    ...prev,
                    y: prev.y + 1 * Math.sign(data.z),
                  },
            );
          }
          break;
        }
      }

      return () => {
        bridge.send('VKWebAppGyroscopeStop');
      };
    });
  }, []);

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
                    <Headline weight="regular">{`x: ${position.x}, y: ${position.y}`}</Headline>
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

                  <Group style={{ padding: '0.5rem 1rem' }}>
                    <Maze maze={maze} position={position} />
                  </Group>
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
