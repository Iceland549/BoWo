import { useCallback } from 'react';
import { AdService } from '../services/adService';
import api from '../api/api';
import { log, warn } from '../utils/logger';

/**
 * Hook that triggers a rewarded ad and notifies backend to unlock a trick
 */
export default function useAds() {
  const showRewardedAndUnlock = useCallback(async ({ trickId, userId }) => {
    log('useAds.showRewardedAndUnlock', { trickId, userId });
    return new Promise((resolve, reject) => {
      AdService.showRewarded({
        onEarn: async () => {
          try {
            // communicate to backend that ad was watched — backend may verify adToken if needed
            const resp = await api.post('/content/quiz/ad/reward', { trickId, adToken: 'client-test-token' });
            log('ad reward backend resp', resp.data);
            resolve(resp.data);
          } catch (err) {
            warn('ad reward backend error', err);
            reject(err);
          }
        },
        onFail: (err) => {
          warn('ad playback failed', err);
          reject(err);
        }
      });
    });
  }, []);
  return { showRewardedAndUnlock };
}
