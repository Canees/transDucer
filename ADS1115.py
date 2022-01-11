import time
import math
# pip3 install Adafruit_ADS1x15
import Adafruit_ADS1x15
# 硬件地址 模块LADDR端接地
ADDR = 0x48
# 初始化ADS1115模块
ADC = Adafruit_ADS1x15.ADS1115(address=ADDR)
# 摇杆数据入口对应模块in0,in1
P0 = 0
P1 = 1
# 最终方向
content = 'Center'

# 获取摇杆值
def GetValue():
    while True:
        # 转换后的值
        value0 = ADC.read_adc(P0, gain=1,data_rate=128)
        value1 = ADC.read_adc(P1, gain=1,data_rate=128)
        # print('初始值',value0,value1)
        # 电压转换方向
        Orientation(value0,value1)
        time.sleep(0.05)


# 区分方向
def Orientation(value0,value1):
    global content
    # /1000得到电压值方便比较,实际电压值得/10000.
    v0 = int(value0 / 1000)
    v1 = int(value1 / 1000)
    if Residual(v0) > 20 and Residual(v1) == 20:
        content = 'Top'
    elif Residual(v0) < 20 and Residual(v1) == 20:
        content = 'Dwon'
    elif Residual(v0) == 20 and Residual(v1) > 20:
        content = 'Right'
    elif Residual(v0) == 20 and Residual(v1) < 20:
        content = 'Left'
    else:
        content = 'Center'
    print('实际电压值',v0,v1,content)

# 电压值误差根据实际情况调整
def Residual(v):
    # 中间值
    vs = 20
    # 误差值
    vd = 3
    if math.fabs(v - vs) > vd:
        return v
    elif math.fabs(v - vs) < vd:
        return vs
    else:
        return vs

if __name__ == '__main__':
    GetValue()