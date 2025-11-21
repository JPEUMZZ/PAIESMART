import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';

const frequencies = [
  { id: 'weekly', label: 'Hebdomadaire', subtitle: 'Chaque semaine' },
  { id: 'biweekly', label: 'Bihebdomadaire', subtitle: 'Aux 2 semaines' },
  { id: 'monthly', label: 'Mensuelle', subtitle: '1 fois par mois' },
  { id: 'other', label: 'Irrégulier', subtitle: 'Montant variable' },
];

export default function PayFrequency() {
  const router = useRouter();
  const { payFrequency, setPayFrequency, setCurrentStep } = useOnboardingStore();
  const [selected, setSelected] = useState(payFrequency);

  const handleNext = () => {
    setPayFrequency(selected);
    setCurrentStep(2);
    router.push('/screens/onboarding/NetIncome');
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '33%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Étape 1 sur 3</Text>
        <Text style={styles.title}>À quelle fréquence reçois-tu ta paie ?</Text>

        <View style={styles.options}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.option,
                selected === freq.id && styles.optionSelected,
              ]}
              onPress={() => setSelected(freq.id)}
            >
              <View style={styles.radio}>
                {selected === freq.id && <View style={styles.radioDot} />}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{freq.label}</Text>
                <Text style={styles.optionSubtitle}>{freq.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>Suivant</Text>
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
  stepLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 24,
    marginHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 8,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  options: {
    paddingHorizontal: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#48BB78',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  footer: {
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#48BB78',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});