package com.crm.data.repositories;

import com.crm.data.model.Organization;
import org.springframework.data.repository.CrudRepository;

import com.crm.data.model.Customer;

public interface CustomersRepository extends CrudRepository<Customer, Long>{

        Iterable<Customer> findByEnabledIsTrueAndOrganization(Organization organization);

        Iterable<Customer> findByOrganization(Organization organization);

        Customer findByIdAndOrganization(Long id,Organization organization);
}
