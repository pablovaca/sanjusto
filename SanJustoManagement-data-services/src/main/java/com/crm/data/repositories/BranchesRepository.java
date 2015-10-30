package com.crm.data.repositories;

import com.crm.data.model.Branch;
import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

public interface BranchesRepository extends CrudRepository<Branch, Long> {

    Page<Branch> findByOrganizationAndCustomer(Organization organization, Customer customer, Pageable pageable);

    Page<Branch> findByOrganizationAndCustomerAndEnabledIsTrue(Organization organization, Customer customer, Pageable pageable);

    Page<Branch> findByOrganization(Organization organization, Pageable pageable);

    Page<Branch> findByOrganizationAndEnabledIsTrue(Organization organization, Pageable pageable);

    Branch findByIdAndOrganization(Long id, Organization organization);
}
