package com.crm.data.model;

public class Organization extends BaseModel {

    private Long id;
    private String name;
    private boolean enabled;

    public Organization(){
    }

    public Organization(String name, boolean enabled){
        this.name = name;
        this.enabled = enabled;
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

    public boolean getEnabled(){
        return enabled;
    }

    public void setEnabled(boolean enabled){
        this.enabled = enabled;
    }
}
