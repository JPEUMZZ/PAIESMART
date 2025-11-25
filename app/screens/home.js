// app/screens/home.js - VERSION COMPLÈTE AVEC NOTIFICATIONS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../configuration/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNotifications } from '../hooks/useNotifications';
import notificationService from '../services/notificationService';

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Hook pour les notifications
  const { scheduleNotifications, sendTestNotification } = useNotifications();

  const loadUserData = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        router.replace('/login');
        return;
      }

      const userDoc = await getDoc(doc(FIREBASE_FIRESTORE, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  // NOUVEAU - Fonction pour confirmer une paie
  const handleConfirmPaycheck = (source) => {
    router.push({
      pathname: '/screens/ConfirmPaycheck',
      params: {
        sourceId: source.id,
        sourceLabel: source.label,
        amount: source.amount,
        frequency: source.frequency,
        scheduledDate: source.nextPayday,
      },
    });
  };

  // NOUVEAU - Fonction pour confirmer un paiement de facture
  const handleConfirmExpense = (expense) => {
    router.push({
      pathname: '/screens/ConfirmExpense',
      params: {
        expenseId: expense.id,
        expenseName: expense.name,
        amount: expense.amount,
        frequency: expense.frequency,
        category: expense.category,
        scheduledDate: expense.nextDate,
      },
    });
  };

  // NOUVEAU - Fonction test notification (pour dev)
  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      alert('✅ Notification de test envoyée!');
    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#48BB78" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Impossible de charger les données</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Données avec la nouvelle structure
  const incomeSources = userData.incomeSources || [];
  const receivedMonthIncome = userData.receivedMonthIncome || 0;
  const currentMonthIncome = userData.currentMonthIncome || 0;
  const currentMonthName = userData.currentMonthName || 'ce mois';
  const totalMonthlyIncome = userData.totalMonthlyIncome || 0;
  const recurringExpenses = userData.recurringExpenses || [];
  const savingsGoals = userData.savingsGoals || [];
  const budgetCalcs = userData.budgetCalculations || {};
  const budgetPrefs = userData.budgetPreferences || { savingsPercent: 20, needsPercent: 50, wantsPercent: 30 };

  // Calculs
  const savingsAmount = budgetCalcs.savingsAmount || 0;
  const needsAmount = budgetCalcs.needsAmount || 0;
  const wantsAmount = budgetCalcs.wantsAmount || 0;
  const totalExpenses = budgetCalcs.totalExpenses || 0;
  const availableMoney = budgetCalcs.availableAfterExpenses || 0;

  // Trouver la prochaine paie (la plus proche)
const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getNextPayday = () => {
  if (!incomeSources || incomeSources.length === 0) return null;

  const today = normalizeDate(new Date());

  const futureDates = incomeSources
    .map(source => normalizeDate(source.nextPayday))
    .filter(date => date >= today)
    .sort((a, b) => a - b);

  return futureDates.length > 0 ? futureDates[0] : null;
};

const nextPayday = getNextPayday();

const daysUntilPayday = nextPayday
  ? Math.ceil((nextPayday - normalizeDate(new Date())) / (1000 * 60 * 60 * 24))
  : 0;


  // Labels de fréquence
  const frequencyLabels = {
    weekly: 'Hebdo',
    biweekly: 'Bi-hebdo',
    monthly: 'Mensuel',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const userName = FIREBASE_AUTH.currentUser?.displayName?.split(' ')[0] || 'Ami';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#48BB78']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {userName}! 👋</Text>
          <Text style={styles.subtitle}>Voici ton aperçu financier</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Revenu déjà reçu ce mois - Card principale */}
      <View style={styles.monthIncomeCard}>
        <View style={styles.monthIncomeHeader}>
          <Text style={styles.monthIncomeLabel}>Revenu reçu en {currentMonthName}</Text>
          <View style={styles.monthBadge}>
            <Text style={styles.monthBadgeText}>{incomeSources.length} source{incomeSources.length > 1 ? 's' : ''}</Text>
          </View>
        </View>
        <Text style={styles.monthIncomeAmount}>{receivedMonthIncome.toFixed(2)} $</Text>
        <Text style={styles.monthIncomeNote}>Paies déjà reçues ce mois</Text>
        
        {/* Info sur les paies à venir */}
        {currentMonthIncome > receivedMonthIncome && (
          <View style={styles.pendingPayBanner}>
            <Text style={styles.pendingPayText}>
              + {(currentMonthIncome - receivedMonthIncome).toFixed(2)} $ à venir ce mois
            </Text>
          </View>
        )}
        
        {/* Prochaine paie */}
        {nextPayday && (
          <View style={styles.nextPaydayBanner}>
            <Text style={styles.nextPaydayText}>
              Prochaine paie dans <Text style={styles.nextPaydayDays}>{daysUntilPayday} jour{daysUntilPayday > 1 ? 's' : ''}</Text>
            </Text>
            <Text style={styles.nextPaydayDate}>{formatFullDate(nextPayday)}</Text>
          </View>
        )}
      </View>

      {/* Sources de revenus - MODIFIÉ AVEC BOUTON CONFIRMATION */}
      {incomeSources.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Tes sources de revenus</Text>
          <View style={styles.sourcesCard}>
            {incomeSources.map((source) => {
              // Vérifier si c'est aujourd'hui
              const isPaydayToday = new Date(source.nextPayday).toDateString() === new Date().toDateString();
              
              return (
                <View key={source.id}>
                  <View style={styles.sourceItem}>
                    <View style={styles.sourceLeft}>
                      <Text style={styles.sourceName}>{source.label}</Text>
                      <Text style={styles.sourceDetails}>
                        {parseFloat(source.amount).toFixed(2)} $ • {frequencyLabels[source.frequency]}
                      </Text>
                    </View>
                    <View style={styles.sourceRight}>
                      <Text style={styles.sourceNextLabel}>Prochaine</Text>
                      <Text style={styles.sourceNextDate}>{formatDate(source.nextPayday)}</Text>
                      
                      {/* NOUVEAU - Bouton de confirmation si c'est aujourd'hui */}
                      {isPaydayToday && (
                        <TouchableOpacity
                          style={styles.confirmPayButton}
                          onPress={() => handleConfirmPaycheck(source)}
                        >
                          <Text style={styles.confirmPayButtonText}>Confirmer 💰</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {source.id !== incomeSources[incomeSources.length - 1].id && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimation mensuelle moyenne</Text>
              <Text style={styles.totalAmount}>~{totalMonthlyIncome.toFixed(0)} $</Text>
            </View>
          </View>
        </View>
      )}

      {/* Résumé budget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Ton plan budgétaire</Text>
        
        <View style={styles.budgetSummaryCard}>
          <BudgetItem
            icon="🎯"
            label={`Épargne (${budgetPrefs.savingsPercent}%)`}
            amount={savingsAmount.toFixed(2)}
            color="#48BB78"
          />
          
          <BudgetItem
            icon="🏠"
            label={`Besoins (${budgetPrefs.needsPercent}%)`}
            amount={needsAmount.toFixed(2)}
            color="#4299E1"
          />
          
          <BudgetItem
            icon="🎮"
            label={`Loisirs (${budgetPrefs.wantsPercent}%)`}
            amount={wantsAmount.toFixed(2)}
            color="#9F7AEA"
          />

          {totalExpenses > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.expensesRow}>
                <Text style={styles.expensesLabel}>Dépenses récurrentes</Text>
                <Text style={styles.expensesAmount}>- {totalExpenses.toFixed(2)} $</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.availableRow}>
            <Text style={styles.availableLabel}>💵 Argent disponible</Text>
            <Text style={styles.availableAmount}>{availableMoney.toFixed(2)} $</Text>
          </View>
        </View>
      </View>

      {/* Dépenses récurrentes - MODIFIÉ AVEC BOUTON CONFIRMATION */}
      {recurringExpenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Dépenses récurrentes</Text>
          <View style={styles.expensesCard}>
            {recurringExpenses.slice(0, 5).map((expense) => {
              // Vérifier si le paiement est prévu aujourd'hui
              const isPaymentToday = new Date(expense.nextDate).toDateString() === new Date().toDateString();
              
              return (
                <View key={expense.id}>
                  <View style={styles.expenseItem}>
                    <View style={styles.expenseLeft}>
                      <Text style={styles.expenseName}>{expense.name}</Text>
                      <Text style={styles.expenseFreq}>
                        {frequencyLabels[expense.frequency]} • Prochaine: {formatDate(expense.nextDate)}
                      </Text>
                    </View>
                    <View style={styles.expenseRight}>
                      <Text style={styles.expenseAmount}>{parseFloat(expense.amount).toFixed(2)} $</Text>
                      
                      {/* NOUVEAU - Bouton de confirmation si c'est aujourd'hui */}
                      {isPaymentToday && (
                        <TouchableOpacity
                          style={styles.confirmExpenseButton}
                          onPress={() => handleConfirmExpense(expense)}
                        >
                          <Text style={styles.confirmExpenseButtonText}>Confirmer 💳</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {expense.id !== recurringExpenses[Math.min(4, recurringExpenses.length - 1)].id && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
            {recurringExpenses.length > 5 && (
              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>
                  Voir les {recurringExpenses.length - 5} autres dépenses →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Objectifs d'épargne */}
      {savingsGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objectifs d'épargne</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.goalsRow}>
              {savingsGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  name={goal.name}
                  current={goal.currentAmount || 0}
                  target={goal.targetAmount}
                  deadline={goal.deadline}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Actions rapides - MODIFIÉ AVEC BOUTON TEST */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="➕"
            title="Ajouter"
            subtitle="Revenu ou dépense"
            color="#48BB78"
            onPress={() => console.log('Ajouter')}
          />
          <ActionCard
            icon="📊"
            title="Statistiques"
            subtitle="Voir mes données"
            color="#4299E1"
            onPress={() => console.log('Statistiques')}
          />
          <ActionCard
            icon="🎯"
            title="Objectifs"
            subtitle="Suivre mes progrès"
            color="#9F7AEA"
            onPress={() => console.log('Objectifs')}
          />
          <ActionCard
            icon="⚙️"
            title="Paramètres"
            subtitle="Mon profil"
            color="#718096"
            onPress={() => console.log('Paramètres')}
          />
          
          {/* NOUVEAU - Bouton test notification (uniquement en dev) */}
          {__DEV__ && (
            <ActionCard
              icon="🔔"
              title="Test Notif"
              subtitle="Tester notifications"
              color="#F59E0B"
              onPress={handleTestNotification}
            />
          )}
        </View>
      </View>

      {/* Conseils du jour */}
      <View style={styles.section}>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Conseil du jour</Text>
            <Text style={styles.tipText}>
              Épargne automatiquement dès que tu reçois ta paie. La règle du "paie-toi en premier" fonctionne vraiment!
            </Text>
          </View>
        </View>
      </View>

      {/* Footer spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ============ COMPOSANTS ============

// Budget item
const BudgetItem = ({ icon, label, amount, color }) => (
  <View style={styles.budgetRow}>
    <View style={styles.budgetLeft}>
      <Text style={styles.budgetIcon}>{icon}</Text>
      <Text style={styles.budgetLabel}>{label}</Text>
    </View>
    <View style={[styles.budgetBadge, { backgroundColor: color + '15' }]}>
      <Text style={[styles.budgetAmount, { color }]}>{amount} $</Text>
    </View>
  </View>
);

// Carte objectif
const GoalCard = ({ name, current, target, deadline }) => {
  const progress = (current / target) * 100;
  
  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalName}>{name}</Text>
      <View style={styles.goalProgress}>
        <View style={styles.goalProgressBar}>
          <View style={[styles.goalProgressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
      </View>
      <View style={styles.goalAmounts}>
        <Text style={styles.goalCurrent}>{current.toFixed(0)} $</Text>
        <Text style={styles.goalTarget}>/ {target.toFixed(0)} $</Text>
      </View>
      {deadline && (
        <Text style={styles.goalDeadline}>
          📅 {new Date(deadline).toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' })}
        </Text>
      )}
    </View>
  );
};

// Action card
const ActionCard = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#48BB78',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    fontSize: 24,
  },
  
  // Card revenu du mois
  monthIncomeCard: {
    backgroundColor: '#48BB78',
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  monthIncomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthIncomeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  monthBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  monthBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  monthIncomeAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  monthIncomeNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  pendingPayBanner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  pendingPayText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textAlign: 'center',
  },
  nextPaydayBanner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
  },
  nextPaydayText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  nextPaydayDays: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
  },
  nextPaydayDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },

  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },

  // Sources de revenus
  sourcesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sourceLeft: {
    flex: 1,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  sourceDetails: {
    fontSize: 13,
    color: '#718096',
  },
  sourceRight: {
    alignItems: 'flex-end',
  },
  sourceNextLabel: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 2,
  },
  sourceNextDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#48BB78',
  },
  // NOUVEAU - Styles pour le bouton de confirmation
  confirmPayButton: {
    marginTop: 8,
    backgroundColor: '#48BB78',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmPayButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#718096',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },

  // Budget
  budgetSummaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  expensesRow: {
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
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    backgroundColor: '#F0FFF4',
    marginHorizontal: -20,
    marginBottom: -20,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  availableLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  availableAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#48BB78',
  },

  // Dépenses
  expensesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseLeft: {
    flex: 1,
  },
  expenseName: {
    fontSize: 15,
    color: '#2D3748',
    marginBottom: 3,
    fontWeight: '500',
  },
  expenseFreq: {
    fontSize: 12,
    color: '#718096',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E53E3E',
  },
  // NOUVEAU - Styles pour le bouton de confirmation de facture
  confirmExpenseButton: {
    marginTop: 8,
    backgroundColor: '#E53E3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmExpenseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  showMoreButton: {
    paddingTop: 12,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '600',
  },

  // Objectifs
  goalsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 24,
  },
  goalCard: {
    backgroundColor: 'white',
    width: 200,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 4,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  goalCurrent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  goalTarget: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#718096',
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },

  // Tip card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5E6',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});