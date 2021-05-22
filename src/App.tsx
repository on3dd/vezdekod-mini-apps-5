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
// import {} from '@limbus-mini-apps';

import { PanelWrapper } from './utils/wrappers';
import { GlobalStyles } from './utils/globalStyles';
import { Maze } from './components/Maze';

const Container = styled.main`
  width: 100%;
`;

const App: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [gyroscopeError, setGyroscopeError] = useState<ErrorData>();

  useEffect(() => {
    bridge.subscribe(({ detail }: VKBridgeEvent<AnyReceiveMethodName>) => {
      switch (detail.type) {
        case 'VKWebAppUpdateConfig': {
          console.log('VKWebAppUpdateConfig', detail.data);

          const schemeAttribute = document.createAttribute('scheme');

          schemeAttribute.value = detail.data.scheme ? detail.data.scheme : 'client_light';

          document.body.attributes.setNamedItem(schemeAttribute);

          break;
        }
      }
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

                  {gyroscopeError && (
                    <Group
                      header={
                        <Title level="2" weight="regular">
                          Flashlight error
                        </Title>
                      }
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Headline weight="regular">{`${gyroscopeError.error_type}`}</Headline>
                      <Headline weight="regular">Error data: {JSON.stringify(gyroscopeError.error_data)}</Headline>
                    </Group>
                  )}

                  <Group style={{ padding: '0.5rem 1rem' }}>
                    <Maze />
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
