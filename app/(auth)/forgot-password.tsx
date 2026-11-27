import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useFitLink();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      const msg = 'Ingresa un correo electrónico válido para enviar el enlace.';
      setErrorMessage(msg);
      return;
    }

    setErrorMessage(null);
    setSent(true);
    showToast({
      title: 'Enlace de recuperación enviado',
      description: `Válido por 1 hora en ${clean}.`,
      tone: 'success',
    });
  };

  return (
    <ScreenWrapper withKeyboardAvoiding contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio de sesión"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={20} color={Colors.night} />
        </Pressable>
        <Text style={styles.title}>Recuperar contraseña</Text>
      </View>

      <View style={styles.card}>
        <StatusChip label="Enlace válido por 1 hora" tone="info" icon="clock" />
        <Text style={styles.description}>
          Ingresa el correo asociado a tu cuenta de socio o entrenador para recibir un enlace temporal de restablecimiento.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <View style={styles.inputBox}>
            <AppIcon name="mail" size={18} color={Colors.night65} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="sofia@fitlink.mx"
              placeholderTextColor={Colors.night65}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              style={styles.input}
              accessibilityLabel="Correo electrónico"
            />
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <AppIcon name="alertCircle" size={18} color={Colors.errorText} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {sent ? (
          <View style={styles.successCard}>
            <AppIcon name="checkCircle" size={20} color={Colors.successText} />
            <Text style={styles.successText}>
              Si existe una cuenta para {email.trim().toLowerCase()}, recibirás un enlace con vigencia de 60 minutos.
            </Text>
          </View>
        ) : null}
      </View>

      <PrimaryButton
        label={sent ? 'Reenviar enlace' : 'Enviar enlace de recuperación'}
        icon="mail"
        onPress={handleSend}
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
  container: {
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
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 14,
  },
  description: {
    ...Typography.body,
    color: Colors.night70,
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
  successCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.successSoft,
    borderRadius: 12,
    padding: 14,
  },
  successText: {
    ...Typography.body,
    color: Colors.successText,
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
  },
});
