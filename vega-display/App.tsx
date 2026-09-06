import React, { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { WebView } from '@amazon-devices/webview';
import { bridge } from './bridge.generated';

const DISPLAY_URL = 'https://ijustcreate.github.io/toysoldierbrigade/#/tv';
const PAGE_ROOT = 'https://ijustcreate.github.io/toysoldierbrigade/';

export const App = () => {
  const [generation, setGeneration] = useState(0);
  const [notice, setNotice] = useState('Opening Recognition Boards…');
  const foreground = useRef(AppState.currentState === 'active');
  const healthyAt = useRef(Date.now());
  const failed = useRef(false);
  const retryAt = useRef(0);
  const retryDelay = useRef(10000);

  const fail = () => {
    if (failed.current) return;
    failed.current = true;
    retryAt.current = Date.now() + retryDelay.current;
    retryDelay.current = Math.min(retryDelay.current * 2, 60000);
    setNotice('Reconnecting to Recognition Boards…');
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      foreground.current = state === 'active';
      // Give a resumed WebView time to recover; do not reload a healthy/offline board.
      if (foreground.current) healthyAt.current = Date.now();
    });
    const timer = setInterval(() => {
      if (!foreground.current) return;
      if ((!failed.current && Date.now() - healthyAt.current > 90000)
        || (failed.current && Date.now() >= retryAt.current)) {
        failed.current = false;
        healthyAt.current = Date.now();
        setGeneration(value => value + 1);
      }
    }, 5000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, []);

  return <View style={styles.root}>
    <WebView
      key={generation}
      style={styles.web}
      source={{ uri: DISPLAY_URL }}
      hasTVPreferredFocus={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowJavaScriptInBackground={false}
      allowSystemKeyEvents={true}
      mediaPlaybackRequiresUserAction={false}
      thirdPartyCookiesEnabled={false}
      injectedJavaScriptBeforeContentLoaded={bridge}
      onShouldStartLoadWithRequest={request => request.url.startsWith(PAGE_ROOT)}
      onError={fail}
      onHttpError={event => { if (event.nativeEvent.isMainFrame) fail(); }}
      onMessage={event => {
        try {
          const message = JSON.parse(event.nativeEvent.data);
          if (message.type === 'ready' || message.type === 'heartbeat') {
            healthyAt.current = Date.now(); failed.current = false;
            retryDelay.current = 10000; setNotice('');
          } else if (message.type === 'storage-unavailable') {
            setNotice('This device could not remember the display selection.');
          }
        } catch { /* Ignore unknown page messages. */ }
      }}
    />
    {notice ? <View pointerEvents="none" style={styles.notice}><Text style={styles.text}>{notice}</Text></View> : null}
  </View>;
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#090d16' },
  web: { flex: 1 },
  notice: { position: 'absolute', bottom: 20, left: 20, right: 20, padding: 20, backgroundColor: '#152136' },
  text: { color: '#ffffff', fontSize: 24, textAlign: 'center' },
});

export default App;
