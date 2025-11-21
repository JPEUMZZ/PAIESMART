// app/index.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../configuration/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      try {
        if (!user) {
          // Pas connecté → login
          console.log('👤 Utilisateur non connecté → /login');
          router.replace('/login');
        } else {
          // Connecté → vérifier onboarding
          console.log('👤 Utilisateur connecté:', user.email);
          
          const userDoc = await getDoc(doc(FIREBASE_FIRESTORE, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📦 Données utilisateur:', userData);
            
            if (userData.onboardingCompleted) {
              // Onboarding complété → home
              console.log('✅ Onboarding complété → /home');
              router.replace('/home');
            } else {
              // Onboarding non complété → welcome
              console.log('⏳ Onboarding non complété → /screens/onboarding/Welcome');
              router.replace('/screens/onboarding/Welcome');
            }
          } else {
            // Nouveau compte sans données → onboarding
            console.log('🆕 Nouveau compte → /screens/onboarding/Welcome');
            router.replace('/screens/onboarding/Welcome');
          }
        }
      } catch (error) {
        console.error('❌ Erreur vérification:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
});