// app/screens/onboarding/Complete.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../../configuration/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function Complete() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    payFrequency, 
    netIncome, 
    nextPayday, 
    fixedExpenses,
    completeOnboarding 
  } = useOnboardingStore();

  // Calculer le budget suggéré (règle 50/30/20)
  const income = parseFloat(netIncome);
  const suggestedSavings = (income * 0.20).toFixed(2);
  const suggestedNeeds = (income * 0.50).toFixed(2);
  const suggestedWants = (income * 0.30).toFixed(2);
  
  // Total des dépenses fixes
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Calculer l'argent disponible
  const remainingMoney = (income - totalFixedExpenses - parseFloat(suggestedSavings)).toFixed(2);

  // Labels de fréquence
  const frequencyLabels = {
    weekly: 'Hebdomadaire',
    biweekly: 'Bihebdomadaire',
    monthly: 'Mensuelle',
    other: 'Irrégulier'
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('fr-CA', options);
  };

const handleFinish = async () => {
  setIsLoading(true);
  
  try {
    console.log('🔄 Début de la sauvegarde...');
    
    const user = FIREBASE_AUTH.currentUser;
    console.log('👤 Utilisateur:', user?.uid);
    
    if (!user) {
      alert('Erreur: Utilisateur non connecté');
      return;
    }
    
    const userData = {
      payFrequency,
      netIncome: parseFloat(netIncome),
      nextPayday: nextPayday.toISOString(),
      fixedExpenses,
      budgetPlan: {
        savings: parseFloat(suggestedSavings),
        needs: parseFloat(suggestedNeeds),
        wants: parseFloat(suggestedWants),
      },
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    };
    
    console.log('📦 Données à sauvegarder:', userData);
    
    // Sauvegarder les données dans Firestore
    await setDoc(doc(FIREBASE_FIRESTORE, 'users', user.uid), userData, { merge: true });
    
    console.log('✅ Données sauvegardées dans Firebase');
    
    // Marquer l'onboarding comme complété
    await completeOnboarding();
    console.log('✅ Onboarding marqué comme complété');
    
    // Naviguer vers le dashboard
    console.log('🚀 Navigation vers /home');
    router.replace('../../screens/home');
    
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    alert(`Erreur: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec célébration */}
      <View style={styles.header}>
        <Text style={styles.celebration}>🎉</Text>
        <Text style={styles.title}>Tout est prêt !</Text>
        <Text style={styles.subtitle}>
          Voici ton plan budgétaire personnalisé
        </Text>
      </View>

      {/* Résumé des informations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Ton profil</Text>
        
        <InfoCard
          icon="💰"
          label="Revenu par paie"
          value={`${netIncome} $`}
        />
        
        <InfoCard
          icon="📅"
          label="Fréquence"
          value={frequencyLabels[payFrequency]}
        />
        
        <InfoCard
          icon="🔔"
          label="Prochaine paie"
          value={formatDate(nextPayday)}
        />
      </View>

      {/* Plan budgétaire suggéré */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Plan suggéré</Text>
        
        <View style={styles.budgetCard}>
          <BudgetRow
            icon="🎯"
            label="Épargne (20%)"
            amount={suggestedSavings}
            color="#48BB78"
          />
          
          <BudgetRow
            icon="🏠"
            label="Besoins essentiels (50%)"
            amount={suggestedNeeds}
            color="#4299E1"
          />
          
          <BudgetRow
            icon="🎮"
            label="Loisirs & extras (30%)"
            amount={suggestedWants}
            color="#9F7AEA"
          />

          <View style={styles.divider} />

          {fixedExpenses.length > 0 && (
            <View style={styles.expensesInfo}>
              <Text style={styles.expensesLabel}>Dépenses fixes déclarées</Text>
              <Text style={styles.expensesAmount}>- {totalFixedExpenses.toFixed(2)} $</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Argent disponible</Text>
            <Text style={styles.totalAmount}>{remainingMoney} $</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            Tu pourras ajuster ces montants à tout moment depuis ton tableau de bord
          </Text>
        </View>
      </View>

      {/* Bouton d'action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Voir mon tableau de bord 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Composant InfoCard
const InfoCard = ({ icon, label, value }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// Composant BudgetRow
const BudgetRow = ({ icon, label, amount, color }) => (
  <View style={styles.budgetRow}>
    <View style={styles.budgetLeft}>
      <Text style={styles.budgetIcon}>{icon}</Text>
      <Text style={styles.budgetLabel}>{label}</Text>
    </View>
    <View style={[styles.budgetBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.budgetAmount, { color }]}>{amount} $</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  celebration: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  budgetCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  budgetLabel: {
    fontSize: 15,
    color: '#2D3748',
    flex: 1,
  },
  budgetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  expensesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expensesLabel: {
    fontSize: 14,
    color: '#718096',
  },
  expensesAmount: {
    fontSize: 14,
    color: '#E53E3E',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#48BB78',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5E6',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#744210',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#48BB78',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});