package com.sanjusto.services.impl;

import com.sanjusto.data.model.User;
import com.sanjusto.services.SecurityService;
import com.sanjusto.services.TreatmentService;
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