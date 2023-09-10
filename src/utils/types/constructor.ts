export type Constructor<T> = new (...args: any[]) => T;

export type ConstructorWithTuppleParams<P extends any[], T> = new (
  ...args: P
) => T;
