import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  buildInitialClasses,
  DEMO_ACCESS_KEY,
  DEMO_TRAINER_PROFILE,
  DEMO_USER_PROFILE,
  formatLocalTimeNow,
  generateFolio,
  getLocalISODate,
  getMinutesUntilEvent,
  GYM_PROFILE,
  INITIAL_INVITES,
  INITIAL_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_PLANS,
  INITIAL_SESSIONS,
  INITIAL_TRAINERS,
  splitCommission,
} from '../data/seedData';
import {
  ActionResult,
  AppNotification,
  AttendanceStatus,
  GymClass,
  GymProfile,
  MemberDirectoryEntry,
  MembershipPlan,
  PaymentMethod,
  PaymentRecord,
  SessionRequest,
  ToastItem,
  Trainer,
  TrainerInvite,
  UserPreferences,
  UserProfile,
  UserRole,
} from '../types/fitlink';

const STORAGE_KEY = 'fitlink_mobile_v3';

interface PersistedState {
  currentUser: UserProfile | null;
  classes: GymClass[];
  trainers: Trainer[];
  invites: TrainerInvite[];
  sessions: SessionRequest[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  members: MemberDirectoryEntry[];
  credentials: Record<string, string>;
}

const DEFAULT_CREDENTIALS: Record<string, string> = {
  'sofia@fitlink.mx': DEMO_ACCESS_KEY,
  'alejandro@fitlink.mx': DEMO_ACCESS_KEY,
  'mariana@fitlink.mx': DEMO_ACCESS_KEY,
  'mateo@fitlink.mx': DEMO_ACCESS_KEY,
  'carlos@fitlink.mx': DEMO_ACCESS_KEY,
  'valeria@fitlink.mx': DEMO_ACCESS_KEY,
  'diego@fitlink.mx': DEMO_ACCESS_KEY,
};

export interface FitLinkContextValue {
  isHydrated: boolean;
  currentUser: UserProfile | null;
  gymProfile: GymProfile;
  classes: GymClass[];
  plans: MembershipPlan[];
  trainers: Trainer[];
  invites: TrainerInvite[];
  sessions: SessionRequest[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  members: MemberDirectoryEntry[];
  toasts: ToastItem[];

  login: (email: string, password: string, role: UserRole) => ActionResult;
  register: (name: string, email: string, password: string) => ActionResult;
  activateTrainerInvite: (codeOrEmail: string, password: string) => ActionResult;
  logout: () => void;

  bookClass: (classId: string) => ActionResult;
  joinWaitlist: (classId: string) => ActionResult;
  leaveWaitlist: (classId: string) => ActionResult;
  cancelClass: (classId: string) => ActionResult;
  saveClassAttendance: (
    classId: string,
    attendanceMap: Record<string, AttendanceStatus>
  ) => ActionResult;

  requestSession: (
    trainerId: string,
    day: string,
    slot: string,
    service: string
  ) => ActionResult;
  acceptSession: (sessionId: string) => ActionResult;
  payAcceptedSession: (sessionId: string) => ActionResult;
  rejectSession: (sessionId: string) => ActionResult;
  cancelSessionByUser: (sessionId: string) => ActionResult;
  cancelSessionByTrainer: (sessionId: string) => ActionResult;

  purchasePlan: (planId: string, method: PaymentMethod, passDate?: string) => ActionResult;
  cancelAutoRenew: () => ActionResult;

  updateUserProfile: (patch: { name: string; phone: string }) => ActionResult;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  connectTrainerStripe: (bankLabel: string) => ActionResult;
  updateTrainerProfile: (
    patch: Partial<Pick<Trainer, 'name' | 'specialty' | 'bio' | 'rateMxn' | 'bankLabel' | 'services'>>
  ) => ActionResult;
  addTrainerAvailability: (day: string, slot: string) => ActionResult;
  removeTrainerAvailability: (slotId: string) => ActionResult;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: UserRole) => void;
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  resetDemoData: () => Promise<void>;
}

const FitLinkMobileContext = createContext<FitLinkContextValue | null>(null);

export function FitLinkMobileProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<GymClass[]>(() => buildInitialClasses());
  const [trainers, setTrainers] = useState<Trainer[]>(INITIAL_TRAINERS);
  const [invites, setInvites] = useState<TrainerInvite[]>(INITIAL_INVITES);
  const [sessions, setSessions] = useState<SessionRequest[]>(INITIAL_SESSIONS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [members, setMembers] = useState<MemberDirectoryEntry[]>(INITIAL_MEMBERS);
  const [credentials, setCredentials] = useState<Record<string, string>>(DEFAULT_CREDENTIALS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
          if (Array.isArray(parsed.classes) && parsed.classes.length > 0) setClasses(parsed.classes);
          if (Array.isArray(parsed.trainers) && parsed.trainers.length > 0) setTrainers(parsed.trainers);
          if (Array.isArray(parsed.invites) && parsed.invites.length > 0) setInvites(parsed.invites);
          if (Array.isArray(parsed.sessions)) setSessions(parsed.sessions);
          if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
          if (Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
          if (Array.isArray(parsed.members) && parsed.members.length > 0) setMembers(parsed.members);
          if (parsed.credentials && typeof parsed.credentials === 'object') {
            setCredentials({ ...DEFAULT_CREDENTIALS, ...parsed.credentials });
          }
        }
      } catch {
      } finally {
        if (active) setIsHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      const payload: PersistedState = {
        currentUser,
        classes,
        trainers,
        invites,
        sessions,
        payments,
        notifications,
        members,
        credentials,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
    }, 180);
    return () => clearTimeout(timer);
  }, [isHydrated, currentUser, classes, trainers, invites, sessions, payments, notifications, members, credentials]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-1), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const pushNotification = useCallback(
    (item: Omit<AppNotification, 'id' | 'read' | 'createdAtLabel' | 'group'>) => {
      const next: AppNotification = {
        ...item,
        id: `not-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        read: false,
        createdAtLabel: formatLocalTimeNow(),
        group: 'Hoy',
      };
      setNotifications((prev) => [next, ...prev]);
    },
    []
  );

  const login = useCallback(
    (email: string, password: string, role: UserRole): ActionResult => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { ok: false, message: 'Ingresa un correo electrónico válido.' };
      }
      if (!password || password.length < 8) {
        return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres (RN-13).' };
      }

      if (role === 'entrenador') {
        const pendingInvite = invites.find(
          (inv) => inv.email.toLowerCase() === cleanEmail && !inv.activated
        );
        if (pendingInvite) {
          return {
            ok: false,
            message: 'Tu invitación aún no está activada. Usa "Activar invitación (48 h)" primero.',
          };
        }

        const matchedTrainer = trainers.find((t) => t.email.toLowerCase() === cleanEmail);
        if (!matchedTrainer) {
          return {
            ok: false,
            message: 'No existe una cuenta de entrenador activa con ese correo.',
          };
        }
        const expectedPass = credentials[cleanEmail] ?? DEMO_ACCESS_KEY;
        if (password !== expectedPass && password !== 'fitlink123') {
          return { ok: false, message: 'Correo o contraseña incorrectos.' };
        }

        const profile: UserProfile = {
          ...DEMO_TRAINER_PROFILE,
          id: `usr-${matchedTrainer.id}`,
          trainerId: matchedTrainer.id,
          name: matchedTrainer.name,
          email: matchedTrainer.email,
        };
        setCurrentUser(profile);
        return { ok: true, message: `Sesión iniciada · ${profile.name}` };
      }

      const matchedMember = members.find((m) => m.email.toLowerCase() === cleanEmail);
      if (!matchedMember) {
        return {
          ok: false,
          message: 'No encontramos una cuenta con ese correo. Regístrate primero.',
        };
      }
      const expectedPass = credentials[cleanEmail] ?? DEMO_ACCESS_KEY;
      if (password !== expectedPass && password !== 'fitlink123') {
        return { ok: false, message: 'Correo o contraseña incorrectos.' };
      }

      const profile: UserProfile = {
        ...DEMO_USER_PROFILE,
        id: matchedMember.id,
        name: matchedMember.name,
        email: matchedMember.email,
        phone: matchedMember.phone,
        planName: matchedMember.planName,
        planId:
          matchedMember.planName === 'Plan Anual'
            ? 'plan-anual'
            : matchedMember.planName === 'Pase de Día'
            ? 'plan-dia'
            : 'plan-mensual',
      };
      setCurrentUser(profile);
      return { ok: true, message: `Hola de nuevo, ${profile.name}` };
    },
    [credentials, invites, members, trainers]
  );

  const register = useCallback(
    (name: string, email: string, password: string): ActionResult => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (cleanName.length < 3) {
        return { ok: false, message: 'Escribe tu nombre completo.' };
      }
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { ok: false, message: 'Ingresa un correo electrónico válido.' };
      }
      if (
        members.some((m) => m.email.toLowerCase() === cleanEmail) ||
        trainers.some((t) => t.email.toLowerCase() === cleanEmail)
      ) {
        return { ok: false, message: 'Ese correo ya está registrado en FitLink (RN-13).' };
      }
      if (password.length < 8) {
        return { ok: false, message: 'La contraseña debe tener mínimo 8 caracteres (RN-13).' };
      }

      const newId = `mem-${Date.now().toString().slice(-4)}`;
      const newProfile: UserProfile = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        phone: '+52 653 000 0000',
        role: 'usuario',
        planId: '',
        planName: 'Sin membresía activa',
        membershipStatus: 'Vencida',
        membershipExpiresAt: 'Sin vigencia',
        autoRenew: false,
        preferences: {
          classReminders: true,
          paymentAlerts: true,
          waitlistAlerts: true,
        },
      };

      setMembers((prev) => [
        {
          id: newId,
          name: cleanName,
          email: cleanEmail,
          phone: '+52 653 000 0000',
          planName: 'Sin membresía activa',
        },
        ...prev,
      ]);
      setCredentials((prev) => ({ ...prev, [cleanEmail]: password }));
      setCurrentUser(newProfile);
      pushNotification({
        role: 'usuario',
        title: 'Cuenta creada en FitLink',
        description: 'Contrata una membresía o Pase de Día para comenzar a reservar clases.',
        tone: 'info',
        targetRoute: '/(user)/memberships',
      });
      return { ok: true, message: 'Cuenta creada. Elige un plan para reservar.' };
    },
    [members, trainers, pushNotification]
  );

  const activateTrainerInvite = useCallback(
    (codeOrEmail: string, password: string): ActionResult => {
      const clean = codeOrEmail.trim();
      if (!clean) {
        return { ok: false, message: 'Ingresa tu código de invitación o correo.' };
      }
      if (password.length < 8) {
        return { ok: false, message: 'Define una contraseña de al menos 8 caracteres (RN-13).' };
      }

      const invite = invites.find(
        (inv) =>
          inv.code.toLowerCase() === clean.toLowerCase() ||
          inv.email.toLowerCase() === clean.toLowerCase()
      );
      if (!invite) {
        return { ok: false, message: 'No encontramos una invitación con ese código o correo.' };
      }
      if (invite.activated) {
        return { ok: false, message: 'Esta invitación ya fue activada. Inicia sesión con tu correo.' };
      }
      if (invite.expiresInHours <= 0) {
        return {
          ok: false,
          message: 'Esta invitación venció (vigencia máxima de 48 horas, RF-004). Solicita una nueva en recepción.',
        };
      }

      const newTrainer: Trainer = {
        id: invite.trainerId,
        name: invite.name,
        email: invite.email,
        specialty: invite.specialty,
        bio: 'Entrenadora certificada del equipo FitLink enfocada en técnica segura y progreso medible.',
        rateMxn: 320,
        rating: 5.0,
        completedSessions: 0,
        services: ['Valoración inicial 1-a-1', 'Sesión funcional personalizada'],
        availability: [],
        stripeConnected: false,
        bankLabel: 'Sin cuenta vinculada',
      };

      setInvites((prev) =>
        prev.map((inv) => (inv.code === invite.code ? { ...inv, activated: true } : inv))
      );
      setTrainers((prev) =>
        prev.some((t) => t.id === newTrainer.id) ? prev : [...prev, newTrainer]
      );
      setCredentials((prev) => ({ ...prev, [invite.email.toLowerCase()]: password }));

      const profile: UserProfile = {
        ...DEMO_TRAINER_PROFILE,
        id: `usr-${newTrainer.id}`,
        trainerId: newTrainer.id,
        name: newTrainer.name,
        email: newTrainer.email,
      };
      setCurrentUser(profile);

      pushNotification({
        role: 'entrenador',
        title: 'Cuenta de entrenador activada',
        description: 'Vincula tu cuenta Stripe Connect Express en Perfil profesional para publicar horarios 1-a-1.',
        tone: 'warning',
        targetRoute: '/(trainer)/profile',
      });

      return {
        ok: true,
        message: `Cuenta activada · Vincula tus cobros en Perfil.`,
      };
    },
    [invites, pushNotification]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const bookClass = useCallback(
    (classId: string): ActionResult => {
      if (!currentUser) {
        return { ok: false, message: 'Inicia sesión para reservar.' };
      }
      if (
        currentUser.membershipStatus !== 'Activa' &&
        currentUser.membershipStatus !== 'Por vencer'
      ) {
        return {
          ok: false,
          message:
            'Necesitas una membresía activa o un pase de día vigente para reservar clases (RN-01).',
        };
      }

      const target = classes.find((c) => c.id === classId);
      if (!target) {
        return { ok: false, message: 'No encontramos esta clase.' };
      }

      if (
        currentUser.planId === 'plan-dia' &&
        currentUser.passValidDate &&
        currentUser.passValidDate !== target.day
      ) {
        return {
          ok: false,
          message: `Tu Pase de Día es válido únicamente para el ${currentUser.passValidDate} (RN-01).`,
        };
      }

      if (target.enrolledMemberIds.includes(currentUser.id)) {
        return { ok: false, message: 'Ya tienes una reserva activa en esta clase (RN-03).' };
      }
      if (target.enrolledMemberIds.length >= target.capacity) {
        return { ok: false, message: 'Cupo lleno. Puedes anotarte en la lista de espera (RN-02).' };
      }

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? {
                ...c,
                enrolledMemberIds: [...c.enrolledMemberIds, currentUser.id],
                waitlistMemberIds: c.waitlistMemberIds.filter((id) => id !== currentUser.id),
                attendance: { ...c.attendance, [currentUser.id]: 'Pendiente' },
              }
            : c
        )
      );

      pushNotification({
        role: 'usuario',
        title: 'Reserva confirmada',
        description: `Tienes lugar en ${target.name} (${target.startTime} · ${target.room}).`,
        tone: 'success',
        targetRoute: `/(user)/class-detail?id=${target.id}`,
      });

      return { ok: true, message: `Reserva confirmada en ${target.name}.` };
    },
    [classes, currentUser, pushNotification]
  );

  const joinWaitlist = useCallback(
    (classId: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Inicia sesión primero.' };
      if (
        currentUser.membershipStatus !== 'Activa' &&
        currentUser.membershipStatus !== 'Por vencer'
      ) {
        return {
          ok: false,
          message: 'Requiere membresía activa o pase vigente para entrar en lista de espera (RN-01).',
        };
      }
      const target = classes.find((c) => c.id === classId);
      if (!target) return { ok: false, message: 'Clase no encontrada.' };
      if (target.enrolledMemberIds.includes(currentUser.id)) {
        return { ok: false, message: 'Ya estás inscrito en esta clase.' };
      }
      if (target.waitlistMemberIds.includes(currentUser.id)) {
        return { ok: false, message: 'Ya estás en la lista de espera.' };
      }

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? { ...c, waitlistMemberIds: [...c.waitlistMemberIds, currentUser.id] }
            : c
        )
      );

      pushNotification({
        role: 'usuario',
        title: 'En lista de espera',
        description: `Te avisaremos si se libera un cupo en ${target.name}.`,
        tone: 'info',
        targetRoute: `/(user)/class-detail?id=${target.id}`,
      });

      return { ok: true, message: `Entraste a la lista de espera de ${target.name}.` };
    },
    [classes, currentUser, pushNotification]
  );

  const leaveWaitlist = useCallback(
    (classId: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Inicia sesión primero.' };
      const target = classes.find((c) => c.id === classId);
      if (!target) return { ok: false, message: 'Clase no encontrada.' };
      if (!target.waitlistMemberIds.includes(currentUser.id)) {
        return { ok: false, message: 'No estás en la lista de espera.' };
      }

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? {
                ...c,
                waitlistMemberIds: c.waitlistMemberIds.filter((id) => id !== currentUser.id),
              }
            : c
        )
      );

      return { ok: true, message: `Saliste de la lista de espera de ${target.name}.` };
    },
    [classes, currentUser]
  );

  const cancelClass = useCallback(
    (classId: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Inicia sesión primero.' };
      const target = classes.find((c) => c.id === classId);
      if (!target) return { ok: false, message: 'Clase no encontrada.' };
      if (!target.enrolledMemberIds.includes(currentUser.id)) {
        return { ok: false, message: 'No tienes una reserva activa en esta clase.' };
      }

      const minutesRemaining = getMinutesUntilEvent(target.day, target.startTime);
      if (minutesRemaining < 120) {
        return {
          ok: false,
          message: `No se permite cancelar cuando faltan menos de 2 horas para la clase (${target.startTime}, RN-04).`,
        };
      }

      setClasses((prev) =>
        prev.map((c) => {
          if (c.id !== classId) return c;
          const nextAttendance = { ...c.attendance };
          delete nextAttendance[currentUser.id];
          return {
            ...c,
            enrolledMemberIds: c.enrolledMemberIds.filter((id) => id !== currentUser.id),
            attendance: nextAttendance,
          };
        })
      );

      pushNotification({
        role: 'usuario',
        title: 'Reserva cancelada',
        description: `Liberaste tu lugar en ${target.name} (${target.startTime}).`,
        tone: 'warning',
        targetRoute: '/(user)/(tabs)/bookings',
      });

      return { ok: true, message: `Cancelaste tu reserva en ${target.name}. Cupo liberado.` };
    },
    [classes, currentUser, pushNotification]
  );

  const saveClassAttendance = useCallback(
    (classId: string, attendanceMap: Record<string, AttendanceStatus>): ActionResult => {
      const target = classes.find((c) => c.id === classId);
      if (!target) return { ok: false, message: 'Clase no encontrada.' };

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId ? { ...c, attendance: { ...c.attendance, ...attendanceMap } } : c
        )
      );

      const presentCount = Object.values(attendanceMap).filter((s) => s === 'Presente').length;

      pushNotification({
        role: 'usuario',
        title: 'Asistencia registrada',
        description: `${target.trainerName} actualizó la asistencia de ${target.name}.`,
        tone: 'success',
        targetRoute: '/(user)/(tabs)/bookings',
      });

      return {
        ok: true,
        message: `Lista guardada (${presentCount} presentes en ${target.name}).`,
      };
    },
    [classes, pushNotification]
  );

  const requestSession = useCallback(
    (trainerId: string, day: string, slot: string, service: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Inicia sesión para solicitar una sesión.' };
      const trainer = trainers.find((t) => t.id === trainerId);
      if (!trainer) return { ok: false, message: 'Entrenador no encontrado.' };
      if (!trainer.stripeConnected) {
        return { ok: false, message: 'Este entrenador aún no tiene habilitada su cuenta de cobros.' };
      }

      const split = splitCommission(trainer.rateMxn);
      const nextSession: SessionRequest = {
        id: `ses-${Date.now()}`,
        trainerId: trainer.id,
        trainerName: trainer.name,
        memberId: currentUser.id,
        memberName: currentUser.name,
        service: service || trainer.services[0] || 'Entrenamiento 1-a-1',
        day,
        slot,
        status: 'Pendiente',
        ...split,
        createdAtLabel: formatLocalTimeNow(),
      };

      setSessions((prev) => [nextSession, ...prev]);

      pushNotification({
        role: 'entrenador',
        title: 'Nueva solicitud 1-a-1',
        description: `${currentUser.name} solicitó ${nextSession.service} el ${day} a las ${slot} ($${split.netTrainerMxn} MXN netos).`,
        tone: 'warning',
        targetRoute: '/(trainer)/(tabs)/requests',
      });

      pushNotification({
        role: 'usuario',
        title: 'Solicitud enviada',
        description: `${trainer.name} tiene hasta 24 h para confirmar el horario ${day} · ${slot}.`,
        tone: 'info',
        targetRoute: '/(user)/(tabs)/bookings',
      });

      return { ok: true, message: `Solicitud enviada a ${trainer.name}.` };
    },
    [currentUser, trainers, pushNotification]
  );

  const acceptSession = useCallback(
    (sessionId: string): ActionResult => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return { ok: false, message: 'Solicitud no encontrada.' };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: 'Aceptada' } : s))
      );

      pushNotification({
        role: 'usuario',
        title: 'Sesión 1-a-1 aceptada',
        description: `${target.trainerName} aceptó tu sesión (${target.day} · ${target.slot}). Tienes 12 h para completar el pago de $${target.grossMxn} MXN.`,
        tone: 'info',
        targetRoute: '/(user)/(tabs)/bookings',
      });

      return {
        ok: true,
        message: 'Solicitud aceptada · Esperando pago con tarjeta del socio.',
      };
    },
    [sessions, pushNotification]
  );

  const payAcceptedSession = useCallback(
    (sessionId: string): ActionResult => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return { ok: false, message: 'Sesión no encontrada.' };
      if (target.status !== 'Aceptada') {
        return { ok: false, message: 'Esta sesión no está pendiente de pago.' };
      }

      const folio = generateFolio();
      const split = splitCommission(target.grossMxn);

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: 'Confirmada' } : s))
      );

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        memberId: target.memberId,
        folio,
        concept: `Sesión 1-a-1 · ${target.trainerName}`,
        method: 'Tarjeta',
        amountMxn: split.grossMxn,
        status: 'Pagado',
        dateLabel: formatLocalTimeNow(),
        sessionId: target.id,
        trainerId: target.trainerId,
        trainerNetMxn: split.netTrainerMxn,
        gymFeeMxn: split.gymFeeMxn,
      };

      setPayments((prev) => [newPayment, ...prev]);

      pushNotification({
        role: 'entrenador',
        title: 'Sesión 1-a-1 confirmada y pagada',
        description: `${target.memberName} liquidó $${split.grossMxn} MXN. Recibes $${split.netTrainerMxn} MXN (90%).`,
        tone: 'success',
        targetRoute: '/(trainer)/(tabs)/payments',
      });

      pushNotification({
        role: 'usuario',
        title: 'Sesión 1-a-1 confirmada',
        description: `Pago aprobado (${folio}) con ${target.trainerName} el ${target.day} a las ${target.slot}.`,
        tone: 'success',
        targetRoute: '/(user)/(tabs)/bookings',
      });

      return {
        ok: true,
        message: `Sesión confirmada · Folio ${folio}`,
        folio,
      };
    },
    [sessions, pushNotification]
  );

  const rejectSession = useCallback(
    (sessionId: string): ActionResult => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return { ok: false, message: 'Solicitud no encontrada.' };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: 'Rechazada' } : s))
      );

      pushNotification({
        role: 'usuario',
        title: 'Horario no disponible',
        description: `${target.trainerName} no pudo aceptar el horario ${target.day} · ${target.slot}. Solicita otro espacio.`,
        tone: 'error',
        targetRoute: '/(user)/(tabs)/bookings',
      });

      return { ok: true, message: 'Solicitud rechazada y socio notificado.' };
    },
    [sessions, pushNotification]
  );

  const cancelSessionByUser = useCallback(
    (sessionId: string): ActionResult => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return { ok: false, message: 'Sesión no encontrada.' };

      const minutesRemaining = getMinutesUntilEvent(target.day, target.slot);
      const qualifiesFullRefund = target.status === 'Confirmada' && minutesRemaining >= 720;
      const lateConfirmedCancel = target.status === 'Confirmada' && minutesRemaining < 720;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: 'Cancelada',
                cancelReason: qualifiesFullRefund
                  ? 'Cancelada por socio (≥ 12 h · reembolso total)'
                  : lateConfirmedCancel
                  ? 'Cancelada por socio (< 12 h · sin reembolso)'
                  : 'Solicitud cancelada por socio',
              }
            : s
        )
      );

      if (qualifiesFullRefund) {
        setPayments((prev) =>
          prev.map((p) =>
            p.sessionId === sessionId ||
            (p.memberId === target.memberId &&
              p.trainerId === target.trainerId &&
              p.status === 'Pagado')
              ? { ...p, status: 'Reembolsado' }
              : p
          )
        );
      }

      pushNotification({
        role: 'entrenador',
        title: 'Sesión 1-a-1 cancelada',
        description: qualifiesFullRefund
          ? `${target.memberName} canceló con ≥ 12 h de anticipación (reembolso total aplicado).`
          : lateConfirmedCancel
          ? `${target.memberName} canceló con < 12 h. Conservas tu pago neto (RN-06).`
          : `${target.memberName} canceló su solicitud del ${target.day} (${target.slot}).`,
        tone: 'warning',
        targetRoute: '/(trainer)/(tabs)/requests',
      });

      pushNotification({
        role: 'usuario',
        title: qualifiesFullRefund ? 'Sesión cancelada · Reembolso total' : 'Sesión 1-a-1 cancelada',
        description: qualifiesFullRefund
          ? `Se reembolsaron $${target.grossMxn} MXN a tu tarjeta por cancelar con 12 h o más (RN-06).`
          : lateConfirmedCancel
          ? 'Cancelada con menos de 12 h de anticipación; no aplica reembolso (RN-06).'
          : `Cancelaste tu solicitud con ${target.trainerName}.`,
        tone: qualifiesFullRefund ? 'info' : 'warning',
        targetRoute: '/(user)/payments',
      });

      return {
        ok: true,
        message: qualifiesFullRefund
          ? `Sesión cancelada · Reembolso total de $${target.grossMxn} MXN aplicado.`
          : lateConfirmedCancel
          ? 'Sesión cancelada (< 12 h, sin reembolso según RN-06).'
          : 'Solicitud cancelada.',
      };
    },
    [sessions, pushNotification]
  );

  const cancelSessionByTrainer = useCallback(
    (sessionId: string): ActionResult => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return { ok: false, message: 'Sesión no encontrada.' };

      const wasConfirmed = target.status === 'Confirmada';

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: 'Cancelada',
                cancelReason: 'Cancelada por entrenador · Reembolso total (RN-06)',
              }
            : s
        )
      );

      if (wasConfirmed) {
        setPayments((prev) =>
          prev.map((p) =>
            p.sessionId === sessionId ||
            (p.memberId === target.memberId &&
              p.trainerId === target.trainerId &&
              p.status === 'Pagado')
              ? { ...p, status: 'Reembolsado' }
              : p
          )
        );
      }

      pushNotification({
        role: 'usuario',
        title: wasConfirmed
          ? 'Sesión cancelada · Reembolso del 100%'
          : 'Sesión cancelada por entrenador',
        description: wasConfirmed
          ? `${target.trainerName} canceló la sesión del ${target.day} (${target.slot}). Recibes reembolso total de $${target.grossMxn} MXN (RN-06).`
          : `${target.trainerName} canceló el horario ${target.day} · ${target.slot}.`,
        tone: 'info',
        targetRoute: '/(user)/payments',
      });

      return {
        ok: true,
        message: wasConfirmed
          ? `Sesión cancelada · Se reembolsó el 100% ($${target.grossMxn} MXN) al socio.`
          : 'Sesión cancelada y socio notificado.',
      };
    },
    [sessions, pushNotification]
  );

  const purchasePlan = useCallback(
    (planId: string, method: PaymentMethod, passDate?: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Inicia sesión para contratar un plan.' };
      const plan = INITIAL_PLANS.find((p) => p.id === planId);
      if (!plan) return { ok: false, message: 'Plan no encontrado.' };

      const folio = generateFolio();
      const isCard = method === 'Tarjeta';
      const isDayPass = plan.billingCycle === 'Día';
      const chosenPassDate = isDayPass ? passDate || getLocalISODate(0) : undefined;
      const daysToAdd = plan.billingCycle === 'Anual' ? 365 : plan.billingCycle === 'Mensual' ? 30 : 1;

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        memberId: currentUser.id,
        folio,
        concept: isDayPass
          ? `Pase de Día (${chosenPassDate})`
          : `${plan.name} FitLink`,
        method,
        amountMxn: plan.priceMxn,
        status: isCard ? 'Pagado' : 'Pendiente',
        dateLabel: formatLocalTimeNow(),
        expiresInHours: isCard ? undefined : 48,
        validForDate: chosenPassDate,
      };

      setPayments((prev) => [newPayment, ...prev]);

      if (isCard) {
        const nextExpiry = isDayPass ? chosenPassDate! : getLocalISODate(daysToAdd);
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                planId: plan.id,
                planName: plan.name,
                membershipStatus: 'Activa',
                membershipExpiresAt: nextExpiry,
                autoRenew: plan.billingCycle === 'Mensual',
                passValidDate: chosenPassDate,
              }
            : prev
        );
        setMembers((prev) =>
          prev.map((m) => (m.id === currentUser.id ? { ...m, planName: plan.name } : m))
        );
        pushNotification({
          role: 'usuario',
          title: `${plan.name} activado`,
          description: isDayPass
            ? `Pase válido el ${chosenPassDate}. Pago de $${plan.priceMxn} MXN aprobado (${folio}).`
            : `Pago de $${plan.priceMxn} MXN aprobado (folio ${folio}).`,
          tone: 'success',
          targetRoute: '/(user)/payments',
        });
        return { ok: true, message: `${plan.name} activado · Folio ${folio}`, folio };
      }

      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              planId: plan.id,
              planName: plan.name,
              membershipStatus: 'Pago pendiente',
              autoRenew: false,
              passValidDate: chosenPassDate,
            }
          : prev
      );
      pushNotification({
        role: 'usuario',
        title: `Ficha generada · ${folio}`,
        description: `Paga $${plan.priceMxn} MXN en recepción dentro de 48 h con el folio ${folio} para activar ${plan.name}.`,
        tone: 'warning',
        targetRoute: '/(user)/payments',
      });
      return {
        ok: true,
        message: `Ficha ${folio} generada (vigencia 48 h en caja).`,
        folio,
      };
    },
    [currentUser, pushNotification]
  );

  const cancelAutoRenew = useCallback((): ActionResult => {
    if (!currentUser) return { ok: false, message: 'Inicia sesión primero.' };
    if (!currentUser.autoRenew) {
      return { ok: false, message: 'Tu membresía ya no tiene renovación automática activa.' };
    }
    setCurrentUser((prev) => (prev ? { ...prev, autoRenew: false } : prev));
    pushNotification({
      role: 'usuario',
      title: 'Renovación automática cancelada',
      description: `Conservarás acceso completo hasta el ${currentUser.membershipExpiresAt} sin nuevos cargos (RN-10).`,
      tone: 'info',
      targetRoute: '/(user)/(tabs)/profile',
    });
    return {
      ok: true,
      message: `Renovación cancelada. Conservas tu acceso hasta ${currentUser.membershipExpiresAt}.`,
    };
  }, [currentUser, pushNotification]);

  const updateUserProfile = useCallback(
    (patch: { name: string; phone: string }): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Inicia sesión primero.' };
      const cleanName = patch.name.trim();
      const cleanPhone = patch.phone.trim();
      const digits = cleanPhone.replace(/\D/g, '');
      if (cleanName.length < 3) {
        return { ok: false, message: 'El nombre debe tener al menos 3 caracteres.' };
      }
      if (digits.length < 10) {
        return { ok: false, message: 'Ingresa un teléfono válido de al menos 10 dígitos.' };
      }
      setCurrentUser((prev) =>
        prev ? { ...prev, name: cleanName, phone: cleanPhone } : prev
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === currentUser.id ? { ...m, name: cleanName, phone: cleanPhone } : m
        )
      );
      return { ok: true, message: 'Nombre y teléfono actualizados.' };
    },
    [currentUser]
  );

  const updateUserPreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setCurrentUser((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, ...prefs } } : prev
    );
  }, []);

  const connectTrainerStripe = useCallback(
    (bankLabel: string): ActionResult => {
      const targetTrainerId = currentUser?.trainerId ?? 'tr-01';
      const cleanBank = bankLabel.trim() || 'BBVA · Terminación 4821';
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === targetTrainerId
            ? {
                ...t,
                stripeConnected: true,
                bankLabel: cleanBank.startsWith('Stripe Connect')
                  ? cleanBank
                  : `Stripe Connect · ${cleanBank}`,
              }
            : t
        )
      );
      pushNotification({
        role: 'entrenador',
        title: 'Stripe Connect Express vinculado',
        description: 'Tu cuenta de cobros está activa. Ya puedes publicar horarios disponibles 1-a-1.',
        tone: 'success',
        targetRoute: '/(trainer)/(tabs)/payments',
      });
      return {
        ok: true,
        message: 'Cuenta Stripe Connect vinculada y habilitada.',
      };
    },
    [currentUser?.trainerId, pushNotification]
  );

  const updateTrainerProfile = useCallback(
    (
      patch: Partial<
        Pick<Trainer, 'name' | 'specialty' | 'bio' | 'rateMxn' | 'bankLabel' | 'services'>
      >
    ): ActionResult => {
      const targetTrainerId = currentUser?.trainerId ?? 'tr-01';
      setTrainers((prev) =>
        prev.map((t) => (t.id === targetTrainerId ? { ...t, ...patch } : t))
      );
      if (patch.name && currentUser?.role === 'entrenador') {
        setCurrentUser((prev) => (prev ? { ...prev, name: patch.name! } : prev));
      }
      return { ok: true, message: 'Perfil profesional actualizado.' };
    },
    [currentUser]
  );

  const addTrainerAvailability = useCallback(
    (day: string, slot: string): ActionResult => {
      const targetTrainerId = currentUser?.trainerId ?? 'tr-01';
      const trainer = trainers.find((t) => t.id === targetTrainerId);
      if (!trainer) return { ok: false, message: 'Entrenador no encontrado.' };
      if (!trainer.stripeConnected) {
        return {
          ok: false,
          message:
            'Debes vincular tu cuenta Stripe Connect Express antes de publicar disponibilidad (RF-047).',
        };
      }
      const cleanDay = day.trim();
      const cleanSlot = slot.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDay) || !/^\d{2}:\d{2}$/.test(cleanSlot)) {
        return { ok: false, message: 'Selecciona una fecha y hora válidas.' };
      }
      const duplicate = trainer.availability.some(
        (a) => a.day === cleanDay && a.slot === cleanSlot
      );
      if (duplicate) {
        return { ok: false, message: 'Ese horario ya está publicado en tu agenda.' };
      }

      const newSlot = { id: `av-${Date.now()}`, day: cleanDay, slot: cleanSlot };
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === targetTrainerId
            ? {
                ...t,
                availability: [...t.availability, newSlot].sort((a, b) =>
                  `${a.day} ${a.slot}`.localeCompare(`${b.day} ${b.slot}`)
                ),
              }
            : t
        )
      );
      return { ok: true, message: `Horario ${cleanDay} · ${cleanSlot} publicado.` };
    },
    [currentUser?.trainerId, trainers]
  );

  const removeTrainerAvailability = useCallback(
    (slotId: string): ActionResult => {
      const targetTrainerId = currentUser?.trainerId ?? 'tr-01';
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === targetTrainerId
            ? { ...t, availability: t.availability.filter((a) => a.id !== slotId) }
            : t
        )
      );
      return { ok: true, message: 'Horario bloqueado y retirado de tu disponibilidad.' };
    },
    [currentUser?.trainerId]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback((role: UserRole) => {
    setNotifications((prev) =>
      prev.map((n) => (n.role === role ? { ...n, read: true } : n))
    );
  }, []);

  const resetDemoData = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setCurrentUser(null);
    setClasses(buildInitialClasses());
    setTrainers(INITIAL_TRAINERS);
    setInvites(INITIAL_INVITES);
    setSessions(INITIAL_SESSIONS);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMembers(INITIAL_MEMBERS);
    setCredentials(DEFAULT_CREDENTIALS);
  }, []);

  const value = useMemo<FitLinkContextValue>(
    () => ({
      isHydrated,
      currentUser,
      gymProfile: GYM_PROFILE,
      classes,
      plans: INITIAL_PLANS,
      trainers,
      invites,
      sessions,
      payments,
      notifications,
      members,
      toasts,
      login,
      register,
      activateTrainerInvite,
      logout,
      bookClass,
      joinWaitlist,
      leaveWaitlist,
      cancelClass,
      saveClassAttendance,
      requestSession,
      acceptSession,
      payAcceptedSession,
      rejectSession,
      cancelSessionByUser,
      cancelSessionByTrainer,
      purchasePlan,
      cancelAutoRenew,
      updateUserProfile,
      updateUserPreferences,
      connectTrainerStripe,
      updateTrainerProfile,
      addTrainerAvailability,
      removeTrainerAvailability,
      markNotificationRead,
      markAllNotificationsRead,
      showToast,
      dismissToast,
      resetDemoData,
    }),
    [
      isHydrated,
      currentUser,
      classes,
      trainers,
      invites,
      sessions,
      payments,
      notifications,
      members,
      toasts,
      login,
      register,
      activateTrainerInvite,
      logout,
      bookClass,
      joinWaitlist,
      leaveWaitlist,
      cancelClass,
      saveClassAttendance,
      requestSession,
      acceptSession,
      payAcceptedSession,
      rejectSession,
      cancelSessionByUser,
      cancelSessionByTrainer,
      purchasePlan,
      cancelAutoRenew,
      updateUserProfile,
      updateUserPreferences,
      connectTrainerStripe,
      updateTrainerProfile,
      addTrainerAvailability,
      removeTrainerAvailability,
      markNotificationRead,
      markAllNotificationsRead,
      showToast,
      dismissToast,
      resetDemoData,
    ]
  );

  return <FitLinkMobileContext.Provider value={value}>{children}</FitLinkMobileContext.Provider>;
}

export function useFitLink(): FitLinkContextValue {
  const ctx = useContext(FitLinkMobileContext);
  if (!ctx) {
    throw new Error('useFitLink debe usarse dentro de <FitLinkMobileProvider>');
  }
  return ctx;
}
