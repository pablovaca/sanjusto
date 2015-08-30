package com.crm.services;

import com.crm.data.model.Customer;
import com.crm.data.model.User;

public interface TreatmentService {

    void setUser(User user);
    User getUser();
    Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception;
}
