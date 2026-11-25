import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon } from '../../../components/ui/AppIcon';
import { ClassCard } from '../../../components/ui/ClassCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GymInfoModal } from '../../../components/ui/GymInfoModal';
import { InitialsAvatar } from '../../../components/ui/InitialsAvatar';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { getLocalISODate } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';
import { ClassDiscipline } from '../../../types/fitlink';

const DISCIPLINE_FILTERS: Array<{ key: 'all' | ClassDiscipline; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'Spinning', label: 'Spinning' },
  { key: 'HIIT', label: 'HIIT' },
  { key: 'Yoga', label: 'Yoga' },
  { key: 'Box', label: 'Box' },
  { key: 'Funcional', label: 'Funcional' },
  { key: 'Pilates', label: 'Pilates' },
];

type TimeBandKey = 'all' | 'morning' | 'afternoon' | 'evening';

const TIME_BANDS: Array<{ key: TimeBandKey; label: string }> = [
  { key: 'all', label: 'Todo horario' },
  { key: 'morning', label: 'Mañana' },
  { key: 'afternoon', label: 'Tarde' },
  { key: 'evening', label: 'Noche' },
];

function matchesTimeBand(hhmm: string, band: TimeBandKey): boolean {
  if (band === 'all') return true;
  const hour = Number(hhmm.split(':')[0] ?? 0);
  if (band === 'morning') return hour < 12;
  if (band === 'afternoon') return hour >= 12 && hour < 18;
  return hour >= 18;
}

function buildUpcomingDays() {
  const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const items: Array<{ key: string; label: string }> = [{ key: 'all', label: 'Todos los días' }];
  for (let i = 0; i < 6; i += 1) {
    const iso = getLocalISODate(i);
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const prefix = i === 0 ? 'Hoy' : shortDays[dt.getDay()];
    items.push({ key: iso, label: `${prefix} ${d}` });
  }
  return items;
}

