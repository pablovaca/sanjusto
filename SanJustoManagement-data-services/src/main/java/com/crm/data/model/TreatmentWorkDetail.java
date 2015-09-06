package com.crm.data.model;


public class TreatmentWorkDetail extends BaseModel {

    private Long id;
    private TreatmentWork treatmentWork;
    private Type typeWorkDetail;

    public TreatmentWorkDetail(){
    }

    public TreatmentWorkDetail(Long id, TreatmentWork treatmentWork, Type typeWorkDetail){
        this.id = id;
        this.treatmentWork = treatmentWork;
        this.typeWorkDetail = typeWorkDetail;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public TreatmentWork getTreatmentWork(){
        return treatmentWork;
    }

    public void setTreatmentWork(TreatmentWork treatmentWork){
        this.treatmentWork = treatmentWork;
    }

    public Type getTypeWorkDetail(){
        return typeWorkDetail;
    }

    public void setTypeWorkDetail(Type typeWorkDetail){
        this.typeWorkDetail = typeWorkDetail;
    }
}