import React from 'react';
import { View, Text, Button, Image, ScrollView } from 'react-native';
import useAds from '../hooks/useAds';
import { log } from '../utils/logger';

export default function TrickDetailScreen({ route, navigation }) {
  const trick = route.params.trick;
  const { showRewardedAndUnlock } = useAds();
  const userId = localStorage.getItem('userId');

  const onWatchAd = async () => {
    log('TrickDetailScreen.onWatchAd', trick.id || trick._id);
    try {
      const resp = await showRewardedAndUnlock({ trickId: trick._id || trick.id, userId });
      log('ad reward resp', resp);
      if (resp.success) {
        alert('Unlocked!');
        navigation.goBack();
      } else {
        alert(resp.message || 'No reward');
      }
      } catch (e) {
        console.warn('Ad failed or was not watched', e);
        alert('Ad failed or was not watched');
      }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24 }}>{trick.name}</Text>
      <Text>{trick.description}</Text>
      {(trick.images || []).map((src, i) => (
        <Image key={i} style={{ height: 180, marginVertical: 8 }} source={{ uri: src }} />
      ))}
      <View style={{ marginVertical: 16 }}>
        <Button title="Watch Ad to Unlock" onPress={onWatchAd} />
        <Button title="Open Quiz" onPress={() => navigation.navigate('Quiz', { trickId: trick._id || trick.id })} />
      </View>
    </ScrollView>
  );
}
