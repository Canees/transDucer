import smbus
import time
# 初始化smbus  1表示scl.1  0表示scl.0
BUS = smbus.SMBus(1)
# 寄存器地址
ADDR = 0x48
# 电位器地址
Pmeter1 = 0x42
Pmeter2 = 0x43
# 方向值
LEFTORRIGHT = 0
UPORDOWN = 0
# 中位归零
MESOL = 0
MESOR = 0
# 最终方向值
POSTION = '中位'


# 左+右
def TLEFTRIGHT():
    global LEFTORRIGHT,MESOL,UPORDOWN
    BUS.write_byte(ADDR,Pmeter1)
    value =  BUS.read_byte(ADDR)
    # nowData = int(MESOL - value)
    LEFTORRIGHT = value
    # if nowData > 10:
    #     a+=1
    #     print('左',UPORDOWN)
    # elif nowData < -10:
    #     a-=1
    #     print('右',UPORDOWN)
    # else:
    #     a =0
    #     print('中',UPORDOWN)



    # if value > MESOL:
    #     LEFTORRIGHT += 1
    #     if LEFTORRIGHT > 100:
    #         LEFTORRIGHT = 100
    # elif value < MESOL:
    #     LEFTORRIGHT -= 1
    #     if LEFTORRIGHT < -100:
    #         LEFTORRIGHT = -100
    # else:
    #     LEFTORRIGHT = 0
    #     MESOL = value
    

# 上+下
def TUPDOWN():
    global UPORDOWN,MESOR
    BUS.write_byte(ADDR,Pmeter2)
    value =  BUS.read_byte(ADDR)
    UPORDOWN = value
    # if  value > MESOR:
    #     UPORDOWN += 1
    #     if UPORDOWN > 100:
    #         UPORDOWN = 100
    # elif value < MESOR:
    #     UPORDOWN -= 1 
    #     if UPORDOWN < -100:
    #         UPORDOWN = -100
    # else:
    #     UPORDOWN = 0
    #     MESOR = value


def Direction():
    global LEFTORRIGHT,UPORDOWN,POSTION
    if LEFTORRIGHT > 0 :
        POSTION = '右'
    elif LEFTORRIGHT < 0:
        POSTION = '左'
    else:
        POSTION = '中'

    

def INIt():
    # 初始化中位值
    global MESOL,MESOR
    BUS.write_byte(ADDR,Pmeter1)
    MESOL = BUS.read_byte(ADDR)
    BUS.write_byte(ADDR,Pmeter2)
    MESOR = BUS.read_byte(ADDR)  


if __name__ == "__main__":
    # 初始化
    # INIt()
    # time.sleep(3)
    print('开始查询数据')
    # loop
    while True:
        TLEFTRIGHT()
        TUPDOWN()
        print(LEFTORRIGHT,UPORDOWN)
        time.sleep(0.01)
        pass
