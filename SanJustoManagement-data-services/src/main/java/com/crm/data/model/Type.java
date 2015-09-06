package com.crm.data.model;

import java.util.Set;

public class Type extends BaseModel {

    private Long id;
    private String type;
    private String shortName;
    private String description;
    private boolean enabled;
    private Set subTypes;
    @ExcludeFieldFromJSON private Organization organization;

    public Type(){
    }

    public Type(String type, String shortName, String description,
                boolean enabled, Organization organization){
        this.type = type;
        this.shortName = shortName;
        this.description = description;
        this.enabled = enabled;
        this.organization = organization;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getType(){
        return type;
    }

    public void setType(String type){
        this.type = type;
    }

    public String getShortName(){
        return shortName;
    }

    public void setShortName(String shortName){
        this.shortName = shortName;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
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

    public Set getSubTypes(){
        return subTypes;
    }

    public void setSubTypes(Set subTypes){
        this.subTypes = subTypes;
    }
}
