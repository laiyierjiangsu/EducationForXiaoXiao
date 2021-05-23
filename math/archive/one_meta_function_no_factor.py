import random
import cexprtk

def GetVariable():
    text = "abcdefghijklmnopqrstuvwxyz"
    pos = random.randint(0,len(text))
    return text[pos: pos+1]
 
def GetFactor():
    return random.randint(1,10)

def GetNum():
    return random.randint(0 ,20)

def GetVariableValue():
    return random.randint(1,10)

def Generage_unit_no_variable():
    sign = random.randint(0,3)
    strsign = ""
    l = GetNum()
    r = GetNum()
    if sign == 0:
        strsign = "+"
    elif sign == 1: 
        strsign = "-"
    elif sign == 2: 
        strsign = "*"
    elif sign == 3: 
        strsign = "/"
        l = l * r
    return "{} {} {} ".format(l,strsign,r)

def Generage_unit_variable():
    sign = random.randint(0,3)
    strsign = ""
    l = GetVariable()
    r = GetNum()
    if sign == 0:
        strsign = "+"
    elif sign == 1: 
        strsign = "-"
    elif sign == 2: 
        strsign = "*"
    elif sign == 3: 
        strsign = "/"
    return "{} {} {} ".format(l,strsign,r), r* GetNum()

def Generate_Group(exp):
    sign = random.randint(0,3)
    is_exp_l = random.randint(0,1)
    l_exp = ""
    r_exp = ""

    if is_exp_l == 0:
        l = cexprtk.evaluate_expression(exp,{})
        l_exp = exp
        r = GetNum()
        r_exp = str(r)
    else:
        r = cexprtk.evaluate_expression(exp,{})
        r_exp = exp
        l = GetNum()
        l_exp = str(l)

    strsign = ""
    l = GetNum()
    r = GetNum()
    if sign == 0:
        strsign = "+"
    elif sign == 1: 
        strsign = "-"
    elif sign == 2: 
        strsign = "*"
    elif sign == 3: 
        strsign = "/"
        l = l * r
    final_exp = "{} {} {} ".format(l,strsign,r)   
    return "{} {} {} ".format(l,strsign,r)   

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

print()