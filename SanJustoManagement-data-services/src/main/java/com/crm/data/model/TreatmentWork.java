package com.crm.data.model;


import java.util.Date;

public class TreatmentWork extends BaseModel {

    private Long id;
    private Treatment treatment;
    private Type typeWork;

    public TreatmentWork(){
    }

    public TreatmentWork(Long id, Treatment treatment, Type typeWork){
        this.id = id;
        this.treatment = treatment;
        this.typeWork = typeWork;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public Treatment getTreatment(){
        return treatment;
    }

    public void setTreatment(Treatment treatment){
        this.treatment = treatment;
    }

    public Type getTypeWork(){
        return typeWork;
    }

    public void setTypeWork(Type typeWork){
        this.typeWork = typeWork;
    }
}
