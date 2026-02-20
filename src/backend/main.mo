import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Float "mo:core/Float";
import List "mo:core/List";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize authorization, file storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  type Service = {
    id : Text;
    name : Text;
    description : Text;
    durationMinutes : Nat;
    priceCents : Nat;
  };

  type StylistProfile = {
    id : Text;
    name : Text;
    specialties : [Text];
    bio : Text;
    photo : ?Storage.ExternalBlob;
  };

  public type UserProfile = {
    name : Text;
    phone : ?Text;
    email : ?Text;
  };

  type HairstyleRecommendation = {
    styleName : Text;
    description : Text;
    confidenceScore : Nat;
    image : ?Storage.ExternalBlob;
  };

  type AIStylingConsultation = {
    userPhoto : Storage.ExternalBlob;
    selectedStyles : [HairstyleRecommendation];
    aiRecommendations : [HairstyleRecommendation];
  };

  public type AppointmentStatus = {
    #pending;
    #confirmed;
    #canceled;
    #completed;
  };

  // Extended Appointment type for post-migration
  public type Appointment = {
    id : Text;
    userId : Principal;
    salonId : Text;
    serviceId : Text;
    stylistId : Text;
    dateTime : Time.Time;
    status : AppointmentStatus;
    aiStylingConsultation : ?AIStylingConsultation;
    createdBy : ?Principal;
    note : ?Text;
  };

  // Salon registration status type
  public type RegistrationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // Extended Salon type for post-migration
  public type Salon = {
    id : Text;
    name : Text;
    address : Text;
    ownerName : Text;
    contactInfo : Text;
    verified : Bool;
    status : RegistrationStatus;
    latitude : Float;
    longitude : Float;
  };

  public type BookingFilterCriteria = {
    salonId : ?Text;
    status : ?AppointmentStatus;
    stylistId : ?Text;
  };

  public type BookingStats = {
    confirmed : Nat;
    pending : Nat;
    canceled : Nat;
    completed : Nat;
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
  };

  type CustomizationVariation = {
    variationName : Text;
    description : Text;
    customizationDetails : [Text];
    previewImage : ?Storage.ExternalBlob;
  };

  // New types for Sales, Reviews, and Dashboard Analytics
  public type Sale = {
    id : Text;
    salonId : Text;
    amountCents : Nat;
    timestamp : Time.Time;
  };

  public type Review = {
    id : Text;
    salonId : Text;
    rating : Nat8;
    comment : Text;
    reviewerName : Text;
    timestamp : Time.Time;
  };

  public type MonthlySalesData = {
    month : Text;
    totalRevenueCents : Nat;
    transactionCount : Nat;
  };

  public type MonthlyBookingStats = {
    month : Text;
    totalBookings : Nat;
  };

  public type BusinessDashboard = {
    salonId : Text;
    monthlySales : [MonthlySalesData];
    monthlyBookings : [MonthlyBookingStats];
    reviews : [Review];
  };

  // Persistent storage
  let serviceStore = Map.empty<Text, Service>();
  let stylistStore = Map.empty<Text, StylistProfile>();
  let appointmentStore = Map.empty<Text, Appointment>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let salonStore = Map.empty<Text, Salon>();
  let saleStore = Map.empty<Text, List.List<Sale>>();
  let reviewStore = Map.empty<Text, List.List<Review>>();
  // New persistent hairstyle mapping
  let userHairstylePhotos = Map.empty<Principal, Storage.ExternalBlob>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Service and Stylist Management (Admin only for admin platform)
  public query ({ caller }) func getServices() : async [Service] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view services");
    };
    serviceStore.values().toArray();
  };

  public query ({ caller }) func getStylists() : async [StylistProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view stylists");
    };
    stylistStore.values().toArray();
  };

  // Admin function - Service management
  public shared ({ caller }) func addService(service : Service) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };
    serviceStore.add(service.id, service);
  };

  public shared ({ caller }) func updateService(service : Service) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };
    serviceStore.add(service.id, service);
  };

  public shared ({ caller }) func deleteService(serviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    serviceStore.remove(serviceId);
  };

  public shared ({ caller }) func addStylist(stylist : StylistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add stylists");
    };
    stylistStore.add(stylist.id, stylist);
  };

  public shared ({ caller }) func updateStylist(stylist : StylistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update stylists");
    };
    stylistStore.add(stylist.id, stylist);
  };

  public shared ({ caller }) func deleteStylist(stylistId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete stylists");
    };
    stylistStore.remove(stylistId);
  };

  // Location-based filtering (New public query function)
  public query ({ caller }) func getNearbySalons(location : Location, radiusKm : Float) : async [Salon] {
    // No authentication required, all users can fetch nearby salons.
    let allSalons = salonStore.values().toArray();
    allSalons.filter(
      func(salon : Salon) : Bool {
        let distance = calculateDistance(location.latitude, location.longitude, salon.latitude, salon.longitude);
        distance <= radiusKm;
      }
    );
  };

  // Helper function to calculate distance between two coordinates (Haversine formula)
  func calculateDistance(lat1 : Float, lon1 : Float, lat2 : Float, lon2 : Float) : Float {
    let toRadians = func(deg : Float) : Float { deg * 3.14159265 / 180.0 };
    let earthRadiusKm = 6371.0;

    let dLat = toRadians(lat2 - lat1);
    let dLon = toRadians(lon2 - lon1);

    let a = Float.sin(dLat / 2.0) ** 2.0 +
            Float.cos(toRadians(lat1)) * Float.cos(toRadians(lat2)) *
              Float.sin(dLon / 2.0) ** 2.0;

    let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
    earthRadiusKm * c;
  };

  // Flexible booking flow for all users
  public shared ({ caller }) func bookAppointment(
    salonId : Text,
    serviceId : Text,
    stylistId : Text,
    dateTime : Time.Time,
    note : ?Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create appointments");
    };

    // Verify salon exists
    switch (salonStore.get(salonId)) {
      case null { Runtime.trap("Salon not found") };
      case (?_) {};
    };

    // Verify service exists
    switch (serviceStore.get(serviceId)) {
      case null { Runtime.trap("Service not found") };
      case (?_) {};
    };

    // Verify stylist exists
    switch (stylistStore.get(stylistId)) {
      case null { Runtime.trap("Stylist not found") };
      case (?_) {};
    };

    let appointmentId = salonId # "-" # caller.toText() # "-" # Time.now().toText();
    let appointment : Appointment = {
      id = appointmentId;
      userId = caller;
      salonId;
      serviceId;
      stylistId;
      dateTime;
      status = #pending;
      aiStylingConsultation = null;
      createdBy = ?caller;
      note;
    };
    appointmentStore.add(appointment.id, appointment);
    appointmentId;
  };

  // AI Styling Consultation function - Users can upload for their own appointments
  public shared ({ caller }) func uploadStylingConsultation(
    appointmentId : Text,
    userPhoto : Storage.ExternalBlob,
    selectedStyles : [HairstyleRecommendation],
    aiRecommendations : [HairstyleRecommendation],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload styling consultations");
    };

    // Validate appointment exists and belongs to caller (or caller is admin)
    switch (appointmentStore.get(appointmentId)) {
      case null { Runtime.trap("Appointment not found") };
      case (?appointment) {
        // Users can only upload consultations for their own appointments, admins can upload for any
        if (appointment.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only upload consultations for your own appointments");
        };

        let consultation : AIStylingConsultation = {
          userPhoto;
          selectedStyles;
          aiRecommendations;
        };

        let updatedAppointment = {
          appointment with aiStylingConsultation = ?consultation;
        };

        appointmentStore.add(appointmentId, updatedAppointment);
      };
    };
  };

  // New endpoint to upload photos to a user profile
  public shared ({ caller }) func uploadHairstylePhoto(externalBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload photos");
    };
    userHairstylePhotos.add(caller, externalBlob);
  };

  // New endpoint to retrieve a user's hairstyle photo - with proper ownership check
  public query ({ caller }) func getHairstylePhoto(user : Principal) : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hairstyle photos");
    };

    // Users can only view their own photos, admins can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own hairstyle photo");
    };

    userHairstylePhotos.get(user);
  };

  // Get caller's own hairstyle photo
  public query ({ caller }) func getMyHairstylePhoto() : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hairstyle photos");
    };
    userHairstylePhotos.get(caller);
  };

  // Get user's own appointments (Users can view their appointments)
  public query ({ caller }) func getMyAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appointments");
    };

    appointmentStore.values().toArray().filter(func(apt : Appointment) : Bool {
      apt.userId == caller;
    });
  };

  // Cancel appointment - Users can cancel their own, admins can cancel any
  public shared ({ caller }) func cancelAppointment(appointmentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel appointments");
    };

    switch (appointmentStore.get(appointmentId)) {
      case null { Runtime.trap("Appointment not found") };
      case (?appointment) {
        // Users can only cancel their own appointments, admins can cancel any
        if (appointment.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only cancel your own appointments");
        };

        let updatedAppointment = {
          appointment with status = #canceled;
        };
        appointmentStore.add(appointmentId, updatedAppointment);
      };
    };
  };

  // Admin function - View all appointments
  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all appointments");
    };
    appointmentStore.values().toArray();
  };

  // Admin function - Confirm appointment
  public shared ({ caller }) func confirmAppointment(appointmentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm appointments");
    };

    switch (appointmentStore.get(appointmentId)) {
      case null { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updatedAppointment = {
          appointment with status = #confirmed;
        };
        appointmentStore.add(appointmentId, updatedAppointment);
      };
    };
  };

  // Salon Management Functions
  // -------------------------

  // Add new salon (Admin only)
  public shared ({ caller }) func addSalon(salon : Salon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add salons");
    };
    salonStore.add(salon.id, salon);
  };

  // Update salon details (Admin only)
  public shared ({ caller }) func updateSalon(salon : Salon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update salons");
    };
    salonStore.add(salon.id, salon);
  };

  // Get all salons (Admin only for intermediary platform)
  public query ({ caller }) func getAllSalons() : async [Salon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view salons");
    };
    salonStore.values().toArray();
  };

  // Get salons by verification status (Admin only)
  public query ({ caller }) func getSalonsByVerification(verified : Bool) : async [Salon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view verified salons");
    };

    salonStore.values().toArray().filter(func(salon) { salon.verified == verified });
  };

  // Admin salon verification (Admin only)
  public shared ({ caller }) func verifySalon(salonId : Text, verified : Bool, status : RegistrationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify salons");
    };

    switch (salonStore.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?salon) {
        let updatedSalon = {
          salon with verified;
          status;
        };
        salonStore.add(salonId, updatedSalon);
      };
    };
  };

  // Centralized Booking Management (Admin only)
  // -------------------------------------------
  public query ({ caller }) func filterBookings(search : Text) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    let allAppointments = appointmentStore.values().toArray();
    if (search == "") { return allAppointments };
    allAppointments.filter(
      func(apt) {
        apt.id.contains(#text search) or
        apt.salonId.contains(#text search)
      }
    );
  };

  public query ({ caller }) func getAllBookingStats(_ : ()) : async BookingStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view booking stats");
    };

    var confirmed = 0;
    var pending = 0;
    var canceled = 0;
    var completed = 0;

    let appointments = appointmentStore.values().toArray();
    for (appointment in appointments.values()) {
      switch (appointment.status) {
        case (#confirmed) { confirmed += 1 };
        case (#pending) { pending += 1 };
        case (#canceled) { canceled += 1 };
        case (#completed) { completed += 1 };
      };
    };

    {
      confirmed;
      pending;
      canceled;
      completed;
    };
  };

  // New functions for sales, reviews, and dashboard analytics

  public shared ({ caller }) func addSale(sale : Sale) : async () {
    if (not isAdminOrSalonOwner(caller, sale.salonId)) {
      Runtime.trap("Unauthorized: Only admin or salon owner can add sales");
    };
    let existingSalesList = switch (saleStore.get(sale.salonId)) {
      case (null) { List.empty<Sale>() };
      case (?list) { list };
    };
    existingSalesList.add(sale);
    saleStore.add(sale.salonId, existingSalesList);
  };

  public shared ({ caller }) func addReview(review : Review) : async () {
    let existingReviewsList = switch (reviewStore.get(review.salonId)) {
      case (null) { List.empty<Review>() };
      case (?list) { list };
    };
    existingReviewsList.add(review);
    reviewStore.add(review.salonId, existingReviewsList);
  };

  public query ({ caller }) func getSalonDashboard(salonId : Text) : async BusinessDashboard {
    if (not isAdminOrSalonOwner(caller, salonId)) {
      Runtime.trap("Unauthorized: Only admin or salon owner can access dashboard");
    };

    let monthlySales = calculateMonthlySales(salonId);
    let monthlyBookings = calculateMonthlyBookings(salonId);
    let reviews = switch (reviewStore.get(salonId)) {
      case (null) { [] };
      case (?reviewsList) { reviewsList.toArray() };
    };

    {
      salonId;
      monthlySales;
      monthlyBookings;
      reviews;
    };
  };

  func calculateMonthlySales(salonId : Text) : [MonthlySalesData] {
    switch (saleStore.get(salonId)) {
      case (null) { [] };
      case (?salesList) { aggregateSalesByMonth(salesList.toArray()) };
    };
  };

  func aggregateSalesByMonth(sales : [Sale]) : [MonthlySalesData] {
    let monthlySalesMap = Map.empty<Text, (Nat, Nat)>();

    for (sale in sales.values()) {
      let month = getMonthFromTimestamp(sale.timestamp);
      let (currentRevenue, currentTransactionCount) = switch (monthlySalesMap.get(month)) {
        case (null) { (0, 0) };
        case (?(rev, count)) { (rev, count) };
      };
      monthlySalesMap.add(month, (currentRevenue + sale.amountCents, currentTransactionCount + 1));
    };

    let results = List.empty<MonthlySalesData>();
    let iter = monthlySalesMap.entries();
    for ((month, totals) in iter) {
      let (totalRevenueCents, transactionCount) = totals;
      results.add({
        month;
        totalRevenueCents;
        transactionCount;
      });
    };
    results.toArray();
  };

  func calculateMonthlyBookings(salonId : Text) : [MonthlyBookingStats] {
    let bookings = appointmentStore.values().toArray().filter(
      func(apt) {
        apt.salonId == salonId and apt.status == #confirmed
      }
    );
    aggregateBookingsByMonth(bookings);
  };

  func aggregateBookingsByMonth(bookings : [Appointment]) : [MonthlyBookingStats] {
    let monthlyBookingMap = Map.empty<Text, Nat>();

    for (booking in bookings.values()) {
      let month = getMonthFromTimestamp(booking.dateTime);
      let currentCount = switch (monthlyBookingMap.get(month)) {
        case (null) { 0 };
        case (?count) { count };
      };
      monthlyBookingMap.add(month, currentCount + 1);
    };

    let results = List.empty<MonthlyBookingStats>();
    let iter = monthlyBookingMap.entries();
    for ((month, totalBookings) in iter) {
      results.add({
        month;
        totalBookings;
      });
    };
    results.toArray();
  };

  func getMonthFromTimestamp(timestamp : Time.Time) : Text {
    let nanosecondsPerMonth = 2592000000000000 + 43200000000000 : Time.Time;
    let monthNumber = timestamp / nanosecondsPerMonth;
    monthNumber.toText();
  };

  func isAdminOrSalonOwner(caller : Principal, salonId : Text) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (salonStore.get(salonId)) {
      case (?salon) { salon.ownerName == caller.toText() };
      case (null) { false };
    };
  };

  // AI Customization Recommendation (Photo Analysis)
  public shared ({ caller }) func getCustomizationRecommendations(photo : Storage.ExternalBlob) : async [CustomizationVariation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access AI recommendations");
    };

    // AI-based photo analysis - returns multiple customization variations
    // with concrete customization suggestions for hairstyle modifications.
    // Placeholder implementation - This would be replaced with actual AI processing.
    let variations : [CustomizationVariation] = [
      {
        variationName = "Classic Bob";
        description = "A timeless short hairstyle with subtle layers.";
        customizationDetails = ["Adjust color for highlights", "Add more texture to the ends"];
        previewImage = null;
      },
      {
        variationName = "Long Layers";
        description = "Flowing long hair with soft layers for volume.";
        customizationDetails = ["Consider face-framing layers", "Add balayage coloring"];
        previewImage = null;
      },
      {
        variationName = "Pixie Cut";
        description = "A bold, short hairstyle emphasizing facial features.";
        customizationDetails = ["Explore different bang styles", "Add color dimensions"];
        previewImage = null;
      },
    ];

    variations;
  };
};
