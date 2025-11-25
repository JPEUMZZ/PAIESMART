// app/_layout.js
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Pages principales */}
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="Signup" />
      
      {/* Onboarding - Nouveau flux complet */}
      <Stack.Screen name="screens/onboarding/Welcome" />
      <Stack.Screen name="screens/onboarding/IncomeSetup" />
      <Stack.Screen name="screens/onboarding/RecurringExpenses" />
      <Stack.Screen name="screens/onboarding/SavingsGoals" />
      <Stack.Screen name="screens/onboarding/BudgetPreferences" />
      <Stack.Screen name="screens/onboarding/NotificationSettings" />
      <Stack.Screen name="screens/onboarding/Complete" />
      <Stack.Screen name="screens/ConfirmPaycheck" 
        options={{ 
          title: 'Confirmer la paie',
          presentation: 'modal',
          headerShown: true,
        }} 
      />
      <Stack.Screen name="screens/ConfirmExpense" 
        options={{ 
         title: 'Confirmer le paiement',
         presentation: 'modal',
         }} 
/>
      
      {/* Home */}
      <Stack.Screen name="screens/home" />
    </Stack>
  );
}