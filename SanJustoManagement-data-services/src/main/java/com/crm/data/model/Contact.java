package com.crm.data.model;

public class Contact extends BaseModel {

    private Long id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String phone;
    private String email;
    private boolean enabled;
    @ExcludeFieldFromJSON private Organization organization;
    private Customer customer;

    public Contact(){
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getFirstName(){
        return firstName;
    }

    public void setFirstName(String firstName){
        this.firstName = firstName;
    }

    public String getMiddleName(){
        return middleName;
    }

    public void setMiddleName(String middleName){
        this.middleName = middleName;
    }

    public String getLastName(){
        return lastName;
    }

    public void setLastName(String lastName){
        this.lastName = lastName;
    }

    public String getPhone(){
        return phone;
    }

    public void setPhone(String phone){
        this.phone = phone;
    }

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public boolean getEnabled(){
        return enabled;
    }

    public void setEnabled(boolean enabled){
        this.enabled = enabled;
    }

    public Organization getOrganization(){
        return organization;
    }

    public void setOrganization(Organization organization){
        this.organization = organization;
    }

    public Customer getCustomer(){
        return customer;
    }

    public void setCustomer(Customer customer){
        this.customer = customer;
    }
}
