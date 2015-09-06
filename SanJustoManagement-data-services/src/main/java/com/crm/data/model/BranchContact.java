package com.crm.data.model;


public class BranchContact extends BaseModel {

    private Long id;
    private Integer priority;
    private boolean enabled;
    private Contact contact;
    private Branch branch;

    public BranchContact(){
    }

    public BranchContact(Integer priority, boolean enabled, Contact contact, Branch branch){
        this.priority = priority;
        this.enabled = enabled;
        this.contact = contact;
        this.branch = branch;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public Integer getPriority(){
        return priority;
    }

    public void setPriority(Integer priority){
        this.priority = priority;
    }

    public boolean isEnabled(){
        return enabled;
    }

    public void setEnabled(boolean enabled){
        this.enabled = enabled;
    }

    public Contact getContact(){
        return contact;
    }

    public void setContact(Contact contact){
        this.contact = contact;
    }

    public Branch getBranch(){
        return branch;
    }

    public void setBranch(Branch branch){
        this.branch = branch;
    }
}
