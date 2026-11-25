import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';

export default function MembershipsScreen() {
  const router = useRouter();
  const { currentUser, plans } = useFitLink();

  const defaultSelected =
    plans.find((p) => p.highlighted)?.id ?? plans[0]?.id ?? '';
  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultSelected);

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
        <Text style={styles.title}>Membresías y pases</Text>
      </View>

      <View style={styles.plansGap}>
        {plans.map((plan) => {
          const isCurrent = currentUser?.planId === plan.id && currentUser?.membershipStatus === 'Activa';
          const isSelected = selectedPlanId === plan.id;

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
              ]}
            >
              <Pressable
                onPress={() => setSelectedPlanId(plan.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Seleccionar ${plan.name}`}
                style={styles.planBody}
              >
                <View style={styles.planTop}>
                  <View style={styles.planTitleWrap}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planTagline}>{plan.tagline}</Text>
                  </View>
                  {isCurrent ? (
                    <StatusChip label="Plan actual" tone="success" icon="checkCircle" />
                  ) : plan.badge ? (
                    <StatusChip label={plan.badge} tone="info" icon="sparkles" />
                  ) : null}
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceValue, tabularNums]}>
                    ${plan.priceMxn.toLocaleString('es-MX')} MXN
                  </Text>
                  <Text style={styles.priceCycle}>/ {plan.billingCycle}</Text>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <AppIcon name="check" size={16} color={Colors.brandBlue} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>

              {isSelected ? (
                <PrimaryButton
                  label={isCurrent ? 'Renovar este plan' : 'Continuar al pago'}
                  icon="arrowRight"
                  onPress={() =>
                    router.push(`/(user)/checkout?planId=${plan.id}`)
                  }
                />
              ) : (
                <SecondaryButton
                  label="Elegir este plan"
                  variant="outline"
                  onPress={() => setSelectedPlanId(plan.id)}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  plansGap: {
    gap: 14,
  },
  planCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderCrisp,
  },
  planCardSelected: {
    borderColor: Colors.brandBlue,
  },
  planBody: {
    gap: 12,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  planTitleWrap: {
    flex: 1,
    gap: 2,
  },
  planName: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  planTagline: {
    ...Typography.label,
    color: Colors.night65,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceValue: {
    ...Typography.title,
    color: Colors.night,
  },
  priceCycle: {
    ...Typography.body,
    color: Colors.night70,
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    ...Typography.body,
    color: Colors.night70,
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
