package com.crm.data.repositories;

import com.crm.data.model.Branch;
import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import org.springframework.data.repository.CrudRepository;

public interface BranchesRepository extends CrudRepository<Branch, Long> {

    Iterable<Branch> findByOrganizationAndCustomer(Organization organization, Customer customer);

    Iterable<Branch> findByOrganizationAndCustomerAndEnabledIsTrue(Organization organization, Customer customer);

    Branch findByIdAndOrganization(Long id, Organization organization);
}
