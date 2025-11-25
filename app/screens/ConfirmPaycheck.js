// app/screens/ConfirmPaycheck.js
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

export default function ConfirmPaycheck() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    sourceId,
    sourceLabel,
    amount,
    frequency,
    scheduledDate,
  } = params;

  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        return;
      }

      console.log('✅ Confirmation de paie...');
      const result = await notificationService.confirmPaycheck(
        userId,
        sourceId,
        parseFloat(amount),
        scheduledDate,
        frequency
      );

      console.log('🎉 Paie confirmée:', result);

      Alert.alert(
        '🎉 Paie confirmée!',
        `Ton revenu a été mis à jour: ${parseFloat(amount).toFixed(2)}$\n\nProchaine paie: ${new Date(result.nextPayday).toLocaleDateString('fr-CA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}`,
        [
          {
            text: 'Voir mon dashboard',
            onPress: () => router.replace('/screens/home'),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Erreur confirmation:', error);
      Alert.alert(
        'Erreur',
        'Impossible de confirmer la paie. Réessaye plus tard.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotReceived = () => {
    Alert.alert(
      '⚠️ Paie non reçue',
      'Tu n\'as pas reçu ta paie? On te rappellera demain.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Rappeler demain',
          onPress: async () => {
            // Replanifier pour demain
            try {
              const userId = FIREBASE_AUTH.currentUser?.uid;
              if (!userId) return;

              // Créer une notification pour demain
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: '💰 Rappel: As-tu reçu ta paie?',
                  body: `${sourceLabel}: ${amount}$`,
                  data: {
                    type: 'payday_confirmation',
                    sourceId,
                    sourceLabel,
                    amount,
                    frequency,
                    scheduledDate,
                    userId,
                  },
                },
                trigger: {
                  date: tomorrow,
                },
              });

              Alert.alert('✅', 'On te rappellera demain à 9h00');
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
      'Tu pourras confirmer ta paie plus tard depuis le dashboard.',
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
          <Text style={styles.icon}>💰</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>C'est jour de paie!</Text>
        <Text style={styles.subtitle}>As-tu reçu ton paiement?</Text>

        {/* Détails de la paie */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source</Text>
            <Text style={styles.detailValue}>{sourceLabel}</Text>
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
            En confirmant, ton revenu sera mis à jour et la prochaine date de paie sera calculée automatiquement.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>✓ Oui, j'ai reçu ma paie</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notReceivedButton}
          onPress={handleNotReceived}
          disabled={loading}
        >
          <Text style={styles.notReceivedButtonText}>✗ Non, pas encore</Text>
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
    shadowColor: '#48BB78',
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
    color: '#48BB78',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
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
    color: '#2C5282',
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
  notReceivedButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  notReceivedButtonText: {
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