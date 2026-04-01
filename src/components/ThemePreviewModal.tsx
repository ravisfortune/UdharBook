import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeId, themeHtmlClass, themeMeta } from '@theme/themes';
import { PREVIEW_HTML } from '@utils/themePreviewHtml';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@theme/tokens';

interface Props {
  visible: boolean;
  themeId: ThemeId;
  onClose: () => void;
  onSelect: (themeId: ThemeId) => void;
}

export default function ThemePreviewModal({ visible, themeId, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const meta = themeMeta[themeId];

  // Inject JS to apply the correct theme class to <body>
  const injectedJS = `
    (function() {
      var cls = '${themeHtmlClass[themeId]}';
      document.body.className = cls;
      // Hide theme selector buttons inside the HTML if any
      var themeBar = document.getElementById('theme-bar');
      if (themeBar) themeBar.style.display = 'none';
      // Scroll to top
      window.scrollTo(0, 0);
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEmoji}>{meta.emoji}</Text>
            <Text style={styles.headerTitle}>{meta.label} Theme</Text>
          </View>
          <TouchableOpacity
            onPress={() => { onSelect(themeId); onClose(); }}
            style={styles.applyBtn}
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>Loading preview…</Text>
          </View>
        )}
        <WebView
          style={[styles.webview, loading && styles.hidden]}
          source={{ html: PREVIEW_HTML, baseUrl: '' }}
          injectedJavaScript={injectedJS}
          onLoadEnd={() => setLoading(false)}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled={false}
          originWhitelist={['*']}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLowest },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceLowest,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerEmoji: { fontSize: 18 },
  headerTitle: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  applyText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: '#ffffff',
  },
  webview: { flex: 1 },
  hidden: { opacity: 0, height: 0 },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loaderText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
});
