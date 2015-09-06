package com.crm.data.model;


import java.util.Date;

public class Treatment extends BaseModel {

    private Long id;
    private Date treatmentDate;
    private boolean coordinated;
    private boolean finished;
    private boolean certified;
    private String comments;
    private Branch branch;
    private User user;
    private Type motive;


    public Treatment(){
    }

    public Treatment(Long id, Date treatmentDate, boolean coordinated, boolean finished,
                     boolean certified, String comments, Branch branch, User user, Type motive){
        this.id = id;
        this.treatmentDate = treatmentDate;
        this.coordinated = coordinated;
        this.finished = finished;
        this.certified = certified;
        this.comments = comments;
        this.branch = branch;
        this.user = user;
        this.motive = motive;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public Date getTreatmentDate(){
        return treatmentDate;
    }

    public void setTreatmentDate(Date treatmentDate){
        this.treatmentDate = treatmentDate;
    }

    public boolean getCoordinated(){
        return coordinated;
    }

    public void setCoordinated(boolean coordinated){
        this.coordinated = coordinated;
    }

    public boolean getFinished(){
        return finished;
    }

    public void setFinished(boolean finished){
        this.finished = finished;
    }

    public boolean getCertified(){
        return certified;
    }

    public void setCertified(boolean certified){
        this.certified = certified;
    }

    public String getComments(){
        return comments;
    }

    public void setComments(String comments){
        this.comments = comments;
    }

    public Branch getBranch(){
        return branch;
    }

    public void setBranch(Branch branch){
        this.branch = branch;
    }

    public User getUser(){
        return user;
    }

    public void setUser(User user){
        this.user = user;
    }

    public Type getMotive(){
        return motive;
    }

    public void setMotive(Type motive){
        this.motive = motive;
    }
}
