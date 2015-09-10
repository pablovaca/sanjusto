package com.crm.services.impl;

import com.crm.data.model.Branch;
import com.crm.data.model.Treatment;
import com.crm.data.model.Type;
import com.crm.data.model.User;
import com.crm.services.TreatmentService;
import com.crm.utils.DateUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Date;
import java.util.List;

public class TreatmentServiceImpl extends BaseServiceImpl implements TreatmentService {
    private static final Logger LOGGER = LogManager.getLogger(TreatmentServiceImpl.class);

    public Iterable<Treatment> getAllTreatments() throws Exception {
        return treatmentsRepository.findByOrganization(user.getOrganization());
    }

    public Treatment getOneTreatment(Long treatmentId) throws  Exception {
        return treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
    }

    public Treatment saveTreatment(Long treatmentId, Long branchId,boolean coordinated, boolean finished, Long typeId,
                                   boolean certificate, String comments, Long userTreatmentId, Date treatmentDate) throws  Exception, DataIntegrityViolationException{
        Treatment treatment = new Treatment();
        if (treatmentId!=null) {
            treatment = treatmentsRepository.findOne(treatmentId);
        }
        Branch branch = branchesRepository.findOne(branchId);
        User userTreatment = usersRepository.findOne(userTreatmentId);
        Type type = null;
        if (typeId != null) {
            type = typesRepository.findOne(typeId);
        }
        treatment.setBranch(branch);
        treatment.setCertificate(certificate);
        treatment.setCoordinated(coordinated);
        treatment.setFinished(finished);
        treatment.setComments(comments);
        treatment.setMotive(type);
        treatment.setUser(userTreatment);
        treatment.setOrganization(user.getOrganization());
        if (treatmentDate!=null) {
            treatment.setTreatmentDate(treatmentDate);
        }
        treatmentsRepository.save(treatment);
        return treatment;
    }
}
