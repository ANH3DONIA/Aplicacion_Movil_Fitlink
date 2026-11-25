import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Image,
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
import { DEMO_ACCESS_KEY } from '../../data/seedData';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { UserRole } from '../../types/fitlink';

const DEMO_ACCOUNTS: Record<UserRole, { email: string; label: string }> = {
  usuario: { email: 'sofia@fitlink.mx', label: 'Sofía Ramírez' },
  entrenador: { email: 'carlos@fitlink.mx', label: 'Carlos Mendoza' },
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, showToast } = useFitLink();

  const [role, setRole] = useState<UserRole>('usuario');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const handleSelectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setErrorMessage(null);
  };

  const handleFillDemo = () => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCESS_KEY);
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    setErrorMessage(null);
    const result = login(email, password, role);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    showToast({
      title: result.message,
      tone: 'success',
    });
    router.replace(role === 'entrenador' ? '/(trainer)/(tabs)' : '/(user)/(tabs)');
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
            <View style={styles.heroTopRow}>
              <Image
                source={require('../../assets/brand/fitlink-logo-amarillo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="FitLink"
              />
              <Pressable
                onPress={handleFillDemo}
                accessibilityRole="button"
                accessibilityLabel={`Cargar cuenta demo de ${role === 'usuario' ? 'Socio' : 'Entrenador'}`}
                style={({ pressed }) => [styles.demoChip, pressed && styles.pressed]}
              >
                <AppIcon name="key" size={14} color={Colors.surfaceWhite} />
                <Text style={styles.demoChipText}>Demo</Text>
              </Pressable>
            </View>
            <Text style={styles.heroTitle}>Acceso FitLink Gym</Text>
          </View>

          <View style={styles.sheet}>
            <View style={styles.roleSwitch} accessibilityRole="tablist">
              <Pressable
                onPress={() => handleSelectRole('usuario')}
                accessibilityRole="tab"
                accessibilityState={{ selected: role === 'usuario' }}
                style={[styles.roleOption, role === 'usuario' && styles.roleOptionActive]}
              >
                <AppIcon
                  name="user"
                  size={16}
                  color={role === 'usuario' ? Colors.surfaceWhite : Colors.night70}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'usuario' && styles.roleOptionTextActive,
                  ]}
                >
                  Socio
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelectRole('entrenador')}
                accessibilityRole="tab"
                accessibilityState={{ selected: role === 'entrenador' }}
                style={[styles.roleOption, role === 'entrenador' && styles.roleOptionActive]}
              >
                <AppIcon
                  name="dumbbell"
                  size={16}
                  color={role === 'entrenador' ? Colors.surfaceWhite : Colors.night70}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'entrenador' && styles.roleOptionTextActive,
                  ]}
                >
                  Entrenador
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
              <View style={styles.inputBox}>
                <AppIcon name="mail" size={18} color={Colors.night65} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={DEMO_ACCOUNTS[role].email}
                  placeholderTextColor={Colors.night65}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  style={styles.input}
                  accessibilityLabel="Correo electrónico"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.fieldLabel}>Contraseña</Text>
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.inlineLink, pressed && styles.pressed]}
                >
                  <Text style={styles.inlineLinkText}>¿Olvidaste tu clave?</Text>
                </Pressable>
              </View>
              <View style={styles.inputBox}>
                <AppIcon name="lock" size={18} color={Colors.night65} />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={Colors.night65}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
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

            {errorMessage ? (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <AppIcon name="alertCircle" size={18} color={Colors.errorText} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <PrimaryButton label="Iniciar sesión" onPress={handleSubmit} />

            {role === 'usuario' ? (
              <Pressable
                onPress={() => router.push('/(auth)/register')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.secondaryRowLink, pressed && styles.pressed]}
              >
                <Text style={styles.linkText}>¿Nuevo socio? Crear cuenta</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => router.push('/(auth)/activate-invite')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.inviteCard, pressed && styles.pressed]}
            >
              <View style={styles.inviteIconBox}>
                <AppIcon name="key" size={18} color={Colors.brandBlue} />
              </View>
              <View style={styles.inviteTextWrap}>
                <Text style={styles.inviteTitle}>Activar invitación de entrenador</Text>
                <Text style={styles.inviteSub}>Primer acceso · vigencia 48{'\u00A0'}h</Text>
              </View>
              <AppIcon name="chevronRight" size={18} color={Colors.night65} />
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
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logo: {
    width: 140,
    height: 40,
  },
  demoChip: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.white18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  demoChipText: {
    ...Typography.labelSemiBold,
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
    paddingBottom: 24,
    gap: 14,
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 4,
    gap: 4,
  },
  roleOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  roleOptionActive: {
    backgroundColor: Colors.brandBlue,
  },
  roleOptionText: {
    ...Typography.bodySemiBold,
    color: Colors.night70,
  },
  roleOptionTextActive: {
    color: Colors.surfaceWhite,
  },
  fieldGroup: {
    gap: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fieldLabel: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  inlineLink: {
    minHeight: 48,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  inlineLinkText: {
    ...Typography.labelSemiBold,
    color: Colors.brandBlue,
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
  secondaryRowLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
  inviteCard: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
  },
  inviteIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteTextWrap: {
    flex: 1,
    gap: 2,
  },
  inviteTitle: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  inviteSub: {
    ...Typography.label,
    color: Colors.night65,
  },
  pressed: {
    opacity: 0.78,
  },
});
