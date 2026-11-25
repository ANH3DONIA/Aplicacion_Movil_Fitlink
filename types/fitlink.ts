export type UserRole = 'usuario' | 'entrenador';

export type MembershipStatus = 'Activa' | 'Por vencer' | 'Pago pendiente' | 'Vencida';

export interface UserPreferences {
  classReminders: boolean;
  paymentAlerts: boolean;
  waitlistAlerts: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  planId: string;
  planName: string;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string;
  autoRenew: boolean;
  passValidDate?: string;
  preferences: UserPreferences;
  trainerId?: string;
}

export interface GymScheduleItem {
  label: string;
  hours: string;
}

export interface GymProfile {
  name: string;
  address: string;
  city: string;
  timezoneLabel: string;
  phone: string;
  schedules: GymScheduleItem[];
  policies: string[];
}

export interface TrainerInvite {
  code: string;
  trainerId: string;
  name: string;
  email: string;
  specialty: string;
  expiresInHours: number;
  activated: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  priceMxn: number;
  billingCycle: 'Mensual' | 'Día' | 'Anual';
  tagline: string;
  badge?: string;
  features: string[];
  highlighted?: boolean;
}

export type AttendanceStatus = 'Presente' | 'Ausente' | 'Pendiente';

export type ClassDiscipline = 'Spinning' | 'HIIT' | 'Yoga' | 'Funcional' | 'Box' | 'Pilates';

export interface GymClass {
  id: string;
  name: string;
  discipline: ClassDiscipline;
  trainerId: string;
  trainerName: string;
  day: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  calories: number;
  room: string;
  capacity: number;
  enrolledMemberIds: string[];
  waitlistMemberIds: string[];
  description: string;
  attendance: Record<string, AttendanceStatus>;
  featured?: boolean;
}

export interface TrainerAvailabilitySlot {
  id: string;
  day: string;
  slot: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  rateMxn: number;
  rating: number;
  completedSessions: number;
  services: string[];
  availability: TrainerAvailabilitySlot[];
  stripeConnected: boolean;
  bankLabel: string;
}

export type SessionRequestStatus =
  | 'Pendiente'
  | 'Aceptada'
  | 'Confirmada'
  | 'Rechazada'
  | 'Cancelada'
  | 'Expirada';

export interface SessionRequest {
  id: string;
  trainerId: string;
  trainerName: string;
  memberId: string;
  memberName: string;
  service: string;
  day: string;
  slot: string;
  status: SessionRequestStatus;
  grossMxn: number;
  netTrainerMxn: number;
  gymFeeMxn: number;
  createdAtLabel: string;
  cancelReason?: string;
}

export type PaymentMethod = 'Tarjeta' | 'Efectivo (Caja)';
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Fallido' | 'Vencido' | 'Reembolsado';

export interface PaymentRecord {
  id: string;
  memberId: string;
  folio: string;
  concept: string;
  method: PaymentMethod;
  amountMxn: number;
  status: PaymentStatus;
  dateLabel: string;
  expiresInHours?: number;
  validForDate?: string;
  sessionId?: string;
  trainerId?: string;
  trainerNetMxn?: number;
  gymFeeMxn?: number;
}

export type NotificationTone = 'success' | 'warning' | 'error' | 'info';
export type NotificationGroup = 'Hoy' | 'Esta semana' | 'Anteriores';

export interface AppNotification {
  id: string;
  role: UserRole;
  title: string;
  description: string;
  tone: NotificationTone;
  read: boolean;
  createdAtLabel: string;
  group: NotificationGroup;
  targetRoute?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: NotificationTone;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  folio?: string;
}

export interface MemberDirectoryEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  planName: string;
}
