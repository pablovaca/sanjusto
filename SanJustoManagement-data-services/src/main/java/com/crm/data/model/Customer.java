package com.crm.data.model;


import java.util.Date;

public class Customer extends BaseModel {

    private Long id;
    private String name;
    private String address;
    private String neighborhood;
    private String city;
    private String phone;
    private Date startDate;
    private boolean enabled;
    private String email;
    private Type type;
    @ExcludeFieldFromJSON private Organization organization;

    public Customer(){
    }

    public Customer(String name, String address, String neighborhood, String city, String phone, Date startDate,
                    boolean enabled, String email, Type type, Organization organization){
        this.name = name;
        this.address = address;
        this.neighborhood = neighborhood;
        this.city = city;
        this.phone = phone;
        this.startDate = startDate;
        this.enabled = enabled;
        this.email = email;
        this.type = type;
        this.organization = organization;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public String getAddress(){
        return address;
    }

    public void setAddress(String address){
        this.address = address;
    }

    public String getPhone(){
        return phone;
    }

    public void setPhone(String phone){
        this.phone = phone;
    }

    public Date getStartDate(){
        return startDate;
    }

    public void setStartDate(Date startDate){
        this.startDate = startDate;
    }

    public boolean getEnabled(){
        return enabled;
    }

    public void setEnabled(boolean enabled){
        this.enabled = enabled;
    }

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public String getNeighborhood(){
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood){
        this.neighborhood = neighborhood;
    }

    public String getCity(){
        return city;
    }

    public void setCity(String city){
        this.city = city;
    }

    public Type getType(){
        return type;
    }

    public void setType(Type type){
        this.type = type;
    }

    public Organization getOrganization(){
        return organization;
    }

    public void setOrganization(Organization organization){
        this.organization = organization;
    }
}
