package com.sanjusto.services;

import com.sanjusto.data.model.Customer;
import com.sanjusto.data.model.User;

import java.util.List;

public interface TreatmentService {

    void setUser(User user);
    User getUser();
    Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception;
}
