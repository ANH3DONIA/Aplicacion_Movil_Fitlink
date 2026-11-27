import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppIcon } from '../../components/ui/AppIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/Colors';
import { tabularNums, Typography } from '../../constants/Typography';
import { formatShortDateES, getLocalISODate } from '../../data/seedData';
import { useFitLink } from '../../store/FitLinkMobileContext';
import { PaymentMethod } from '../../types/fitlink';

interface CheckoutReceipt {
  folio: string;
  method: PaymentMethod;
  concept: string;
  amountMxn: number;
  isCashSlip: boolean;
  validDate?: string;
}

function buildPassDates() {
  const options: Array<{ iso: string; label: string }> = [];
  for (let i = 0; i < 7; i += 1) {
    const iso = getLocalISODate(i);
    options.push({ iso, label: formatShortDateES(iso) });
  }
  return options;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string; sessionId?: string }>();
  const planId = typeof params.planId === 'string' ? params.planId : '';
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';

  const {
    plans,
    sessions,
    purchasePlan,
    payAcceptedSession,
    showToast,
  } = useFitLink();

  const passDateOptions = useMemo(() => buildPassDates(), []);
  const [selectedPassDate, setSelectedPassDate] = useState<string>(getLocalISODate(0));
  const [method, setMethod] = useState<PaymentMethod>('Tarjeta');
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);

  useEffect(() => {
    setMethod('Tarjeta');
    setSelectedPassDate(getLocalISODate(0));
    setReceipt(null);
  }, [planId, sessionId]);

  const plan = useMemo(
    () => (planId ? plans.find((p) => p.id === planId) ?? null : null),
    [plans, planId]
  );

  const session = useMemo(
    () => (sessionId ? sessions.find((s) => s.id === sessionId) ?? null : null),
    [sessions, sessionId]
  );

  const isSessionCheckout = Boolean(session);
  const isDayPass = plan?.billingCycle === 'Día';

  if (!plan && !session) {
    return (
      <ScreenWrapper contentContainerStyle={styles.emptyWrap}>
        <EmptyState
          icon="creditCard"
          title="No hay concepto por pagar"
          description="Selecciona una membresía o una sesión 1-a-1 aceptada para continuar."
          actionLabel="Volver"
          onActionPress={() => router.back()}
        />
      </ScreenWrapper>
    );
  }

  const concept = session
    ? `Sesión 1-a-1 · ${session.service} (${session.trainerName})`
    : isDayPass
    ? `Pase de Día (${selectedPassDate})`
    : `${plan!.name} (${plan!.billingCycle})`;
  const amountMxn = session ? session.grossMxn : plan!.priceMxn;

  const handleConfirmPayment = () => {
    if (session) {
      const result = payAcceptedSession(session.id);
      if (!result.ok) {
        showToast({
          title: 'No se pudo procesar el pago',
          description: result.message,
          tone: 'error',
        });
        return;
      }
      showToast({
        title: 'Sesión confirmada',
        description: result.message,
        tone: 'success',
      });
      setReceipt({
        folio: result.folio ?? 'FL-000000',
        method: 'Tarjeta',
        concept,
        amountMxn,
        isCashSlip: false,
      });
      return;
    }

    if (plan) {
      const result = purchasePlan(
        plan.id,
        method,
        isDayPass ? selectedPassDate : undefined
      );
      if (!result.ok) {
        showToast({
          title: 'No se pudo completar',
          description: result.message,
          tone: 'error',
        });
        return;
      }
      const isCash = method === 'Efectivo (Caja)';
      showToast({
        title: isCash ? 'Ficha de caja generada' : 'Pago aprobado',
        description: result.message,
        tone: isCash ? 'info' : 'success',
      });
      setReceipt({
        folio: result.folio ?? 'FL-000000',
        method,
        concept,
        amountMxn,
        isCashSlip: isCash,
        validDate: isDayPass ? selectedPassDate : undefined,
      });
    }
  };

  if (receipt) {
    return (
      <ScreenWrapper scroll contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.replace('/(user)/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <AppIcon name="arrowLeft" size={20} color={Colors.night} />
          </Pressable>
          <Text style={styles.title}>
            {receipt.isCashSlip ? 'Ficha de pago en caja' : 'Comprobante de pago'}
          </Text>
        </View>

        <View
          style={[
            styles.receiptHero,
            receipt.isCashSlip ? styles.receiptHeroCash : styles.receiptHeroPaid,
          ]}
        >
          <StatusChip
            label={receipt.isCashSlip ? 'Vigencia 48 horas' : 'Pago aprobado'}
            tone={receipt.isCashSlip ? 'warning' : 'success'}
            icon={receipt.isCashSlip ? 'clock' : 'checkCircle'}
          />
          <Text style={styles.folioLabel}>Folio de operación</Text>
          <Text style={[styles.folioCode, tabularNums]}>{receipt.folio}</Text>
          <Text style={[styles.receiptAmount, tabularNums]}>
            ${receipt.amountMxn.toLocaleString('es-MX')} MXN
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Concepto</Text>
            <Text style={styles.summaryValue}>{receipt.concept}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Método</Text>
            <Text style={styles.summaryValue}>{receipt.method}</Text>
          </View>
          {receipt.isCashSlip ? (
            <>
              <View style={styles.divider} />
              <View style={styles.cashNotice}>
                <AppIcon name="info" size={18} color={Colors.infoText} />
                <Text style={styles.cashNoticeText}>
                  Presenta este folio en recepción dentro de las próximas 48 horas para validar tu pago y activar el acceso.
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.receiptActions}>
          <PrimaryButton
            label="Ver historial de pagos"
            icon="wallet"
            onPress={() => router.replace('/(user)/payments')}
          />
          <SecondaryButton
            label="Ir al inicio"
            variant="outline"
            onPress={() => router.replace('/(user)/(tabs)')}
          />
        </View>
      </ScreenWrapper>
    );
  }

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
        <Text style={styles.title}>Confirmar pago</Text>
      </View>

      {isDayPass ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fecha de tu visita</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.datesRow}
          >
            {passDateOptions.map((opt) => {
              const active = selectedPassDate === opt.iso;
              return (
                <Pressable
                  key={opt.iso}
                  onPress={() => setSelectedPassDate(opt.iso)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.dateChip,
                    active ? styles.dateChipActive : styles.dateChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateChipLabel,
                      active ? styles.dateChipTextActive : styles.dateChipTextInactive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.dateChipIso,
                      tabularNums,
                      active ? styles.dateChipIsoActive : styles.dateChipIsoInactive,
                    ]}
                  >
                    {opt.iso}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <Text style={styles.conceptTitle}>{concept}</Text>

        {session ? (
          <View style={styles.breakdownBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fecha y horario</Text>
              <Text style={[styles.summaryValue, tabularNums]}>
                {formatShortDateES(session.day)} · {session.slot}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entrenador (90%)</Text>
              <Text style={[styles.summaryValue, tabularNums]}>
                ${session.netTrainerMxn.toLocaleString('es-MX')} MXN
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Comisión gimnasio (10%)</Text>
              <Text style={[styles.summaryValue, tabularNums]}>
                ${session.gymFeeMxn.toLocaleString('es-MX')} MXN
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={[styles.totalValue, tabularNums]}>
            ${amountMxn.toLocaleString('es-MX')} MXN
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Método de pago</Text>

        <Pressable
          onPress={() => setMethod('Tarjeta')}
          accessibilityRole="radio"
          accessibilityState={{ selected: method === 'Tarjeta' }}
          style={[
            styles.methodOption,
            method === 'Tarjeta' && styles.methodOptionActive,
          ]}
        >
          <View style={styles.methodIconBox}>
            <AppIcon name="creditCard" size={20} color={Colors.brandBlue} />
          </View>
          <View style={styles.methodTextWrap}>
            <Text style={styles.methodTitle}>Tarjeta (Stripe modo prueba)</Text>
            <Text style={styles.methodSub}>Activación inmediata y recibo digital</Text>
          </View>
          <AppIcon
            name={method === 'Tarjeta' ? 'checkCircle' : 'circle'}
            size={20}
            color={method === 'Tarjeta' ? Colors.brandBlue : Colors.night65}
          />
        </Pressable>

        {isSessionCheckout ? (
          <View style={styles.cashNotice}>
            <AppIcon name="info" size={18} color={Colors.infoText} />
            <Text style={styles.cashNoticeText}>
              Las sesiones 1-a-1 se liquidan exclusivamente con tarjeta para procesar el reparto automático con el entrenador.
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => setMethod('Efectivo (Caja)')}
            accessibilityRole="radio"
            accessibilityState={{ selected: method === 'Efectivo (Caja)' }}
            style={[
              styles.methodOption,
              method === 'Efectivo (Caja)' && styles.methodOptionActive,
            ]}
          >
            <View style={styles.methodIconBox}>
              <AppIcon name="wallet" size={20} color={Colors.brandBlue} />
            </View>
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>Pagar en caja (ficha 48 h)</Text>
              <Text style={styles.methodSub}>
                Genera un folio único para pagar en efectivo en recepción
              </Text>
            </View>
            <AppIcon
              name={method === 'Efectivo (Caja)' ? 'checkCircle' : 'circle'}
              size={20}
              color={
                method === 'Efectivo (Caja)' ? Colors.brandBlue : Colors.night65
              }
            />
          </Pressable>
        )}
      </View>

      <PrimaryButton
        label={
          method === 'Efectivo (Caja)'
            ? 'Generar ficha de pago en caja'
            : `Pagar $${amountMxn.toLocaleString('es-MX')} MXN`
        }
        icon={method === 'Efectivo (Caja)' ? 'wallet' : 'shieldCheck'}
        onPress={handleConfirmPayment}
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
  sectionTitle: {
    ...Typography.subtitleSora,
    color: Colors.night,
  },
  horizontalScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  datesRow: {
    gap: 8,
    alignItems: 'center',
  },
  dateChip: {
    height: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateChipActive: {
    backgroundColor: Colors.brandBlue,
    borderColor: Colors.brandBlue,
  },
  dateChipInactive: {
    backgroundColor: Colors.ice,
    borderColor: Colors.borderCrisp,
  },
  dateChipLabel: {
    ...Typography.bodySemiBold,
  },
  dateChipTextActive: {
    color: Colors.surfaceWhite,
  },
  dateChipTextInactive: {
    color: Colors.night,
  },
  dateChipIso: {
    ...Typography.label,
  },
  dateChipIsoActive: {
    color: Colors.white75,
  },
  dateChipIsoInactive: {
    color: Colors.night65,
  },
  conceptTitle: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  breakdownBox: {
    backgroundColor: Colors.ice,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCrisp,
    padding: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    ...Typography.label,
    color: Colors.night65,
  },
  summaryValue: {
    ...Typography.bodySemiBold,
    color: Colors.night,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderCrisp,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  totalValue: {
    ...Typography.subtitle,
    color: Colors.brandBlue,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderCrisp,
    backgroundColor: Colors.surfaceWhite,
  },
  methodOptionActive: {
    borderColor: Colors.brandBlue,
    backgroundColor: Colors.blueSoft,
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextWrap: {
    flex: 1,
  },
  methodTitle: {
    ...Typography.bodySemiBold,
    color: Colors.night,
  },
  methodSub: {
    ...Typography.label,
    color: Colors.night65,
    marginTop: 2,
  },
  cashNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.infoSoft,
    borderRadius: 12,
    padding: 12,
  },
  cashNoticeText: {
    ...Typography.label,
    color: Colors.infoText,
    flex: 1,
  },
  receiptHero: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  receiptHeroPaid: {
    backgroundColor: Colors.brandBlue,
  },
  receiptHeroCash: {
    backgroundColor: Colors.night,
  },
  folioLabel: {
    ...Typography.labelSemiBold,
    color: Colors.white75,
    marginTop: 4,
  },
  folioCode: {
    ...Typography.display,
    color: Colors.surfaceWhite,
  },
  receiptAmount: {
    ...Typography.bodySemiBold,
    color: Colors.surfaceWhite,
  },
  receiptActions: {
    gap: 12,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
