import {
  AppNotification,
  GymClass,
  GymProfile,
  MemberDirectoryEntry,
  MembershipPlan,
  PaymentRecord,
  SessionRequest,
  Trainer,
  TrainerInvite,
  UserProfile,
} from '../types/fitlink';

export const GYM_COMMISSION_RATE = 0.1;
export const TRAINER_NET_RATE = 0.9;
export const DEMO_ACCESS_KEY = 'FitLink2026!';

export function splitCommission(grossMxn: number) {
  const gymFeeMxn = Math.round(grossMxn * GYM_COMMISSION_RATE);
  const netTrainerMxn = grossMxn - gymFeeMxn;
  return { grossMxn, netTrainerMxn, gymFeeMxn };
}

export function getLocalISODate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeSchedule(offsetMinutes: number, durationMinutes = 50): {
  day: string;
  startTime: string;
  endTime: string;
} {
  const start = new Date(Date.now() + offsetMinutes * 60_000);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const dayNum = String(start.getDate()).padStart(2, '0');
  const sh = String(start.getHours()).padStart(2, '0');
  const sm = String(start.getMinutes()).padStart(2, '0');
  const eh = String(end.getHours()).padStart(2, '0');
  const em = String(end.getMinutes()).padStart(2, '0');
  return {
    day: `${year}-${month}-${dayNum}`,
    startTime: `${sh}:${sm}`,
    endTime: `${eh}:${em}`,
  };
}

export function getMinutesUntilEvent(isoDay: string, hhmm: string): number {
  const [y, m, d] = isoDay.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) {
    return 9999;
  }
  const target = new Date(y, m - 1, d, hh, mm, 0, 0);
  return Math.round((target.getTime() - Date.now()) / 60_000);
}

