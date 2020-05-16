# coding=utf-8
import random
def Generage():
    sign = random.randint(1,9)
    sign1 = random.randint(1,9)
    return "{}  X  {} = ______".format(sign,sign1)
 

def Output2File():
    f = open("MUTIPLE.txt", mode="w+", encoding="utf-8")
    count = 500
    i =  0
    while i < count:
        i = i + 1
        f.write("{}       {}      {}      {}\n\n".format(Generage(),Generage(),Generage(),Generage()))
        if i % 8 == 0:
            f.write("--------------------------------------------------------------------------------------------\n\n")
    f.flush()
    f.close()
Output2File()