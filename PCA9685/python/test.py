# pip install adafruit-pca9685
import Adafruit_PCA9685

# 这里只给函数不讲原理了，大部分人只是用不用懂。要了解原理，就要涉及电信号的时差和角度精度等知识。
# 想了解的可以看板卡的原理说明书。


def set_servo_angle(channel, angle):
    date = int(4096*((angle*11)+500)/(20000)+0.5)
    pwm.set_pwm(channel, 0, date)


if __name__ == '__main__':
    pwm = Adafruit_PCA9685.PCA9685()
    channel = 1  # 通道
    angle = 90  # 角度
    pwm.set_pwm_freq(50)  # 频率
    set_servo_angle(channel, angle)
