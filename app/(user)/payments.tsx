import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon, AppIconName } from '../../components/ui/AppIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip, StatusChipTone } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { PaymentStatus } from '../../types/fitlink';

function getPaymentBadge(status: PaymentStatus): { tone: StatusChipTone; icon: AppIconName } {
  switch (status) {
    case 'Pagado':
      return { tone: 'success', icon: 'checkCircle' };
    case 'Pendiente':
      return { tone: 'warning', icon: 'clock' };
    case 'Reembolsado':
      return { tone: 'info', icon: 'rotateCcw' };
    case 'Fallido':
    case 'Vencido':
      return { tone: 'error', icon: 'xCircle' };
  }
}

export default function UserPaymentsScreen() {
  const router = useRouter();
  const { currentUser, payments } = useFitLink();

  const memberId = currentUser?.id ?? '';

  const userPayments = useMemo(
    () => payments.filter((p) => p.memberId === memberId),
    [payments, memberId]
  );

  const totalPaidMxn = useMemo(
    () =>
      userPayments
        .filter((p) => p.status === 'Pagado')
        .reduce((acc, p) => acc + p.amountMxn, 0),
    [userPayments]
  );

  const hasPending = useMemo(
    () => userPayments.some((p) => p.status === 'Pendiente'),
    [userPayments]
  );

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
        <Text style={styles.title}>Historial de pagos</Text>
      </View>

      <View style={styles.summaryHero}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryLabel}>Pagos netos confirmados</Text>
          <StatusChip
            label={hasPending ? 'Ficha pendiente' : 'Al corriente'}
            tone={hasPending ? 'warning' : 'success'}
            icon={hasPending ? 'clock' : 'checkCircle'}
          />
        </View>
        <Text style={[styles.summaryAmount, tabularNums]}>
          ${totalPaidMxn.toLocaleString('es-MX')} MXN
        </Text>
        <Text style={[styles.summaryCount, tabularNums]}>
          {userPayments.length}{' '}
          {userPayments.length === 1 ? 'movimiento registrado' : 'movimientos registrados'}
        </Text>
      </View>

      <SecondaryButton
        label="Ver planes y membresías"
        variant="outline"
        icon="award"
        onPress={() => router.push('/(user)/memberships')}
      />

      {userPayments.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="Sin pagos registrados"
          description="Cuando contrates una membresía, Pase de Día o sesión 1-a-1 verás aquí tu folio y estado."
        />
      ) : (
        <View style={styles.listGap}>
          {userPayments.map((payment) => {
            const badge = getPaymentBadge(payment.status);
            return (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.conceptText}>{payment.concept}</Text>
                    <Text style={[styles.folioText, tabularNums]}>
                      Folio {payment.folio} · {payment.dateLabel}
                    </Text>
                  </View>
                  <StatusChip
                    label={payment.status}
                    tone={badge.tone}
                    icon={badge.icon}
                  />
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.methodText}>{payment.method}</Text>
                  <Text style={[styles.amountText, tabularNums]}>
                    ${payment.amountMxn.toLocaleString('es-MX')} MXN
                  </Text>
                </View>

                {payment.status === 'Pendiente' && payment.expiresInHours ? (
                  <Text style={styles.expiryNote}>
                    Ficha válida por {payment.expiresInHours} h en recepción (RN-09)
                  </Text>
                ) : null}
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
  summaryHero: {
    backgroundColor: Colors.brandBlue,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryLabel: {
    ...Typography.bodyMedium,
    color: Colors.surfaceWhite,
  },
  summaryAmount: {
    ...Typography.display,
    color: Colors.surfaceWhite,
  },
  summaryCount: {
    ...Typography.label,
    color: Colors.white75,
  },
  listGap: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  conceptText: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  folioText: {
    ...Typography.label,
    color: Colors.night65,
    marginTop: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodText: {
    ...Typography.labelSemiBold,
    color: Colors.night70,
  },
  amountText: {
    ...Typography.subtitle,
    color: Colors.night,
  },
  expiryNote: {
    ...Typography.labelSemiBold,
    color: Colors.warningText,
  },
  pressed: {
    opacity: 0.8,
  },
});
