import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import SupportScreen, { SUPPORT_LOAD_TIMEOUT_MS } from './SupportScreen';
import { FakeBillingClient } from '../../support/fakeBillingClient';
import { SUPPORT_TEXT } from '../../content/support';

function makeClient() {
  const client = new FakeBillingClient();
  // Play may return them in any order
  client.products = [
    { id: 'support_399', price: '₹399.00' },
    { id: 'support_49', price: '₹49.00' },
    { id: 'support_199', price: '₹199.00' },
    { id: 'support_99', price: '₹99.00' },
  ];
  return client;
}

describe('SupportScreen', () => {
  it('should show why support helps and the four amounts in order', async () => {
    const { findByTestId, getByText, getAllByRole } = render(
      <SupportScreen onBack={() => {}} client={makeClient()} />,
    );
    await findByTestId('support-support_49');

    expect([
      !!getByText(SUPPORT_TEXT.why),
      getAllByRole('button')
        .map(b => b.props.accessibilityLabel)
        .filter(Boolean)
        .slice(1),
    ]).toEqual([
      true,
      [
        'Support with ₹49.00',
        'Support with ₹99.00',
        'Support with ₹199.00',
        'Support with ₹399.00',
      ],
    ]);
  });

  it('should buy, consume and say thank you, and allow buying again', async () => {
    const client = makeClient();
    const { findByTestId, getByTestId } = render(
      <SupportScreen onBack={() => {}} client={client} />,
    );
    fireEvent.press(await findByTestId('support-support_99'));

    await act(async () =>
      client.complete({
        productId: 'support_99',
        token: 't1',
        state: 'purchased',
      }),
    );

    expect([
      client.bought,
      client.consumed,
      !!getByTestId('support-thanks'),
      getByTestId('support-support_99').props.accessibilityState.disabled,
    ]).toEqual([['support_99'], ['t1'], true, false]);
  });

  it('should show Payment pending for a pending purchase', async () => {
    const client = makeClient();
    const { findByTestId } = render(
      <SupportScreen onBack={() => {}} client={client} />,
    );
    fireEvent.press(await findByTestId('support-support_49'));

    await act(async () =>
      client.complete({
        productId: 'support_49',
        token: 't',
        state: 'pending',
      }),
    );

    expect([
      (await findByTestId('support-pending')).props.children,
      client.consumed,
    ]).toEqual([SUPPORT_TEXT.pending, []]);
  });

  it('should show nothing more when the purchase is cancelled', async () => {
    const client = makeClient();
    const { findByTestId, queryByTestId, getByTestId } = render(
      <SupportScreen onBack={() => {}} client={client} />,
    );
    fireEvent.press(await findByTestId('support-support_49'));

    await act(async () => client.fail());

    expect([
      queryByTestId('support-thanks'),
      queryByTestId('support-pending'),
      getByTestId('support-support_49').props.accessibilityState.disabled,
    ]).toEqual([null, null, false]);
  });

  it('should say support is unavailable when Play billing is not', async () => {
    const client = makeClient();
    client.available = false;
    const { findByTestId } = render(
      <SupportScreen onBack={() => {}} client={client} />,
    );

    expect((await findByTestId('support-unavailable')).props.children).toBe(
      SUPPORT_TEXT.unavailable,
    );
  });

  it('should say support is unavailable when no products load', async () => {
    const client = new FakeBillingClient();
    const { findByTestId } = render(
      <SupportScreen onBack={() => {}} client={client} />,
    );

    expect(await findByTestId('support-unavailable')).toBeTruthy();
  });

  it('should disconnect when leaving the screen', async () => {
    const client = makeClient();
    const { findByTestId, unmount } = render(
      <SupportScreen onBack={() => {}} client={client} />,
    );
    await findByTestId('support-support_49');

    unmount();

    expect([client.connected, client.listeners]).toEqual([false, null]);
  });

  it('should say support is unavailable when Play takes too long', async () => {
    jest.useFakeTimers();
    try {
      const client = makeClient();
      client.connect = () => new Promise(() => {});
      const { getByTestId } = render(
        <SupportScreen onBack={() => {}} client={client} />,
      );

      await act(async () => {
        jest.advanceTimersByTime(SUPPORT_LOAD_TIMEOUT_MS);
      });

      expect(getByTestId('support-unavailable')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
