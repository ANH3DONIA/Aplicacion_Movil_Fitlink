import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { InitialsAvatar } from '../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { formatShortDateES, splitCommission } from '../../data/seedData';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function SessionConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trainerId?: string }>();
  const trainerId = typeof params.trainerId === 'string' ? params.trainerId : '';

  const { trainers, requestSession, showToast } = useFitLink();

  const trainer = useMemo(
    () => trainers.find((t) => t.id === trainerId) ?? null,
    [trainers, trainerId]
  );

  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  useEffect(() => {
    setSelectedService(trainer?.services[0] ?? '');
    setSelectedSlotId(trainer?.availability[0]?.id ?? '');
  }, [trainerId, trainer]);

  if (!trainer) {
    return (
      <ScreenWrapper contentContainerStyle={styles.emptyWrap}>
        <EmptyState
          icon="users"
          title="Entrenador no encontrado"
          description="Selecciona un entrenador disponible del catálogo para agendar tu sesión."
          actionLabel="Volver a coaches"
          onActionPress={() => router.back()}
        />
      </ScreenWrapper>
    );
  }

  const selectedSlot =
    trainer.availability.find((s) => s.id === selectedSlotId) ?? null;
  const { netTrainerMxn, gymFeeMxn } = splitCommission(trainer.rateMxn);

  const handleSubmit = () => {
    if (!selectedSlot || !selectedService) {
      showToast({
        title: 'Selecciona horario y servicio',
        description: 'Elige un servicio y un horario disponible para continuar.',
        tone: 'warning',
      });
      return;
    }

    const result = requestSession(
      trainer.id,
      selectedSlot.day,
      selectedSlot.slot,
      selectedService
    );

    if (!result.ok) {
      showToast({
        title: 'No se pudo enviar la solicitud',
        description: result.message,
        tone: 'error',
      });
      return;
    }

    showToast({
      title: 'Solicitud enviada',
      description: result.message,
      tone: 'success',
    });
    router.replace('/(user)/(tabs)/bookings');
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <AppIcon name="arrowLeft" size={20} color={Colors.night} />
        </Pressable>
        <Text style={styles.title}>Solicitar sesión 1-a-1</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.trainerRow}>
          <InitialsAvatar name={trainer.name} size="md" tone="blue" />
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>{trainer.name}</Text>
            <Text style={styles.trainerSpec}>{trainer.specialty}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Servicio</Text>
        <View style={styles.chipsWrap}>
          {trainer.services.map((service) => {
            const active = selectedService === service;
            return (
              <Pressable
                key={service}
                onPress={() => setSelectedService(service)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.optionChip,
                  active ? styles.optionChipActive : styles.optionChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    active
                      ? styles.optionChipTextActive
                      : styles.optionChipTextInactive,
                  ]}
                >
                  {service}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Horarios disponibles</Text>
        {trainer.availability.length === 0 ? (
          <Text style={styles.emptySlotsText}>
            Este entrenador no tiene horarios publicados por el momento.
          </Text>
        ) : (
          <View style={styles.slotsGap}>
            {trainer.availability.map((item) => {
              const active = selectedSlotId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedSlotId(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.slotRow,
                    active && styles.slotRowActive,
                  ]}
                >
                  <AppIcon
                    name="clock"
                    size={18}
                    color={active ? Colors.brandBlue : Colors.night65}
                  />
                  <Text style={[styles.slotText, tabularNums]}>
                    {formatShortDateES(item.day)} ({item.day}) · {item.slot}
                  </Text>
                  <AppIcon
                    name={active ? 'checkCircle' : 'circle'}
                    size={18}
                    color={active ? Colors.brandBlue : Colors.night65}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Desglose (RN-08)</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tarifa de la sesión</Text>
          <Text style={[styles.summaryValue, tabularNums]}>
            ${trainer.rateMxn.toLocaleString('es-MX')} MXN
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Entrenador (90%)</Text>
          <Text style={[styles.summaryValue, tabularNums]}>
            ${netTrainerMxn.toLocaleString('es-MX')} MXN
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Comisión gimnasio (10%)</Text>
          <Text style={[styles.summaryValue, tabularNums]}>
            ${gymFeeMxn.toLocaleString('es-MX')} MXN
          </Text>
        </View>

        <View style={styles.infoBanner}>
          <AppIcon name="info" size={18} color={Colors.infoText} />
          <Text style={styles.infoBannerText}>
            Sin cargo inicial. Cuando el entrenador acepte tendrás 12 horas para pagar con tarjeta (RN-07).
          </Text>
        </View>
      </View>

      <PrimaryButton
        label="Enviar solicitud"
        icon="calendarCheck"
        disabled={!selectedSlot || !selectedService}
        onPress={handleSubmit}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backButton: {
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
    gap: 12,
  },
  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  trainerSpec: {
    ...Typography.body,
    color: Colors.night70,
  },
  sectionTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  optionChipInactive: {
    backgroundColor: Colors.ice,
    borderColor: Colors.borderCrisp,
  },
  optionChipText: {
    ...Typography.bodyMedium,
  },
  optionChipTextActive: {
    color: Colors.surfaceWhite,
  },
  optionChipTextInactive: {
    color: Colors.night,
  },
  slotsGap: {
    gap: 8,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderCrisp,
    backgroundColor: Colors.surfaceWhite,
  },
  slotRowActive: {
    borderColor: Colors.brandBlue,
    backgroundColor: Colors.blueSoft,
  },
  slotText: {
    ...Typography.bodySemiBold,
    color: Colors.night,
    flex: 1,
  },
  emptySlotsText: {
    ...Typography.body,
    color: Colors.night70,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.night70,
  },
  summaryValue: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.infoSoft,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoBannerText: {
    ...Typography.label,
    color: Colors.infoText,
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
