package com.crm.data.repositories;

import com.crm.data.model.Treatment;
import com.crm.data.model.TreatmentSurvey;
import org.springframework.data.repository.CrudRepository;

public interface TreatmentsSurveysRepository extends CrudRepository<TreatmentSurvey, Long>{

    Iterable<TreatmentSurvey> findByTreatment(Treatment treatment);

    TreatmentSurvey findById(Long id);
}
