package com.crm.data.repositories;

import com.crm.data.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import com.crm.data.model.Customer;

public interface CustomersRepository extends CrudRepository<Customer, Long>{

        Page<Customer> findByEnabledIsTrueAndOrganization(Organization organization, Pageable pageable);

        Page<Customer> findByOrganization(Organization organization, Pageable pageable);

        Customer findByIdAndOrganization(Long id,Organization organization);
}
