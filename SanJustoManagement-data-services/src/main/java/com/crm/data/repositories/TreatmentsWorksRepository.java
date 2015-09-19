package com.crm.data.repositories;

import com.crm.data.model.Treatment;
import com.crm.data.model.TreatmentWork;
import org.springframework.data.repository.CrudRepository;

public interface TreatmentsWorksRepository extends CrudRepository<TreatmentWork, Long>{

    Iterable<TreatmentWork> findByTreatment(Treatment treatment);
}
