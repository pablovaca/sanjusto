package com.crm.data.repositories;

import com.crm.data.model.Branch;
import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import com.crm.services.dto.BranchDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BranchesRepository extends CrudRepository<Branch, Long> {

    Page<Branch> findByOrganizationAndCustomer(Organization organization, Customer customer, Pageable pageable);

    Page<Branch> findByOrganizationAndCustomerAndEnabledIsTrue(Organization organization, Customer customer, Pageable pageable);

    Page<Branch> findByOrganization(Organization organization, Pageable pageable);

    Page<Branch> findByOrganizationAndEnabledIsTrue(Organization organization, Pageable pageable);

    Branch findByIdAndOrganization(Long id, Organization organization);

    @Query("select b "
            + "from Branch b "
            + "where b.enabled = 1 "
            + "and (b.organization.id = :orgId or :orgId = -1) "
            + "and b.name like :searchString")
    List<Branch> locateBranches(@Param("orgId") Long orgId, @Param("searchString") String searchString, Pageable pageable);

    @Query("select NEW com.crm.services.dto.BranchDTO(b) "
            + "from Branch b "
            + "where b.enabled = 1 "
            + "and b.customer.id = :customerId "
            + "and b.organization.id = :orgId ")
    List<BranchDTO> findBranchByCustomerEnabled(@Param("orgId") Long orgId, @Param("customerId") Long customerId);
}
