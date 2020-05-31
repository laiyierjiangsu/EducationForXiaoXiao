# coding=utf-8
import random
def Generage():
    divisor = random.randint(2,9)
    divisor1 = random.randint(2,9)
    dividend = random.randint(1,9) + divisor*divisor1
    return "{} ÷ {}= ___余___".format(dividend,divisor)
 

def Output2File():
    f = open("divide.txt", mode="w+", encoding="utf-8")
    count = 500
    i =  0
    while i < count:
        i = i + 1
        f.write("{}       {}       {}\n\n".format(Generage(),Generage(),Generage(),Generage()))
        if i % 8 == 0:
            f.write("-----------------------------------------------------------------\n\n")
    f.flush()
    f.close()
Output2File()