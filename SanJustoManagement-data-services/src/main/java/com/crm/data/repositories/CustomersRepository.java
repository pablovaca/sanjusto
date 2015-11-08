package com.crm.data.repositories;

import com.crm.data.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.crm.data.model.Customer;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomersRepository extends CrudRepository<Customer, Long>{

        Page<Customer> findByEnabledIsTrueAndOrganization(Organization organization, Pageable pageable);

        Page<Customer> findByOrganization(Organization organization, Pageable pageable);

        Customer findByIdAndOrganization(Long id,Organization organization);

        @Query("select c "
                + "from Customer c "
                + "where c.enabled = 1 "
                + "and (c.organization.id = :orgId or :orgId = -1) "
                + "and c.name like :searchString")
        List<Customer> locateCustomers(@Param("orgId") Long orgId, @Param("searchString") String searchString, Pageable pageable);
}
