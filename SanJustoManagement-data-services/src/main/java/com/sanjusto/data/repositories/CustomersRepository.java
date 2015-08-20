package com.sanjusto.data.repositories;

import org.springframework.data.repository.CrudRepository;

import com.sanjusto.data.model.Customer;

public interface CustomersRepository extends CrudRepository<Customer, Long>{

        /**
         * Search and list Customers only Enabled
         * @return Iterable<Customer>
         */
        Iterable<Customer> findByEnabledIsTrue();
}
