import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export interface StylistProfile {
    id: string;
    bio: string;
    name: string;
    specialties: Array<string>;
    photo?: ExternalBlob;
}
export interface Location {
    latitude: number;
    longitude: number;
}
export type Time = bigint;
export interface Salon {
    id: string;
    status: RegistrationStatus;
    latitude: number;
    verified: boolean;
    contactInfo: string;
    ownerName: string;
    name: string;
    longitude: number;
    address: string;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    durationMinutes: bigint;
    priceCents: bigint;
}
export interface Sale {
    id: string;
    amountCents: bigint;
    timestamp: Time;
    salonId: string;
}
export interface MonthlySalesData {
    month: string;
    totalRevenueCents: bigint;
    transactionCount: bigint;
}
export interface BookingStats {
    canceled: bigint;
    pending: bigint;
    completed: bigint;
    confirmed: bigint;
}
export interface MonthlyBookingStats {
    month: string;
    totalBookings: bigint;
}
export interface CustomizationVariation {
    previewImage?: ExternalBlob;
    customizationDetails: Array<string>;
    variationName: string;
    description: string;
}
export interface BusinessDashboard {
    reviews: Array<Review>;
    monthlySales: Array<MonthlySalesData>;
    monthlyBookings: Array<MonthlyBookingStats>;
    salonId: string;
}
export interface AIStylingConsultation {
    userPhoto: ExternalBlob;
    selectedStyles: Array<HairstyleRecommendation>;
    aiRecommendations: Array<HairstyleRecommendation>;
}
export interface HairstyleRecommendation {
    description: string;
    confidenceScore: bigint;
    image?: ExternalBlob;
    styleName: string;
}
export interface Appointment {
    id: string;
    status: AppointmentStatus;
    aiStylingConsultation?: AIStylingConsultation;
    userId: Principal;
    stylistId: string;
    note?: string;
    createdBy?: Principal;
    serviceId: string;
    dateTime: Time;
    salonId: string;
}
export interface Review {
    id: string;
    reviewerName: string;
    comment: string;
    timestamp: Time;
    rating: number;
    salonId: string;
}
export enum AppointmentStatus {
    canceled = "canceled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum RegistrationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addReview(review: Review): Promise<void>;
    addSale(sale: Sale): Promise<void>;
    addSalon(salon: Salon): Promise<void>;
    addService(service: Service): Promise<void>;
    addStylist(stylist: StylistProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(salonId: string, serviceId: string, stylistId: string, dateTime: Time, note: string | null): Promise<string>;
    cancelAppointment(appointmentId: string): Promise<void>;
    confirmAppointment(appointmentId: string): Promise<void>;
    deleteService(serviceId: string): Promise<void>;
    deleteStylist(stylistId: string): Promise<void>;
    filterBookings(search: string): Promise<Array<Appointment>>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllBookingStats(arg0: null): Promise<BookingStats>;
    getAllSalons(): Promise<Array<Salon>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomizationRecommendations(photo: ExternalBlob): Promise<Array<CustomizationVariation>>;
    getHairstylePhoto(user: Principal): Promise<ExternalBlob | null>;
    getMyAppointments(): Promise<Array<Appointment>>;
    getMyHairstylePhoto(): Promise<ExternalBlob | null>;
    getNearbySalons(location: Location, radiusKm: number): Promise<Array<Salon>>;
    getSalonDashboard(salonId: string): Promise<BusinessDashboard>;
    getSalonsByVerification(verified: boolean): Promise<Array<Salon>>;
    getServices(): Promise<Array<Service>>;
    getStylists(): Promise<Array<StylistProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateSalon(salon: Salon): Promise<void>;
    updateService(service: Service): Promise<void>;
    updateStylist(stylist: StylistProfile): Promise<void>;
    uploadHairstylePhoto(externalBlob: ExternalBlob): Promise<void>;
    uploadStylingConsultation(appointmentId: string, userPhoto: ExternalBlob, selectedStyles: Array<HairstyleRecommendation>, aiRecommendations: Array<HairstyleRecommendation>): Promise<void>;
    verifySalon(salonId: string, verified: boolean, status: RegistrationStatus): Promise<void>;
}
