use crm;

insert into ORGANIZATIONS (ID,NAME)
values (1,'SAN JUSTO');

insert into TYPES (ID,TYPE,SHORT_NAME,DESCRIPTION,ORG_ID)
values (1,'CUSTOMER_TYPE','NORMAL','Cliente normal',1);
insert into TYPES (ID,TYPE,SHORT_NAME,DESCRIPTION,ORG_ID)
values (2,'CUSTOMER_TYPE','REGULAR','Cliente regular',1);
insert into TYPES (ID,TYPE,SHORT_NAME,DESCRIPTION,ORG_ID)
values (3,'CUSTOMER_TYPE','CRITICO','Cliente critico',1);

insert into CUSTOMERS (ID,CUSTOMER_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,EMAIL,START_DATE,CUSTOMER_TYPE,ENABLED,ORG_ID)
values (1,'Pablo Vaca','Mza 221 Lote 12','La Estanzuela 2','LA CALERA','1533731837','vacapablo72@gmail.com',current_date(),1,1,1);

insert into BRANCHES (ID,BRANCH_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,CUSTOMER_ID,BRANCH_TYPE,ORG_ID)
values (1,'Branch 1','Mza 221 lote 12','La Estanzuela 2','La Calera','402775',1,1,1);
insert into BRANCHES (ID,BRANCH_NAME,ADDRESS,NEIGHBORHOOD,CITY,PHONE,CUSTOMER_ID,BRANCH_TYPE,ORG_ID)
values (2,'Branch 2','Mza 224 lote 121','La Estanzuela','La Calera','402779',1,1,1);

insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID)
values (1,'Contacto','Uno','contacto1@email.com','12345678',1);
insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID)
values (2,'Contacto','dos','contacto2@email.com','12345678',1);
insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID)
values (3,'Contacto','tres','contacto3@email.com','12345678',1);
insert into CONTACTS (ID,FIRST_NAME,LAST_NAME,EMAIL,PHONE,ORG_ID)
values (4,'Contacto','cuatro','contacto4@email.com','12345678',1);

insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (1,1);
insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (3,1);
insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (2,1);
insert into BRANCHES_CONTACTS (CONTACT_ID,BRANCH_ID)
values (4,1);

insert into USERS (FIRST_NAME,LAST_NAME,EMAIL,ORG_ID,USERNAME,PASSWORD)
values ('Pablo','Vaca','vacapablo72@gmail.com',1,'pvaca','1000:4a7a2f5a02edb7b256dd9db4eec7ece1054a3e785d3276fbb4f46b4870837cd964c24a78:53e04ef6893f03a667fd18bc5a9b5fd460b1d4cbe01631e0b8296db12ab68454e48e6a85');

commit;