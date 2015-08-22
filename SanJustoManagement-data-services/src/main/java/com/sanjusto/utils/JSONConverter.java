package com.sanjusto.utils;

import com.sanjusto.data.model.ExcludeFieldFromJSON;
import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;
import com.google.gson.GsonBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.lang.annotation.Annotation;

public class JSONConverter {
    protected static final Logger log = LogManager.getLogger(JSONConverter.class);

    static private GsonBuilder b=null;
    public JSONConverter() {
        if (b==null) {
            b = new GsonBuilder();
            b.setExclusionStrategies(new AnnotationExclusionStrategy());
            b.registerTypeAdapterFactory(HibernateProxyTypeAdapter.FACTORY);
        }
    }

    public String toJSON(Object obj)
    {
        return b.create().toJson(obj);
    }

    public Object fromJSON(String value,Class clazz)
    {
        return  b.create().fromJson(value, clazz);
    }

    private static class AnnotationExclusionStrategy implements ExclusionStrategy {
        public boolean shouldSkipClass(Class<?> clazz) {
            Annotation a=clazz.getAnnotation(ExcludeFieldFromJSON.class);
            if (a!=null) {
                return true;
            }
            return  false;
        }

        public boolean shouldSkipField(FieldAttributes f) {
            Annotation a=f.getAnnotation( ExcludeFieldFromJSON.class);
            if (a!=null) {
                //LOGGER.debug("excluding field:"+f.getName());
                return true;
            }
            return  false;
        }
    }

}
