package com.crm.services.impl;

import com.crm.data.model.User;
import com.crm.data.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class BaseServiceImpl {
    @Autowired
    protected ServiceFactory serviceFactory;

    @Autowired
    protected CustomersRepository customersRepository;

    @Autowired
    protected OrganizationsRepository organizationsRepository;

    @Autowired
    protected TreatmentsRepository treatmentsRepository;

    @Autowired
    protected TypesRepository typesRepository;

    @Autowired
    protected BranchesRepository branchesRepository;

    @Autowired
    protected UsersRepository usersRepository;

    protected User user;

    public void setUser(User user) {
        if (this.user != null)
            throw new IllegalStateException("Cannot change user");
        this.user = user;
    }

    public User getUser() {
        return this.user;
    }
}
