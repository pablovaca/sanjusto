package com.crm.services;

import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import com.crm.data.model.Type;
import com.crm.data.model.User;

public interface TreatmentService {

    void setUser(User user);

    User getUser();

    Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception;

    Customer getOneCustomer(Long custId, boolean onlyEnabled) throws Exception;

    Customer saveCustomer(Customer customer) throws Exception;

    void removeCustomer(Customer customer);

    Organization getOneOrganization(Long orgId, boolean onlyEnabled) throws Exception;

    Type getOneType(Long typeId) throws Exception;
}
