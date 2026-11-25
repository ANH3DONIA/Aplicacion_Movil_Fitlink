import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { DEMO_ACCESS_KEY } from '../../data/seedData';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function ActivateInviteScreen() {
  const router = useRouter();
  const { invites, activateTrainerInvite, showToast } = useFitLink();

  const [codeOrEmail, setCodeOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confirmRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const activeSampleInvite = invites.find((i) => !i.activated && i.expiresInHours > 0);

  const handlePrefillValid = () => {
    if (!activeSampleInvite) return;
    setCodeOrEmail(activeSampleInvite.code);
    setPassword(DEMO_ACCESS_KEY);
    setConfirmPassword(DEMO_ACCESS_KEY);
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    setErrorMessage(null);
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    const result = activateTrainerInvite(codeOrEmail, password);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    showToast({
      title: 'Invitación activada',
      description: result.message,
      tone: 'success',
    });
    router.replace('/(trainer)/profile');
  };

  return (
    <ScreenWrapper withKeyboardAvoiding contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio de sesión"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={20} color={Colors.night} />
        </Pressable>
        <Text style={styles.title}>Activar invitación</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoTopRow}>
          <StatusChip label="Vigencia 48 horas" tone="info" icon="clock" />
          {activeSampleInvite ? (
            <Pressable
              onPress={handlePrefillValid}
              accessibilityRole="button"
              style={({ pressed }) => [styles.sampleBtn, pressed && styles.pressed]}
            >
              <Text style={[styles.sampleBtnText, tabularNums]}>
                Usar {activeSampleInvite.code}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.infoText}>
          Ingresa el código o correo enviado por administración para activar tu cuenta de entrenador y crear tu contraseña personal.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Código de invitación o correo</Text>
          <View style={styles.inputBox}>
            <AppIcon name="key" size={18} color={Colors.night65} />
            <TextInput
              value={codeOrEmail}
              onChangeText={setCodeOrEmail}
              placeholder="Ej. INV-4820 o fernanda@fitlink.mx"
              placeholderTextColor={Colors.night65}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
              style={[styles.input, tabularNums]}
              accessibilityLabel="Código de invitación o correo"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Definir contraseña (mínimo 8 caracteres)</Text>
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
              accessibilityLabel="Nueva contraseña"
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={styles.eyeBtn}
            >
              <AppIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} color={Colors.night70} />
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirmar contraseña</Text>
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
      </View>

      <PrimaryButton
        label="Activar cuenta y continuar"
        icon="check"
        onPress={handleSubmit}
      />

      <SecondaryButton
        label="Volver al inicio de sesión"
        variant="outline"
        onPress={() => router.back()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.title,
    color: Colors.night,
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 10,
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sampleBtn: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleBtnText: {
    ...Typography.labelSemiBold,
    color: Colors.brandBlue,
  },
  infoText: {
    ...Typography.body,
    color: Colors.night70,
  },
  formCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  inputBox: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.ice,
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
  eyeBtn: {
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
  pressed: {
    opacity: 0.78,
  },
});
