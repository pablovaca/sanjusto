package com.sanjusto.services.impl;

import com.sanjusto.data.model.Customer;
import com.sanjusto.data.repositories.CustomersRepository;
import com.sanjusto.services.TreatmentService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

public class TreatmentServiceImpl implements TreatmentService {
    private static final Logger log = LogManager.getLogger(TreatmentServiceImpl.class);

    @Autowired
    private CustomersRepository customerRepository;

    public Iterable<Customer> getAllCustomers() throws Exception {
        Iterable<Customer> result = customerRepository.findAll();
        return result;
    }
}
