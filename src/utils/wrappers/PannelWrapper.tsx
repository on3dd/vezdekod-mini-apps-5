import React, { useMemo } from 'react';
import { View, ScreenSpinner } from '@vkontakte/vkui';

type PanelWrapperProps = {
  id: string;
  modal?: React.ReactNode;
  fetching?: boolean;
  children: JSX.Element;
};

export const PanelWrapper: React.FC<PanelWrapperProps> = ({ id, modal, fetching, children }: PanelWrapperProps) => {
  const popout = useMemo(() => {
    return fetching ? <ScreenSpinner /> : null;
  }, [fetching]);

  return (
    <View activePanel={id} modal={modal} popout={popout}>
      {React.cloneElement(children, { id })}
    </View>
  );
};
