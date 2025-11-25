// app/services/notificationService.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { FIREBASE_FIRESTORE } from '../../configuration/FirebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationToken = null;
  }

  // ============ PERMISSIONS ============
  
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.log('⚠️ Les notifications ne fonctionnent que sur un appareil physique');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permission de notification refusée');
        return false;
      }

      console.log('✅ Permission de notification accordée');

      // Configuration spécifique Android
      if (Platform.OS === 'android') {
        // Channel pour les paies
        await Notifications.setNotificationChannelAsync('payday-reminders', {
          name: 'Rappels de paie',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#48BB78',
          sound: 'default',
        });
        
        // Channel pour les factures/dépenses
        await Notifications.setNotificationChannelAsync('expense-reminders', {
          name: 'Rappels de factures',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E53E3E',
          sound: 'default',
        });
      }

      // Note: On n'a pas besoin de getExpoPushTokenAsync() pour les notifications locales
      // Si tu veux ajouter des notifications push serveur plus tard, décommente:
      // const token = await Notifications.getExpoPushTokenAsync({
      //   projectId: 'ton-project-id-expo'
      // });
      // this.notificationToken = token.data;

      return true;
    } catch (error) {
      console.error('❌ Erreur permissions:', error);
      return false;
    }
  }

  // ============ PLANIFICATION DES NOTIFICATIONS ============

  async schedulePaydayNotifications(incomeSources, userId) {
    try {
      // Annuler toutes les notifications existantes de paies
      await this.cancelNotificationsByType('payday');

      if (!incomeSources || incomeSources.length === 0) {
        console.log('⚠️ Aucune source de revenu à planifier');
        return 0;
      }

      const now = new Date();
      let scheduledCount = 0;

      for (const source of incomeSources) {
        const nextPayday = new Date(source.nextPayday);

        // Vérifier si la date est dans le futur
        if (nextPayday <= now) {
          console.log(`⚠️ Date passée pour ${source.label}, skip`);
          continue;
        }

        // Planifier la notification pour le jour de la paie à 9h00
        const notificationDate = new Date(nextPayday);
        notificationDate.setHours(9, 0, 0, 0);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💰 C\'est jour de paie!',
            body: `As-tu reçu ton paiement de ${source.amount}$ (${source.label})?`,
            data: {
              type: 'payday_confirmation',
              sourceId: source.id,
              sourceLabel: source.label,
              amount: source.amount,
              frequency: source.frequency,
              scheduledDate: source.nextPayday,
              userId: userId,
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'payday',
          },
          trigger: {
            date: notificationDate,
            channelId: Platform.OS === 'android' ? 'payday-reminders' : undefined,
          },
        });

        console.log(`✅ Notification planifiée pour ${source.label} le ${notificationDate.toLocaleDateString()}`);
        console.log(`   ID: ${notificationId}`);
        scheduledCount++;

        // Sauvegarder l'ID de notification dans Firebase pour référence
        await this.saveNotificationId(userId, `payday_${source.id}`, notificationId);
      }

      console.log(`🎉 ${scheduledCount} notifications de paies planifiées avec succès`);
      return scheduledCount;

    } catch (error) {
      console.error('❌ Erreur planification notifications paies:', error);
      throw error;
    }
  }

  async scheduleExpenseNotifications(recurringExpenses, userId) {
    try {
      // Annuler toutes les notifications existantes de factures
      await this.cancelNotificationsByType('expense');

      if (!recurringExpenses || recurringExpenses.length === 0) {
        console.log('⚠️ Aucune dépense récurrente à planifier');
        return 0;
      }

      const now = new Date();
      let scheduledCount = 0;

      for (const expense of recurringExpenses) {
        const nextDate = new Date(expense.nextDate);

        // Vérifier si la date est dans le futur
        if (nextDate <= now) {
          console.log(`⚠️ Date passée pour ${expense.name}, skip`);
          continue;
        }

        // Planifier la notification pour le jour de la facture à 10h00
        const notificationDate = new Date(nextDate);
        notificationDate.setHours(10, 0, 0, 0);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💳 Rappel de facture!',
            body: `As-tu payé ${expense.name} (${expense.amount}$)?`,
            data: {
              type: 'expense_confirmation',
              expenseId: expense.id,
              expenseName: expense.name,
              amount: expense.amount,
              frequency: expense.frequency,
              category: expense.category,
              scheduledDate: expense.nextDate,
              userId: userId,
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'expense',
          },
          trigger: {
            date: notificationDate,
            channelId: Platform.OS === 'android' ? 'expense-reminders' : undefined,
          },
        });

        console.log(`✅ Notification planifiée pour ${expense.name} le ${notificationDate.toLocaleDateString()}`);
        console.log(`   ID: ${notificationId}`);
        scheduledCount++;

        // Sauvegarder l'ID de notification dans Firebase pour référence
        await this.saveNotificationId(userId, `expense_${expense.id}`, notificationId);
      }

      console.log(`🎉 ${scheduledCount} notifications de factures planifiées avec succès`);
      return scheduledCount;

    } catch (error) {
      console.error('❌ Erreur planification notifications factures:', error);
      throw error;
    }
  }

  async scheduleAllNotifications(incomeSources, recurringExpenses, userId) {
    try {
      console.log('🔔 Planification de toutes les notifications...');
      
      const paydayCount = await this.schedulePaydayNotifications(incomeSources, userId);
      const expenseCount = await this.scheduleExpenseNotifications(recurringExpenses, userId);
      
      const total = paydayCount + expenseCount;
      console.log(`🎉 Total: ${total} notifications planifiées (${paydayCount} paies + ${expenseCount} factures)`);
      
      return { paydayCount, expenseCount, total };
    } catch (error) {
      console.error('❌ Erreur planification toutes notifications:', error);
      throw error;
    }
  }

  async saveNotificationId(userId, sourceId, notificationId) {
    try {
      const userRef = doc(FIREBASE_FIRESTORE, 'users', userId);
      await updateDoc(userRef, {
        [`notificationIds.${sourceId}`]: notificationId,
      });
    } catch (error) {
      console.error('❌ Erreur sauvegarde notification ID:', error);
    }
  }

  // ============ ANNULATION DES NOTIFICATIONS ============

  async cancelAllPaydayNotifications() {
    try {
      await this.cancelNotificationsByType('payday');
      console.log('✅ Toutes les notifications de paies annulées');
    } catch (error) {
      console.error('❌ Erreur annulation notifications paies:', error);
    }
  }

  async cancelAllExpenseNotifications() {
    try {
      await this.cancelNotificationsByType('expense');
      console.log('✅ Toutes les notifications de factures annulées');
    } catch (error) {
      console.error('❌ Erreur annulation notifications factures:', error);
    }
  }

  async cancelNotificationsByType(type) {
    try {
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of allNotifications) {
        const notifType = notification.content.data?.type;
        if (
          (type === 'payday' && notifType === 'payday_confirmation') ||
          (type === 'expense' && notifType === 'expense_confirmation')
        ) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      console.log(`✅ Notifications de type ${type} annulées`);
    } catch (error) {
      console.error(`❌ Erreur annulation notifications ${type}:`, error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Toutes les notifications annulées');
    } catch (error) {
      console.error('❌ Erreur annulation notifications:', error);
    }
  }

  async cancelNotificationForSource(sourceId, userId) {
    try {
      // Récupérer l'ID de notification depuis Firebase
      const userRef = doc(FIREBASE_FIRESTORE, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const notificationId = userDoc.data().notificationIds?.[sourceId];
        if (notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
          console.log(`✅ Notification annulée pour source ${sourceId}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur annulation notification:', error);
    }
  }

  // ============ GESTION DES CLICS SUR NOTIFICATIONS ============

  setupNotificationListener(navigation) {
    // Listener pour quand l'app est au premier plan
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notification reçue (foreground):', notification);
    });

    // Listener pour quand l'utilisateur clique sur la notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      
      const data = response.notification.request.content.data;
      
      if (data.type === 'payday_confirmation') {
        // Naviguer vers l'écran de confirmation de paie
        navigation.navigate('ConfirmPaycheck', {
          sourceId: data.sourceId,
          sourceLabel: data.sourceLabel,
          amount: data.amount,
          frequency: data.frequency,
          scheduledDate: data.scheduledDate,
          userId: data.userId,
        });
      } else if (data.type === 'expense_confirmation') {
        // Naviguer vers l'écran de confirmation de facture
        navigation.navigate('ConfirmExpense', {
          expenseId: data.expenseId,
          expenseName: data.expenseName,
          amount: data.amount,
          frequency: data.frequency,
          category: data.category,
          scheduledDate: data.scheduledDate,
          userId: data.userId,
        });
      }
    });

    // Retourner les subscriptions pour cleanup
    return () => {
      Notifications.removeNotificationSubscription(foregroundSubscription);
      Notifications.removeNotificationSubscription(responseSubscription);
    };
  }

  // ============ NOTIFICATIONS MANUELLES (POUR TESTS) ============

  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test de notification',
          body: 'Si tu vois ce message, les notifications fonctionnent!',
          data: { type: 'test' },
        },
        trigger: null, // Envoyer immédiatement
      });
      console.log('✅ Notification de test envoyée');
    } catch (error) {
      console.error('❌ Erreur notification test:', error);
    }
  }

  // ============ UTILITAIRES ============

  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Notifications planifiées:', notifications.length);
      notifications.forEach(notif => {
        console.log(`   - ${notif.content.title} le ${new Date(notif.trigger.date).toLocaleDateString()}`);
      });
      return notifications;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  // Calculer la prochaine date de paie selon la fréquence
  calculateNextPayday(currentPayday, frequency) {
    const date = new Date(currentPayday);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        console.error('❌ Fréquence inconnue:', frequency);
    }
    
    return date.toISOString();
  }

  // ============ CONFIRMATION DE PAIE ============

  async confirmPaycheck(userId, sourceId, amount, currentPayday, frequency) {
    try {
      console.log('🔄 Confirmation de paie...');
      console.log('   User:', userId);
      console.log('   Source:', sourceId);
      console.log('   Montant:', amount);

      // Calculer la prochaine date de paie
      const nextPayday = this.calculateNextPayday(currentPayday, frequency);
      console.log('   Prochaine paie:', nextPayday);

      // Mettre à jour Firebase
      const userRef = doc(FIREBASE_FIRESTORE, 'users', userId);
      
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const incomeSources = userData.incomeSources || [];
        
        // Trouver et mettre à jour la source
        const updatedSources = incomeSources.map(source => {
          if (source.id === sourceId) {
            return {
              ...source,
              nextPayday: nextPayday,
              lastConfirmedPayday: new Date().toISOString(),
            };
          }
          return source;
        });
        
        // Recalculer le revenu reçu du mois
        const currentReceived = userData.receivedMonthIncome || 0;
        const newReceived = currentReceived + parseFloat(amount);
        
        await updateDoc(userRef, {
          incomeSources: updatedSources,
          receivedMonthIncome: newReceived,
          lastPaycheckConfirmed: new Date().toISOString(),
        });
        
        console.log('✅ Paie confirmée dans Firebase');
        
        // Replanifier les notifications avec la nouvelle date
        await this.schedulePaydayNotifications(updatedSources, userId);
        
        return { success: true, nextPayday, newReceived };
      } else {
        throw new Error('Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur confirmation paie:', error);
      throw error;
    }
  }

  // ============ CONFIRMATION DE PAIEMENT DE FACTURE ============

  async confirmExpense(userId, expenseId, amount, currentDate, frequency, category) {
    try {
      console.log('🔄 Confirmation de paiement de facture...');
      console.log('   User:', userId);
      console.log('   Facture:', expenseId);
      console.log('   Montant:', amount);

      // Calculer la prochaine date de paiement
      const nextDate = this.calculateNextPayday(currentDate, frequency); // Même logique
      console.log('   Prochain paiement:', nextDate);

      // Mettre à jour Firebase
      const userRef = doc(FIREBASE_FIRESTORE, 'users', userId);
      
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const recurringExpenses = userData.recurringExpenses || [];
        
        // Trouver et mettre à jour la dépense
        const updatedExpenses = recurringExpenses.map(expense => {
          if (expense.id === expenseId) {
            return {
              ...expense,
              nextDate: nextDate,
              lastConfirmedDate: new Date().toISOString(),
            };
          }
          return expense;
        });
        
        // Créer ou mettre à jour l'historique des paiements
        const paymentHistory = userData.expensePaymentHistory || [];
        paymentHistory.push({
          expenseId: expenseId,
          amount: parseFloat(amount),
          paidDate: new Date().toISOString(),
          category: category,
        });
        
        await updateDoc(userRef, {
          recurringExpenses: updatedExpenses,
          expensePaymentHistory: paymentHistory,
          lastExpenseConfirmed: new Date().toISOString(),
        });
        
        console.log('✅ Facture confirmée dans Firebase');
        
        // Replanifier les notifications avec la nouvelle date
        await this.scheduleExpenseNotifications(updatedExpenses, userId);
        
        return { success: true, nextDate };
      } else {
        throw new Error('Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur confirmation facture:', error);
      throw error;
    }
  }
}

// Exporter une instance unique
const notificationService = new NotificationService();
export default notificationService;