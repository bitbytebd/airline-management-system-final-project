package com.cogent.model;

import jakarta.persistence.*;

@Entity
@Table(name = "passengers")
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "passport_number", unique = true)
    private String passportNumber;

    private String nationality;
    
    @Column(name = "date_of_birth")
    private String dateOfBirth;
    
    private String gender;
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    private String address;
    
    @Column(name = "frequent_flyer_no")
    private String frequentFlyerNo;
    
    @Column(name = "meal_preference")
    private String mealPreference;
    
    private String status;

    @Transient
    private Long totalBookings;

    @Transient
    private Integer loyaltyPoints;

    // Constructors, Getters and Setters
    public Passenger() {}

    public Long getId() { return id; }
    
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPassportNumber() { return passportNumber; }
    
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }
    
    public String getNationality() { return nationality; }
    
    public void setNationality(String nationality) { this.nationality = nationality; }
    
    public String getDateOfBirth() { return dateOfBirth; }
    
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getGender() { return gender; }
    
    public void setGender(String gender) { this.gender = gender; }
    
    public String getEmail() { return email; }
    
    public void setEmail(String email) { this.email = email; }
    
    public String getPhoneNumber() { return phoneNumber; }
    
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getAddress() { return address; }
    
    public void setAddress(String address) { this.address = address; }
    
    public String getFrequentFlyerNo() { return frequentFlyerNo; }
    
    public void setFrequentFlyerNo(String frequentFlyerNo) { this.frequentFlyerNo = frequentFlyerNo; }
    
    public String getMealPreference() { return mealPreference; }
    
    public void setMealPreference(String mealPreference) { this.mealPreference = mealPreference; }
    
    public String getStatus() { return status; }
    
    public void setStatus(String status) { this.status = status; }

    public Long getTotalBookings() { return totalBookings; }

    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }

    public Integer getLoyaltyPoints() { return loyaltyPoints; }

    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
}
