#include "monitorAPI/include/client_monitor.hpp"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <vector>
#include <string>

double GetTemperature(){
    FILE* fp = popen("vcgencmd measure_temp", "r");
    char value[50];
    fgets(value, 50, fp);
    float temp;
    sscanf(value,"temp=%f'C\n", &temp);
    fclose(fp);
    return (double) temp;
}

int main(int argc, char **argv) {
  ClientMonitor monitor(&argc, argv);

  monitor.AddDataGenerator("temperature", Type::Temperature, &GetTemperature);
  
  monitor.Run();

  return 0;
}
