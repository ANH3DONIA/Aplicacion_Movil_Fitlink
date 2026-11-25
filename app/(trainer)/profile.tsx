import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { InitialsAvatar } from '../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { splitCommission } from '../../data/seedData';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function TrainerProfileScreen() {
  const router = useRouter();
  const {
    currentUser,
    trainers,
    connectTrainerStripe,
    updateTrainerProfile,
    resetDemoData,
    logout,
    showToast,
  } = useFitLink();

  const trainer = useMemo(() => {
    return trainers.find((t) => t.id === currentUser?.trainerId) ?? trainers[0];
  }, [trainers, currentUser?.trainerId]);

  const [specialty, setSpecialty] = useState(trainer?.specialty ?? '');
  const [bio, setBio] = useState(trainer?.bio ?? '');
  const [rateText, setRateText] = useState(String(trainer?.rateMxn ?? 300));
  const [services, setServices] = useState<string[]>(trainer?.services ?? []);
  const [newService, setNewService] = useState('');
  const [bankInput, setBankInput] = useState(
    trainer?.stripeConnected ? trainer.bankLabel : 'BBVA · Terminación 4821'
  );
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  useEffect(() => {
    if (!trainer) return;
    setSpecialty(trainer.specialty);
    setBio(trainer.bio);
    setRateText(String(trainer.rateMxn));
    setServices(trainer.services);
    setBankInput(
      trainer.stripeConnected ? trainer.bankLabel : 'BBVA · Terminación 4821'
    );
  }, [trainer?.id]);

  const parsedRate = Number(rateText.replace(/[^0-9]/g, '')) || 0;
  const liveSplit = useMemo(() => splitCommission(parsedRate), [parsedRate]);

  const handleConnectStripe = () => {
    const result = connectTrainerStripe(bankInput);
    showToast({
      title: result.ok ? 'Cuenta vinculada' : 'Error',
      description: result.message,
      tone: result.ok ? 'success' : 'error',
    });
  };

  const handleAddService = () => {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (services.includes(trimmed)) {
      setNewService('');
      return;
    }
    setServices((prev) => [...prev, trimmed]);
    setNewService('');
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices((prev) => prev.filter((s) => s !== serviceToRemove));
  };

  const handleSave = () => {
    if (parsedRate < 100) {
      showToast({
        title: 'Tarifa inválida',
        description: 'La tarifa mínima por sesión es de $100 MXN.',
        tone: 'error',
      });
      return;
    }
    const result = updateTrainerProfile({
      specialty: specialty.trim(),
      bio: bio.trim(),
      rateMxn: parsedRate,
      services,
    });
    showToast({
      title: result.ok ? 'Perfil actualizado' : 'Error al guardar',
      description: result.message,
      tone: result.ok ? 'success' : 'error',
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
      title: 'Datos demo restaurados',
      description: 'Se restablecieron clases, solicitudes, pagos e invitaciones.',
      tone: 'info',
    });
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper scroll withKeyboardAvoiding contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={20} color={Colors.night} />
        </Pressable>
        <Text style={styles.topTitle}>Perfil profesional</Text>
      </View>

      <View style={styles.profileCard}>
        <InitialsAvatar
          name={trainer?.name ?? currentUser?.name ?? 'Coach'}
          size="lg"
          tone="blue"
        />
        <View style={styles.profileMeta}>
          <Text style={styles.coachName}>{trainer?.name ?? currentUser?.name}</Text>
          <Text style={styles.coachEmail}>{trainer?.email ?? currentUser?.email}</Text>
          <StatusChip
            label={trainer?.stripeConnected ? 'Stripe Connect activo' : 'Cobros sin vincular'}
            tone={trainer?.stripeConnected ? 'success' : 'warning'}
            icon={trainer?.stripeConnected ? 'shieldCheck' : 'alertTriangle'}
          />
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Cuenta de cobros (Stripe Connect)</Text>
        <Text style={styles.helperText}>
          {trainer?.stripeConnected
            ? `Liquidación automática del 90% activa en ${trainer.bankLabel}.`
            : 'Vincula una cuenta de prueba en Stripe Connect Express para habilitar la publicación de horarios 1-a-1 (RF-046, RF-047).'}
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cuenta bancaria receptora (modo prueba)</Text>
          <TextInput
            value={bankInput}
            onChangeText={setBankInput}
            placeholder="BBVA · Terminación 4821"
            placeholderTextColor={Colors.night65}
            style={[styles.input, tabularNums]}
            accessibilityLabel="Cuenta bancaria receptora"
          />
        </View>

        <SecondaryButton
          label={
            trainer?.stripeConnected
              ? 'Actualizar cuenta vinculada'
              : 'Vincular Stripe Connect Express'
          }
          variant={trainer?.stripeConnected ? 'outline' : 'solid'}
          icon="link"
          onPress={handleConnectStripe}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Información profesional</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Especialidad</Text>
          <TextInput
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="Ej. Spinning y acondicionamiento"
            placeholderTextColor={Colors.night65}
            style={styles.input}
            accessibilityLabel="Especialidad profesional"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descripción y experiencia</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Describe tu experiencia y enfoque de entrenamiento."
            placeholderTextColor={Colors.night65}
            multiline
            scrollEnabled={false}
            style={[styles.input, styles.textArea]}
            accessibilityLabel="Descripción profesional"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tarifa por sesión 1-a-1 (MXN)</Text>
          <TextInput
            value={rateText}
            onChangeText={setRateText}
            keyboardType="numeric"
            placeholder="350"
            placeholderTextColor={Colors.night65}
            style={[styles.input, tabularNums]}
            accessibilityLabel="Tarifa por sesión en pesos mexicanos"
          />
          <View style={styles.liveCalcBox}>
            <Text style={styles.liveCalcNet}>
              Tu ganancia neta (90%): ${liveSplit.netTrainerMxn} MXN
            </Text>
            <Text style={styles.liveCalcFee}>
              Comisión gimnasio (10%): ${liveSplit.gymFeeMxn} MXN
            </Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Servicios ofrecidos</Text>
          <View style={styles.servicesWrap}>
            {services.map((srv) => (
              <View key={srv} style={styles.serviceChip}>
                <Text style={styles.serviceChipText}>{srv}</Text>
                <Pressable
                  onPress={() => handleRemoveService(srv)}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar servicio ${srv}`}
                  style={styles.removeServiceBtn}
                  hitSlop={6}
                >
                  <AppIcon name="x" size={16} color={Colors.brandBlue} />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.addServiceRow}>
            <TextInput
              value={newService}
              onChangeText={setNewService}
              placeholder="Ej. Evaluación física"
              placeholderTextColor={Colors.night65}
              returnKeyType="done"
              style={[styles.input, styles.addServiceInput]}
              onSubmitEditing={handleAddService}
              accessibilityLabel="Nuevo servicio"
            />
            <Pressable
              onPress={handleAddService}
              accessibilityRole="button"
              accessibilityLabel="Agregar servicio"
              style={({ pressed }) => [styles.addServiceBtn, pressed && styles.pressed]}
            >
              <AppIcon name="plus" size={20} color={Colors.surfaceWhite} />
            </Pressable>
          </View>
        </View>
      </View>

      <PrimaryButton
        label="Guardar cambios"
        icon="check"
        onPress={handleSave}
      />

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

      <ConfirmModal
        visible={logoutModalVisible}
        title="¿Cerrar sesión?"
        description="Saldrás de tu cuenta de entrenador en este dispositivo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        destructive
        tone="error"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      <ConfirmModal
        visible={resetModalVisible}
        title="¿Restaurar datos demo?"
        description="Se restablecerán las clases, solicitudes, pagos e invitaciones de prueba."
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
    gap: 14,
    paddingTop: 16,
    paddingBottom: 32,
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
  topTitle: {
    ...Typography.title,
    color: Colors.night,
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
  },
  profileMeta: {
    flex: 1,
    gap: 6,
    alignItems: 'flex-start',
  },
  coachName: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  coachEmail: {
    ...Typography.label,
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
  sectionTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  helperText: {
    ...Typography.body,
    color: Colors.night70,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  input: {
    minHeight: 48,
    backgroundColor: Colors.ice,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.night,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
  },
  textArea: {
    minHeight: 124,
    textAlignVertical: 'top',
  },
  liveCalcBox: {
    backgroundColor: Colors.successSoft,
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  liveCalcNet: {
    ...Typography.bodySemiBold,
    color: Colors.successText,
    ...tabularNums,
  },
  liveCalcFee: {
    ...Typography.label,
    color: Colors.night70,
    ...tabularNums,
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 4,
    backgroundColor: Colors.blueSoft,
    paddingLeft: 12,
    paddingRight: 4,
    borderRadius: 10,
  },
  serviceChipText: {
    ...Typography.bodyMedium,
    color: Colors.brandBlue,
  },
  removeServiceBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addServiceInput: {
    flex: 1,
  },
  addServiceBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
