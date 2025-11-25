// app/hooks/useNotifications.js
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import notificationService from '../services/notificationService';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../configuration/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Demander les permissions au premier lancement
    const initNotifications = async () => {
      try {
        const hasPermission = await notificationService.requestPermissions();
        
        if (hasPermission) {
          console.log('✅ Notifications initialisées');
          
          // Charger les données et replanifier si nécessaire
          const user = FIREBASE_AUTH.currentUser;
          if (user) {
            const userDoc = await getDoc(doc(FIREBASE_FIRESTORE, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const incomeSources = userData.incomeSources || [];
              const recurringExpenses = userData.recurringExpenses || [];
              
              // Replanifier toutes les notifications (au cas où l'app a été fermée longtemps)
              if (incomeSources.length > 0 || recurringExpenses.length > 0) {
                await notificationService.scheduleAllNotifications(
                  incomeSources,
                  recurringExpenses,
                  user.uid
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Erreur init notifications:', error);
      }
    };

    initNotifications();

    // Setup des listeners pour les clics sur notifications
    responseListener.current = notificationService.setupNotificationListener(router);

    // Cleanup
    return () => {
      if (responseListener.current) {
        responseListener.current();
      }
    };
  }, []);

  return {
    schedulePaydayNotifications: notificationService.schedulePaydayNotifications.bind(notificationService),
    scheduleExpenseNotifications: notificationService.scheduleExpenseNotifications.bind(notificationService),
    scheduleAllNotifications: notificationService.scheduleAllNotifications.bind(notificationService),
    cancelNotifications: notificationService.cancelAllNotifications.bind(notificationService),
    sendTestNotification: notificationService.sendTestNotification.bind(notificationService),
  };
}