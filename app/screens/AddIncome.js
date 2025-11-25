// app/screens/AddIncome.js
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

export default function AddIncome() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Données du formulaire
  const [label, setLabel] = useState('');
  const [frequency, setFrequency] = useState('biweekly');
  const [amount, setAmount] = useState('');
  const [nextPayday, setNextPayday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    // Avec display="spinner", on met à jour en temps réel
    if (selectedDate) {
      setNextPayday(selectedDate);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!label.trim()) {
      Alert.alert('Erreur', 'Entre un nom pour cette source de revenu');
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

      console.log('💾 Ajout de source de revenu...');

      // Récupérer les données actuelles
      const userRef = doc(FIREBASE_FIRESTORE, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        Alert.alert('Erreur', 'Données utilisateur non trouvées');
        return;
      }

      const userData = userDoc.data();
      const currentIncomeSources = userData.incomeSources || [];

      // Créer la nouvelle source
      const newSource = {
        id: Date.now().toString(),
        label: label.trim(),
        frequency: frequency,
        amount: numAmount,
        nextPayday: nextPayday.toISOString(),
      };

      // Ajouter à la liste
      const updatedSources = [...currentIncomeSources, newSource];

      // Recalculer le revenu total mensuel
      const totalMonthlyIncome = updatedSources.reduce((total, source) => {
        let monthly = parseFloat(source.amount);
        if (source.frequency === 'weekly') monthly *= 4.33;
        if (source.frequency === 'biweekly') monthly *= 2.17;
        return total + monthly;
      }, 0);

      // Mettre à jour Firebase
      await updateDoc(userRef, {
        incomeSources: updatedSources,
        totalMonthlyIncome: totalMonthlyIncome,
      });

      console.log('✅ Source de revenu ajoutée');

      // Replanifier les notifications
      try {
        const recurringExpenses = userData.recurringExpenses || [];
        await notificationService.scheduleAllNotifications(
          updatedSources,
          recurringExpenses,
          userId
        );
        console.log('✅ Notifications replanifiées');
      } catch (notifError) {
        console.error('⚠️ Erreur notifications:', notifError);
      }

      Alert.alert(
        '✅ Source ajoutée!',
        `${label} a été ajouté avec succès.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.error('❌ Erreur ajout source:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la source. Réessaye.');
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Hebdomadaire', description: 'Chaque semaine' },
    { value: 'biweekly', label: 'Bihebdomadaire', description: 'Aux 2 semaines' },
    { value: 'monthly', label: 'Mensuelle', description: 'Chaque mois' },
  ];

  const suggestions = [
    '💼 Salaire principal',
    '⏰ Temps partiel',
    '💻 Freelance',
    '📝 Contrats',
    '📈 Investissements',
    '🏠 Revenus de location',
    '💰 Autre revenu',
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nouvelle source de revenu</Text>
          <Text style={styles.subtitle}>Ajoute une nouvelle source de revenu récurrente</Text>
        </View>

        {/* Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions populaires</Text>
          <View style={styles.suggestionsGrid}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => setLabel(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nom */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom de la source *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Salaire principal, Freelance..."
            value={label}
            onChangeText={setLabel}
            placeholderTextColor="#A0AEC0"
          />
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
          <Text style={styles.label}>Montant NET par paie *</Text>
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
          <Text style={styles.hint}>Entre le montant que tu reçois réellement (après impôts)</Text>
        </View>

        {/* Date de prochaine paie */}
        <View style={styles.section}>
          <Text style={styles.label}>Date de la prochaine paie *</Text>
          
          {Platform.OS === 'ios' ? (
            <View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={nextPayday}
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
                Date sélectionnée: {nextPayday.toLocaleDateString('fr-CA', {
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
                      {nextPayday.toLocaleDateString('fr-CA', {
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
                    value={nextPayday}
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
            Une notification te sera envoyée le jour de chaque paie pour confirmer que tu l'as reçue.
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
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  frequencyButtonTextActive: {
    color: '#48BB78',
  },
  frequencyButtonDescription: {
    fontSize: 13,
    color: '#718096',
  },
  frequencyButtonDescriptionActive: {
    color: '#38A169',
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
    color: '#48BB78',
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#1A202C',
    paddingVertical: 16,
  },
  hint: {
    fontSize: 13,
    color: '#718096',
    marginTop: 8,
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
    color: '#48BB78',
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
    color: '#48BB78',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
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
    color: '#2C5282',
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
    backgroundColor: '#48BB78',
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