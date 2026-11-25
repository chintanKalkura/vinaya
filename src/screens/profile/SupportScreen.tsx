import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { SUPPORT_TEXT } from '../../content/support';
import {
  BillingClient,
  SUPPORT_PRODUCT_IDS,
  SupportProduct,
} from '../../support/BillingClient';
import { playBillingClient } from '../../support/playBillingClient';
import { PurchaseOutcome, handlePurchase } from '../../support/support';
import ScreenHeader from './ScreenHeader';

// Profile → Support the developer: docs/style-choices/profile/support.md
interface SupportScreenProps {
  onBack: () => void;
  client?: BillingClient; // a fake in tests
}

type Load = 'loading' | 'ready' | 'unavailable';

// Play can retry for a long time when it can't connect; after this the
// screen says support isn't available
export const SUPPORT_LOAD_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export default function SupportScreen({
  onBack,
  client = playBillingClient,
}: SupportScreenProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [load, setLoad] = useState<Load>('loading');
  const [products, setProducts] = useState<SupportProduct[]>([]);
  const [outcome, setOutcome] = useState<PurchaseOutcome>('none');
  const [buying, setBuying] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const stop = client.listen({
      onPurchase: purchase => {
        handlePurchase(client, purchase)
          .then(result => {
            if (mounted.current && result !== 'none') setOutcome(result);
          })
          .catch(() => {}) // left for the next app start to consume
          .finally(() => mounted.current && setBuying(false));
      },
      onError: () => setBuying(false), // Play shows its own message
    });

    const loadProducts = async () => {
      if (!(await client.connect())) throw new Error('unavailable');
      return client.loadProducts(SUPPORT_PRODUCT_IDS);
    };
    (async () => {
      try {
        const loaded = await withTimeout(
          loadProducts(),
          SUPPORT_LOAD_TIMEOUT_MS,
        );
        const ordered = SUPPORT_PRODUCT_IDS.map(id =>
          loaded.find(p => p.id === id),
        ).filter((p): p is SupportProduct => !!p);
        if (!mounted.current) return;
        setProducts(ordered);
        setLoad(ordered.length ? 'ready' : 'unavailable');
      } catch {
        if (mounted.current) setLoad('unavailable');
      }
    })();

    return () => {
      mounted.current = false;
      stop();
      client.disconnect();
    };
  }, [client]);

  const buy = (productId: string) => {
    setBuying(true);
    setOutcome('none');
    client.buy(productId).catch(() => setBuying(false));
  };

  return (
    <View testID="support-screen" style={styles.screen}>
      <ScreenHeader
        title="Support the developer"
        onBack={onBack}
        testID="support"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{SUPPORT_TEXT.why}</Text>

        {load === 'loading' ? (
          <ActivityIndicator
            testID="support-loading"
            color={colors.v2Orange}
            style={styles.spinner}
          />
        ) : null}

        {load === 'unavailable' ? (
          <Text testID="support-unavailable" style={styles.note}>
            {SUPPORT_TEXT.unavailable}
          </Text>
        ) : null}

        {load === 'ready' ? (
          <View style={styles.amounts}>
            {products.map(product => (
              <Pressable
                key={product.id}
                testID={`support-${product.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Support with ${product.price}`}
                accessibilityState={{ disabled: buying }}
                disabled={buying}
                onPress={() => buy(product.id)}
                style={[styles.amount, buying && styles.amountDisabled]}
              >
                <Text style={styles.amountLabel}>{product.price}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {outcome === 'thanks' ? (
          <Text testID="support-thanks" style={styles.thanks}>
            {SUPPORT_TEXT.thanks}
          </Text>
        ) : null}
        {outcome === 'pending' ? (
          <Text testID="support-pending" style={styles.note}>
            {SUPPORT_TEXT.pending}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.v2Background,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 32,
      gap: 20,
    },
    body: {
      color: colors.v2White,
      fontSize: 16,
      lineHeight: 24,
    },
    spinner: {
      marginTop: 16,
    },
    amounts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    amount: {
      flexGrow: 1,
      flexBasis: '40%',
      minHeight: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.v2Orange,
    },
    amountDisabled: {
      opacity: 0.6,
    },
    amountLabel: {
      color: colors.v2Background,
      fontSize: 18,
      fontWeight: '700',
    },
    thanks: {
      color: colors.v2Orange,
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
    },
    note: {
      color: colors.v2GreyText,
      fontSize: 15,
      lineHeight: 22,
    },
  });
