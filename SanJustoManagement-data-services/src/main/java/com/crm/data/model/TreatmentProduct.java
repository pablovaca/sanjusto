package com.crm.data.model;


public class TreatmentProduct extends BaseModel {

    private Long id;
    private Treatment treatment;
    private Product product;
    private Double quantity;

    public TreatmentProduct(){
    }

    public TreatmentProduct(Treatment treatment, Product product, Double quantity){
        this.treatment = treatment;
        this.product = product;
        this.quantity = quantity;
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

    public Product getProduct(){
        return product;
    }

    public void setProduct(Product product){
        this.product = product;
    }

    public Double getQuantity(){
        return quantity;
    }

    public void setQuantity(Double quantity){
        this.quantity = quantity;
    }
}
