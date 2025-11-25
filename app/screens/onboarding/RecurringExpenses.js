// app/screens/onboarding/RecurringExpenses.js
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

// Suggestions de dépenses populaires
const EXPENSE_SUGGESTIONS = [
  { name: 'Loyer', icon: '🏠', category: 'Logement' },
  { name: 'Téléphone', icon: '📱', category: 'Services' },
  { name: 'Internet', icon: '🌐', category: 'Services' },
  { name: 'Transport', icon: '🚗', category: 'Transport' },
  { name: 'Électricité', icon: '⚡', category: 'Services' },
  { name: 'Gym', icon: '💪', category: 'Santé' },
  { name: 'Assurance', icon: '🛡️', category: 'Assurance' },
  { name: 'Abonnement streaming', icon: '📺', category: 'Divertissement' },
];

const FREQUENCIES = [
  { id: 'weekly', label: 'Hebdomadaire' },
  { id: 'biweekly', label: 'Bihebdomadaire' },
  { id: 'monthly', label: 'Mensuelle' },
];

export default function RecurringExpenses() {
  const router = useRouter();
  const { recurringExpenses, addRecurringExpense, removeRecurringExpense, setCurrentStep } = useOnboardingStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseFrequency, setExpenseFrequency] = useState('monthly');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [expenseCategory, setExpenseCategory] = useState('Autre');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddExpense = () => {
    if (!expenseName.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    addRecurringExpense({
      name: expenseName.trim(),
      amount: parseFloat(expenseAmount),
      frequency: expenseFrequency,
      nextDate: expenseDate.toISOString(),
      category: expenseCategory,
    });

    // Reset form
    setExpenseName('');
    setExpenseAmount('');
    setExpenseFrequency('monthly');
    setExpenseDate(new Date());
    setExpenseCategory('Autre');
    setShowAddModal(false);
  };

  const handleSuggestionPress = (suggestion) => {
    setExpenseName(suggestion.name);
    setExpenseCategory(suggestion.category);
    setShowAddModal(true);
  };

  const handleNext = () => {
    setCurrentStep(3);
    router.push('/screens/onboarding/SavingsGoals');
  };

  const handleSkip = () => {
    setCurrentStep(3);
    router.push('/screens/onboarding/SavingsGoals');
  };

  const handleBack = () => {
    router.back();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpenseDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const progress = (2 / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.stepLabel}>Étape 2 sur 7</Text>
          <Text style={styles.title}>Dépenses récurrentes 🏠</Text>
          <Text style={styles.subtitle}>
            Ajoute tes dépenses fixes pour mieux planifier ton budget
          </Text>

          {/* Suggestions populaires */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions populaires</Text>
            <View style={styles.suggestionsGrid}>
              {EXPENSE_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <Text style={styles.suggestionName}>{suggestion.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dépenses ajoutées */}
          {recurringExpenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tes dépenses ({recurringExpenses.length})</Text>
              {recurringExpenses.map((expense) => (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseName}>{expense.name}</Text>
                    <Text style={styles.expenseDetails}>
                      {expense.amount.toFixed(2)} $ • {FREQUENCIES.find(f => f.id === expense.frequency)?.label}
                    </Text>
                    <Text style={styles.expenseDate}>
                      Prochaine: {formatDate(expense.nextDate)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeRecurringExpense(expense.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
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
            <Text style={styles.addCustomText}>Ajouter une dépense personnalisée</Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Tu peux ajouter autant de dépenses que tu veux. Nous les utiliserons pour calculer ton budget disponible.
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

      {/* Modal pour ajouter une dépense */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une dépense</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Nom */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom de la dépense</Text>
                <TextInput
                  style={styles.textInput}
                  value={expenseName}
                  onChangeText={setExpenseName}
                  placeholder="Ex: Loyer, Téléphone..."
                  placeholderTextColor="#CBD5E0"
                />
              </View>

              {/* Montant */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountTextInput}
                    value={expenseAmount}
                    onChangeText={setExpenseAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#CBD5E0"
                  />
                </View>
              </View>

              {/* Fréquence */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fréquence</Text>
                <View style={styles.frequencyButtons}>
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq.id}
                      style={[
                        styles.frequencyButton,
                        expenseFrequency === freq.id && styles.frequencyButtonActive,
                      ]}
                      onPress={() => setExpenseFrequency(freq.id)}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          expenseFrequency === freq.id && styles.frequencyButtonTextActive,
                        ]}
                      >
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prochaine échéance</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(expenseDate)}</Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>

                {/* iOS: Toujours visible */}
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={expenseDate}
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
                    value={expenseDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
              <Text style={styles.addButtonText}>Ajouter</Text>
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
    padding: 16,
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
    fontSize: 12,
    color: '#2D3748',
    textAlign: 'center',
    fontWeight: '500',
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 14,
    color: '#48BB78',
    marginBottom: 2,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    color: '#718096',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
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
    maxHeight: '90%',
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
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  frequencyButtonActive: {
    backgroundColor: '#48BB78',
    borderColor: '#48BB78',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  frequencyButtonTextActive: {
    color: 'white',
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