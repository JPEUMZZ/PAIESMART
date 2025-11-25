// app/screens/onboarding/Welcome.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function Welcome() {
  const router = useRouter();
  const { setCurrentStep } = useOnboardingStore();

  const handleStart = () => {
    setCurrentStep(1);
    router.push('/screens/onboarding/IncomeSetup');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.emoji}>💰</Text>
          <Text style={styles.title}>Bienvenue sur PaieSmart !</Text>
          <Text style={styles.subtitle}>
            Prends le contrôle de tes finances en quelques minutes
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Ce qu'on va configurer ensemble :</Text>
          
          <FeatureItem 
            icon="💵" 
            title="Tes revenus"
            description="Fréquence, montant et prochaine paie"
            step="1"
          />
          
          <FeatureItem 
            icon="🏠" 
            title="Dépenses récurrentes"
            description="Loyer, téléphone, transport..."
            step="2"
          />
          
          <FeatureItem 
            icon="🎯" 
            title="Objectifs d'épargne"
            description="Voyage, auto, fonds d'urgence..."
            step="3"
          />
          
          <FeatureItem 
            icon="⚙️" 
            title="Préférences"
            description="Budget et notifications personnalisés"
            step="4-5"
          />
        </View>

        {/* Time Estimate */}
        <View style={styles.timeEstimate}>
          <Text style={styles.timeIcon}>⏱️</Text>
          <Text style={styles.timeText}>Temps estimé : 3-5 minutes</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Commencer</Text>
        </TouchableOpacity>

        {/* Skip Option */}
        <Text style={styles.skipText}>
          Tu pourras modifier ces informations plus tard
        </Text>
      </View>
    </ScrollView>
  );
}

const FeatureItem = ({ icon, title, description, step }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Text style={styles.featureEmoji}>{icon}</Text>
    </View>
    <View style={styles.featureContent}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureTitle}>{title}</Text>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Étape {step}</Text>
        </View>
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  stepBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 11,
    color: '#2C5282',
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#48BB78',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
  },
});