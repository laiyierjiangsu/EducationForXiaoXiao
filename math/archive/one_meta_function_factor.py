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

#Output2File()

class Pipe(object):
    def __init__(self, func):
        self.func = func
        print("pipe init func {}", func.__name__)
 
    def __ror__(self, other):
        def generator():
            for obj in other:
                if obj is not None:
                    print("yield begin obj {} fun {} ".format(obj,self.func.__name__))
                    yield self.func(obj)
                    print("yield end obj {} fun {} ".format(obj,self.func.__name__))
                else:
                    print("yield end obj is null, fun {} ".format(self.func.__name__))
        return generator()
 
@Pipe
def even_filter(num):
    return num if num % 2 == 0 else None
 
@Pipe
def multiply_by_three(num):
    return num*3
 
@Pipe
def convert_to_string(num):
    return 'The Number: %s' % num
 
@Pipe
def echo(item):
    print(item)
    return item
 
def force(sqs):
    for item in sqs: print("item {}".format(item))
 
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 
force(nums | even_filter | multiply_by_three | convert_to_string | echo)

