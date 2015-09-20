package com.crm.data.repositories;

import com.crm.data.model.TreatmentWork;
import com.crm.data.model.TreatmentWorkDetail;
import org.springframework.data.repository.CrudRepository;

public interface TreatmentsWorksDetailsRepository extends CrudRepository<TreatmentWorkDetail, Long>{

    Iterable<TreatmentWorkDetail> findByTreatmentWork(TreatmentWork work);

    TreatmentWorkDetail findById(Long id);
}