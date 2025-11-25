// app/screens/onboarding/BudgetPreferences.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';

const PRESET_BUDGETS = [
  {
    id: 'standard',
    name: 'Standard (50/30/20)',
    description: 'La règle classique recommandée',
    savings: 20,
    needs: 50,
    wants: 30,
  },
  {
    id: 'aggressive',
    name: 'Épargne agressive (40/40/20)',
    description: 'Pour épargner plus rapidement',
    savings: 40,
    needs: 40,
    wants: 20,
  },
  {
    id: 'balanced',
    name: 'Équilibré (30/40/30)',
    description: 'Plus d\'argent pour les loisirs',
    savings: 30,
    needs: 40,
    wants: 30,
  },
  {
    id: 'moderate',
    name: 'Modéré (25/50/25)',
    description: 'Entre standard et équilibré',
    savings: 25,
    needs: 50,
    wants: 25,
  },
];

export default function BudgetPreferences() {
  const router = useRouter();
  const { budgetPreferences, setBudgetPreferences, setCurrentStep } = useOnboardingStore();
  
  const [selectedPreset, setSelectedPreset] = useState('standard');
  const [savings, setSavings] = useState(budgetPreferences.savingsPercent);
  const [needs, setNeeds] = useState(budgetPreferences.needsPercent);
  const [wants, setWants] = useState(budgetPreferences.wantsPercent);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setSavings(preset.savings);
    setNeeds(preset.needs);
    setWants(preset.wants);
  };

  const handleNext = () => {
    setBudgetPreferences({
      savingsPercent: savings,
      needsPercent: needs,
      wantsPercent: wants,
    });

    setCurrentStep(5);
    router.push('/screens/onboarding/NotificationSettings');
  };

  const handleBack = () => {
    router.back();
  };

  const total = savings + needs + wants;
  const isValid = total === 100;

  const progress = (4 / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.stepLabel}>Étape 4 sur 7</Text>
          <Text style={styles.title}>Préférences de budget ⚖️</Text>
          <Text style={styles.subtitle}>
            Choisis comment tu veux répartir ton argent
          </Text>

          {/* Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modèles prédéfinis</Text>
            {PRESET_BUDGETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  selectedPreset === preset.id && styles.presetCardSelected,
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <View style={styles.presetHeader}>
                  <View style={styles.radio}>
                    {selectedPreset === preset.id && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.presetInfo}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetDescription}>{preset.description}</Text>
                  </View>
                </View>

                <View style={styles.presetBars}>
                  <View style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Text style={styles.barEmoji}>🎯</Text>
                      <Text style={styles.barText}>Épargne</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${preset.savings}%`, backgroundColor: '#48BB78' },
                        ]}
                      />
                    </View>
                    <Text style={styles.barPercent}>{preset.savings}%</Text>
                  </View>

                  <View style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Text style={styles.barEmoji}>🏠</Text>
                      <Text style={styles.barText}>Besoins</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${preset.needs}%`, backgroundColor: '#4299E1' },
                        ]}
                      />
                    </View>
                    <Text style={styles.barPercent}>{preset.needs}%</Text>
                  </View>

                  <View style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Text style={styles.barEmoji}>🎮</Text>
                      <Text style={styles.barText}>Loisirs</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${preset.wants}%`, backgroundColor: '#9F7AEA' },
                        ]}
                      />
                    </View>
                    <Text style={styles.barPercent}>{preset.wants}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Comment ça marche?</Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Épargne</Text>: Argent mis de côté pour tes objectifs{'\n'}
                <Text style={styles.infoBold}>Besoins</Text>: Dépenses essentielles (loyer, nourriture){'\n'}
                <Text style={styles.infoBold}>Loisirs</Text>: Sorties, hobbies, divertissement
              </Text>
            </View>
          </View>

          {/* Note personnalisable */}
          <View style={styles.noteBox}>
            <Text style={styles.noteIcon}>✨</Text>
            <Text style={styles.noteText}>
              Tu pourras ajuster ces pourcentages à tout moment depuis les paramètres
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  presetCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#48BB78',
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 14,
    color: '#718096',
  },
  presetBars: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  barEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  barText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  barPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
    width: 40,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#2C5282',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5E6',
    padding: 16,
    borderRadius: 12,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
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
  nextButton: {
    flex: 2,
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