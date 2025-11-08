import React, { useState, useEffect } from "react";
import { FIREBASE_AUTH } from "@/configuration/FirebaseConfig";
import { signOut } from "firebase/auth";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  useEffect(() => {
    // Vérifier l'authentification de l'utilisateur
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Si pas connecté, rediriger vers login
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ Déconnexion réussie");
      router.replace("/login");
    } catch (error) {
      console.error("❌ Erreur de déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>
              {user?.displayName || user?.email?.split("@")[0] || "Utilisateur"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde Total</Text>
          <Text style={styles.balanceAmount}>2 450,00 €</Text>
          <View style={styles.balanceChange}>
            <Text style={styles.changePositive}>+5.2%</Text>
            <Text style={styles.changeText}> ce mois</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Text style={styles.actionEmoji}>💸</Text>
              </View>
              <Text style={styles.actionText}>Envoyer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: "#D1FAE5" }]}>
                <Text style={styles.actionEmoji}>💰</Text>
              </View>
              <Text style={styles.actionText}>Recevoir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionText}>Analyser</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: "#E0E7FF" }]}>
                <Text style={styles.actionEmoji}>⚙️</Text>
              </View>
              <Text style={styles.actionText}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            <TransactionItem
              icon="🛒"
              title="Supermarché"
              date="Aujourd'hui, 14:30"
              amount="-45,20 €"
              isNegative={true}
            />
            <TransactionItem
              icon="💼"
              title="Salaire"
              date="Hier, 09:00"
              amount="+2 500,00 €"
              isNegative={false}
            />
            <TransactionItem
              icon="☕"
              title="Café"
              date="Hier, 08:15"
              amount="-4,50 €"
              isNegative={true}
            />
            <TransactionItem
              icon="🎬"
              title="Netflix"
              date="15 Oct"
              amount="-13,99 €"
              isNegative={true}
            />
          </View>
        </View>

        {/* Spending Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dépenses par catégorie</Text>
          <View style={styles.categoriesList}>
            <CategoryItem
              icon="🍔"
              title="Alimentation"
              amount="342,50 €"
              percentage={45}
              color="#6366F1"
            />
            <CategoryItem
              icon="🚗"
              title="Transport"
              amount="180,00 €"
              percentage={30}
              color="#8B5CF6"
            />
            <CategoryItem
              icon="🎮"
              title="Loisirs"
              amount="95,80 €"
              percentage={15}
              color="#EC4899"
            />
            <CategoryItem
              icon="📱"
              title="Abonnements"
              amount="67,99 €"
              percentage={10}
              color="#F59E0B"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Composant pour une transaction
const TransactionItem = ({ icon, title, date, amount, isNegative }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeft}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionEmoji}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
    </View>
    <Text
      style={[
        styles.transactionAmount,
        isNegative ? styles.amountNegative : styles.amountPositive,
      ]}
    >
      {amount}
    </Text>
  </View>
);

// Composant pour une catégorie
const CategoryItem = ({ icon, title, amount, percentage, color }) => (
  <View style={styles.categoryItem}>
    <View style={styles.categoryLeft}>
      <View style={[styles.categoryIcon, { backgroundColor: color + "20" }]}>
        <Text style={styles.categoryEmoji}>{icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryAmount}>{amount}</Text>
      </View>
    </View>
    <View style={styles.categoryRight}>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.categoryPercentage}>{percentage}%</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutIcon: {
    fontSize: 24,
  },
  balanceCard: {
    backgroundColor: "#6366F1",
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#E0E7FF",
    fontWeight: "600",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
  },
  changePositive: {
    fontSize: 16,
    fontWeight: "700",
    color: "#86EFAC",
  },
  changeText: {
    fontSize: 14,
    color: "#E0E7FF",
    fontWeight: "500",
  },
  sectionContainer: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  transactionsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 24,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  amountNegative: {
    color: "#EF4444",
  },
  amountPositive: {
    color: "#10B981",
  },
  categoriesList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  categoryRight: {
    alignItems: "flex-end",
    marginLeft: 16,
  },
  progressBarContainer: {
    width: 80,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
});