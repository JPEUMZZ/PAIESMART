// app/screens/onboarding/NotificationSettings.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';

const NOTIFICATION_OPTIONS = [
  {
    id: 'paydayReminder',
    icon: '💰',
    title: 'Rappel de paie',
    description: 'Reçois une notification le jour de ta paie',
    recommended: true,
  },
  {
    id: 'budgetAlerts',
    icon: '⚠️',
    title: 'Alertes budget',
    description: 'Sois averti(e) quand tu approches tes limites',
    recommended: true,
  },
  {
    id: 'goalProgress',
    icon: '🎯',
    title: 'Progression des objectifs',
    description: 'Célèbre tes progrès d\'épargne',
    recommended: false,
  },
  {
    id: 'billReminders',
    icon: '📅',
    title: 'Rappel de factures',
    description: 'Ne manque jamais une date limite',
    recommended: true,
  },
];

export default function NotificationSettings() {
  const router = useRouter();
  const { notificationSettings, setNotificationSettings, setCurrentStep } = useOnboardingStore();
  
  const [settings, setSettings] = useState(notificationSettings);

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNext = () => {
    setNotificationSettings(settings);
    setCurrentStep(6);
    router.push('/screens/onboarding/Complete');
  };

  const handleSkip = () => {
    setCurrentStep(6);
    router.push('/screens/onboarding/Complete');
  };

  const handleBack = () => {
    router.back();
  };

  const enabledCount = Object.values(settings).filter(Boolean).length;
  const progress = (5 / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.stepLabel}>Étape 5 sur 7</Text>
          <Text style={styles.title}>Notifications 🔔</Text>
          <Text style={styles.subtitle}>
            Reste informé(e) sans être submergé(e)
          </Text>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>✨</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>
                {enabledCount} notification{enabledCount !== 1 ? 's' : ''} activée{enabledCount !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.summaryText}>
                Tu peux modifier ces paramètres à tout moment
              </Text>
            </View>
          </View>

          {/* Notification Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisis tes préférences</Text>
            {NOTIFICATION_OPTIONS.map((option) => (
              <View key={option.id} style={styles.optionCard}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>{option.icon}</Text>
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    {option.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommandé</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Switch
                  value={settings[option.id]}
                  onValueChange={() => toggleSetting(option.id)}
                  trackColor={{ false: '#E2E8F0', true: '#9AE6B4' }}
                  thumbColor={settings[option.id] ? '#48BB78' : '#CBD5E0'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            ))}
          </View>

          {/* Info Boxes */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🔐</Text>
            <Text style={styles.infoText}>
              Tes notifications sont privées et sécurisées. Nous n'envoyons jamais d'informations sensibles.
            </Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: '#FFF5E6', marginTop: 12 }]}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={[styles.infoText, { color: '#92400E' }]}>
              Les notifications sont envoyées intelligemment pour ne pas te déranger pendant ton sommeil.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Passer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continuer</Text>
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
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
  },
  progress: {
    height: '100%',
    backgroundColor: '#48BB78',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  stepLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 24,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#48BB78',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#718096',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  recommendedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
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
  footer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#48BB78',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});