# coding=utf-8
import random
def fun_01(f):
    money = random.randint(10,100)
    f.write("{} 角 = _______元_______角 \n".format(money))

def fun_02(f):
    money = random.randint(10,1000)
    f.write("{} 分 = _______元_______角_______分 \n".format(money))

def fun_03(f):
    a_yun = random.randint(1,100)
    a_jiao = random.randint(1,10)
    a_fen = random.randint(1,10)
    b_yun = random.randint(1,100)
    b_jiao = random.randint(1,10)
    b_fen = random.randint(1,10)
    a = a_yun*100 + a_jiao*10 + a_fen
    b = b_yun*100 + b_jiao*10 + b_fen
    if a > b:
        f.write("{} 元 {} 角 {} 分  - {} 元 {} 角 {} 分 = _______元_______角_______分 \n".format(a_yun,a_fen,a_jiao,b_yun,b_jiao,b_fen))
    else:
        f.write("{} 元 {} 角 {} 分  + {} 元 {} 角 {} 分 = _______元_______角_______分 \n".format(a_yun,a_fen,a_jiao,b_yun,b_jiao,b_fen))
    
def fun_04(f):
    a_yun = random.randint(1,100)
    a_jiao = random.randint(1,10)
    a_fen = random.randint(1,10)
    f.write("{} 元 {} 角 {} 分  = ________ 分 \n".format(a_yun,a_jiao,a_fen))

def fun_05(f):
    a_yun = random.randint(1,100)
    a_jiao = random.randint(1,10)
    f.write("{} 元 {} 角  = ________ 角 \n".format(a_yun,a_jiao))


def Output2File():
    f = open("money.txt", mode="w+", encoding="utf-8")
    count = 100
    i =  0
    while i < count:
        r = random.randint(1,5)
        i = i + 1
        if r == 1:
            fun_01(f)
        if r == 2:
            fun_02(f)
        if r == 3:
            fun_03(f)
        if r == 4:
            fun_04(f)
        if r == 5:
            fun_05(f) 
        if i % 20 == 0:
            f.write("\n--------------------------------------------------------------------------------------------\n")
    f.flush()
    f.close()

Output2File()