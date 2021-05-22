declare module '@limbus-mini-apps' {
  export type GyroscopeData2D = {
    x: number;
    y: number;
  };

  export type GyroscopeData3D = GyroscopeData2D & {
    z: number;
  };

  export type Direction = 'x' | 'y';
}
