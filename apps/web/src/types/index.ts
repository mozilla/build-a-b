export interface FlagType<T = boolean> {
  key: string;
  decide: (params?: any) => Promise<T> | T;
  description: string;
  defaultValue: T;
}
