ARCH=$(shell uname -m)
CC=gcc
CCPP=g++
SRC= ./src
CFLAGS= -O0 -g -Wall -Wextra  -Werror
SHAREDOBJ= repa.so
LDrepa= -pthread -lpthread $(SHAREDOBJ) -lpython2.7
LDmysql=  -lmysqlclient
HEADERS= -I$(SRC)/include/ -I/usr/include/mysql/ -I./repd/

all: repa server client clear.o

dataDAO.o:
	$(CCPP) -c $(SRC)/database/dataDAO.c -o dataDAO.o $(CFLAGS) $(HEADERS) -fpermissive

server.o:
	$(CCPP) -c $(SRC)/server.c -o server.o $(CFLAGS) $(HEADERS)

server: dataDAO.o server.o machineLearning.o repa
	$(CCPP) server.o dataDAO.o $(SRC)/machineLearning/*.o $(LDrepa) $(LDmysql) $(HEADERS) -o server

client: repa
	$(CC) $(SRC)/client.c -o client $(CFLAGS) $(LDrepa) $(HEADERS) -lm

init:
	@echo "Iniciando repd..."
	@sudo ./repd/repad_$(ARCH);\
	if [ $$? -eq 0 ]; then\
		echo "Sucesso.";\
		else echo "Falha.";\
		fi;

kill:
	@echo "Fechando programa..."
	@ps -e | grep repad_$(ARCH) | sudo -s kill $$(awk '{print $$1}');\
	if [ $$? -eq 0 ]; then\
		echo "Programa fechado.";\
		else echo "Programa inexistente";\
		fi;

machineLearning.o:
	cd ./$(SRC)/machineLearning;\
	make;\
	cd -;

repa:
	cd ./src/repa/ &&\
	python setup.py build &&\
	sudo python setup.py install &&\
	cd ./build/ &&\
	cd $$(ls | egrep '^lib') &&\
	cp repa.so ../../../../ &&\
	sudo cp repa.so /usr/lib/ &&\
	sudo ldconfig

clear.o:
	rm -f *.o
	rm -f *.so

clear: clear.o
	rm -f client;\
	rm -f server;\
	rm -f $(SRC)/web-UI/getDados;
	cd ./$(SRC)/machineLearning;\
	make clear;\
	cd -;
