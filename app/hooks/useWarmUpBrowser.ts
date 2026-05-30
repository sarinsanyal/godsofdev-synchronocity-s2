// app/hooks/useWarmUpBrowser.ts
import React from 'react';
import * as WebBrowser from 'expo-web-browser';

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Pre-loads the browser in the background for faster/reliable opening
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};