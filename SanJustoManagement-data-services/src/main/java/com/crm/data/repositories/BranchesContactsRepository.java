package com.crm.data.repositories;

import com.crm.data.model.Branch;
import com.crm.data.model.BranchContact;
import com.crm.data.model.Organization;
import org.springframework.data.repository.CrudRepository;

public interface BranchesContactsRepository extends CrudRepository<BranchContact, Long>{

    Iterable<BranchContact> findByBranchAndEnabledIsTrue(Branch branch);

    Iterable<BranchContact> findByBranch(Branch branch);
}