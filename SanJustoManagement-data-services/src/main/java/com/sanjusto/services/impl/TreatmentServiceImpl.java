package com.sanjusto.services.impl;

import com.sanjusto.data.model.Customer;
import com.sanjusto.data.repositories.CustomersRepository;
import com.sanjusto.services.TreatmentService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

public class TreatmentServiceImpl extends BaseServiceImpl implements TreatmentService {
    private static final Logger LOGGER = LogManager.getLogger(TreatmentServiceImpl.class);

    @Autowired
    private CustomersRepository customersRepository;

    public Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception {
        Iterable<Customer> result;
        if (onlyEnabled) {
            result = customersRepository.findAll();
        } else {
            result = customersRepository.findByEnabledIsTrue();
        }
        return result;
    }
}
