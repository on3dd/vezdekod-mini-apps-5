declare module 'amazejs' {
  export class Backtracker {
    width: number;
    height: number;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(width: number, height: number) {}

    reset: () => void;
    generate: () => void;
    get: (x: number, y: number) => number;
    solve: (start: [number, number], end: [number, number]) => number[][];

  }
}