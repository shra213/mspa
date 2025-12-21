import { Stack } from 'expo-router';
import React from 'react';
// import 'react-native-reanimated';
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // show top header (you can hide later)
        animation: 'slide_from_right', // nice transition between screens
      }}
    >
    </Stack>
  );
}
