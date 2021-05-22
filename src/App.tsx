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
import { FlashlightState } from '@limbus-mini-apps';

import { PanelWrapper } from './utils/wrappers';
import { GlobalStyles } from './utils/globalStyles';
import { FlashLight } from './components/Flashlight';

const Container = styled.main`
  width: 100%;
`;

const INITIAL_FLASHLIGHT_STATE: FlashlightState = [false, false, false, false, false, false, false, false];

const App: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [flashlightError, setFlashlightError] = useState<ErrorData>();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [buttonState, setButtonState] = useState<FlashlightState>(INITIAL_FLASHLIGHT_STATE);

  const onToggleButtonState = useCallback(
    (idx: number) => {
      setButtonState((p) => [...p.slice(0, idx), !p[idx], ...p.slice(idx + 1)] as FlashlightState);
    },
    [setButtonState],
  );

  useEffect(() => {
    bridge.send('VKWebAppFlashGetInfo');

    bridge.subscribe(({ detail }: VKBridgeEvent<AnyReceiveMethodName>) => {
      switch (detail.type) {
        case 'VKWebAppUpdateConfig': {
          console.log('VKWebAppUpdateConfig', detail.data);

          const schemeAttribute = document.createAttribute('scheme');

          schemeAttribute.value = detail.data.scheme ? detail.data.scheme : 'client_light';

          document.body.attributes.setNamedItem(schemeAttribute);

          break;
        }

        case 'VKWebAppFlashGetInfoResult': {
          console.log('VKWebAppFlashGetInfoResult', detail.data.is_available);
          setIsAvailable(() => detail.data.is_available);
          break;
        }

        case 'VKWebAppFlashGetInfoFailed': {
          console.log('VKWebAppFlashGetInfoFailed', detail.data);
          setFlashlightError(() => detail.data);
          break;
        }

        case 'VKWebAppFlashSetLevelResult': {
          console.log('VKWebAppFlashSetLevelResult', detail.data);
          break;
        }

        case 'VKWebAppFlashSetLevelFailed': {
          console.log('VKWebAppFlashSetLevelFailed', detail.data);
          setFlashlightError(() => detail.data);
          break;
        }
      }
    });
  }, []);

  const shineFlashlight = useCallback(
    (idx: number) => {
      const prevIdx = idx === 0 ? buttonState.length : idx - 1;

      if (buttonState[idx] !== buttonState[prevIdx]) {
        bridge.send('VKWebAppFlashSetLevel', { level: buttonState[idx] ? 1 : 0 });
      }

      setCurrentIdx(() => (idx + 1) % 8);
    },
    [buttonState, setCurrentIdx],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (isAvailable && flashlightError === undefined) {
        shineFlashlight(currentIdx);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAvailable, flashlightError, currentIdx, shineFlashlight]);

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout>
            <Container>
              <GlobalStyles />

              <PanelWrapper id="home">
                <Panel id="home">
                  <PanelHeader>Flashlight app</PanelHeader>

                  <Group
                    header={
                      <Title level="2" weight="regular">
                        Is flashlight available
                      </Title>
                    }
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <Headline weight="regular">: {`${isAvailable}`}</Headline>
                  </Group>

                  {flashlightError && (
                    <Group
                      header={
                        <Title level="2" weight="regular">
                          Flashlight error
                        </Title>
                      }
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Headline weight="regular">{`${flashlightError.error_type}`}</Headline>
                      <Headline weight="regular">Error data: {JSON.stringify(flashlightError.error_data)}</Headline>
                    </Group>
                  )}

                  <FlashLight
                    currentIdx={currentIdx}
                    buttonState={buttonState}
                    onToggleButtonState={onToggleButtonState}
                  />
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
