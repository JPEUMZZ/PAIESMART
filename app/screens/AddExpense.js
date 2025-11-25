// app/screens/AddExpense.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../configuration/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import notificationService from '../services/notificationService';

export default function AddExpense() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Données du formulaire
  const [name, setName] = useState('');
  const [category, setCategory] = useState('autre');
  const [frequency, setFrequency] = useState('monthly');
  const [amount, setAmount] = useState('');
  const [nextDate, setNextDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    // Avec display="spinner", on met à jour en temps réel
    if (selectedDate) {
      setNextDate(selectedDate);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Entre un nom pour cette dépense');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Erreur', 'Entre un montant valide');
      return;
    }

    setLoading(true);

    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        return;
      }

      console.log('💾 Ajout de dépense...');

      // Récupérer les données actuelles
      const userRef = doc(FIREBASE_FIRESTORE, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        Alert.alert('Erreur', 'Données utilisateur non trouvées');
        return;
      }

      const userData = userDoc.data();
      const currentExpenses = userData.recurringExpenses || [];

      // Créer la nouvelle dépense
      const newExpense = {
        id: Date.now().toString(),
        name: name.trim(),
        category: category,
        frequency: frequency,
        amount: numAmount,
        nextDate: nextDate.toISOString(),
      };

      // Ajouter à la liste
      const updatedExpenses = [...currentExpenses, newExpense];

      // Recalculer le total des dépenses mensuelles
      const totalExpenses = updatedExpenses.reduce((total, expense) => {
        let monthly = parseFloat(expense.amount);
        if (expense.frequency === 'weekly') monthly *= 4.33;
        if (expense.frequency === 'biweekly') monthly *= 2.17;
        return total + monthly;
      }, 0);

      // Mettre à jour les calculs budgétaires
      const budgetCalcs = userData.budgetCalculations || {};
      budgetCalcs.totalExpenses = totalExpenses;

      // Mettre à jour Firebase
      await updateDoc(userRef, {
        recurringExpenses: updatedExpenses,
        budgetCalculations: budgetCalcs,
      });

      console.log('✅ Dépense ajoutée');

      // Replanifier les notifications
      try {
        const incomeSources = userData.incomeSources || [];
        await notificationService.scheduleAllNotifications(
          incomeSources,
          updatedExpenses,
          userId
        );
        console.log('✅ Notifications replanifiées');
      } catch (notifError) {
        console.error('⚠️ Erreur notifications:', notifError);
      }

      Alert.alert(
        '✅ Dépense ajoutée!',
        `${name} a été ajoutée avec succès.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.error('❌ Erreur ajout dépense:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la dépense. Réessaye.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'logement', label: 'Logement', emoji: '🏠' },
    { value: 'transport', label: 'Transport', emoji: '🚗' },
    { value: 'alimentation', label: 'Alimentation', emoji: '🍔' },
    { value: 'services', label: 'Services', emoji: '📱' },
    { value: 'assurance', label: 'Assurance', emoji: '🛡️' },
    { value: 'abonnement', label: 'Abonnement', emoji: '📺' },
    { value: 'autre', label: 'Autre', emoji: '💳' },
  ];

  const frequencyOptions = [
    { value: 'weekly', label: 'Hebdomadaire', description: 'Chaque semaine' },
    { value: 'biweekly', label: 'Bihebdomadaire', description: 'Aux 2 semaines' },
    { value: 'monthly', label: 'Mensuelle', description: 'Chaque mois' },
  ];

  const suggestions = [
    '🏠 Loyer',
    '⚡ Électricité',
    '💧 Eau',
    '📱 Téléphone',
    '🌐 Internet',
    '🚗 Assurance auto',
    '🏥 Assurance santé',
    '📺 Netflix',
    '🎵 Spotify',
    '🏋️ Gym',
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nouvelle dépense</Text>
          <Text style={styles.subtitle}>Ajoute une dépense récurrente à suivre</Text>
        </View>

        {/* Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions populaires</Text>
          <View style={styles.suggestionsGrid}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => setName(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nom */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom de la dépense *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Loyer, Internet, Gym..."
            value={name}
            onChangeText={setName}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* Catégorie */}
        <View style={styles.section}>
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  category === cat.value && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.value && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fréquence */}
        <View style={styles.section}>
          <Text style={styles.label}>Fréquence de paiement *</Text>
          <View style={styles.frequencyButtons}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  frequency === option.value && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(option.value)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    frequency === option.value && styles.frequencyButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.frequencyButtonDescription,
                    frequency === option.value && styles.frequencyButtonDescriptionActive,
                  ]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Montant */}
        <View style={styles.section}>
          <Text style={styles.label}>Montant par paiement *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

        {/* Date du prochain paiement */}
        <View style={styles.section}>
          <Text style={styles.label}>Date du prochain paiement *</Text>
          
          {Platform.OS === 'ios' ? (
            <View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={nextDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  locale="fr-CA"
                  style={{ height: 200 }}
                  textColor="#1A202C"
                />
              </View>
              <Text style={styles.datePreview}>
                Date sélectionnée: {nextDate.toLocaleDateString('fr-CA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  weekday: 'long',
                })}
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateButtonContent}>
                  <View>
                    <Text style={styles.dateButtonLabel}>Date sélectionnée:</Text>
                    <Text style={styles.dateButtonText}>
                      {nextDate.toLocaleDateString('fr-CA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.dateButtonIcon}>📅</Text>
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.androidPickerContainer}>
                  <View style={styles.androidPickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.androidPickerCancel}>Annuler</Text>
                    </TouchableOpacity>
                    <Text style={styles.androidPickerTitle}>Choisir une date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.androidPickerOk}>OK</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={nextDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor="#1A202C"
                    style={{ backgroundColor: 'white' }}
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Une notification te rappellera le jour du paiement pour confirmer que tu l'as payée.
          </Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Ajouter</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2D3748',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A202C',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryButtonActive: {
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#E53E3E',
  },
  frequencyButtons: {
    gap: 12,
  },
  frequencyButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  frequencyButtonActive: {
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5',
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  frequencyButtonTextActive: {
    color: '#E53E3E',
  },
  frequencyButtonDescription: {
    fontSize: 13,
    color: '#718096',
  },
  frequencyButtonDescriptionActive: {
    color: '#C53030',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 20,
    color: '#E53E3E',
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#1A202C',
    paddingVertical: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
  },
  datePreview: {
    marginTop: 12,
    fontSize: 15,
    color: '#E53E3E',
    fontWeight: '600',
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonLabel: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '600',
  },
  dateButtonIcon: {
    fontSize: 24,
  },
  androidPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
    overflow: 'hidden',
  },
  androidPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  androidPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  androidPickerCancel: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
  },
  androidPickerOk: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#E53E3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});