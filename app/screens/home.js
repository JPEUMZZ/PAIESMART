// app/home.js
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

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Calculs
  const income = parseFloat(userData.netIncome) || 0;
  const savings = userData.budgetPlan?.savings || 0;
  const needs = userData.budgetPlan?.needs || 0;
  const wants = userData.budgetPlan?.wants || 0;
  const totalFixedExpenses = userData.fixedExpenses?.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  ) || 0;
  const availableMoney = income - totalFixedExpenses - savings;

  // Prochaine paie
  const nextPayday = userData.nextPayday ? new Date(userData.nextPayday) : null;
  const daysUntilPayday = nextPayday
    ? Math.ceil((nextPayday - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  // Labels de fréquence
  const frequencyLabels = {
    weekly: 'Hebdomadaire',
    biweekly: 'Bihebdomadaire',
    monthly: 'Mensuelle',
    other: 'Irrégulier',
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('fr-CA', options);
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

      {/* Prochaine paie - Card principale */}
      <View style={styles.paydayCard}>
        <View style={styles.paydayHeader}>
          <Text style={styles.paydayLabel}>Prochaine paie</Text>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>
              {frequencyLabels[userData.payFrequency]}
            </Text>
          </View>
        </View>
        <Text style={styles.paydayDate}>{nextPayday ? formatDate(nextPayday) : 'Non définie'}</Text>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownNumber}>{daysUntilPayday}</Text>
          <Text style={styles.countdownLabel}>jours restants</Text>
        </View>
      </View>

      {/* Résumé budget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Ton budget</Text>
        
        <View style={styles.budgetSummaryCard}>
          <View style={styles.budgetMainRow}>
            <Text style={styles.budgetMainLabel}>Revenu net</Text>
            <Text style={styles.budgetMainAmount}>{income.toFixed(2)} $</Text>
          </View>

          <View style={styles.divider} />

          <BudgetItem
            icon="🎯"
            label="Épargne (20%)"
            amount={savings.toFixed(2)}
            color="#48BB78"
          />
          
          <BudgetItem
            icon="🏠"
            label="Besoins (50%)"
            amount={needs.toFixed(2)}
            color="#4299E1"
          />
          
          <BudgetItem
            icon="🎮"
            label="Loisirs (30%)"
            amount={wants.toFixed(2)}
            color="#9F7AEA"
          />

          {totalFixedExpenses > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.expensesRow}>
                <Text style={styles.expensesLabel}>Dépenses fixes</Text>
                <Text style={styles.expensesAmount}>- {totalFixedExpenses.toFixed(2)} $</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.availableRow}>
            <Text style={styles.availableLabel}>Argent disponible</Text>
            <Text style={styles.availableAmount}>{availableMoney.toFixed(2)} $</Text>
          </View>
        </View>
      </View>

      {/* Dépenses fixes */}
      {userData.fixedExpenses && userData.fixedExpenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Dépenses fixes</Text>
          <View style={styles.expensesCard}>
            {userData.fixedExpenses.map((expense, index) => (
              <View key={index} style={styles.expenseItem}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseAmount}>{expense.amount} $</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="📊"
            title="Statistiques"
            subtitle="Voir mes dépenses"
            onPress={() => console.log('Statistiques')}
          />
          <ActionCard
            icon="🎯"
            title="Objectifs"
            subtitle="Mes objectifs"
            onPress={() => console.log('Objectifs')}
          />
          <ActionCard
            icon="⚙️"
            title="Paramètres"
            subtitle="Mon profil"
            onPress={() => console.log('Paramètres')}
          />
          <ActionCard
            icon="📱"
            title="Aide"
            subtitle="Besoin d'aide?"
            onPress={() => console.log('Aide')}
          />
        </View>
      </View>

      {/* Conseils du jour */}
      <View style={styles.section}>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Conseil du jour</Text>
            <Text style={styles.tipText}>
              Essaie d'épargner automatiquement dès que tu reçois ta paie. C'est plus facile que d'épargner ce qui reste!
            </Text>
          </View>
        </View>
      </View>

      {/* Bouton test onboarding (temporaire pour dev) */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => router.push('/screens/onboarding/Welcome')}
        >
          <Text style={styles.testButtonText}>🔄 Refaire l'onboarding (dev)</Text>
        </TouchableOpacity>
      </View>

      {/* Footer spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Composant BudgetItem
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

// Composant ActionCard
const ActionCard = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

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
  paydayCard: {
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
  paydayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paydayLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  frequencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  frequencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paydayDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  countdownLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
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
  budgetMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetMainLabel: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
  },
  budgetMainAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
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
  },
  availableLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  availableAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48BB78',
  },
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseName: {
    fontSize: 15,
    color: '#2D3748',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
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
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
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
  testButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '600',
  },
});