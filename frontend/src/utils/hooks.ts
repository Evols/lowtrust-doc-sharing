
import { useEffect } from 'react';

export function useAsyncEffect(effect: () => Promise<void>, deps?: React.DependencyList | undefined) {
  useEffect(() => {
    effect();
  }, deps);
}
