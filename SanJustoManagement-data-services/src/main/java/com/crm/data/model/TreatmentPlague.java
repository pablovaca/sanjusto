package com.crm.data.model;


public class TreatmentPlague extends BaseModel {

    private Long id;
    private Treatment treatment;
    private Type typePlague;
    private Type controlled;

    public TreatmentPlague(){
    }

    public TreatmentPlague(Long id, Treatment treatment, Type typePlague, Type controlled){
        this.id = id;
        this.treatment = treatment;
        this.typePlague = typePlague;
        this.controlled = controlled;
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

    public Type getTypePlague(){
        return typePlague;
    }

    public void setTypePlague(Type typePlague){
        this.typePlague = typePlague;
    }

    public Type getControlled(){
        return controlled;
    }

    public void setControlled(Type controlled){
        this.controlled = controlled;
    }
}
