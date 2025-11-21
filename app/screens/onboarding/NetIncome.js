import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function NetIncome() {
  const router = useRouter();
  const { netIncome, setNetIncome, setCurrentStep } = useOnboardingStore();
  const [income, setIncome] = useState(netIncome);

  const handleNext = () => {
    if (income && parseFloat(income) > 0) {
      setNetIncome(income);
      setCurrentStep(3);
      router.push('/screens/onboarding/NextPayday');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '66%' }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.stepLabel}>Étape 2 sur 3</Text>
        <Text style={styles.title}>Quel est ton revenu NET par paie ?</Text>
        <Text style={styles.subtitle}>(après impôts et déductions)</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.input}
            value={income}
            onChangeText={setIncome}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#CBD5E0"
            autoFocus
          />
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Regarde ton dernier dépôt bancaire pour le montant exact
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!income || parseFloat(income) <= 0) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!income || parseFloat(income) <= 0}
        >
          <Text style={styles.buttonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 24,
  },
  stepLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#48BB78',
  },
  currency: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    paddingVertical: 20,
  },
  tip: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2C5282',
    lineHeight: 20,
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
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});