export function formatShortDateES(isoDay: string): string {
  const today = getLocalISODate(0);
  const tomorrow = getLocalISODate(1);
  if (isoDay === today) return 'Hoy';
  if (isoDay === tomorrow) return 'Mañana';
  const [y, m, d] = isoDay.split('-').map(Number);
  if (!y || !m || !d) return isoDay;
  const dt = new Date(y, m - 1, d);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${days[dt.getDay()]} ${d} ${months[m - 1]}`;
}

export function formatLocalTimeNow(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `Hoy, ${hh}:${mm}`;
}

export function generateFolio(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `FL-${digits}`;
}

export const GYM_PROFILE: GymProfile = {
  name: 'FitLink Gym',
  address: 'Av. Kino y Calle 7ma #704, Col. Comercial',
  city: 'San Luis Río Colorado, Sonora',
  timezoneLabel: 'Zona horaria Sonora (UTC-7)',
  phone: '+52 653 534 8810',
  schedules: [
    { label: 'Lunes a viernes', hours: '05:30 – 22:30' },
    { label: 'Sábados', hours: '07:00 – 19:00' },
    { label: 'Domingos', hours: '08:00 – 14:00' },
  ],
  policies: [
    'Cancelación de clases grupales hasta 2 horas antes del inicio (RN-04).',
    'Sesiones 1-a-1: reembolso total cancelando con 12 h o más de anticipación (RN-06).',
    'Fichas de pago en efectivo válidas por 48 horas en recepción (RN-09).',
  ],
};

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'mem-01',
  name: 'Sofía Ramírez',
  email: 'sofia@fitlink.mx',
  phone: '+52 653 120 8890',
  role: 'usuario',
  planId: 'plan-mensual',
  planName: 'Plan Mensual',
  membershipStatus: 'Activa',
  membershipExpiresAt: getLocalISODate(24),
  autoRenew: true,
  preferences: {
    classReminders: true,
    paymentAlerts: true,
    waitlistAlerts: true,
  },
};

export const DEMO_TRAINER_PROFILE: UserProfile = {
  id: 'usr-tr-01',
  trainerId: 'tr-01',
  name: 'Carlos Mendoza',
  email: 'carlos@fitlink.mx',
  phone: '+52 653 391 2241',
  role: 'entrenador',
  planId: 'staff',
  planName: 'Entrenador Certificado',
  membershipStatus: 'Activa',
  membershipExpiresAt: getLocalISODate(365),
  autoRenew: false,
  preferences: {
    classReminders: true,
    paymentAlerts: true,
    waitlistAlerts: false,
  },
};

export const INITIAL_INVITES: TrainerInvite[] = [
  {
    code: 'INV-4820',
    trainerId: 'tr-04',
    name: 'Fernanda Vega',
    email: 'fernanda@fitlink.mx',
    specialty: 'Entrenamiento Funcional y Movilidad',
    expiresInHours: 36,
    activated: false,
  },
  {
    code: 'INV-1094',
    trainerId: 'tr-05',
    name: 'Roberto Luna',
    email: 'roberto@fitlink.mx',
    specialty: 'Acondicionamiento Físico',
    expiresInHours: 0,
    activated: false,
  },
];

export const INITIAL_MEMBERS: MemberDirectoryEntry[] = [
  { id: 'mem-01', name: 'Sofía Ramírez', email: 'sofia@fitlink.mx', phone: '+52 653 120 8890', planName: 'Plan Mensual' },
  { id: 'mem-02', name: 'Alejandro Torres', email: 'alejandro@fitlink.mx', phone: '+52 653 118 4410', planName: 'Plan Anual' },
  { id: 'mem-03', name: 'Mariana López', email: 'mariana@fitlink.mx', phone: '+52 653 209 3312', planName: 'Plan Mensual' },
  { id: 'mem-04', name: 'Diego Hernández', email: 'diego.h@fitlink.mx', phone: '+52 653 402 1198', planName: 'Plan Mensual' },
  { id: 'mem-05', name: 'Camila Flores', email: 'camila@fitlink.mx', phone: '+52 653 511 9024', planName: 'Plan Anual' },
  { id: 'mem-06', name: 'Mateo Vargas', email: 'mateo@fitlink.mx', phone: '+52 653 644 7781', planName: 'Pase de Día' },
  { id: 'mem-07', name: 'Valentina Cruz', email: 'valentina@fitlink.mx', phone: '+52 653 715 3390', planName: 'Plan Mensual' },
  { id: 'mem-08', name: 'Sebastián Ortiz', email: 'sebastian@fitlink.mx', phone: '+52 653 822 1045', planName: 'Plan Anual' },
  { id: 'mem-09', name: 'Renata Morales', email: 'renata@fitlink.mx', phone: '+52 653 903 5512', planName: 'Plan Mensual' },
  { id: 'mem-10', name: 'Emiliano Castro', email: 'emiliano@fitlink.mx', phone: '+52 653 334 6670', planName: 'Plan Mensual' },
  { id: 'mem-11', name: 'Regina Navarro', email: 'regina@fitlink.mx', phone: '+52 653 449 2201', planName: 'Plan Anual' },
  { id: 'mem-12', name: 'Andrés Silva', email: 'andres@fitlink.mx', phone: '+52 653 590 8834', planName: 'Plan Mensual' },
];

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-mensual',
    name: 'Plan Mensual',
    priceMxn: 699,
    billingCycle: 'Mensual',
    tagline: 'Acceso ilimitado a clases grupales y piso de entrenamiento.',
    badge: 'Más elegido',
    highlighted: true,
    features: [
      'Clases grupales ilimitadas',
      'Reserva con hasta 7 días de anticipación',
      'Cobro mensual automático cancelable en cualquier momento',
      'Pago con tarjeta o ficha de 48 h en caja',
    ],
  },
  {
    id: 'plan-dia',
    name: 'Pase de Día',
    priceMxn: 120,
    billingCycle: 'Día',
    tagline: 'Acceso completo durante la fecha que elijas.',
    features: [
      'Acceso por 1 día en la fecha seleccionada',
      'Clases grupales del día incluidas según cupo',
      'Pago con tarjeta o ficha de 48 h en caja',
    ],
  },
  {
    id: 'plan-anual',
    name: 'Plan Anual',
    priceMxn: 6490,
    billingCycle: 'Anual',
    tagline: '12 meses continuos de entrenamiento con tarifa preferencial.',
    badge: 'Ahorra 23%',
    features: [
      'Todo lo incluido en Plan Mensual',
      '2 sesiones 1-a-1 de valoración inicial',
      'Prioridad en lista de espera',
    ],
  },
];

export const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'tr-01',
    name: 'Carlos Mendoza',
    email: 'carlos@fitlink.mx',
    specialty: 'Spinning y Acondicionamiento HIIT',
    bio: 'Entrenador certificado con 8 años de experiencia en resistencia cardiovascular, ciclismo indoor y recomposición corporal.',
    rateMxn: 350,
    rating: 4.9,
    completedSessions: 64,
    services: ['Evaluación física 1-a-1', 'Plan de resistencia', 'Sesión HIIT personalizada'],
    availability: [
      { id: 'av-01', day: getLocalISODate(0), slot: '18:00' },
      { id: 'av-02', day: getLocalISODate(1), slot: '09:00' },
      { id: 'av-03', day: getLocalISODate(1), slot: '10:00' },
      { id: 'av-04', day: getLocalISODate(2), slot: '18:00' },
    ],
    stripeConnected: true,
    bankLabel: 'Stripe Connect · BBVA terminación 4821',
  },
  {
    id: 'tr-02',
    name: 'Valeria Ríos',
    email: 'valeria@fitlink.mx',
    specialty: 'Yoga Flow, Pilates y Movilidad',
    bio: 'Especialista en control postural, respiración consciente y recuperación activa para socios de todos los niveles.',
    rateMxn: 300,
    rating: 4.8,
    completedSessions: 51,
    services: ['Movilidad articular', 'Pilates personalizado', 'Yoga restaurativo'],
    availability: [
      { id: 'av-05', day: getLocalISODate(0), slot: '17:00' },
      { id: 'av-06', day: getLocalISODate(1), slot: '11:00' },
      { id: 'av-07', day: getLocalISODate(2), slot: '10:00' },
    ],
    stripeConnected: true,
    bankLabel: 'Stripe Connect · Santander terminación 9104',
  },
  {
    id: 'tr-03',
    name: 'Diego Morales',
    email: 'diego@fitlink.mx',
    specialty: 'Boxeo Fitness y Fuerza',
    bio: 'Ex boxeador amateur enfocado en técnica de golpeo, coordinación y fuerza explosiva en sesiones individuales.',
    rateMxn: 400,
    rating: 4.9,
    completedSessions: 42,
    services: ['Técnica de boxeo 1-a-1', 'Fuerza y potencia', 'Acondicionamiento metabólico'],
    availability: [
      { id: 'av-08', day: getLocalISODate(1), slot: '08:00' },
      { id: 'av-09', day: getLocalISODate(1), slot: '19:00' },
      { id: 'av-10', day: getLocalISODate(2), slot: '08:00' },
    ],
    stripeConnected: true,
    bankLabel: 'Stripe Connect · Banorte terminación 3319',
  },
];

export function buildInitialClasses(): GymClass[] {
  const soonSchedule = getRelativeSchedule(50, 55);
  const laterSchedule = getRelativeSchedule(240, 50);

  return [
    {
      id: 'cls-01',
      name: 'Spinning Power',
      discipline: 'Spinning',
      trainerId: 'tr-01',
      trainerName: 'Carlos Mendoza',
      day: laterSchedule.day,
      startTime: laterSchedule.startTime,
      endTime: laterSchedule.endTime,
      durationMinutes: 50,
      calories: 520,
      room: 'Sala Ciclo',
      capacity: 12,
      enrolledMemberIds: [
        'mem-01',
        'mem-02',
        'mem-03',
        'mem-04',
        'mem-05',
        'mem-06',
        'mem-07',
        'mem-08',
        'mem-09',
        'mem-10',
      ],
      waitlistMemberIds: [],
      description:
        'Intervalos de alta intensidad sobre bicicleta fija para mejorar resistencia aeróbica sin impacto articular.',
      attendance: {
        'mem-01': 'Pendiente',
        'mem-02': 'Presente',
        'mem-03': 'Presente',
        'mem-04': 'Pendiente',
        'mem-05': 'Pendiente',
        'mem-06': 'Pendiente',
        'mem-07': 'Pendiente',
        'mem-08': 'Pendiente',
        'mem-09': 'Pendiente',
        'mem-10': 'Pendiente',
      },
      featured: true,
    },
    {
      id: 'cls-02',
      name: 'HIIT Metabólico',
      discipline: 'HIIT',
      trainerId: 'tr-01',
      trainerName: 'Carlos Mendoza',
      day: getLocalISODate(0),
      startTime: '20:15',
      endTime: '21:00',
      durationMinutes: 45,
      calories: 480,
      room: 'Zona Funcional',
      capacity: 10,
      enrolledMemberIds: [
        'mem-02',
        'mem-03',
        'mem-04',
        'mem-05',
        'mem-06',
        'mem-07',
        'mem-08',
        'mem-09',
        'mem-10',
        'mem-11',
      ],
      waitlistMemberIds: ['mem-12'],
      description:
        'Circuito cronometrado de cuerpo completo con kettlebells, remo y trabajo pliométrico.',
      attendance: {
        'mem-02': 'Pendiente',
        'mem-03': 'Pendiente',
        'mem-04': 'Pendiente',
        'mem-05': 'Pendiente',
        'mem-06': 'Pendiente',
        'mem-07': 'Pendiente',
        'mem-08': 'Pendiente',
        'mem-09': 'Pendiente',
        'mem-10': 'Pendiente',
        'mem-11': 'Pendiente',
      },
    },
    {
      id: 'cls-03',
      name: 'Yoga Flow',
      discipline: 'Yoga',
      trainerId: 'tr-02',
      trainerName: 'Valeria Ríos',
      day: soonSchedule.day,
      startTime: soonSchedule.startTime,
      endTime: soonSchedule.endTime,
      durationMinutes: 55,
      calories: 240,
      room: 'Estudio Zen',
      capacity: 14,
      enrolledMemberIds: ['mem-01', 'mem-03', 'mem-05', 'mem-07', 'mem-09', 'mem-11', 'mem-12', 'mem-04'],
      waitlistMemberIds: [],
      description:
        'Secuencia fluida de posturas y respiración para liberar tensión muscular y mejorar movilidad.',
      attendance: {
        'mem-01': 'Pendiente',
        'mem-03': 'Pendiente',
        'mem-05': 'Pendiente',
        'mem-07': 'Pendiente',
        'mem-09': 'Pendiente',
        'mem-11': 'Pendiente',
        'mem-12': 'Pendiente',
        'mem-04': 'Pendiente',
      },
    },
    {
      id: 'cls-04',
      name: 'Box Fitness',
      discipline: 'Box',
      trainerId: 'tr-03',
      trainerName: 'Diego Morales',
      day: getLocalISODate(1),
      startTime: '07:00',
      endTime: '07:50',
      durationMinutes: 50,
      calories: 560,
      room: 'Ring Norte',
      capacity: 12,
      enrolledMemberIds: [
        'mem-02',
        'mem-03',
        'mem-04',
        'mem-05',
        'mem-06',
        'mem-07',
        'mem-08',
        'mem-09',
        'mem-10',
        'mem-11',
        'mem-12',
      ],
      waitlistMemberIds: [],
      description:
        'Combinaciones en costal, cuerda y trabajo de abdomen para desarrollar potencia y coordinación.',
      attendance: {},
    },
    {
      id: 'cls-05',
      name: 'Fuerza Funcional',
      discipline: 'Funcional',
      trainerId: 'tr-01',
      trainerName: 'Carlos Mendoza',
      day: getLocalISODate(1),
      startTime: '18:30',
      endTime: '19:20',
      durationMinutes: 50,
      calories: 450,
      room: 'Zona Funcional',
      capacity: 16,
      enrolledMemberIds: ['mem-02', 'mem-04', 'mem-06', 'mem-08', 'mem-10', 'mem-12', 'mem-05'],
      waitlistMemberIds: [],
      description:
        'Entrenamiento multiarticular con mancuernas, TRX y balón medicinal orientado a fuerza útil.',
      attendance: {},
    },
    {
      id: 'cls-06',
      name: 'Pilates Core',
      discipline: 'Pilates',
      trainerId: 'tr-02',
      trainerName: 'Valeria Ríos',
      day: getLocalISODate(2),
      startTime: '09:00',
      endTime: '09:50',
      durationMinutes: 50,
      calories: 280,
      room: 'Estudio Zen',
      capacity: 12,
      enrolledMemberIds: ['mem-03', 'mem-05', 'mem-07', 'mem-09', 'mem-11'],
      waitlistMemberIds: [],
      description:
        'Trabajo controlado de abdomen profundo, espalda baja y estabilidad postural sobre tapete.',
      attendance: {},
    },
  ];
}

export const INITIAL_CLASSES: GymClass[] = buildInitialClasses();

export const INITIAL_SESSIONS: SessionRequest[] = [
  {
    id: 'ses-01',
    trainerId: 'tr-01',
    trainerName: 'Carlos Mendoza',
    memberId: 'mem-02',
    memberName: 'Alejandro Torres',
    service: 'Plan de resistencia',
    day: getLocalISODate(0),
    slot: '18:00',
    status: 'Pendiente',
    ...splitCommission(350),
    createdAtLabel: 'Hoy, 10:15',
  },
  {
    id: 'ses-02',
    trainerId: 'tr-01',
    trainerName: 'Carlos Mendoza',
    memberId: 'mem-01',
    memberName: 'Sofía Ramírez',
    service: 'Evaluación física 1-a-1',
    day: getLocalISODate(1),
    slot: '10:00',
    status: 'Aceptada',
    ...splitCommission(350),
    createdAtLabel: 'Hoy, 11:30',
  },
  {
    id: 'ses-03',
    trainerId: 'tr-01',
    trainerName: 'Carlos Mendoza',
    memberId: 'mem-03',
    memberName: 'Mariana López',
    service: 'Sesión HIIT personalizada',
    day: getLocalISODate(0),
    slot: '16:00',
    status: 'Confirmada',
    ...splitCommission(350),
    createdAtLabel: 'Ayer, 18:20',
  },
  {
    id: 'ses-04',
    trainerId: 'tr-02',
    trainerName: 'Valeria Ríos',
    memberId: 'mem-01',
    memberName: 'Sofía Ramírez',
    service: 'Movilidad articular',
    day: getLocalISODate(2),
    slot: '11:00',
    status: 'Confirmada',
    ...splitCommission(300),
    createdAtLabel: 'Hace 2 días',
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-01',
    memberId: 'mem-01',
    folio: 'FL-849201',
    concept: 'Plan Mensual FitLink',
    method: 'Tarjeta',
    amountMxn: 699,
    status: 'Pagado',
    dateLabel: 'Hace 6 días',
  },
  {
    id: 'pay-02',
    memberId: 'mem-01',
    folio: 'FL-849245',
    concept: 'Sesión 1-a-1 · Valeria Ríos',
    method: 'Tarjeta',
    amountMxn: 300,
    status: 'Pagado',
    dateLabel: 'Hace 2 días',
    sessionId: 'ses-04',
    trainerId: 'tr-02',
    trainerNetMxn: 270,
    gymFeeMxn: 30,
  },
  {
    id: 'pay-03',
    memberId: 'mem-03',
    folio: 'FL-849312',
    concept: 'Sesión 1-a-1 · Carlos Mendoza',
    method: 'Tarjeta',
    amountMxn: 350,
    status: 'Pagado',
    dateLabel: 'Ayer, 18:35',
    sessionId: 'ses-03',
    trainerId: 'tr-01',
    trainerNetMxn: 315,
    gymFeeMxn: 35,
  },
  {
    id: 'pay-04',
    memberId: 'mem-04',
    folio: 'FL-849190',
    concept: 'Sesión 1-a-1 · Carlos Mendoza',
    method: 'Tarjeta',
    amountMxn: 350,
    status: 'Pagado',
    dateLabel: 'Hace 4 días',
    trainerId: 'tr-01',
    trainerNetMxn: 315,
    gymFeeMxn: 35,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'not-01',
    role: 'usuario',
    title: 'Sesión 1-a-1 aceptada',
    description: 'Carlos Mendoza aceptó tu solicitud. Completa el pago ($350 MXN) para confirmarla.',
    tone: 'info',
    read: false,
    createdAtLabel: 'Hoy, 11:32',
    group: 'Hoy',
    targetRoute: '/(user)/(tabs)/bookings',
  },
  {
    id: 'not-02',
    role: 'usuario',
    title: 'Hoy toca Spinning Power',
    description: 'Tu lugar está reservado en Sala Ciclo con Carlos Mendoza.',
    tone: 'success',
    read: false,
    createdAtLabel: 'Hoy, 09:00',
    group: 'Hoy',
    targetRoute: '/(user)/class-detail?id=cls-01',
  },
  {
    id: 'not-03',
    role: 'usuario',
    title: 'Pago aprobado · Plan Mensual',
    description: 'Recibimos tu pago de $699 MXN con folio FL-849201.',
    tone: 'success',
    read: true,
    createdAtLabel: 'Hace 6 días',
    group: 'Esta semana',
    targetRoute: '/(user)/payments',
  },
  {
    id: 'not-04',
    role: 'entrenador',
    title: 'Nueva solicitud 1-a-1',
    description: 'Alejandro Torres solicitó Plan de resistencia hoy a las 18:00 ($315 MXN netos).',
    tone: 'warning',
    read: false,
    createdAtLabel: 'Hoy, 10:15',
    group: 'Hoy',
    targetRoute: '/(trainer)/(tabs)/requests',
  },
  {
    id: 'not-05',
    role: 'entrenador',
    title: 'Spinning Power casi llena',
    description: '10 de 12 lugares ocupados para tu clase en Sala Ciclo.',
    tone: 'info',
    read: false,
    createdAtLabel: 'Hoy, 08:40',
    group: 'Hoy',
    targetRoute: '/(trainer)/(tabs)/attendance?classId=cls-01',
  },
  {
    id: 'not-06',
    role: 'entrenador',
    title: 'Pago recibido · Sesión 1-a-1',
    description: 'Mariana López liquidó su sesión. Se abonaron $315 MXN (90%) a tu cuenta.',
    tone: 'success',
    read: true,
    createdAtLabel: 'Ayer, 18:35',
    group: 'Esta semana',
    targetRoute: '/(trainer)/(tabs)/payments',
  },
];
