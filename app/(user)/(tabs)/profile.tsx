import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon } from '../../../components/ui/AppIcon';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { GymInfoModal } from '../../../components/ui/GymInfoModal';
import { InitialsAvatar } from '../../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { useFitLink } from '../../../store/FitLinkMobileContext';

export default function UserProfileScreen() {
  const router = useRouter();
  const {
    currentUser,
    plans,
    notifications,
    updateUserProfile,
    updateUserPreferences,
    cancelAutoRenew,
    resetDemoData,
    logout,
    showToast,
  } = useFitLink();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name ?? '');
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone ?? '');
  const [gymModalVisible, setGymModalVisible] = useState(false);
  const [cancelRenewModalVisible, setCancelRenewModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  useEffect(() => {
    setNameInput(currentUser?.name ?? '');
    setPhoneInput(currentUser?.phone ?? '');
  }, [currentUser?.name, currentUser?.phone]);

  const activePlan = useMemo(
    () => plans.find((p) => p.id === currentUser?.planId) ?? null,
    [plans, currentUser?.planId]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.role === 'usuario' && !n.read).length,
    [notifications]
  );

  const membershipTone =
    currentUser?.membershipStatus === 'Activa'
      ? 'success'
      : currentUser?.membershipStatus === 'Por vencer' ||
        currentUser?.membershipStatus === 'Pago pendiente'
      ? 'warning'
      : 'error';

  const handleSaveProfile = () => {
    const result = updateUserProfile({ name: nameInput, phone: phoneInput });
    if (!result.ok) {
      showToast({
        title: 'Revisa tus datos',
        description: result.message,
        tone: 'error',
      });
      return;
    }
    setEditModalVisible(false);
    showToast({
      title: 'Perfil actualizado',
      description: result.message,
      tone: 'success',
    });
  };

  const handleConfirmCancelAutoRenew = () => {
    setCancelRenewModalVisible(false);
    const result = cancelAutoRenew();
    showToast({
      title: result.ok ? 'Renovación cancelada' : 'Aviso',
      description: result.message,
      tone: result.ok ? 'info' : 'warning',
    });
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
    router.replace('/(auth)/login');
  };

  const handleConfirmReset = async () => {
    setResetModalVisible(false);
    await resetDemoData();
    showToast({
      title: 'Datos semilla restaurados',
      description: 'Se restablecieron clases, reservas, pagos e invitaciones.',
      tone: 'info',
    });
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <InitialsAvatar
          name={currentUser?.name ?? 'Socio FitLink'}
          size="lg"
          tone="blue"
        />
        <View style={styles.profileTextWrap}>
          <Text style={styles.userName} numberOfLines={1}>
            {currentUser?.name ?? 'Socio FitLink'}
          </Text>
          <Text style={styles.userMeta} numberOfLines={1}>
            {currentUser?.email ?? 'socio@fitlink.mx'}
          </Text>
          <Text style={[styles.userPhone, tabularNums]}>
            {currentUser?.phone ?? '+52 653 000 0000'}
          </Text>
        </View>
        <Pressable
          onPress={() => setEditModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Editar nombre y teléfono"
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
        >
          <AppIcon name="edit" size={18} color={Colors.brandBlue} />
        </Pressable>
      </View>

      <View style={styles.membershipCard}>
        <View style={styles.membershipTop}>
          <View style={styles.membershipTitleWrap}>
            <Text style={styles.membershipLabel}>Tu membresía</Text>
            <Text style={styles.membershipName}>
              {currentUser?.planName ?? activePlan?.name ?? 'Sin plan activo'}
            </Text>
          </View>
          <StatusChip
            label={currentUser?.membershipStatus ?? 'Activa'}
            tone={membershipTone}
          />
        </View>

        <Text style={[styles.membershipExpiry, tabularNums]}>
          {currentUser?.planId === 'plan-dia' && currentUser?.passValidDate
            ? `Pase válido para: ${currentUser.passValidDate}`
            : `Vigencia hasta: ${currentUser?.membershipExpiresAt ?? 'Sin fecha'}`}
        </Text>

        <Text style={styles.renewStatusNote}>
          {currentUser?.autoRenew
            ? 'Cobro mensual automático activo con tarjeta'
            : 'Sin renovación automática · Acceso activo hasta el fin del periodo'}
        </Text>

        <PrimaryButton
          label="Planes y membresías"
          icon="award"
          onPress={() => router.push('/(user)/memberships')}
        />

        {currentUser?.autoRenew ? (
          <Pressable
            onPress={() => setCancelRenewModalVisible(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cancelRenewLink, pressed && styles.pressed]}
          >
            <Text style={styles.cancelRenewText}>Cancelar renovación automática</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mi cuenta</Text>

        <Pressable
          onPress={() => router.push('/(user)/payments')}
          accessibilityRole="button"
          accessibilityLabel="Ir al historial de pagos"
          style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        >
          <View style={styles.menuIconWrap}>
            <AppIcon name="wallet" size={20} color={Colors.brandBlue} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Historial de pagos</Text>
            <Text style={styles.menuSub}>Recibos, reembolsos y fichas en caja</Text>
          </View>
          <AppIcon name="chevronRight" size={20} color={Colors.night65} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={() => router.push('/(user)/notifications')}
          accessibilityRole="button"
          accessibilityLabel="Ir a notificaciones"
          style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        >
          <View style={styles.menuIconWrap}>
            <AppIcon name="bell" size={20} color={Colors.brandBlue} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Notificaciones</Text>
            <Text style={styles.menuSub}>
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
            </Text>
          </View>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, tabularNums]}>{unreadCount}</Text>
            </View>
          ) : null}
          <AppIcon name="chevronRight" size={20} color={Colors.night65} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={() => setGymModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Ver información y horarios del gimnasio"
          style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        >
          <View style={styles.menuIconWrap}>
            <AppIcon name="building" size={20} color={Colors.brandBlue} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>FitLink Gym</Text>
            <Text style={styles.menuSub}>Ubicación, horarios y políticas</Text>
          </View>
          <AppIcon name="chevronRight" size={20} color={Colors.night65} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Avisos</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.menuTitle}>Recordatorios de clase</Text>
            <Text style={styles.menuSub}>Aviso 2 h antes de iniciar</Text>
          </View>
          <Switch
            value={currentUser?.preferences.classReminders ?? true}
            onValueChange={(value) =>
              updateUserPreferences({ classReminders: value })
            }
            trackColor={{ false: Colors.borderCrisp, true: Colors.brandBlue }}
            thumbColor={Colors.surfaceWhite}
            accessibilityLabel="Activar recordatorios de clase"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.menuTitle}>Alertas de pago y caja</Text>
            <Text style={styles.menuSub}>Confirmaciones y vigencia de fichas</Text>
          </View>
          <Switch
            value={currentUser?.preferences.paymentAlerts ?? true}
            onValueChange={(value) =>
              updateUserPreferences({ paymentAlerts: value })
            }
            trackColor={{ false: Colors.borderCrisp, true: Colors.brandBlue }}
            thumbColor={Colors.surfaceWhite}
            accessibilityLabel="Activar alertas de pago y caja"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.menuTitle}>Lista de espera</Text>
            <Text style={styles.menuSub}>Aviso cuando se libere un cupo</Text>
          </View>
          <Switch
            value={currentUser?.preferences.waitlistAlerts ?? true}
            onValueChange={(value) =>
              updateUserPreferences({ waitlistAlerts: value })
            }
            trackColor={{ false: Colors.borderCrisp, true: Colors.brandBlue }}
            thumbColor={Colors.surfaceWhite}
            accessibilityLabel="Activar alertas de lista de espera"
          />
        </View>
      </View>

      <View style={styles.actionsGap}>
        <SecondaryButton
          label="Restaurar datos demo"
          variant="outline"
          icon="refresh"
          onPress={() => setResetModalVisible(true)}
        />
        <SecondaryButton
          label="Cerrar sesión"
          variant="destructive"
          icon="logOut"
          onPress={() => setLogoutModalVisible(true)}
        />
      </View>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar datos personales</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Tu nombre completo"
                placeholderTextColor={Colors.night65}
                autoComplete="name"
                style={styles.input}
                accessibilityLabel="Nombre completo"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Teléfono</Text>
              <TextInput
                value={phoneInput}
                onChangeText={setPhoneInput}
                placeholder="+52 653 120 8890"
                placeholderTextColor={Colors.night65}
                keyboardType="phone-pad"
                autoComplete="tel"
                style={[styles.input, tabularNums]}
                accessibilityLabel="Teléfono"
              />
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancelar"
                variant="outline"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalBtn}
              />
              <SecondaryButton
                label="Guardar"
                variant="solid"
                icon="check"
                onPress={handleSaveProfile}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <GymInfoModal
        visible={gymModalVisible}
        onClose={() => setGymModalVisible(false)}
      />

      <ConfirmModal
        visible={cancelRenewModalVisible}
        title="¿Cancelar renovación automática?"
        description={`No se realizará ningún cobro mensual adicional y conservarás tu acceso completo hasta el ${currentUser?.membershipExpiresAt ?? 'fin del periodo'}.`}
        confirmLabel="Sí, cancelar renovación"
        cancelLabel="Mantener activa"
        destructive
        tone="warning"
        onConfirm={handleConfirmCancelAutoRenew}
        onCancel={() => setCancelRenewModalVisible(false)}
      />

      <ConfirmModal
        visible={logoutModalVisible}
        title="¿Cerrar sesión?"
        description="Saldrás de tu cuenta actual en este dispositivo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        destructive
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      <ConfirmModal
        visible={resetModalVisible}
        title="¿Restaurar datos demo?"
        description="Se restablecerán las clases, reservas, pagos e invitaciones de demostración."
        confirmLabel="Restaurar"
        cancelLabel="Cancelar"
        destructive
        tone="warning"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetModalVisible(false)}
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
  },
  profileTextWrap: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  userMeta: {
    ...Typography.label,
    color: Colors.night70,
  },
  userPhone: {
    ...Typography.bodyMedium,
    color: Colors.night,
  },
  editBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipCard: {
    backgroundColor: Colors.brandBlue,
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  membershipTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  membershipTitleWrap: {
    flex: 1,
  },
  membershipLabel: {
    ...Typography.labelSemiBold,
    color: Colors.white75,
  },
  membershipName: {
    ...Typography.subtitleSora,
    color: Colors.surfaceWhite,
    marginTop: 2,
  },
  membershipExpiry: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
  },
  renewStatusNote: {
    ...Typography.label,
    color: Colors.white75,
    marginBottom: 4,
  },
  cancelRenewLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRenewText: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  menuSub: {
    ...Typography.label,
    color: Colors.night65,
    marginTop: 2,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.magentaSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...Typography.labelSemiBold,
    color: Colors.magentaDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderCrisp,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    gap: 12,
  },
  switchTextWrap: {
    flex: 1,
  },
  actionsGap: {
    gap: 12,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,38,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Colors.ice,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    paddingHorizontal: 14,
    ...Typography.body,
    color: Colors.night,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
