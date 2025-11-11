import * as InAppPurchases from 'expo-in-app-purchases';
import { log, warn } from '../utils/logger';

export async function connectPurchases() {
  log('Connecting to InAppPurchases...');
  await InAppPurchases.connectAsync();
  log('Connected InAppPurchases');
}

export async function getProductsAsync(productIds = []) {
  log('Requesting products', productIds);
  const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);
  log('Products resp', responseCode, results);
  return { responseCode, results };
}

export async function purchaseItemAsync(productId) {
  log('purchaseItemAsync', productId);
  const res = await InAppPurchases.purchaseItemAsync(productId);
  log('purchaseItemAsync result', res);
  return res;
}

export async function finishTransactionAsync(purchase, isConsumed = true) {
  try {
    await InAppPurchases.finishTransactionAsync(purchase, isConsumed);
    log('finishTransactionAsync ok', purchase.productId);
  } catch (e) {
    warn('finishTransactionAsync error', e);
  }
}
