import time
import Adafruit_ADS1x15
adc = Adafruit_ADS1x15.ADS1115(address=0x48)
GAIN = 1

print('Reading ADS1x15 values, press Ctrl-C to quit...')
print('| {0:>6} | {1:>6} | {2:>6} | {3:>6} |'.format(*range(4)))
print('-' * 37)
# Main loop.
while True:
    # Read all the ADC channel values in a list.
    values = [0]*4
    for i in range(4):
        values[i] = adc.read_adc(i, gain=GAIN,data_rate=128)
    print('| {0:>6} | {1:>6} | {2:>6} | {3:>6} |'.format(*values))
    # Pause for half a second.
    time.sleep(0.05)