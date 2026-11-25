import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { formatShortDateES } from '../../data/seedData';
import { GymClass } from '../../types/fitlink';
import { AppIcon } from './AppIcon';
import { PrimaryButton } from './PrimaryButton';
import { StatusChip } from './StatusChip';

export type ClassCardVariant = 'default' | 'hero';

export interface ClassCardProps {
  gymClass: GymClass;
  variant?: ClassCardVariant;
  isEnrolled?: boolean;
  isWaitlisted?: boolean;
  onPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  heroBadgeLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ClassCard({
  gymClass,
  variant = 'default',
  isEnrolled = false,
  isWaitlisted = false,
  onPress,
  actionLabel,
  onActionPress,
  heroBadgeLabel = 'Destacada hoy',
  style,
}: ClassCardProps) {
  const enrolledCount = gymClass.enrolledMemberIds.length;
  const remaining = Math.max(0, gymClass.capacity - enrolledCount);
  const isFull = remaining === 0;
  const isAlmostFull = remaining > 0 && remaining <= 2;
  const fillRatio = Math.min(1, enrolledCount / Math.max(1, gymClass.capacity));
  const dayLabel = formatShortDateES(gymClass.day);

  if (variant === 'hero') {
    const heroHeader = (
      <View style={styles.heroTopRow}>
        <View style={styles.heroLeft}>
          <View style={styles.heroBadge}>
            <AppIcon name="sparkles" size={12} color={Colors.surfaceWhite} />
            <Text style={styles.heroBadgeText}>{heroBadgeLabel}</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {gymClass.name}
          </Text>
          <Text style={styles.heroMeta} numberOfLines={1}>
            {dayLabel} · {gymClass.startTime} · {gymClass.room}
          </Text>
          <Text style={styles.heroCoach} numberOfLines={1}>
            Coach {gymClass.trainerName} · {gymClass.durationMinutes} min
          </Text>
        </View>
        <View style={styles.heroKcalBox}>
          <AppIcon name="flame" size={18} color={Colors.surfaceWhite} />
          <Text style={[styles.heroKcalText, tabularNums]}>{gymClass.calories} kcal</Text>
        </View>
      </View>
    );

    return (
      <View style={[styles.heroCard, style]}>
        {onPress ? (
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${gymClass.name}`}
            style={({ pressed }) => [pressed && styles.pressedSoft]}
          >
            {heroHeader}
          </Pressable>
        ) : (
          heroHeader
        )}

        <View style={styles.heroFooter}>
          <View style={styles.heroBarRow}>
            <View style={styles.heroTrack}>
              <View style={[styles.heroFill, { width: `${Math.round(fillRatio * 100)}%` }]} />
            </View>
            <Text style={[styles.heroSpotsText, tabularNums]}>
              {enrolledCount}/{gymClass.capacity} lugares
            </Text>
          </View>

          {actionLabel && onActionPress ? (
            <PrimaryButton
              label={actionLabel}
              onPress={onActionPress}
              accessibilityLabel={`${actionLabel} en ${gymClass.name}`}
            />
          ) : null}
        </View>
      </View>
    );
  }

  const cardBody = (
    <View style={styles.defaultRow}>
      <View style={styles.timeBox}>
        <Text style={[styles.timeText, tabularNums]}>{gymClass.startTime}</Text>
        <Text style={styles.dayMiniText}>{dayLabel}</Text>
      </View>

      <View style={styles.defaultInfo}>
        <Text style={styles.defaultTitle} numberOfLines={1}>
          {gymClass.name}
        </Text>
        <Text style={styles.defaultCoach} numberOfLines={1}>
          {gymClass.trainerName}
        </Text>
        <Text style={[styles.defaultSubMeta, tabularNums]}>
          {gymClass.room} · {gymClass.durationMinutes} min
        </Text>

        <View style={styles.statusRow}>
          {isEnrolled ? (
            <StatusChip label="Reservada" tone="success" icon="checkCircle" />
          ) : isWaitlisted ? (
            <StatusChip label="En lista de espera" tone="info" icon="clock" />
          ) : isFull ? (
            <StatusChip
              label={`Cupo lleno (${enrolledCount}/${gymClass.capacity})`}
              tone="error"
              icon="xCircle"
            />
          ) : isAlmostFull ? (
            <StatusChip
              label={remaining === 1 ? 'Último cupo' : `Quedan ${remaining} cupos`}
              tone="magenta"
              icon="flame"
            />
          ) : (
            <View style={styles.occupancyInline}>
              <View style={styles.defaultTrack}>
                <View
                  style={[
                    styles.defaultFill,
                    {
                      width: `${Math.round(fillRatio * 100)}%`,
                      backgroundColor: Colors.brandBlue,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.occupancyLabel, tabularNums]}>
                {enrolledCount}/{gymClass.capacity}
              </Text>
            </View>
          )}
        </View>
      </View>

      {onPress ? (
        <View style={styles.chevronWrap}>
          <AppIcon name="chevronRight" size={18} color={Colors.night65} />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.defaultCard, style]}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${gymClass.name}, ${dayLabel} ${gymClass.startTime}, ${gymClass.room}, ${gymClass.trainerName}`}
          style={({ pressed }) => [styles.defaultPressable, pressed && styles.pressedSoft]}
        >
          {cardBody}
        </Pressable>
      ) : (
        <View style={styles.defaultPressable}>{cardBody}</View>
      )}

      {actionLabel && onActionPress ? (
        <View style={styles.defaultActionWrap}>
          <PrimaryButton label={actionLabel} onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.brandBlue,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroLeft: {
    flex: 1,
    gap: 6,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.night35,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    ...Typography.labelSemiBold,
    color: Colors.surfaceWhite,
  },
  heroTitle: {
    ...Typography.title,
    color: Colors.surfaceWhite,
  },
  heroMeta: {
    ...Typography.bodyMedium,
    color: Colors.surfaceWhite,
  },
  heroCoach: {
    ...Typography.label,
    color: Colors.white75,
  },
  heroKcalBox: {
    backgroundColor: Colors.white18,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 76,
  },
  heroKcalText: {
    ...Typography.labelSemiBold,
    color: Colors.surfaceWhite,
  },
  heroFooter: {
    gap: 12,
  },
  heroBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.white18,
    overflow: 'hidden',
  },
  heroFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.surfaceWhite,
  },
  heroSpotsText: {
    ...Typography.labelSemiBold,
    color: Colors.surfaceWhite,
  },

  defaultCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
  },
  defaultPressable: {
    padding: 16,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timeBox: {
    width: 68,
    minHeight: 68,
    borderRadius: 12,
    backgroundColor: Colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  timeText: {
    ...Typography.bodySemiBold,
    color: Colors.brandBlue,
  },
  dayMiniText: {
    ...Typography.label,
    color: Colors.night70,
    textAlign: 'center',
  },
  defaultInfo: {
    flex: 1,
    gap: 2,
  },
  defaultTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  defaultCoach: {
    ...Typography.body,
    color: Colors.night70,
  },
  defaultSubMeta: {
    ...Typography.labelSemiBold,
    color: Colors.night65,
  },
  statusRow: {
    marginTop: 6,
  },
  occupancyInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.blueSoft,
    overflow: 'hidden',
  },
  defaultFill: {
    height: '100%',
    borderRadius: 999,
  },
  occupancyLabel: {
    ...Typography.labelSemiBold,
    color: Colors.night70,
  },
  chevronWrap: {
    paddingLeft: 4,
  },
  defaultActionWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pressedSoft: {
    opacity: 0.86,
  },
});
