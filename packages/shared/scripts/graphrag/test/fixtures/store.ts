import { add } from './utils';

export const useMockStore = () => {
  const value = add(1, 2);
  return { value };
};
