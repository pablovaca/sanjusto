package com.crm.controllers.commons;

import com.crm.utils.JSONConverter;
import org.json.JSONException;

import java.util.Map;

class ControllerResponse {
    private String status;
    private String message="";
    private Object result="";
    private String token="";
    private Map additionalInfo=null;



    ControllerResponse(String status) {
        checkStatus(status);
        this.status = status;
    }

    ControllerResponse(String status, String message) {
        checkStatus(status);
        this.status = status;
        this.message = message;
    }

    public ControllerResponse(String status, String message, Object result) {
        checkStatus(status);
        this.status = status;
        this.message = message;
        this.result = result;
    }

    String getStatus() {
        return status;
    }
    String getMessage() {
        return message;
    }
    Object getResult() {
        return result;
    }

    void setMessage(String message) {
        this.message = message;
    }

    void setResult(String result) {
        this.result = result;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setAdditionalInfo(Map additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    String toJSONString() throws JSONException {
        return new JSONConverter().toJSON(this);
    }

    private void checkStatus(String status)
    {
        if (status==null)
            throw new NullPointerException("status cannot be null");
    }

}
