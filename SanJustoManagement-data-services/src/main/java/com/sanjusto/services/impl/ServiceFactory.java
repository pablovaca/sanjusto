package com.sanjusto.services.impl;

import com.sanjusto.services.SecurityService;
import com.sanjusto.services.TreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

/**
 * Abstract class that provides a factory for the creation of instances. Created by drobak on 19/11/14.
 */
public abstract class ServiceFactory {
    /** The Spring Application Context */
    @Autowired
    private ApplicationContext context;

    public abstract SecurityService getSecurityService();

    public abstract TreatmentService getTreatmentService();
}
