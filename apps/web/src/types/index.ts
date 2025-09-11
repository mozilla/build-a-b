export interface FlagType<T = boolean> {
  key: string;
  decide: (params?: unknown) => Promise<T> | T;
  description: string;
  defaultValue: T;
}
