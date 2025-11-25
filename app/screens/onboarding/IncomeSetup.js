// app/screens/onboarding/IncomeSetup.js - VERSION AVEC SOURCES MULTIPLES
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

const frequencies = [
  { id: 'weekly', label: 'Hebdomadaire', subtitle: 'Chaque semaine' },
  { id: 'biweekly', label: 'Bihebdomadaire', subtitle: 'Aux 2 semaines' },
  { id: 'monthly', label: 'Mensuelle', subtitle: '1 fois par mois' },
];

// Suggestions de labels populaires
const LABEL_SUGGESTIONS = [
  { label: 'Salaire principal', icon: '💼' },
  { label: 'Travail à temps partiel', icon: '⏰' },
  { label: 'Freelance', icon: '💻' },
  { label: 'Contrats', icon: '📝' },
  { label: 'Investissements', icon: '📈' },
  { label: 'Loyer (revenus)', icon: '🏠' },
  { label: 'Autre revenu', icon: '💰' },
];

export default function IncomeSetup() {
  const router = useRouter();
  const { 
    incomeSources, 
    addIncomeSource, 
    removeIncomeSource, 
    setCurrentStep,
    getReceivedMonthIncome,
    getCurrentMonthName,
  } = useOnboardingStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('');
  const [frequency, setFrequency] = useState('biweekly');
  const [amount, setAmount] = useState('');
  const [nextPayday, setNextPayday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddSource = () => {
    if (!sourceLabel.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    addIncomeSource({
      label: sourceLabel.trim(),
      frequency,
      amount: parseFloat(amount),
      nextPayday: nextPayday.toISOString(),
    });

    // Reset form
    setSourceLabel('');
    setFrequency('biweekly');
    setAmount('');
    setNextPayday(new Date());
    setShowAddModal(false);
  };

  const handleSuggestionPress = (suggestion) => {
    setSourceLabel(suggestion.label);
    setShowAddModal(true);
  };

  const handleNext = () => {
    if (incomeSources.length === 0) {
      alert('Veuillez ajouter au moins une source de revenu');
      return;
    }

    setCurrentStep(2);
    router.push('/screens/onboarding/RecurringExpenses');
  };

  const handleBack = () => {
    router.back();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setNextPayday(selectedDate);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculer le revenu déjà reçu ce mois (paies passées seulement)
  const receivedMonthIncome = getReceivedMonthIncome();
  const currentMonthName = getCurrentMonthName();
  const progress = (1 / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.stepLabel}>Étape 1 sur 7</Text>
          <Text style={styles.title}>Tes sources de revenus 💵</Text>
          <Text style={styles.subtitle}>
            Ajoute toutes tes sources de revenus pour un portrait financier complet
          </Text>

          {/* Total du mois en cours - Revenus reçus uniquement */}
          {incomeSources.length > 0 && (
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Revenu reçu en {currentMonthName}</Text>
              <Text style={styles.totalAmount}>{receivedMonthIncome.toFixed(2)} $</Text>
              <Text style={styles.totalNote}>
                Basé sur {incomeSources.length} source{incomeSources.length > 1 ? 's' : ''} • Paies déjà reçues
              </Text>
            </View>
          )}

          {/* Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sources populaires</Text>
            <View style={styles.suggestionsGrid}>
              {LABEL_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sources ajoutées */}
          {incomeSources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Tes revenus ({incomeSources.length})
              </Text>
              {incomeSources.map((source) => (
                <View key={source.id} style={styles.sourceCard}>
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceName}>{source.label}</Text>
                    <Text style={styles.sourceAmount}>
                      {parseFloat(source.amount).toFixed(2)} $ • {frequencies.find(f => f.id === source.frequency)?.label}
                    </Text>
                    <Text style={styles.sourceDate}>
                      Prochaine paie: {formatDate(source.nextPayday)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeIncomeSource(source.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Bouton ajouter */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Ajouter une source de revenu</Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Ajoute tous tes revenus (salaire, freelance, investissements...) pour un plan budgétaire précis
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            incomeSources.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={incomeSources.length === 0}
        >
          <Text style={styles.nextButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour ajouter une source */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle source de revenu</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Label */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom de la source</Text>
                <TextInput
                  style={styles.textInput}
                  value={sourceLabel}
                  onChangeText={setSourceLabel}
                  placeholder="Ex: Salaire principal, Freelance..."
                  placeholderTextColor="#CBD5E0"
                />
              </View>

              {/* Fréquence */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fréquence de paie</Text>
                <View style={styles.frequencyButtons}>
                  {frequencies.map((freq) => (
                    <TouchableOpacity
                      key={freq.id}
                      style={[
                        styles.frequencyButton,
                        frequency === freq.id && styles.frequencyButtonActive,
                      ]}
                      onPress={() => setFrequency(freq.id)}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          frequency === freq.id && styles.frequencyButtonTextActive,
                        ]}
                      >
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Montant */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant NET par paie</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountTextInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#CBD5E0"
                  />
                </View>
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prochaine paie</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(nextPayday)}</Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>

                {/* iOS: Toujours visible */}
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={nextPayday}
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
                    value={nextPayday}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalAddButton} onPress={handleAddSource}>
              <Text style={styles.modalAddButtonText}>Ajouter cette source</Text>
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
  totalCard: {
    backgroundColor: '#48BB78',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  totalNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
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
    fontSize: 28,
    marginBottom: 8,
  },
  suggestionLabel: {
    fontSize: 11,
    color: '#2D3748',
    textAlign: 'center',
    fontWeight: '500',
  },
  sourceCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  sourceAmount: {
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '500',
    marginBottom: 2,
  },
  sourceDate: {
    fontSize: 12,
    color: '#718096',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  addButton: {
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
  addIcon: {
    fontSize: 24,
    color: '#48BB78',
    marginRight: 8,
  },
  addText: {
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
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
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
  frequencyButtons: {
    gap: 8,
  },
  frequencyButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  modalAddButton: {
    backgroundColor: '#48BB78',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});