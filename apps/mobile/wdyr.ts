/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from 'react';

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: false,
    trackHooks: true,
    logOwnerReasons: true,
    notifier: (updateInfo: any) => {
      const name = updateInfo.Component.displayName || updateInfo.Component.name;
      console.log(`[WDYR] 🚨 Re-render in ${name}!`);
      console.log(`[WDYR] 🔍 Reasons:`, JSON.stringify(updateInfo.reason, null, 2));
    }
  });
}
