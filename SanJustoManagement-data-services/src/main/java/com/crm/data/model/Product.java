package com.crm.data.model;

import java.util.Set;

public class Product extends BaseModel {

    private Long id;
    private String name;
    private String description;
    private Double quantity;
    private Type unit;
    @ExcludeFieldFromJSON private Organization organization;

    public Product(){
    }

    public Product(Long id, String name, String description, Double quantity, Type unit, Organization organization){
        this.id = id;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.unit = unit;
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

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public Double getQuantity(){
        return quantity;
    }

    public void setQuantity(Double quantity){
        this.quantity = quantity;
    }

    public Type getUnit(){
        return unit;
    }

    public void setUnit(Type unit){
        this.unit = unit;
    }

    public Organization getOrganization(){
        return organization;
    }

    public void setOrganization(Organization organization){
        this.organization = organization;
    }
}
