package com.crm.services.impl;

import com.crm.data.model.TreatmentProduct;
import com.crm.data.model.TreatmentWorkDetail;
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
    protected ContactsRepository contactsRepository;

    @Autowired
    protected  BranchesContactsRepository branchesContactsRepository;

    @Autowired
    protected UsersRepository usersRepository;

    @Autowired
    protected ProductsRepository productsRepository;

    @Autowired
    protected TreatmentsWorksRepository treatmentsWorksRepository;

    @Autowired
    protected TreatmentsWorksDetailsRepository treatmentsWorksDetailsRepository;

    @Autowired
    protected TreatmentsProductsRepository treatmentsProductsRepository;

    @Autowired
    protected TreatmentsPlaguesRepository treatmentsPlaguesRepository;

    @Autowired
    protected TreatmentsSurveysRepository treatmentsSurveysRepository;

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
