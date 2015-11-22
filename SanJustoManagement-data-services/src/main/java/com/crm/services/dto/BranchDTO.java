package com.crm.services.dto;

import com.crm.data.model.Branch;

/**
 * Created by pvaca on 11/22/15.
 */
public class BranchDTO {

    private Long id;
    private String name;

    public BranchDTO(Long id, String name){
        this.id = id;
        this.name = name;
    }

    public BranchDTO(Branch branch) {
        this.id = branch.getId();
        this.name = branch.getName();
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
}
