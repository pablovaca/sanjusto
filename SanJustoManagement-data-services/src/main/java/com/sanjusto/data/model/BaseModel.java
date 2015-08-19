package com.sanjusto.data.model;

import com.sanjusto.utils.JSONConverter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public abstract class BaseModel {
    protected static final Logger log = LogManager.getLogger(BaseModel.class);

    @Override
    public String toString(){
        return new JSONConverter().toJSON(this);
    }

    public static BaseModel fromJSON(String value,Class clazz){
        return (BaseModel) new JSONConverter().fromJSON(value,clazz);
    }

}
