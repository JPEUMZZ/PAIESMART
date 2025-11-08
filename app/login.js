// app/login.js - VERSION AMÉLIORÉE SANS POPUPS
import React, { useState } from "react";
import { FIREBASE_AUTH } from "@/configuration/FirebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from "firebase/auth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

const logo = require("./assets/images/logo.png");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  // Réinitialiser les erreurs quand l'utilisateur tape
  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError("");
    setError("");
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError("");
    setError("");
  };

const handleLogin = async () => {
  // Réinitialiser les erreurs
  setError("");
  setEmailError("");
  setPasswordError("");

  // Validation des champs (seulement vérifier qu'ils ne sont pas vides)
  if (!email.trim()) {
    setEmailError("L'email est requis");
    return;
  }
  
  if (!password) {
    setPasswordError("Le mot de passe est requis");
    return;
  }

  setLoading(true);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    console.log("✅ Connexion réussie:", userCredential.user.email);
    // Navigate to home or dashboard
    router.push("/home");
  } catch (error) {
    // On affiche l'erreur en mode développement seulement
    if (__DEV__) {
      console.log("⚠️ Erreur de connexion:", error.code);
    }
    
    switch (error.code) {
      case "auth/invalid-email":
        setEmailError("Email invalide");
        break;
      case "auth/user-disabled":
        setError("Ce compte a été désactivé");
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        // On groupe ces erreurs pour ne pas donner d'indices
        setError("Email ou mot de passe incorrect");
        break;
      case "auth/too-many-requests":
        setError("Trop de tentatives. Veuillez réessayer plus tard");
        break;
      case "auth/network-request-failed":
        setError("Problème de connexion. Vérifiez votre internet");
        break;
      default:
        setError("Une erreur est survenue. Veuillez réessayer");
    }
  } finally {
    setLoading(false);
  }
};
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google login successful", result.user);
      // router.push("/home");
    } catch (error) {
      console.error("Google login error:", error);
      setError("Échec de la connexion avec Google. Veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      console.log("Apple login successful", result.user);
      // router.push("/home");
    } catch (error) {
      console.error("Apple login error:", error);
      setError("Échec de la connexion avec Apple. Veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // router.push("/forgot-password");
    console.log("Navigate to forgot password");
  };

  const handleSignup = () => {
    router.push("/Signup");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image 
              source={logo} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>Gérez votre argent intelligemment</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Bon retour!</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

          {/* Message d'erreur général */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailError && styles.inputError
              ]}
              placeholder="votre@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            {emailError ? (
              <Text style={styles.fieldError}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={[
              styles.passwordContainer,
              passwordError && styles.inputError
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.fieldError}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Pas encore de compte? </Text>
            <TouchableOpacity 
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  tagline: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 32,
    fontWeight: "400",
  },
  // Styles pour les messages d'erreur
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  fieldError: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    color: "#0F172A",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  passwordInput: {
    flex: 1,
    padding: 18,
    fontSize: 16,
    color: "#0F172A",
  },
  eyeIcon: {
    padding: 18,
  },
  eyeText: {
    fontSize: 22,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 28,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#6366F1",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#64748B",
    fontSize: 15,
  },
  signupLink: {
    color: "#6366F1",
    fontSize: 15,
    fontWeight: "700",
  },
});