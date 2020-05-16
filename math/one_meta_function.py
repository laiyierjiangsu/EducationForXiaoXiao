import random


def GetVariable( ):
    text = "abcd"
    pos = random.randint(0,3)
    return text[pos: pos+1]
 
def GetFactor():
    return random.randint(1,10)

def GetNum():
    return random.randint(0 ,20)

def GetVariableValue():
    return random.randint(1,10)

def Generage():
    factor = GetFactor()
    sign = random.randint(0,1)
    result = 0
    num = 0
    strsign = ""
    value = GetVariableValue()
    variable = GetVariable()
    if sign == 0:
        num = GetNum()
        result = factor* value + num
        strsign = "+"
    else:
        first = factor* value
        num = random.randint(1,first)
        result = first - num
        strsign = "-"
    return "{}{} {} {} = {}".format(factor, variable,strsign, num, result)

def Output2File():
    f = open("one_meta.txt", mode="w+", encoding="utf-8")
    count = 100
    i =  0
    while i < count:
        i = i + 1
        f.write("{}       {}      {}      {}\n\n\n\n".format(Generage(),Generage(),Generage(),Generage()))
        if i % 4 == 0:
            f.write("--------------------------------------------------------------------------------------------\n")
    f.flush()
    f.close()

Output2File()