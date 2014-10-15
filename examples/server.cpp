#include <iostream>
#include "monitorAPI/include/server_monitor.hpp"

void send_email(char* message){
    char command[255];
    char emails[] = "joao29a@gmail.com luziasj@hotmail.com";
    snprintf(command, 255, "echo -e '%s' | mail -s 'Aviso de Temperatura' %s", message, emails);
    FILE *fp = popen(command, "r");
    fclose(fp);
}

Data filter(Data d) {
  cout << " Prefix: " <<
    d.nickname << " send a msg " << d.type << endl;
  if (d.definedType.sensor == Type::Temperature) {
    if ((d.nickname == "raspberry" && d.value > 65)
            || (d.nickname == "casa" && d.value > 45)) {
        char message[255];
        snprintf(message, 255, "Temperatura do(a) %s muito alta! %.1f Celsius.\n\n", d.nickname.c_str(), d.value);
        strcat(message, "---------------\nEmail enviado automaticamente pelo sistema.");
        send_email(message);
    }
  }
  return d;
}

int main(int argc, char** argv) {
  ServerMonitor server(&argc, argv);
  server.EnablePersistence("../config/db.conf");
  server.SetFilter(&filter);
  server.Run();
  return 0;
}
