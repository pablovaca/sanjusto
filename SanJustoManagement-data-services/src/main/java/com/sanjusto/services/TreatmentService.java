package com.sanjusto.services;

import com.sanjusto.data.model.Customer;

import java.util.List;

public interface TreatmentService {

    public Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception;
}
