// app/signup.js - VERSION AMÉLIORÉE SANS POPUPS
import React, { useState } from "react";
import { FIREBASE_AUTH } from "@/configuration/FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  updateProfile,
} from "firebase/auth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const logo = require("./assets/images/logo.png");

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // États pour les erreurs
  const [error, setError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  // Réinitialiser les erreurs quand l'utilisateur tape
  const handleFullNameChange = (text) => {
    setFullName(text);
    setFullNameError("");
    setError("");
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError("");
    setError("");
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setConfirmPasswordError("");
    setError("");
  };

  const handleTermsToggle = () => {
    setAcceptedTerms(!acceptedTerms);
    setTermsError("");
    setError("");
  };

  const validateForm = () => {
    // Réinitialiser toutes les erreurs
    setError("");
    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");

    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError("Le nom complet est requis");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("L'email est requis");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Veuillez entrer un email valide");
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError("Le mot de passe est requis");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      isValid = false;
    }

    if (!acceptedTerms) {
      setTermsError("Vous devez accepter les conditions d'utilisation");
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      console.log("Signup successful", userCredential.user);
      // router.push("/home");
    } catch (error) {
      console.error("Signup error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setEmailError("Cet email est déjà utilisé");
          break;
        case "auth/invalid-email":
          setEmailError("Email invalide");
          break;
        case "auth/operation-not-allowed":
          setError("L'inscription par email est désactivée");
          break;
        case "auth/weak-password":
          setPasswordError("Le mot de passe est trop faible");
          break;
        default:
          setError("Une erreur est survenue lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!acceptedTerms) {
      setTermsError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google signup successful", result.user);
      // router.push("/home");
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Échec de l'inscription avec Google. Veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    if (!acceptedTerms) {
      setTermsError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      console.log("Apple signup successful", result.user);
      // router.push("/home");
    } catch (error) {
      console.error("Apple signup error:", error);
      setError("Échec de l'inscription avec Apple. Veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
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
          <Text style={styles.welcomeText}>Créer un compte</Text>
          <Text style={styles.subtitle}>Commencez votre parcours financier</Text>

          {/* Message d'erreur général */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={[
                styles.input,
                fullNameError && styles.inputError
              ]}
              placeholder="Joun Peumzz"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={handleFullNameChange}
              autoCapitalize="words"
              editable={!loading}
            />
            {fullNameError ? (
              <Text style={styles.fieldError}>{fullNameError}</Text>
            ) : null}
          </View>

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
                placeholder="Min. 6 caractères"
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={[
              styles.passwordContainer,
              confirmPasswordError && styles.inputError
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Retapez votre mot de passe"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.fieldError}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Terms and Conditions Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleTermsToggle}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox, 
              acceptedTerms && styles.checkboxChecked,
              termsError && styles.checkboxError
            ]}>
              {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              J'accepte les{" "}
              <Text style={styles.linkText}>conditions d'utilisation</Text> et la{" "}
              <Text style={styles.linkText}>politique de confidentialité</Text>
            </Text>
          </TouchableOpacity>
          {termsError ? (
            <Text style={[styles.fieldError, styles.termsErrorText]}>{termsError}</Text>
          ) : null}

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte? </Text>
            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Se connecter</Text>
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
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 70,
    height: 70,
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
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 28,
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
  termsErrorText: {
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 36,
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  checkboxError: {
    borderColor: "#DC2626",
  },
  inputContainer: {
    marginBottom: 18,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    backgroundColor: "#F8FAFC",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  checkmark: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 21,
  },
  linkText: {
    color: "#6366F1",
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#6366F1",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  signupButtonText: {
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
    marginBottom: 20,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
  },
  loginText: {
    color: "#64748B",
    fontSize: 15,
  },
  loginLink: {
    color: "#6366F1",
    fontSize: 15,
    fontWeight: "700",
  },
});