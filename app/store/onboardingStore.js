// app/store/onboardingStore.js - VERSION AVEC SOURCES DE REVENUS MULTIPLES
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOnboardingStore = create((set, get) => ({
  // État de progression
  currentStep: 0,
  totalSteps: 7,
  hasCompletedOnboarding: false,

  // 1. Sources de revenus (MODIFIÉ - maintenant un array)
  incomeSources: [],
  // Format: { id, label, frequency, amount, nextPayday }

  // 2. Dépenses récurrentes
  recurringExpenses: [],
  // Format: { id, name, amount, frequency, nextDate, category }

  // 3. Objectifs d'épargne
  savingsGoals: [],
  // Format: { id, name, targetAmount, deadline, currentAmount }

  // 4. Préférences de budget (règle modifiable)
  budgetPreferences: {
    savingsPercent: 20,
    needsPercent: 50,
    wantsPercent: 30,
  },

  // 5. Préférences de notifications
  notificationSettings: {
    paydayReminder: true,
    budgetAlerts: true,
    goalProgress: true,
    billReminders: true,
  },

  // Actions - Navigation
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  // Actions - Sources de revenus (NOUVEAU)
  addIncomeSource: (source) => set((state) => ({
    incomeSources: [...state.incomeSources, {
      ...source,
      id: Date.now().toString(),
    }]
  })),
  removeIncomeSource: (id) => set((state) => ({
    incomeSources: state.incomeSources.filter(source => source.id !== id)
  })),
  updateIncomeSource: (id, updates) => set((state) => ({
    incomeSources: state.incomeSources.map(source =>
      source.id === id ? { ...source, ...updates } : source
    )
  })),
  
  // Calculer le revenu total (helper)
  getTotalIncome: () => {
    const state = get();
    return state.incomeSources.reduce((total, source) => {
      // Normaliser en mensuel selon la fréquence
      let monthlyAmount = parseFloat(source.amount) || 0;
      if (source.frequency === 'weekly') monthlyAmount = monthlyAmount * 4.33;
      if (source.frequency === 'biweekly') monthlyAmount = monthlyAmount * 2.17;
      return total + monthlyAmount;
    }, 0);
  },

  // Calculer le revenu du mois en cours (toutes les paies incluant futures)
  getCurrentMonthIncome: () => {
    const state = get();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return state.incomeSources.reduce((total, source) => {
      const amount = parseFloat(source.amount) || 0;
      const nextPayday = new Date(source.nextPayday);
      
      // Compter combien de paies tombent dans le mois en cours
      let payCount = 0;
      
      // Fonction pour vérifier si une date est dans le mois en cours
      const isInCurrentMonth = (date) => {
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      };
      
      // Calculer les paies du mois selon la fréquence
      if (source.frequency === 'weekly') {
        // Semaine = 7 jours, max 5 paies par mois
        let checkDate = new Date(nextPayday);
        
        // Vérifier les 5 semaines précédentes
        for (let i = 0; i < 5; i++) {
          if (isInCurrentMonth(checkDate) && checkDate <= now) {
            payCount++;
          }
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 7);
        }
        
        // Vérifier si la prochaine paie est dans le mois en cours
        if (isInCurrentMonth(nextPayday) && nextPayday > now) {
          payCount++;
        }
        
      } else if (source.frequency === 'biweekly') {
        // Aux 2 semaines = 14 jours, max 3 paies par mois
        let checkDate = new Date(nextPayday);
        
        // Vérifier les 3 périodes précédentes (6 semaines)
        for (let i = 0; i < 3; i++) {
          if (isInCurrentMonth(checkDate) && checkDate <= now) {
            payCount++;
          }
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 14);
        }
        
        // Vérifier si la prochaine paie est dans le mois en cours
        if (isInCurrentMonth(nextPayday) && nextPayday > now) {
          payCount++;
        }
        
      } else if (source.frequency === 'monthly') {
        // Mensuelle = 1 paie par mois
        // Vérifier si la prochaine paie est ce mois
        if (isInCurrentMonth(nextPayday)) {
          payCount = 1;
        } else {
          // Sinon, il y a peut-être eu une paie plus tôt ce mois
          const lastMonth = new Date(nextPayday);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          if (isInCurrentMonth(lastMonth) && lastMonth <= now) {
            payCount = 1;
          }
        }
      }
      
      return total + (amount * payCount);
    }, 0);
  },

  // Calculer SEULEMENT le revenu déjà reçu (paies passées uniquement) - NOUVEAU
  getReceivedMonthIncome: () => {
    const state = get();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return state.incomeSources.reduce((total, source) => {
      const amount = parseFloat(source.amount) || 0;
      const nextPayday = new Date(source.nextPayday);
      
      // Compter SEULEMENT les paies déjà reçues (dans le passé)
      let payCount = 0;
      
      // Fonction pour vérifier si une date est dans le mois en cours ET dans le passé
      const isInCurrentMonthAndPast = (date) => {
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               date <= now; // IMPORTANT: seulement si dans le passé
      };
      
      // Calculer les paies reçues selon la fréquence
      if (source.frequency === 'weekly') {
        // Vérifier les 5 semaines précédentes
        let checkDate = new Date(nextPayday);
        for (let i = 0; i < 5; i++) {
          if (isInCurrentMonthAndPast(checkDate)) {
            payCount++;
          }
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 7);
        }
        
      } else if (source.frequency === 'biweekly') {
        // Vérifier les 3 périodes précédentes
        let checkDate = new Date(nextPayday);
        for (let i = 0; i < 3; i++) {
          if (isInCurrentMonthAndPast(checkDate)) {
            payCount++;
          }
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 14);
        }
        
      } else if (source.frequency === 'monthly') {
        // Vérifier la paie de ce mois si elle est passée
        if (isInCurrentMonthAndPast(nextPayday)) {
          payCount = 1;
        } else {
          // Sinon, vérifier la paie du mois dernier
          const lastMonth = new Date(nextPayday);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          if (isInCurrentMonthAndPast(lastMonth)) {
            payCount = 1;
          }
        }
      }
      
      return total + (amount * payCount);
    }, 0);
  },

  // Obtenir le nom du mois en cours
  getCurrentMonthName: () => {
    const now = new Date();
    return now.toLocaleDateString('fr-CA', { month: 'long' });
  },

  // Actions - Dépenses récurrentes
  addRecurringExpense: (expense) => set((state) => ({
    recurringExpenses: [...state.recurringExpenses, {
      ...expense,
      id: Date.now().toString(),
    }]
  })),
  removeRecurringExpense: (id) => set((state) => ({
    recurringExpenses: state.recurringExpenses.filter(exp => exp.id !== id)
  })),
  updateRecurringExpense: (id, updates) => set((state) => ({
    recurringExpenses: state.recurringExpenses.map(exp =>
      exp.id === id ? { ...exp, ...updates } : exp
    )
  })),

  // Actions - Objectifs d'épargne
  addSavingsGoal: (goal) => set((state) => ({
    savingsGoals: [...state.savingsGoals, {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0,
    }]
  })),
  removeSavingsGoal: (id) => set((state) => ({
    savingsGoals: state.savingsGoals.filter(goal => goal.id !== id)
  })),
  updateSavingsGoal: (id, updates) => set((state) => ({
    savingsGoals: state.savingsGoals.map(goal =>
      goal.id === id ? { ...goal, ...updates } : goal
    )
  })),

  // Actions - Préférences de budget
  setBudgetPreferences: (prefs) => set({ budgetPreferences: { ...get().budgetPreferences, ...prefs } }),

  // Actions - Notifications
  setNotificationSettings: (settings) => set({
    notificationSettings: { ...get().notificationSettings, ...settings }
  }),

  // Sauvegarder et compléter l'onboarding
  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      set({ hasCompletedOnboarding: true });
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde onboarding:', error);
      return false;
    }
  },

  // Vérifier si l'onboarding est complété
  checkOnboardingStatus: async () => {
    try {
      const status = await AsyncStorage.getItem('hasCompletedOnboarding');
      set({ hasCompletedOnboarding: status === 'true' });
      return status === 'true';
    } catch (error) {
      console.error('Erreur vérification onboarding:', error);
      return false;
    }
  },

  // Obtenir toutes les données pour Firebase
  getAllOnboardingData: () => {
    const state = get();
    return {
      incomeSources: state.incomeSources,
      recurringExpenses: state.recurringExpenses,
      savingsGoals: state.savingsGoals,
      budgetPreferences: state.budgetPreferences,
      notificationSettings: state.notificationSettings,
      totalMonthlyIncome: state.getTotalIncome(),
      currentMonthIncome: state.getCurrentMonthIncome(),
      receivedMonthIncome: state.getReceivedMonthIncome(), // NOUVEAU
      currentMonthName: state.getCurrentMonthName(),
    };
  },

  // Reset (pour dev/test)
  resetOnboarding: async () => {
    await AsyncStorage.removeItem('hasCompletedOnboarding');
    set({
      currentStep: 0,
      incomeSources: [],
      recurringExpenses: [],
      savingsGoals: [],
      budgetPreferences: {
        savingsPercent: 20,
        needsPercent: 50,
        wantsPercent: 30,
      },
      notificationSettings: {
        paydayReminder: true,
        budgetAlerts: true,
        goalProgress: true,
        billReminders: true,
      },
      hasCompletedOnboarding: false,
    });
  },
}));