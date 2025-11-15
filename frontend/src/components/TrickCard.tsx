import React from 'react';
import { View, Text, Image } from 'react-native';
import { MEDIA_BASE_URL } from '../config/env';

export default function TrickCard({ trick }) {
  const fallback = `${MEDIA_BASE_URL}/static/default.jpg`;

  const imageUrl =
    (trick.images && trick.images.length > 0 && trick.images[0]) ||
    fallback;

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 8,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 80, height: 80, marginRight: 12 }}
        resizeMode="cover"
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{trick.name}</Text>
        <Text style={{ color: '#666' }}>{trick.difficulty}</Text>
      </View>
    </View>
  );
}
