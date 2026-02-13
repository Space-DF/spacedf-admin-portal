import { PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

const SWRProvider = ({ children }: PropsWithChildren) => {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then((res) => res.json()),
        provider: () => new Map(),
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
