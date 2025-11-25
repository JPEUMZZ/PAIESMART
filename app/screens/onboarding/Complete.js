// app/screens/onboarding/Complete.js - VERSION AVEC SOURCES MULTIPLES
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../../configuration/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import notificationService from '../../services/notificationService';

export default function Complete() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    incomeSources,
    recurringExpenses,
    savingsGoals,
    budgetPreferences,
    notificationSettings,
    getTotalIncome,
    getCurrentMonthIncome,
    getReceivedMonthIncome,
    getCurrentMonthName,
    completeOnboarding,
  } = useOnboardingStore();

  // Calculer le revenu mensuel total (pour estimation)
  const monthlyIncome = getTotalIncome();
  
  // Calculer le revenu total du mois en cours (incluant paies futures)
  const currentMonthIncome = getCurrentMonthIncome();
  
  // Calculer le revenu déjà reçu (paies passées seulement)
  const receivedMonthIncome = getReceivedMonthIncome();
  
  const currentMonthName = getCurrentMonthName();

  // Calculs du budget
  const totalExpenses = recurringExpenses.reduce((sum, exp) => {
    let monthlyAmount = exp.amount;
    if (exp.frequency === 'weekly') monthlyAmount = exp.amount * 4.33;
    if (exp.frequency === 'biweekly') monthlyAmount = exp.amount * 2.17;
    return sum + monthlyAmount;
  }, 0);

  const savingsAmount = (monthlyIncome * budgetPreferences.savingsPercent) / 100;
  const needsAmount = (monthlyIncome * budgetPreferences.needsPercent) / 100;
  const wantsAmount = (monthlyIncome * budgetPreferences.wantsPercent) / 100;
  const availableAfterExpenses = monthlyIncome - totalExpenses - savingsAmount;

  // Labels
  const frequencyLabels = {
    weekly: 'Hebdomadaire',
    biweekly: 'Bihebdomadaire',
    monthly: 'Mensuelle',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
    
    // Préparer les données à sauvegarder
    const userData = {
      incomeSources: incomeSources.map(source => ({
        id: source.id,
        label: source.label,
        frequency: source.frequency,
        amount: parseFloat(source.amount),
        nextPayday: source.nextPayday,
      })),
      totalMonthlyIncome: monthlyIncome,
      currentMonthIncome: currentMonthIncome,
      receivedMonthIncome: receivedMonthIncome,
      currentMonthName: currentMonthName,
      recurringExpenses: recurringExpenses.map(exp => ({
        id: exp.id,
        name: exp.name,
        amount: parseFloat(exp.amount),
        frequency: exp.frequency,
        nextDate: exp.nextDate,
        category: exp.category,
      })),
      savingsGoals: savingsGoals.map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: parseFloat(goal.targetAmount),
        currentAmount: 0,
        deadline: goal.deadline,
      })),
      budgetPreferences: {
        savingsPercent: budgetPreferences.savingsPercent,
        needsPercent: budgetPreferences.needsPercent,
        wantsPercent: budgetPreferences.wantsPercent,
      },
      notificationSettings,
      budgetCalculations: {
        monthlyIncome,
        savingsAmount,
        needsAmount,
        wantsAmount,
        totalExpenses,
        availableAfterExpenses,
      },
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
    };
    
    console.log('📦 Données à sauvegarder:', userData);
    
    // Sauvegarder dans Firestore
    await setDoc(doc(FIREBASE_FIRESTORE, 'users', user.uid), userData, { merge: true });
    
    console.log('✅ Données sauvegardées dans Firebase');
    
    // Marquer l'onboarding comme complété
    await completeOnboarding();
    console.log('✅ Onboarding marqué comme complété');
    
    // Configuration des notifications
    try {
      console.log('🔔 Configuration des notifications...');
      
      const hasPermission = await notificationService.requestPermissions();
      
      if (hasPermission) {
        const count = await notificationService.schedulePaydayNotifications(
          incomeSources,
          recurringExpenses,
          user.uid
        );
        
        console.log(`✅ ${count} notifications planifiées`);
      } else {
        console.log('⚠️ Permissions refusées, notifications non planifiées');
      }
    } catch (notifError) {
      console.error('⚠️ Erreur notifications (non bloquant):', notifError);
    }
    
    // Naviguer vers le dashboard
    console.log('🚀 Navigation vers /screens/home');
    router.replace('/screens/home');
    
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    alert(`Erreur lors de la sauvegarde: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};



  const progress = (6 / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.celebration}>🎉</Text>
          <Text style={styles.title}>C'est tout prêt !</Text>
          <Text style={styles.subtitle}>
            Voici ton plan financier personnalisé
          </Text>
        </View>

        <View style={styles.content}>
          {/* Résumé des revenus (MODIFIÉ) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💰 Tes sources de revenus ({incomeSources.length})
            </Text>
            <View style={styles.summaryCard}>
              {incomeSources.map((source) => {
                // Calculer le montant mensuel
                let monthlyAmount = parseFloat(source.amount);
                if (source.frequency === 'weekly') monthlyAmount *= 4.33;
                if (source.frequency === 'biweekly') monthlyAmount *= 2.17;
                
                return (
                  <View key={source.id} style={styles.sourceRow}>
                    <View style={styles.sourceLeft}>
                      <Text style={styles.sourceName}>{source.label}</Text>
                      <Text style={styles.sourceDetails}>
                        {parseFloat(source.amount).toFixed(2)} $ • {frequencyLabels[source.frequency]}
                      </Text>
                    </View>
                    <Text style={styles.sourceMonthly}>
                      ~{monthlyAmount.toFixed(0)} $/mois
                    </Text>
                  </View>
                );
              })}
              <View style={styles.divider} />
              
              {/* Revenu reçu ce mois (EN GRAND) */}
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Revenu reçu en {currentMonthName}</Text>
                <Text style={styles.highlightValue}>{receivedMonthIncome.toFixed(2)} $</Text>
              </View>
              
              {/* Total du mois incluant futures (info) */}
              <InfoRow 
                label={`Total de ${currentMonthName} (avec futures paies)`}
                value={`${currentMonthIncome.toFixed(2)} $`}
              />
              
              {/* Estimation mensuelle moyenne */}
              <InfoRow 
                label="Estimation mensuelle moyenne" 
                value={`${monthlyIncome.toFixed(2)} $`}
              />
            </View>
          </View>

          {/* Plan budgétaire */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Ton plan budgétaire</Text>
            <View style={styles.budgetCard}>
              <BudgetRow
                icon="🎯"
                label={`Épargne (${budgetPreferences.savingsPercent}%)`}
                amount={savingsAmount.toFixed(2)}
                color="#48BB78"
              />
              <BudgetRow
                icon="🏠"
                label={`Besoins (${budgetPreferences.needsPercent}%)`}
                amount={needsAmount.toFixed(2)}
                color="#4299E1"
              />
              <BudgetRow
                icon="🎮"
                label={`Loisirs (${budgetPreferences.wantsPercent}%)`}
                amount={wantsAmount.toFixed(2)}
                color="#9F7AEA"
              />
            </View>
          </View>

          {/* Dépenses récurrentes */}
          {recurringExpenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📋 Dépenses récurrentes ({recurringExpenses.length})
              </Text>
              <View style={styles.expensesCard}>
                {recurringExpenses.map((exp) => (
                  <View key={exp.id} style={styles.expenseRow}>
                    <Text style={styles.expenseName}>{exp.name}</Text>
                    <Text style={styles.expenseAmount}>{exp.amount.toFixed(2)} $</Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseTotalLabel}>Total mensuel estimé</Text>
                  <Text style={styles.expenseTotalAmount}>
                    {totalExpenses.toFixed(2)} $
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Objectifs d'épargne */}
          {savingsGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🎯 Objectifs d'épargne ({savingsGoals.length})
              </Text>
              <View style={styles.goalsCard}>
                {savingsGoals.map((goal) => (
                  <View key={goal.id} style={styles.goalRow}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>
                      {goal.targetAmount.toLocaleString('fr-CA')} $
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Résumé final */}
          <View style={styles.finalSummary}>
            <Text style={styles.finalIcon}>💵</Text>
            <View style={styles.finalContent}>
              <Text style={styles.finalLabel}>Argent disponible estimé</Text>
              <Text style={styles.finalAmount}>
                {availableAfterExpenses.toFixed(2)} $ / mois
              </Text>
              <Text style={styles.finalNote}>
                Après épargne et dépenses fixes
              </Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteIcon}>💡</Text>
            <Text style={styles.noteText}>
              Tu pourras ajuster toutes ces informations à tout moment depuis ton tableau de bord
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishButton, isLoading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.finishButtonText}>Voir mon tableau de bord</Text>
              <Text style={styles.finishButtonIcon}>🚀</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Composants helpers
const InfoRow = ({ label, value, highlight }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, highlight && styles.infoLabelHighlight]}>{label}</Text>
    <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
  </View>
);

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
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  celebration: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
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
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sourceLeft: {
    flex: 1,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 2,
  },
  sourceDetails: {
    fontSize: 12,
    color: '#718096',
  },
  sourceMonthly: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48BB78',
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
  },
  infoLabelHighlight: {
    fontWeight: '600',
    color: '#2D3748',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  budgetCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    color: '#2D3748',
  },
  budgetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expensesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  expenseName: {
    fontSize: 14,
    color: '#2D3748',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  expenseTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  expenseTotalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  goalsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  goalName: {
    fontSize: 14,
    color: '#2D3748',
  },
  goalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48BB78',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  finalSummary: {
    flexDirection: 'row',
    backgroundColor: '#48BB78',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  finalIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  finalContent: {
    flex: 1,
  },
  finalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  finalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  finalNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
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
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: '#48BB78',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  finishButtonIcon: {
    fontSize: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});