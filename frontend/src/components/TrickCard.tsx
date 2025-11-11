import React from 'react';
import { View, Text, Image } from 'react-native';

export default function TrickCard({ trick }) {
  return (
    <View style={{ flexDirection: 'row', padding: 8, borderBottomColor: '#eee', borderBottomWidth: 1 }}>
      <Image source={{ uri: trick.images?.[0] || 'https://via.placeholder.com/150' }} style={{ width: 80, height: 80, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{trick.name}</Text>
        <Text style={{ color: '#666' }}>{trick.level}</Text>
      </View>
    </View>
  );
}
