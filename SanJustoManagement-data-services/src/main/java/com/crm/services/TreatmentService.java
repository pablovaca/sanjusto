package com.crm.services;

import com.crm.data.model.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Date;
import java.util.List;

public interface TreatmentService {

    void setUser(User user);

    User getUser();

    Iterable<Treatment> getAllTreatments() throws Exception;

    Treatment getOneTreatment(Long treatmentId) throws  Exception;

    Treatment saveTreatment(Long treatmentId, Long branchId,boolean coordinated, boolean finished, Long typeId,
                            boolean certificate, String comments, Long userTreatmentId, Date treatmentDate) throws Exception, DataIntegrityViolationException;
}
