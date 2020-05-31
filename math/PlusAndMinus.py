import random


def GetVariable( ):
    range = random.randint(0,1)
    if range == 0:
        return random.randint(100,1000)
    else:
        return random.randint(50,100)

 

def Generage():
    a = GetVariable()
    b = GetVariable()
    if a > b:
        return "{} - {} = _____".format(a, b)
    else:
        return "{} + {} = _____".format(a, b)


   

def Output2File_Two():
    f = open("minus.txt", mode="w+", encoding="utf-8")
    count = 210
    i =  0
    while i < count:
        i = i + 1
        f.write("{}    {}    {}   {}\n\n".format(Generage(),Generage(),Generage(),Generage()))
        if i % 15 == 0:
            f.write("--------------------------------------------------------------------------------------------\n")
    f.flush()
    f.close()

def Output2File_Three():
    f = open("minus.txt", mode="w+", encoding="utf-8")
    count = 180
    i =  0
    while i < count:
        i = i + 1
        f.write("{}            {}         {}\n\n".format(Generage(),Generage(),Generage()))
        if i % 10 == 0:
            f.write("--------------------------------------------------------------------------------------------\n")
    f.flush()
    f.close()
    f.close()

Output2File_Three()