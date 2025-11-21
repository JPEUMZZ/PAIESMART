// app/screens/onboarding/NextPayday.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NextPayday() {
  const router = useRouter();
  const { nextPayday, setNextPayday, setCurrentStep } = useOnboardingStore();
  const [date, setDate] = useState(new Date(nextPayday));
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleNext = () => {
    setNextPayday(date);
    setCurrentStep(4);
    router.push('/screens/onboarding/Complete');
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-CA', options);
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '100%' }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.stepLabel}>Étape 3 sur 3</Text>
        <Text style={styles.title}>Quand reçois-tu ta prochaine paie ?</Text>
        <Text style={styles.subtitle}>
          On t'enverra une notification ce jour-là pour t'aider à gérer ton argent
        </Text>

        {/* Date Display */}
        <TouchableOpacity 
          style={styles.dateContainer}
          onPress={() => setShowPicker(true)}
        >
          <View style={styles.calendarIcon}>
            <Text style={styles.calendarEmoji}>📅</Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Date sélectionnée</Text>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </View>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>

        {/* Date Picker */}
        {(showPicker || Platform.OS === 'ios') && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              textColor="#2D3748"
            />
          </View>
        )}

        {Platform.OS === 'android' && showPicker === false && (
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.changeButtonText}>Changer la date</Text>
          </TouchableOpacity>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Tu recevras une notification le jour de ta paie avec un plan d'action personnalisé
          </Text>
        </View>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Terminer</Text>
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
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#48BB78',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F0FFF4',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  calendarEmoji: {
    fontSize: 24,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  editIcon: {
    fontSize: 20,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  changeButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  changeButtonText: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
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