package com.crm.services.impl;

import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import com.crm.data.model.Type;
import com.crm.data.repositories.CustomersRepository;
import com.crm.data.repositories.OrganizationsRepository;
import com.crm.data.repositories.TypesRepository;
import com.crm.services.TreatmentService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

public class TreatmentServiceImpl extends BaseServiceImpl implements TreatmentService {
    private static final Logger LOGGER = LogManager.getLogger(TreatmentServiceImpl.class);

    @Autowired
    private CustomersRepository customersRepository;

    @Autowired
    private OrganizationsRepository organizationsRepository;

    @Autowired
    private TypesRepository typesRepository;

    public Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception {
        Iterable<Customer> result;
        if (onlyEnabled) {
            result = customersRepository.findByOrganization(user.getOrganization());
        } else {
            result = customersRepository.findByEnabledIsTrueAndOrganization(user.getOrganization());
        }
        return result;
    }

    public Customer getOneCustomer(Long custId, boolean onlyEnabled) throws Exception {
        Customer customer = customersRepository.findByIdAndOrganization(custId, user.getOrganization());
        if (onlyEnabled && customer != null && customer.getEnabled()) {
            return customer;
        } else if (onlyEnabled) {
            return null;
        } else {
            return customer;
        }
    }

    public Customer saveCustomer(Customer customer) throws Exception {
        return customersRepository.save(customer);
    }

    public void removeCustomer(Customer customer) {
            customersRepository.delete(customer);
    }

    public Organization getOneOrganization(Long orgId, boolean onlyEnabled) throws Exception {
        Organization organization = organizationsRepository.findOne(orgId);
        if (onlyEnabled && organization != null && organization.getEnabled()) {
            return organization;
        } else if (onlyEnabled) {
            return null;
        } else {
            return organization;
        }
    }

    public Type getOneType(Long typeId) throws Exception {
        return typesRepository.findByIdAndOrganizationAndEnabledIsTrue(typeId, user.getOrganization());
    }
}
