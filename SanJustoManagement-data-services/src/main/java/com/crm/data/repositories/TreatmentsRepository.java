package com.crm.data.repositories;

import com.crm.data.model.Organization;
import com.crm.data.model.Treatment;
import org.springframework.data.repository.CrudRepository;

public interface TreatmentsRepository extends CrudRepository<Treatment, Long>{

    Iterable<Treatment> findByOrganization(Organization organization);

    Treatment findByIdAndOrganization(Long id, Organization organization);
}
