use sanjusto;

insert into SJ_CUSTOMERS (CUSTOMER_NAME,ADDRESS,PHONE,EMAIL,START_DATE,ENABLED)
values ('Pablo Vaca','Mza 221 Lote 12 - La Estanzuela 2 - La Calera','1533731837','vacapablo72@gmail.com',current_date(),1);

insert into SJ_USERS (FIRST_NAME,LAST_NAME,EMAIL,USERNAME)
values ('Pablo','Vaca','vacapablo72@gmail.com','pvaca');

commit;