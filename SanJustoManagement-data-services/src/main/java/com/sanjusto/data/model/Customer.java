package com.sanjusto.data.model;


import java.util.Date;

public class Customer {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private Date startDate;
    private boolean enable;
    private String email;

    public Customer(){
    }

    public Customer(String name, String address, String phone, Date startDate, boolean enable, String email){
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.startDate = startDate;
        this.enable = enable;
        this.email = email;
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

    public boolean getEnable(){
        return enable;
    }

    public void setEnable(boolean enable){
        this.enable = enable;
    }

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }
}
