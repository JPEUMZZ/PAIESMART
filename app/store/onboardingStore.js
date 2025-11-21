import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOnboardingStore = create((set) => ({
  // État
  currentStep: 0,
  payFrequency: 'biweekly',
  netIncome: '',
  nextPayday: new Date(),
  fixedExpenses: [],
  hasCompletedOnboarding: false,

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setPayFrequency: (frequency) => set({ payFrequency: frequency }),
  
  setNetIncome: (income) => set({ netIncome: income }),
  
  setNextPayday: (date) => set({ nextPayday: date }),
  
  addFixedExpense: (expense) =>
    set((state) => ({
      fixedExpenses: [...state.fixedExpenses, expense],
    })),
  
  removeFixedExpense: (id) =>
    set((state) => ({
      fixedExpenses: state.fixedExpenses.filter((exp) => exp.id !== id),
    })),

  // Sauvegarder et marquer comme complété
  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      set({ hasCompletedOnboarding: true });
      // Ici tu enverras aussi les données à Firebase
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

  // Reset (pour dev/test)
  resetOnboarding: async () => {
    await AsyncStorage.removeItem('hasCompletedOnboarding');
    set({
      currentStep: 0,
      payFrequency: 'biweekly',
      netIncome: '',
      nextPayday: new Date(),
      fixedExpenses: [],
      hasCompletedOnboarding: false,
    });
  },
}));