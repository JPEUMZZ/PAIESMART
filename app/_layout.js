// app/_layout.js
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="Signup" />
      <Stack.Screen name="screens/onboarding/Welcome" />
      <Stack.Screen name="screens/onboarding/PayFrequency" />
      <Stack.Screen name="screens/onboarding/NetIncome" />
      <Stack.Screen name="home" />
    </Stack>
  );
}