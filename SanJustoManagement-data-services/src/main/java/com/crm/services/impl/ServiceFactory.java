package com.crm.services.impl;

import com.crm.data.model.User;
import com.crm.services.SecurityService;
import com.crm.services.TreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

public abstract class ServiceFactory {
    @Autowired
    private ApplicationContext context;

    public abstract SecurityService getSecurityService();

    protected abstract TreatmentService getTreatmentService();

    public TreatmentService getTreatmentService(User user) {
        TreatmentService service = getTreatmentService();
        service.setUser(user);

        return service;
    }
}