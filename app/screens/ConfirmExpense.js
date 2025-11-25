
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notificationService';
import { FIREBASE_AUTH } from '../../configuration/FirebaseConfig';

export default function ConfirmExpense() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    expenseId,
    expenseName,
    amount,
    frequency,
    category,
    scheduledDate,
  } = params;

  const handleConfirmPaid = async () => {
    setLoading(true);
    
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        return;
      }

      console.log('✅ Confirmation de paiement...');
      const result = await notificationService.confirmExpense(
        userId,
        expenseId,
        parseFloat(amount),
        scheduledDate,
        frequency,
        category
      );

      console.log('🎉 Paiement confirmé:', result);

      Alert.alert(
        '✅ Paiement confirmé!',
        `${expenseName} a été marqué comme payé.\n\nProchain paiement: ${new Date(result.nextDate).toLocaleDateString('fr-CA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/screens/home'),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Erreur confirmation:', error);
      Alert.alert(
        'Erreur',
        'Impossible de confirmer le paiement. Réessaye plus tard.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotPaid = () => {
    Alert.alert(
      '⚠️ Paiement non effectué',
      'Tu n\'as pas encore payé cette facture? On te rappellera demain.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Rappeler demain',
          onPress: async () => {
            try {
              // Créer une notification pour demain
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(10, 0, 0, 0);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: '💳 Rappel: As-tu payé cette facture?',
                  body: `${expenseName}: ${amount}$`,
                  data: {
                    type: 'expense_confirmation',
                    expenseId,
                    expenseName,
                    amount,
                    frequency,
                    category,
                    scheduledDate,
                    userId: FIREBASE_AUTH.currentUser?.uid,
                  },
                },
                trigger: {
                  date: tomorrow,
                },
              });

              Alert.alert('✅', 'On te rappellera demain à 10h00');
              router.replace('/screens/home');
            } catch (error) {
              console.error('❌ Erreur rappel:', error);
            }
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Ignorer',
      'Tu pourras confirmer le paiement plus tard depuis le dashboard.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Ignorer',
          style: 'destructive',
          onPress: () => router.replace('/screens/home'),
        },
      ]
    );
  };

  const frequencyLabels = {
    weekly: 'Hebdomadaire',
    biweekly: 'Bihebdomadaire',
    monthly: 'Mensuelle',
  };

  const categoryEmojis = {
    logement: '🏠',
    transport: '🚗',
    alimentation: '🍔',
    services: '📱',
    assurance: '🛡️',
    abonnement: '📺',
    autre: '💳',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icône */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{categoryEmojis[category] || '💳'}</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>Rappel de paiement</Text>
        <Text style={styles.subtitle}>As-tu payé cette facture?</Text>

        {/* Détails de la facture */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Facture</Text>
            <Text style={styles.detailValue}>{expenseName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant</Text>
            <Text style={styles.amountValue}>{parseFloat(amount).toFixed(2)} $</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fréquence</Text>
            <Text style={styles.detailValue}>{frequencyLabels[frequency]}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date prévue</Text>
            <Text style={styles.detailValue}>{formatDate(scheduledDate)}</Text>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            En confirmant, la prochaine date de paiement sera calculée automatiquement selon ta fréquence.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.buttonDisabled]}
          onPress={handleConfirmPaid}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>✓ Oui, j'ai payé</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notPaidButton}
          onPress={handleNotPaid}
          disabled={loading}
        >
          <Text style={styles.notPaidButtonText}>✗ Non, pas encore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Ignorer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#718096',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53E3E',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#C53030',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 24,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#48BB78',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notPaidButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  notPaidButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});