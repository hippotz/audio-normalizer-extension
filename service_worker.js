'use strict';
const tabs = {};

const setBadge = (on) => {
  if (on === true) {
    chrome.action.setBadgeText({text: 'ON'});
    chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
  } else {
    chrome.action.setBadgeText({text: on === false ? 'OFF' : ''});
    chrome.action.setBadgeBackgroundColor({color: '#8B0000'});
  }
};

chrome.action.setBadgeText({text: ''});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('clicked: ' + JSON.stringify(tab));

  const tabData = tabs[tab.id] || {on: false};
  const on = !tabData.on;
  tabs[tab.id] = {
    ...tabData,
    on,
  };
  try {
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['normalizer.js'],
    }); //how do we inject the parameter? maybe need enable-norm, disable-norm script?
    const result = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      args: [on],
      func: (...args) => setNormalizer(args[0]),
    });

    setBadge(result[0].result);
  } catch (err) {
    console.log(`Failed to run normalizer script: ${err}`);
  }
});

chrome.tabs.onUpdated.addListener((tabId, { status }) => {
  if (status === 'loading') {
    setBadge();
  }
  console.log('onUpdated called: ' + tabId + ', ' + "status: " + status);
});

chrome.tabs.onActivated.addListener(async (tab) => {
  console.log('onActivated: ' + tab.tabId);
  try {
    const result = await chrome.scripting.executeScript({
      target: {tabId: tab.tabId},
      func: () => window.normalizerOn,
    });
    console.log(JSON.stringify(result));
    const on = result[0].result;
    setBadge(on);
    tabs[tab.tabId] = {
      ...tabs[tab.tabId],
      on,
    };
  } catch (err) {
    console.log(`Failed to check onActivated: ${err}`);
    setBadge();
  }
});

