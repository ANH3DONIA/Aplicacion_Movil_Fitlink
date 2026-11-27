import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon } from '../../../components/ui/AppIcon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { InitialsAvatar } from '../../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { formatShortDateES } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';

const SPECIALTY_FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'spinning', label: 'Spinning / HIIT' },
  { key: 'yoga', label: 'Yoga / Pilates' },
  { key: 'box', label: 'Box / Fuerza' },
  { key: 'funcional', label: 'Funcional' },
] as const;

const RATE_FILTERS = [
  { key: 'all', label: 'Toda tarifa', max: 99999 },
  { key: '300', label: 'Hasta $300', max: 300 },
  { key: '350', label: 'Hasta $350', max: 350 },
] as const;

export default function UserCoachesScreen() {
  const router = useRouter();
  const { currentUser, trainers, sessions } = useFitLink();

  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyKey, setSpecialtyKey] = useState<string>('all');
  const [rateKey, setRateKey] = useState<string>('all');

  const memberId = currentUser?.id ?? '';

  const acceptedPendingSessions = useMemo(
    () =>
      sessions.filter(
        (s) => s.memberId === memberId && s.status === 'Aceptada'
      ),
    [sessions, memberId]
  );

  const firstPendingPayment = acceptedPendingSessions[0] ?? null;

  const filteredTrainers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const maxRate = RATE_FILTERS.find((r) => r.key === rateKey)?.max ?? 99999;

    return trainers.filter((tr) => {
      if (tr.rateMxn > maxRate) return false;
      if (specialtyKey !== 'all') {
        const spec = tr.specialty.toLowerCase();
        if (specialtyKey === 'spinning' && !spec.includes('spinning') && !spec.includes('hiit')) {
          return false;
        }
        if (specialtyKey === 'yoga' && !spec.includes('yoga') && !spec.includes('pilates')) {
          return false;
        }
        if (specialtyKey === 'box' && !spec.includes('box') && !spec.includes('fuerza')) {
          return false;
        }
        if (specialtyKey === 'funcional' && !spec.includes('funcional') && !spec.includes('movilidad')) {
          return false;
        }
      }
      if (q.length > 0) {
        const haystack = `${tr.name} ${tr.specialty} ${tr.services.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [trainers, searchQuery, specialtyKey, rateKey]);

  const hasFilters = searchQuery.trim().length > 0 || specialtyKey !== 'all' || rateKey !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSpecialtyKey('all');
    setRateKey('all');
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Entrenadores 1-a-1</Text>

      <View style={styles.searchBox}>
        <AppIcon name="search" size={20} color={Colors.night65} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar entrenador o servicio…"
          placeholderTextColor={Colors.night65}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Buscar entrenador por nombre"
        />
        {searchQuery.length > 0 ? (
          <Pressable
            onPress={() => setSearchQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            style={styles.clearBtn}
          >
            <AppIcon name="x" size={18} color={Colors.night65} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.filterRow}
      >
        {SPECIALTY_FILTERS.map((item) => {
          const active = specialtyKey === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setSpecialtyKey(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.filterChip,
                active ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active ? styles.filterChipTextActive : styles.filterChipTextInactive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.rateRow}>
        {RATE_FILTERS.map((item) => {
          const active = rateKey === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setRateKey(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.rateChip,
                active ? styles.rateChipActive : styles.rateChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.rateChipText,
                  tabularNums,
                  active ? styles.rateChipTextActive : styles.rateChipTextInactive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {firstPendingPayment && !hasFilters ? (
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <AppIcon name="creditCard" size={14} color={Colors.surfaceWhite} />
              <Text style={styles.heroBadgeText}>Pago pendiente</Text>
            </View>
            <Text style={[styles.heroAmountTag, tabularNums]}>
              ${firstPendingPayment.grossMxn}{'\u00A0'}MXN
            </Text>
          </View>

          <Text style={styles.heroTitle}>{firstPendingPayment.service}</Text>
          <Text style={[styles.heroMeta, tabularNums]}>
            {firstPendingPayment.trainerName} · {formatShortDateES(firstPendingPayment.day)} · {firstPendingPayment.slot}
          </Text>

          <PrimaryButton
            label="Completar pago"
            icon="creditCard"
            onPress={() =>
              router.push(`/(user)/checkout?sessionId=${firstPendingPayment.id}`)
            }
          />
        </View>
      ) : null}

      <SectionHeader
        title={`Coaches (${filteredTrainers.length})`}
        actionLabel={hasFilters ? 'Limpiar' : undefined}
        onActionPress={resetFilters}
        style={styles.sectionHeader}
      />

      {filteredTrainers.length === 0 ? (
        <EmptyState
          icon="users"
          title="Sin entrenadores para este filtro"
          description="Ajusta la especialidad o el rango de tarifa para ver más opciones."
          actionLabel="Restablecer filtros"
          onActionPress={resetFilters}
        />
      ) : (
        <View style={styles.listGap}>
          {filteredTrainers.map((trainer, index) => {
            const canBook = trainer.stripeConnected && trainer.availability.length > 0;
            const usePrimaryCta = (!firstPendingPayment || hasFilters) && index === 0;
            return (
              <View key={trainer.id} style={styles.trainerCard}>
                <View style={styles.trainerTop}>
                  <InitialsAvatar
                    name={trainer.name}
                    size="md"
                    tone={index % 2 === 0 ? 'blue' : 'night'}
                  />
                  <View style={styles.trainerInfo}>
                    <Text style={styles.trainerName}>{trainer.name}</Text>
                    <Text style={styles.trainerSpecialty}>{trainer.specialty}</Text>
                    <View style={styles.ratingRow}>
                      <AppIcon name="star" size={14} color={Colors.brandBlue} />
                      <Text style={[styles.ratingText, tabularNums]}>
                        {trainer.rating.toFixed(1)} · {trainer.completedSessions} sesiones
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rateBox}>
                    <Text style={[styles.rateValue, tabularNums]}>
                      ${trainer.rateMxn}
                    </Text>
                    <Text style={styles.rateUnit}>MXN / sesión</Text>
                  </View>
                </View>

                <Text style={styles.bioText} numberOfLines={2}>
                  {trainer.bio}
                </Text>

                <View style={styles.slotsSection}>
                  <Text style={styles.slotsLabel}>Agenda disponible</Text>
                  <View style={styles.slotsRow}>
                    {trainer.availability.slice(0, 3).map((slot) => (
                      <StatusChip
                        key={slot.id}
                        label={`${formatShortDateES(slot.day)} · ${slot.slot}`}
                        tone="neutral"
                        icon="clock"
                      />
                    ))}
                    {!trainer.stripeConnected ? (
                      <StatusChip
                        label="Cuenta de cobros en configuración"
                        tone="warning"
                        icon="clock"
                      />
                    ) : trainer.availability.length === 0 ? (
                      <StatusChip
                        label="Sin horarios publicados"
                        tone="warning"
                        icon="alertTriangle"
                      />
                    ) : null}
                  </View>
                </View>

                {usePrimaryCta ? (
                  <PrimaryButton
                    label="Solicitar sesión"
                    icon="calendar"
                    disabled={!canBook}
                    onPress={() =>
                      router.push(`/(user)/session-confirm?trainerId=${trainer.id}`)
                    }
                  />
                ) : (
                  <SecondaryButton
                    label="Solicitar sesión"
                    variant="solid"
                    icon="calendar"
                    disabled={!canBook}
                    onPress={() =>
                      router.push(`/(user)/session-confirm?trainerId=${trainer.id}`)
                    }
                  />
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    ...Typography.title,
    color: Colors.night,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.night,
    paddingVertical: 10,
  },
  clearBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  horizontalScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 10,
    alignItems: 'center',
  },
  filterChip: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  filterChipInactive: {
    backgroundColor: Colors.surfaceWhite,
    borderColor: Colors.borderCrisp,
  },
  filterChipText: {
    ...Typography.bodyMedium,
  },
  filterChipTextActive: {
    color: Colors.surfaceWhite,
  },
  filterChipTextInactive: {
    color: Colors.night,
  },
  rateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  rateChip: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rateChipActive: {
    backgroundColor: Colors.night,
    borderColor: Colors.night,
  },
  rateChipInactive: {
    backgroundColor: Colors.surfaceWhite,
    borderColor: Colors.borderCrisp,
  },
  rateChipText: {
    ...Typography.labelSemiBold,
  },
  rateChipTextActive: {
    color: Colors.surfaceWhite,
  },
  rateChipTextInactive: {
    color: Colors.night70,
  },
  heroCard: {
    backgroundColor: Colors.brandBlue,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroAmountTag: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  heroBadgeText: {
    ...Typography.labelSemiBold,
    color: Colors.surfaceWhite,
  },
  heroTitle: {
    ...Typography.subtitleSora,
    color: Colors.surfaceWhite,
  },
  heroMeta: {
    ...Typography.body,
    color: Colors.white75,
    marginBottom: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  listGap: {
    gap: 12,
  },
  trainerCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 12,
  },
  trainerTop: {
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
  trainerSpecialty: {
    ...Typography.label,
    color: Colors.night70,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    ...Typography.labelSemiBold,
    color: Colors.brandBlue,
  },
  rateBox: {
    alignItems: 'flex-end',
  },
  rateValue: {
    ...Typography.subtitle,
    color: Colors.night,
  },
  rateUnit: {
    ...Typography.label,
    color: Colors.night65,
  },
  bioText: {
    ...Typography.body,
    color: Colors.night70,
  },
  slotsSection: {
    gap: 8,
  },
  slotsLabel: {
    ...Typography.labelSemiBold,
    color: Colors.night65,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
