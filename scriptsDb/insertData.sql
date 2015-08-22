use sanjusto;

insert into SJ_CUSTOMERS (CUSTOMER_NAME,ADDRESS,PHONE,EMAIL,START_DATE,ENABLED)
values ('Pablo Vaca','Mza 221 Lote 12 - La Estanzuela 2 - La Calera','1533731837','vacapablo72@gmail.com',current_date(),1);

insert into SJ_USERS (FIRST_NAME,LAST_NAME,EMAIL,USERNAME,PASSWORD)
values ('Pablo','Vaca','vacapablo72@gmail.com','pvaca','1000:4a7a2f5a02edb7b256dd9db4eec7ece1054a3e785d3276fbb4f46b4870837cd964c24a78:53e04ef6893f03a667fd18bc5a9b5fd460b1d4cbe01631e0b8296db12ab68454e48e6a85');

commit;