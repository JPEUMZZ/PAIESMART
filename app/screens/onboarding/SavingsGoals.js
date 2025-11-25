// app/screens/onboarding/SavingsGoals.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';
import DateTimePicker from '@react-native-community/datetimepicker';

// Suggestions d'objectifs populaires
const GOAL_SUGGESTIONS = [
  { name: "Fonds d'urgence", icon: "🛡️", suggestedAmount: 1000 },
  { name: "Voyage", icon: "✈️", suggestedAmount: 2000 },
  { name: "Nouvelle auto", icon: "🚗", suggestedAmount: 5000 },
  { name: "Mise de fonds maison", icon: "🏠", suggestedAmount: 10000 },
  { name: "Électronique", icon: "💻", suggestedAmount: 1500 },
  { name: "Mariage", icon: "💍", suggestedAmount: 5000 },
  { name: "Études", icon: "🎓", suggestedAmount: 3000 },
  { name: "Retraite", icon: "🌴", suggestedAmount: 10000 },
];

export default function SavingsGoals() {
  const router = useRouter();
  const { savingsGoals, addSavingsGoal, removeSavingsGoal, setCurrentStep } = useOnboardingStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [goalDeadline, setGoalDeadline] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddGoal = () => {
    if (!goalName.trim() || !goalAmount || parseFloat(goalAmount) <= 0) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    addSavingsGoal({
      name: goalName.trim(),
      targetAmount: parseFloat(goalAmount),
      deadline: hasDeadline ? goalDeadline.toISOString() : null,
    });

    // Reset form
    setGoalName('');
    setGoalAmount('');
    setHasDeadline(false);
    setGoalDeadline(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    setShowAddModal(false);
  };

  const handleSuggestionPress = (suggestion) => {
    setGoalName(suggestion.name);
    setGoalAmount(suggestion.suggestedAmount.toString());
    setShowAddModal(true);
  };

  const handleNext = () => {
    setCurrentStep(4);
    router.push('/screens/onboarding/BudgetPreferences');
  };

  const handleSkip = () => {
    setCurrentStep(4);
    router.push('/screens/onboarding/BudgetPreferences');
  };

  const handleBack = () => {
    router.back();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setGoalDeadline(selectedDate);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const progress = (3 / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.stepLabel}>Étape 3 sur 7</Text>
          <Text style={styles.title}>Objectifs d'épargne 🎯</Text>
          <Text style={styles.subtitle}>
            Définis tes objectifs financiers pour rester motivé(e)
          </Text>

          {/* Suggestions populaires */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objectifs populaires</Text>
            <View style={styles.suggestionsGrid}>
              {GOAL_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <Text style={styles.suggestionName}>{suggestion.name}</Text>
                  <Text style={styles.suggestionAmount}>
                    {suggestion.suggestedAmount.toLocaleString('fr-CA')} $
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Objectifs ajoutés */}
          {savingsGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tes objectifs ({savingsGoals.length})</Text>
              {savingsGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeSavingsGoal(goal.id)}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.goalAmount}>
                    <Text style={styles.goalCurrent}>0 $</Text>
                    <Text style={styles.goalTarget}>/ {goal.targetAmount.toLocaleString('fr-CA')} $</Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.goalProgressBar}>
                    <View style={[styles.goalProgressFill, { width: '0%' }]} />
                  </View>

                  {goal.deadline && (
                    <Text style={styles.goalDeadline}>
                      📅 Objectif: {formatDate(goal.deadline)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Bouton ajouter personnalisé */}
          <TouchableOpacity
            style={styles.addCustomButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addCustomIcon}>+</Text>
            <Text style={styles.addCustomText}>Ajouter un objectif personnalisé</Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Avoir des objectifs clairs aide à rester motivé. Tu pourras suivre ta progression et mettre à jour tes objectifs à tout moment.
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

      {/* Modal pour ajouter un objectif */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvel objectif</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Nom */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom de l'objectif</Text>
                <TextInput
                  style={styles.textInput}
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="Ex: Voyage, Auto, Fonds d'urgence..."
                  placeholderTextColor="#CBD5E0"
                />
              </View>

              {/* Montant */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant visé</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountTextInput}
                    value={goalAmount}
                    onChangeText={setGoalAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#CBD5E0"
                  />
                </View>
              </View>

              {/* Deadline toggle */}
              <TouchableOpacity
                style={styles.deadlineToggle}
                onPress={() => setHasDeadline(!hasDeadline)}
              >
                <View style={styles.checkbox}>
                  {hasDeadline && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.deadlineToggleText}>
                  Ajouter une date limite (optionnel)
                </Text>
              </TouchableOpacity>

              {/* Date */}
              {hasDeadline && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date limite</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>{formatDate(goalDeadline)}</Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>

                {/* iOS: Toujours visible */}
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={goalDeadline}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                      textColor="#2D3748"
                    />
                  </View>
                )}

                {/* Android: Modal quand showDatePicker est true */}
                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={goalDeadline}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
              <Text style={styles.addButtonText}>Ajouter l'objectif</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionCard: {
    width: '30%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  suggestionName: {
    fontSize: 11,
    color: '#2D3748',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionAmount: {
    fontSize: 10,
    color: '#48BB78',
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  goalAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  goalCurrent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  goalTarget: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 4,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#48BB78',
  },
  goalDeadline: {
    fontSize: 12,
    color: '#718096',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#48BB78',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addCustomIcon: {
    fontSize: 24,
    color: '#48BB78',
    marginRight: 8,
  },
  addCustomText: {
    fontSize: 16,
    color: '#48BB78',
    fontWeight: '600',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  closeIcon: {
    fontSize: 24,
    color: '#718096',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1A202C',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    paddingVertical: 16,
  },
  deadlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#48BB78',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkmark: {
    color: '#48BB78',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deadlineToggleText: {
    fontSize: 16,
    color: '#2D3748',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  calendarIcon: {
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#48BB78',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});