import { useCallback } from 'react';
import * as purchaseService from '../services/purchaseService';
import api from '../api/api';
import { log } from '../utils/logger';

export default function usePurchases() {
  const buyTrick = useCallback(async ({ productId, trickId, userId }) => {
    log('usePurchases.buyTrick', { productId, trickId, userId });
    await purchaseService.connectPurchases();
    const purchase = await purchaseService.purchaseItemAsync(productId);
    // On real flows, validate purchase on backend with purchase receipt / token:
    const validateResp = await api.post('/content/quiz/purchase/validate', { trickId, purchaseToken: purchase?.response?.purchaseToken });
    log('purchase validate resp', validateResp.data);
    return validateResp.data;
  }, []);
  return { buyTrick };
}
