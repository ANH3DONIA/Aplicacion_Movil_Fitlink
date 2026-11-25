import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../components/ui/AppIcon';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, showToast } = useFitLink();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const passRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confirmRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const handleSubmit = () => {
    setErrorMessage(null);
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    const result = register(name, email, password);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    showToast({ title: result.message, tone: 'success' });
    router.replace('/(user)/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Volver al inicio de sesión"
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <AppIcon name="arrowLeft" size={20} color={Colors.surfaceWhite} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <Text style={styles.heroTitle}>Registro de socio</Text>
          </View>

          <View style={styles.sheet}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <View style={styles.inputBox}>
                <AppIcon name="user" size={18} color={Colors.night65} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej. Ana López"
                  placeholderTextColor={Colors.night65}
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  style={styles.input}
                  accessibilityLabel="Nombre completo"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
              <View style={styles.inputBox}>
                <AppIcon name="mail" size={18} color={Colors.night65} />
                <TextInput
                  ref={emailRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ana.lopez@correo.com"
                  placeholderTextColor={Colors.night65}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                  style={styles.input}
                  accessibilityLabel="Correo electrónico"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contraseña (mínimo 8 caracteres)</Text>
              <View style={styles.inputBox}>
                <AppIcon name="lock" size={18} color={Colors.night65} />
                <TextInput
                  ref={passRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={Colors.night65}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  style={styles.input}
                  accessibilityLabel="Contraseña"
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={styles.eyeButton}
                >
                  <AppIcon
                    name={showPassword ? 'eyeOff' : 'eye'}
                    size={18}
                    color={Colors.night70}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirmar contraseña</Text>
              <View style={styles.inputBox}>
                <AppIcon name="shieldCheck" size={18} color={Colors.night65} />
                <TextInput
                  ref={confirmRef}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={Colors.night65}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={styles.input}
                  accessibilityLabel="Confirmar contraseña"
                />
              </View>
            </View>

            {errorMessage ? (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <AppIcon name="alertCircle" size={18} color={Colors.errorText} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <PrimaryButton label="Crear cuenta" onPress={handleSubmit} style={styles.submitBtn} />

            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={({ pressed }) => [styles.loginLink, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.night,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    backgroundColor: Colors.night,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 8,
  },
  backBtn: {
    minHeight: 48,
    minWidth: 48,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  backText: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
  },
  heroTitle: {
    ...Typography.title,
    color: Colors.surfaceWhite,
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.ice,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  inputBox: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.night,
    paddingVertical: 12,
  },
  eyeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.errorSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.errorText,
    flex: 1,
  },
  submitBtn: {
    marginTop: 4,
  },
  loginLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
  pressed: {
    opacity: 0.78,
  },
});
