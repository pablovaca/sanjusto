package com.sanjusto.data.repositories;

import org.springframework.data.repository.CrudRepository;

import com.sanjusto.data.model.Customer;

public interface CustomersRepository extends CrudRepository<Customer, Long>{

        Iterable<Customer> findByEnabledIsTrue();
}
