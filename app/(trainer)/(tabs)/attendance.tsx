import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { AppIcon } from '../../../components/ui/AppIcon';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { InitialsAvatar } from '../../../components/ui/InitialsAvatar';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Colors } from '../../../constants/Colors';
import { tabularNums, Typography } from '../../../constants/Typography';
import { formatShortDateES } from '../../../data/seedData';
import { useFitLink } from '../../../store/FitLinkMobileContext';
import { AttendanceStatus } from '../../../types/fitlink';

export default function TrainerAttendanceScreen() {
  const params = useLocalSearchParams<{ classId?: string }>();
  const { currentUser, trainers, classes, members, saveClassAttendance, showToast } = useFitLink();

  const trainer = useMemo(() => {
    return trainers.find((t) => t.id === currentUser?.trainerId) ?? trainers[0];
  }, [trainers, currentUser?.trainerId]);

  const trainerId = trainer?.id ?? 'tr-01';

  const trainerClasses = useMemo(() => {
    return classes
      .filter((c) => c.trainerId === trainerId)
      .sort((a, b) => `${a.day} ${a.startTime}`.localeCompare(`${b.day} ${b.startTime}`));
  }, [classes, trainerId]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    params.classId ?? trainerClasses[0]?.id ?? ''
  );
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [pendingSwitchClassId, setPendingSwitchClassId] = useState<string | null>(null);

  useEffect(() => {
    if (params.classId && trainerClasses.some((c) => c.id === params.classId)) {
      setSelectedClassId(params.classId);
      setIsDirty(false);
    } else if (!selectedClassId && trainerClasses.length > 0) {
      setSelectedClassId(trainerClasses[0].id);
    }
  }, [params.classId, trainerClasses]);

  const activeClass = useMemo(() => {
    return trainerClasses.find((c) => c.id === selectedClassId) ?? trainerClasses[0] ?? null;
  }, [trainerClasses, selectedClassId]);

  useEffect(() => {
    if (!activeClass) {
      setLocalAttendance({});
      setIsDirty(false);
      return;
    }
    const initialMap: Record<string, AttendanceStatus> = {};
    activeClass.enrolledMemberIds.forEach((memberId) => {
      initialMap[memberId] = activeClass.attendance[memberId] ?? 'Pendiente';
    });
    setLocalAttendance(initialMap);
    setIsDirty(false);
  }, [activeClass?.id, activeClass?.attendance, activeClass?.enrolledMemberIds]);

  const enrolledMembers = useMemo(() => {
    if (!activeClass) return [];
    return activeClass.enrolledMemberIds.map((id) => {
      const found = members.find((m) => m.id === id);
      return {
        id,
        name: found?.name ?? `Socio ${id}`,
        planName: found?.planName ?? 'Membresía FitLink',
      };
    });
  }, [activeClass, members]);

  const presentCount = useMemo(() => {
    return Object.values(localAttendance).filter((st) => st === 'Presente').length;
  }, [localAttendance]);

  const handleSelectClassChip = (classId: string) => {
    if (classId === activeClass?.id) return;
    if (isDirty) {
      setPendingSwitchClassId(classId);
      return;
    }
    setSelectedClassId(classId);
  };

  const confirmSwitchClass = () => {
    if (pendingSwitchClassId) {
      setSelectedClassId(pendingSwitchClassId);
      setIsDirty(false);
    }
    setPendingSwitchClassId(null);
  };

  const setStudentStatus = (memberId: string, status: AttendanceStatus) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setLocalAttendance((prev) => ({
      ...prev,
      [memberId]: prev[memberId] === status ? 'Pendiente' : status,
    }));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    if (!activeClass) return;
    const next: Record<string, AttendanceStatus> = {};
    activeClass.enrolledMemberIds.forEach((id) => {
      next[id] = 'Presente';
    });
    setLocalAttendance(next);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!activeClass) return;
    const result = saveClassAttendance(activeClass.id, localAttendance);
    if (result.ok) {
      setIsDirty(false);
      showToast({
        title: 'Asistencia guardada',
        description: result.message,
        tone: 'success',
      });
    } else {
      showToast({
        title: 'No se pudo guardar',
        description: result.message,
        tone: 'error',
      });
    }
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Asistencia de clase</Text>

      {trainerClasses.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {trainerClasses.map((gymClass) => {
            const isSelected = gymClass.id === activeClass?.id;
            return (
              <Pressable
                key={gymClass.id}
                onPress={() => handleSelectClassChip(gymClass.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.classChip,
                  isSelected ? styles.classChipActive : styles.classChipInactive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.classChipText,
                    tabularNums,
                    isSelected ? styles.classChipTextActive : styles.classChipTextInactive,
                  ]}
                  numberOfLines={1}
                >
                  {gymClass.name} · {formatShortDateES(gymClass.day)} {gymClass.startTime}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {!activeClass ? (
        <EmptyState
          icon="users"
          title="Sin clases asignadas"
          description="Aún no tienes clases grupales asignadas para pasar lista."
        />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryTitleWrap}>
                <Text style={styles.className}>{activeClass.name}</Text>
                <Text style={[styles.classMeta, tabularNums]}>
                  {formatShortDateES(activeClass.day)} · {activeClass.startTime} – {activeClass.endTime} · {activeClass.room}
                </Text>
              </View>
              <View style={styles.counterBox}>
                <Text style={styles.counterValue}>
                  {presentCount} / {enrolledMembers.length}
                </Text>
                <Text style={styles.counterLabel}>Presentes</Text>
              </View>
            </View>

            <View style={styles.summaryActionsRow}>
              {isDirty ? (
                <StatusChip
                  label="Cambios sin guardar"
                  tone="warning"
                  icon="alertTriangle"
                />
              ) : (
                <StatusChip
                  label={`Cupo ${enrolledMembers.length}/${activeClass.capacity}`}
                  tone="neutral"
                  icon="users"
                />
              )}

              {enrolledMembers.length > 0 ? (
                <SecondaryButton
                  label="Todos asistieron"
                  variant="outline"
                  icon="userCheck"
                  onPress={handleMarkAllPresent}
                />
              ) : null}
            </View>
          </View>

          {enrolledMembers.length === 0 ? (
            <EmptyState
              icon="userCheck"
              title="Sin alumnos inscritos"
              description="Todavía no hay socios registrados en esta clase."
            />
          ) : (
            <View style={styles.studentsList}>
              {enrolledMembers.map((student) => {
                const status = localAttendance[student.id] ?? 'Pendiente';
                const isPresent = status === 'Presente';
                const isAbsent = status === 'Ausente';

                return (
                  <View key={student.id} style={styles.studentCard}>
                    <View style={styles.studentInfoRow}>
                      <InitialsAvatar name={student.name} size="sm" tone="soft" />
                      <View style={styles.studentTextWrap}>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {student.name}
                        </Text>
                        <Text style={styles.studentPlan} numberOfLines={1}>
                          {student.planName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.toggleRow}>
                      <Pressable
                        onPress={() => setStudentStatus(student.id, 'Presente')}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isPresent }}
                        accessibilityLabel={`Marcar asistencia de ${student.name}`}
                        style={({ pressed }) => [
                          styles.toggleBtn,
                          isPresent ? styles.togglePresentActive : styles.toggleNeutral,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppIcon
                          name="checkCircle"
                          size={18}
                          color={isPresent ? Colors.surfaceWhite : Colors.successText}
                        />
                        <Text
                          style={[
                            styles.toggleLabel,
                            { color: isPresent ? Colors.surfaceWhite : Colors.successText },
                          ]}
                        >
                          Asistió
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setStudentStatus(student.id, 'Ausente')}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isAbsent }}
                        accessibilityLabel={`Marcar falta de ${student.name}`}
                        style={({ pressed }) => [
                          styles.toggleBtn,
                          isAbsent ? styles.toggleAbsentActive : styles.toggleNeutral,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppIcon
                          name="xCircle"
                          size={18}
                          color={isAbsent ? Colors.surfaceWhite : Colors.errorText}
                        />
                        <Text
                          style={[
                            styles.toggleLabel,
                            { color: isAbsent ? Colors.surfaceWhite : Colors.errorText },
                          ]}
                        >
                          Faltó
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {enrolledMembers.length > 0 && (
            <PrimaryButton
              label="Guardar asistencia"
              icon="check"
              onPress={handleSave}
              style={styles.saveButton}
            />
          )}
        </>
      )}

      <ConfirmModal
        visible={pendingSwitchClassId !== null}
        title="¿Descartar cambios?"
        description="Tienes cambios de asistencia sin guardar en esta clase. Si cambias de clase se perderán."
        confirmLabel="Descartar y cambiar"
        cancelLabel="Seguir editando"
        destructive
        tone="warning"
        onConfirm={confirmSwitchClass}
        onCancel={() => setPendingSwitchClassId(null)}
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
  title: {
    ...Typography.title,
    color: Colors.night,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  classChip: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classChipActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  classChipInactive: {
    backgroundColor: Colors.surfaceWhite,
    borderColor: Colors.borderCrisp,
  },
  classChipText: {
    ...Typography.bodyMedium,
  },
  classChipTextActive: {
    color: Colors.surfaceWhite,
  },
  classChipTextInactive: {
    color: Colors.night,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTitleWrap: {
    flex: 1,
    gap: 4,
  },
  className: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  classMeta: {
    ...Typography.label,
    color: Colors.night70,
  },
  counterBox: {
    backgroundColor: Colors.blueSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  counterValue: {
    ...Typography.subtitle,
    color: Colors.brandBlue,
    ...tabularNums,
  },
  counterLabel: {
    ...Typography.label,
    color: Colors.night70,
  },
  summaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  studentsList: {
    gap: 10,
  },
  studentCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 14,
    gap: 12,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentTextWrap: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  studentPlan: {
    ...Typography.label,
    color: Colors.night70,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  toggleNeutral: {
    backgroundColor: Colors.ice,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
  },
  togglePresentActive: {
    backgroundColor: Colors.success,
  },
  toggleAbsentActive: {
    backgroundColor: Colors.error,
  },
  toggleLabel: {
    ...Typography.bodyMedium,
  },
  saveButton: {
    marginTop: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