export default function UserHomeScreen() {
  const router = useRouter();
  const { currentUser, gymProfile, classes, notifications } = useFitLink();

  const dayChips = useMemo(() => buildUpcomingDays(), []);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | ClassDiscipline>('all');
  const [selectedTimeBand, setSelectedTimeBand] = useState<TimeBandKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gymModalVisible, setGymModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const memberId = currentUser?.id ?? '';

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.role === 'usuario' && !n.read).length,
    [notifications]
  );

  const featuredClass = useMemo(() => {
    return classes.find((c) => c.featured) ?? classes[0] ?? null;
  }, [classes]);

  const hasActiveFilter =
    selectedDay !== 'all' ||
    selectedDiscipline !== 'all' ||
    selectedTimeBand !== 'all' ||
    searchQuery.trim().length > 0;

  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return classes
      .filter((item) => {
        if (selectedDay !== 'all' && item.day !== selectedDay) return false;
        if (selectedDiscipline !== 'all' && item.discipline !== selectedDiscipline) return false;
        if (!matchesTimeBand(item.startTime, selectedTimeBand)) return false;
        if (query.length > 0) {
          const haystack = `${item.name} ${item.discipline} ${item.trainerName} ${item.room}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => `${a.day} ${a.startTime}`.localeCompare(`${b.day} ${b.startTime}`));
  }, [classes, selectedDay, selectedDiscipline, selectedTimeBand, searchQuery]);

  const resetAllFilters = useCallback(() => {
    setSelectedDay('all');
    setSelectedDiscipline('all');
    setSelectedTimeBand('all');
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 300);
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] ?? 'Socio';
  const membershipTone =
    currentUser?.membershipStatus === 'Activa'
      ? 'success'
      : currentUser?.membershipStatus === 'Por vencer' ||
        currentUser?.membershipStatus === 'Pago pendiente'
      ? 'warning'
      : 'error';

  return (
    <ScreenWrapper
      scroll
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerTop}>
        <Pressable
          onPress={() => setGymModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ver ubicación y horarios de ${gymProfile.name}`}
          style={({ pressed }) => [styles.gymPill, pressed && styles.pressed]}
        >
          <AppIcon name="mapPin" size={16} color={Colors.brandBlue} />
          <Text style={styles.gymPillText} numberOfLines={1}>
            {gymProfile.name}
          </Text>
          <AppIcon name="info" size={16} color={Colors.brandBlue} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/(user)/notifications')}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `Notificaciones, ${unreadCount} sin leer`
                : 'Notificaciones'
            }
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon name="bell" size={20} color={Colors.night} />
            {unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
          </Pressable>

          <Pressable
            onPress={() => router.push('/(user)/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Ir a mi perfil"
            style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
          >
            <InitialsAvatar
              name={currentUser?.name ?? 'FitLink'}
              size="sm"
              tone="blue"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.greetingRow}>
        <Text style={styles.title}>Hola, {firstName}</Text>
        {currentUser ? (
          <StatusChip
            label={`Membresía ${currentUser.membershipStatus}`}
            tone={membershipTone}
          />
        ) : null}
      </View>

      <View style={styles.searchBox}>
        <AppIcon name="search" size={20} color={Colors.night65} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar clase, disciplina o coach…"
          placeholderTextColor={Colors.night65}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Buscar clase, disciplina o coach"
        />
        {searchQuery.length > 0 ? (
          <Pressable
            onPress={() => setSearchQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            style={styles.clearButton}
          >
            <AppIcon name="x" size={18} color={Colors.night65} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {dayChips.map((chip) => {
          const active = selectedDay === chip.key;
          return (
            <Pressable
              key={chip.key}
              onPress={() => setSelectedDay(chip.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterChip,
                active ? styles.filterChipActive : styles.filterChipInactive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  tabularNums,
                  active ? styles.filterChipTextActive : styles.filterChipTextInactive,
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {DISCIPLINE_FILTERS.map((disc) => {
          const active = selectedDiscipline === disc.key;
          return (
            <Pressable
              key={disc.key}
              onPress={() => setSelectedDiscipline(disc.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterChip,
                active ? styles.filterChipActive : styles.filterChipInactive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active ? styles.filterChipTextActive : styles.filterChipTextInactive,
                ]}
              >
                {disc.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.timeBandRow}>
        {TIME_BANDS.map((band) => {
          const active = selectedTimeBand === band.key;
          return (
            <Pressable
              key={band.key}
              onPress={() => setSelectedTimeBand(band.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.timeBandBtn,
                active ? styles.timeBandActive : styles.timeBandInactive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.timeBandText,
                  active ? styles.timeBandTextActive : styles.timeBandTextInactive,
                ]}
                numberOfLines={1}
              >
                {band.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {featuredClass && !hasActiveFilter ? (
        <View style={styles.heroWrap}>
          <ClassCard
            gymClass={featuredClass}
            variant="hero"
            heroBadgeLabel="Destacada hoy"
            isEnrolled={featuredClass.enrolledMemberIds.includes(memberId)}
            isWaitlisted={featuredClass.waitlistMemberIds.includes(memberId)}
            actionLabel={
              featuredClass.enrolledMemberIds.includes(memberId)
                ? 'Ver mi reserva'
                : 'Reservar ahora'
            }
            onPress={() =>
              router.push(`/(user)/class-detail?id=${featuredClass.id}`)
            }
            onActionPress={() =>
              router.push(`/(user)/class-detail?id=${featuredClass.id}`)
            }
          />
        </View>
      ) : null}

      <SectionHeader
        title="Calendario de clases"
        actionLabel={hasActiveFilter ? 'Limpiar filtros' : undefined}
        onActionPress={resetAllFilters}
        style={styles.sectionHeader}
      />

      {filteredClasses.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Sin clases para este filtro"
          description="Prueba otro día, disciplina u horario para explorar todas las clases disponibles."
          actionLabel="Mostrar todas las clases"
          onActionPress={resetAllFilters}
        />
      ) : (
        <View style={styles.listGap}>
          {filteredClasses.map((gymClass) => (
            <ClassCard
              key={gymClass.id}
              gymClass={gymClass}
              variant="default"
              isEnrolled={gymClass.enrolledMemberIds.includes(memberId)}
              isWaitlisted={gymClass.waitlistMemberIds.includes(memberId)}
              onPress={() =>
                router.push(`/(user)/class-detail?id=${gymClass.id}`)
              }
            />
          ))}
        </View>
      )}

      <GymInfoModal
        visible={gymModalVisible}
        onClose={() => setGymModalVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  gymPill: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  gymPillText: {
    ...Typography.bodyMedium,
    color: Colors.brandBlue,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brandMagenta,
    borderWidth: 2,
    borderColor: Colors.surfaceWhite,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  title: {
    ...Typography.title,
    color: Colors.night,
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
  clearButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    minHeight: 48,
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
  timeBandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeBandBtn: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeBandActive: {
    backgroundColor: Colors.night,
    borderColor: Colors.night,
  },
  timeBandInactive: {
    backgroundColor: Colors.surfaceWhite,
    borderColor: Colors.borderCrisp,
  },
  timeBandText: {
    ...Typography.labelSemiBold,
  },
  timeBandTextActive: {
    color: Colors.surfaceWhite,
  },
  timeBandTextInactive: {
    color: Colors.night70,
  },
  heroWrap: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  listGap: {
    gap: 12,
  },
  pressed: {
    opacity: 0.82,
  },
});
