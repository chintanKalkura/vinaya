import React, { useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CircleCheck,
  Cloud,
  LayoutGrid,
  ListChecks,
  LucideIcon,
  Snowflake,
} from 'lucide-react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { WALKTHROUGH_CARDS } from '../../content/howToUse';

// First-launch walkthrough: docs/style-choices/how-to-use/walkthrough-and-help.md
const ICONS: Record<string, LucideIcon> = {
  habits: ListChecks,
  mark: CircleCheck,
  streaks: Snowflake,
  groups: LayoutGrid,
  backup: Cloud,
};

interface WalkthroughScreenProps {
  visible: boolean;
  onDone: () => void; // Skip, Get started and Android back
}

export default function WalkthroughScreen({
  visible,
  onDone,
}: WalkthroughScreenProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const last = page === WALKTHROUGH_CARDS.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const next = () => {
    if (last) {
      onDone();
      return;
    }
    scroller.current?.scrollTo({ x: (page + 1) * width, animated: true });
    setPage(page + 1);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDone}
      onShow={() => setPage(0)}
    >
      <View
        testID="walkthrough"
        style={[
          styles.screen,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.top}>
          <Pressable
            testID="walkthrough-skip"
            accessibilityRole="button"
            onPress={onDone}
            style={styles.skip}
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
        >
          {WALKTHROUGH_CARDS.map(card => {
            const Icon = ICONS[card.key];
            return (
              <View
                key={card.key}
                testID={`walkthrough-card-${card.key}`}
                style={[styles.card, { width }]}
              >
                <Icon color={colors.v2Orange} size={88} strokeWidth={1.5} />
                <Text accessibilityRole="header" style={styles.title}>
                  {card.title}
                </Text>
                <Text style={styles.body}>{card.body}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`Card ${page + 1} of ${WALKTHROUGH_CARDS.length}`}
        >
          {WALKTHROUGH_CARDS.map((card, i) => (
            <View
              key={card.key}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          testID="walkthrough-next"
          accessibilityRole="button"
          onPress={next}
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>
            {last ? 'Get started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.v2Background,
    },
    top: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 8,
    },
    skip: {
      minHeight: 48,
      minWidth: 48,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipLabel: {
      color: colors.v2GreyText,
      fontSize: 16,
      fontWeight: '600',
    },
    card: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      paddingHorizontal: 32,
    },
    title: {
      color: colors.v2White,
      fontFamily: 'serif',
      fontStyle: 'italic',
      fontSize: 26,
      textAlign: 'center',
    },
    body: {
      color: colors.v2GreyText,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.v2Border,
    },
    dotActive: {
      width: 20,
      backgroundColor: colors.v2Orange,
    },
    primary: {
      minHeight: 52,
      marginHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.v2Orange,
    },
    primaryLabel: {
      color: colors.v2Background,
      fontSize: 16,
      fontWeight: '700',
    },
  });
