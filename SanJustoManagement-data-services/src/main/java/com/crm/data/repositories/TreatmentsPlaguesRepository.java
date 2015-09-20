package com.crm.data.repositories;

import com.crm.data.model.Treatment;
import com.crm.data.model.TreatmentPlague;
import org.springframework.data.repository.CrudRepository;

public interface TreatmentsPlaguesRepository extends CrudRepository<TreatmentPlague, Long>{

    Iterable<TreatmentPlague> findByTreatment(Treatment treatment);

    TreatmentPlague findById(Long id);
}
