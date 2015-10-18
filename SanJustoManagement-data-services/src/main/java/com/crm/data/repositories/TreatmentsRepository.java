package com.crm.data.repositories;

import com.crm.data.model.Organization;
import com.crm.data.model.Treatment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface TreatmentsRepository extends CrudRepository<Treatment, Long>{

    Page<Treatment> findByOrganization(Organization organization, Pageable pageable);

    Treatment findByIdAndOrganization(Long id, Organization organization);

    @Query("select count(1) from Treatment where organization = :organization")
    long qtyTreatments(@Param("organization") Organization organization);
}