import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import Float "mo:core/Float";

module {
  // Old type definitions (without Sales and Reviews)
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

  type UserProfile = {
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

  type AppointmentStatus = {
    #pending;
    #confirmed;
    #canceled;
    #completed;
  };

  type Appointment = {
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

  type RegistrationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Salon = {
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

  type OldActor = {
    serviceStore : Map.Map<Text, Service>;
    stylistStore : Map.Map<Text, StylistProfile>;
    appointmentStore : Map.Map<Text, Appointment>;
    userProfiles : Map.Map<Principal, UserProfile>;
    salonStore : Map.Map<Text, Salon>;
    userHairstylePhotos : Map.Map<Principal, Storage.ExternalBlob>;
  };

  // New types for Sales and Reviews
  type Sale = {
    id : Text;
    salonId : Text;
    amountCents : Nat;
    timestamp : Time.Time;
  };

  type Review = {
    id : Text;
    salonId : Text;
    rating : Nat8;
    comment : Text;
    reviewerName : Text;
    timestamp : Time.Time;
  };

  type NewActor = {
    serviceStore : Map.Map<Text, Service>;
    stylistStore : Map.Map<Text, StylistProfile>;
    appointmentStore : Map.Map<Text, Appointment>;
    userProfiles : Map.Map<Principal, UserProfile>;
    salonStore : Map.Map<Text, Salon>;
    userHairstylePhotos : Map.Map<Principal, Storage.ExternalBlob>;
    saleStore : Map.Map<Text, List.List<Sale>>;
    reviewStore : Map.Map<Text, List.List<Review>>;
  };

  public func run(old : OldActor) : NewActor {
    let emptySaleStore = Map.empty<Text, List.List<Sale>>();
    let emptyReviewStore = Map.empty<Text, List.List<Review>>();

    {
      old with
      saleStore = emptySaleStore;
      reviewStore = emptyReviewStore;
    };
  };
};
