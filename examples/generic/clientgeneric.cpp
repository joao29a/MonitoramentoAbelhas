#include "monitorAPI/client_monitor.hpp"
#include "generic.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <vector>
#include <string>
#include <time.h>
#include <bcm2835.h>

#define TYPE Generic

uint16_t port = 18;
time_t bf_time = 0;

TYPE GetGenericData() {
  while (true) {
    sleep(1);
    time_t diff = time(NULL) - bf_time;
    if (bcm2835_gpio_lev(port) && diff > 30) {
      time(&bf_time);
      Generic data("Movement detected!", 1);
      return data;
    }
  }
}

int main(int argc, char **argv) {
  bcm2835_init();

  bcm2835_gpio_fsel(port, BCM2835_GPIO_FSEL_INPT);

  ClientMonitor<TYPE> monitor(&argc, argv);

  monitor.AddDataGenerator("generic data", &GetGenericData);

  monitor.Run();

  return 0;
}
