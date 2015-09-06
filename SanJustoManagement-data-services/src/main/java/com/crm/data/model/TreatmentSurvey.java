package com.crm.data.model;


public class TreatmentSurvey extends BaseModel {

    private Long id;
    private Treatment treatment;
    private Type typeSurvey;
    private Type subTypeSurvey;
    private boolean checked;

    public TreatmentSurvey(){
    }

    public TreatmentSurvey(Long id, Treatment treatment, Type typeSurvey, Type subTypeSurvey, boolean checked){
        this.id = id;
        this.treatment = treatment;
        this.typeSurvey = typeSurvey;
        this.subTypeSurvey = subTypeSurvey;
        this.checked = checked;
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

    public Type getTypeSurvey(){
        return typeSurvey;
    }

    public void setTypeSurvey(Type typeSurvey){
        this.typeSurvey = typeSurvey;
    }

    public Type getSubTypeSurvey(){
        return subTypeSurvey;
    }

    public void setSubTypeSurvey(Type subTypeSurvey){
        this.subTypeSurvey = subTypeSurvey;
    }

    public boolean isChecked(){
        return checked;
    }

    public void setChecked(boolean checked){
        this.checked = checked;
    }
}
