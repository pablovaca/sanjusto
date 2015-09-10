package com.crm.services;

import com.crm.data.model.*;
import com.crm.services.impl.ServiceFactory;
import com.crm.utils.DateUtils;
import com.crm.utils.TransactionalSupportTest;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.Assert.*;

/**
 * Created by pvaca on 8/17/15.
 */
public class TreatmentServiceTest extends TransactionalSupportTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(TreatmentServiceTest.class);

    @Test
    public void testGetAllTreatments() throws Exception {
        LOGGER.info("testGetAllTreatments");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<Treatment> result = treatmentService.getAllTreatments();
        assertNotNull("Result should not be null",result);
        int counter = 0;
        for (Treatment treatment:result) {
            assertNotNull("Customer should not be null",treatment);
            LOGGER.info(treatment.getId() + "-" + treatment.getBranch().getName() + "-" + treatment.getBranch().getCustomer().getName());
            counter++;
        }
        LOGGER.info("counter " + counter);
        assertEquals("Should be equals to 1",1,counter);
        LOGGER.info("testGetAllTreatments");
    }

    @Test
    public void testGetOneTreatment() throws Exception {
        LOGGER.info("testGetOneTreatment");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Treatment treatment = treatmentService.getOneTreatment(1L);
        assertNotNull("Treatment should not be null", treatment);
        assertEquals("Branch Name should be Branch 1","Branch 1",treatment.getBranch().getName());
        LOGGER.info("testGetOneTreatment");
    }

    @Test
    public void testSaveTreatment() throws Exception {
        LOGGER.info("testInsertTreatment");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long branchId = 2L;
        boolean coordinated = true;
        boolean finished = false;
        boolean certificate = true;
        String comments = "Treatment comments";
        Treatment treatment = treatmentService.saveTreatment(null,branchId, coordinated, finished, null, certificate, comments, 1L, DateUtils.getCurrentDate());
        assertNotNull("Treatment id should not be null", treatment.getId());
        assertFalse("Finished should be false", treatment.getFinished());
        LOGGER.info("Treatment id " + treatment.getId());
        assertEquals("Treatment id should be 2", 2L, treatment.getId().longValue());
        finished = true;
        treatment = treatmentService.saveTreatment(treatment.getId(),branchId, coordinated, finished, null, certificate, comments, 1L, null);
        assertNotNull("Treatment should not be null", treatment);
        assertEquals("Treatment id should be 2", 2L, treatment.getId().longValue());
        assertTrue("Finished should be true", treatment.getFinished());
        LOGGER.info("testInsertTreatment");
        try {
            treatment = treatmentService.saveTreatment(null, branchId, coordinated, finished, null, certificate, comments, 1L, null);
        } catch (DataIntegrityViolationException die) {
            LOGGER.info(die.getMessage());
            assertTrue("Should be true", die.getMessage().contains("not-null property references a null"));
            LOGGER.info(die.getClass().getName());
            assertEquals("Should be equals","org.springframework.dao.DataIntegrityViolationException",die.getClass().getName());
        }
    }
}