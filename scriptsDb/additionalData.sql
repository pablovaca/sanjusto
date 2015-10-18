use crm;

SELECT @customer2 := MAX(id) + 1 FROM CUSTOMERS;
SET @customer2 = CASE WHEN @customer2 IS NULL THEN 1 ELSE @customer2 END;
SET @customer3 = @customer2 + 1;
SET @customer4 = @customer3 + 1;

SELECT @branch3 := MAX(id) + 1 FROM BRANCHES;
SET @branch3 = CASE WHEN @branch3 IS NULL THEN 1 ELSE @branch3 END;
SET @branch4 = @branch3 + 1;
SET @branch5 = @branch4 + 1;

SELECT @contact5 := MAX(id) + 1 FROM CONTACTS;
SET @contact5 = CASE WHEN @contact5 IS NULL THEN 1 ELSE @contact5 END;
SET @contact6 = @contact5 + 1;
SET @contact7 = @contact6 + 1;

insert into CUSTOMERS (ID,CUSTOMER_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,EMAIL,START_DATE,CUSTOMER_TYPE,ENABLED,ORG_ID)
values (@customer2,'Supermercado ABC','Calle Pública','Alta Córdoba','CORDOBA','12345678','vacapablo72@gmail.com',current_date(),1,1,1);
insert into CUSTOMERS (ID,CUSTOMER_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,EMAIL,START_DATE,CUSTOMER_TYPE,ENABLED,ORG_ID)
values (@customer3,'Ferreteria ABC','Calle Pública','Alta Córdoba','CORDOBA','12345678','vacapablo72@gmail.com',current_date(),1,1,1);
insert into CUSTOMERS (ID,CUSTOMER_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,EMAIL,START_DATE,CUSTOMER_TYPE,ENABLED,ORG_ID)
values (@customer4,'Estación de Servicios ABC','Calle Pública','Alta Córdoba','CORDOBA','12345678','vacapablo72@gmail.com',current_date(),1,1,1);

insert into BRANCHES (ID,BRANCH_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,CUSTOMER_ID,BRANCH_TYPE,ORG_ID, START_DATE)
values (@branch3,'Sucursal A','Calle Pública','Alta Córdoba','CORDOBA','123456',@customer2,1,1,current_date());
insert into BRANCHES (ID,BRANCH_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,CUSTOMER_ID,BRANCH_TYPE,ORG_ID, START_DATE)
values (@branch4,'Sucursal Principal','Calle Pública','Alta Córdoba','CORDOBA','123456',@customer3,1,1,current_date());
insert into BRANCHES (ID,BRANCH_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,CUSTOMER_ID,BRANCH_TYPE,ORG_ID, START_DATE)
values (@branch5,'Estación A','Calle Pública','Alta Córdoba','CORDOBA','123456',@customer4,1,1,current_date());

insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID,CUSTOMER_ID)
values (@contact5,'Contacto','Cinco','contacto5@email.com','12345678',1,@customer2);
insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID,CUSTOMER_ID)
values (@contact6,'Contacto','Seis','contacto6@email.com','12345678',1,@customer3);
insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID,CUSTOMER_ID)
values (@contact7,'Contacto','Siete','contacto7@email.com','12345678',1,@customer4);

insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (@contact5,@branch3);
insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (@contact6,@branch4);
insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (@contact7,@branch5);

SELECT @treatment2 := MAX(id) + 1 FROM TREATMENTS;
SET @treatment2 = CASE WHEN @treatment2 IS NULL THEN 1 ELSE @treatment2 END;
SET @treatment3 = @treatment2 + 1;
SET @treatment4 = @treatment3 + 1;
SET @treatment5 = @treatment4 + 1;
SET @treatment6 = @treatment5 + 1;
SET @treatment7 = @treatment6 + 1;
SET @treatment8 = @treatment7 + 1;
SET @treatment9 = @treatment8 + 1;
SET @treatment10 = @treatment9 + 1;
SET @treatment11 = @treatment10 + 1;
SET @treatment12 = @treatment11 + 1;
SET @treatment13 = @treatment12 + 1;
SET @treatment14 = @treatment13 + 1;
SET @treatment15 = @treatment14 + 1;
SET @treatment16 = @treatment15 + 1;
SET @treatment17 = @treatment16 + 1;
SET @treatment18 = @treatment17 + 1;
SET @treatment19 = @treatment18 + 1;
SET @treatment20 = @treatment19 + 1;
SET @treatment21 = @treatment20 + 1;
SET @treatment22 = @treatment21 + 1;

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment2,current_date(),2,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment2,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment2,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment3,current_date(),1,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment3,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment3,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment4,current_date(),2,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment4,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment4,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment5,current_date(),1,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment5,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment5,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment6,current_date(),@branch3,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment6,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment6,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment7,current_date(),@branch3,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment7,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment7,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment8,current_date(),@branch4,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment8,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment8,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment9,current_date(),@branch4,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment9,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment9,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment10,current_date(),@branch5,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment10,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment10,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment11,current_date(),@branch5,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment11,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment11,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment12,current_date(),@branch3,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment12,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment12,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment13,current_date(),@branch3,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment13,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment13,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment14,current_date(),@branch4,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment14,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment14,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment15,current_date(),@branch4,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment15,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment15,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment16,current_date(),@branch5,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment16,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment16,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment17,current_date(),@branch5,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment17,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment17,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment18,current_date(),1,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment18,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment18,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment19,current_date(),1,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment19,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment19,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment20,current_date(),@branch3,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment20,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment20,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment21,current_date(),@branch3,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment21,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment21,8);

insert into TREATMENTS (ID,TREATMENT_DATE,BRANCH_ID,USER_ID,ORG_ID) values (@treatment22,current_date(),@branch4,1,1);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment22,4);
insert into TREATMENTS_WORKS (TREATMENT_ID,TYPE_WORK) values (@treatment22,8);

commit;