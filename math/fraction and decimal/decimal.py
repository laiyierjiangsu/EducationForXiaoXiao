#--Coding--utf-8
import random
import re
import numpy
from fractions import Fraction
'参数信息'
class Meta(object):
    def __init__(self,index):
        # 是第几个参数
        self.index = index
        # 分母
        self.denominator = random.randint(1,9)
        # 分子
        self.numerator = random.randint(1,9)
        # 随机生产的小数值
        self.decimal = int(float(Fraction(self.numerator, self.denominator) ) * 10)/10
        #print(self.decimal)
        # 符号:0 为 正数 ， 非0 为 负数
        self.sign = random.randint(0,1)
        # 运算符号，第一个参数忽略[0,1,2,3]->[+,-,*,/]
        self.operater = random.randint(0,3)
        self.operater_desc = ["＋","－","×","÷"]
        #用于打印的信息  
    def meta_desc(self):
        # 如果是第一个参数，其为正，可以省略
        ret = ""
        if self.sign ==  0:
            self.sign_desc = "+"
            # 第一个不用显示正好
            if self.index == 0 :
                ret = "{} ".format(self.decimal)
            else:
                ret = "{}{}  ".format(self.operater_desc[self.operater],self.decimal)
            
        else:
            self.sign_desc = "-"
            # 第一个不用加括号
            if self.index == 0 :
                ret = "{}{} ".format(self.sign_desc,self.decimal)
            else:
                # 如果是加号，省略运算符
                if self.operater == 0:
                    ret = "{}{}  ".format(self.sign_desc,self.decimal)
                else:
                    ret = "{}({}{}) ".format(self.operater_desc[self.operater],self.sign_desc,self.decimal)
        return ret
        #具体的值
    def value(self):
        return self.decimal

class Express:
    def __init__(self):
        # 有几个项
        self.item_count = 2
        # 各个参数 
        self.item_list = []
        i = 0
        while i < self.item_count:
            self.item_list.append(Meta(i))
            i = i + 1
        #运算结果
        self.result_value = self.item_list[0].value()
        i = 1
        while i < self.item_count:
            meta = self.item_list[i]
            if meta.operater == 0:
                self.result_value = self.result_value + meta.value()
            if meta.operater == 1:
                self.result_value = self.result_value - meta.value()
            if meta.operater == 2:
                self.result_value = self.result_value * meta.value()
            if meta.operater == 3:
                self.result_value = self.result_value / meta.value()
            i = i + 1

    def result(self):
        return self.result_value

    def express_desc(self):   
        i = 0
        ret = ""
        while i < self.item_count:
            ret = ret +  self.item_list[i].meta_desc()
            i = i+1
        ret = ret + "=______"    
        return ret


if __name__ == "__main__": 
    print(Fraction(1,2) * Fraction(1,3))
    f_practice = open("fraction and decimal\\decimal.txt", mode="w+", encoding="utf-8")
    f_answer = open("fraction and decimal\\decimal_answer.txt", mode="w+", encoding="utf-8")
    raw = 150
    i =  0
    while i < raw:
        col = 3
        exp = Express()
        desc = "{}. {}    ".format(i+1,exp.express_desc())
        f_practice.write(desc)
        f_answer.write("{}. {}    ".format(i+1,exp.result()))
        i = i + 1
        if i % 5 == 0:
            f_answer.write("\n")
        
        if i %3 == 0:
            f_practice.write("\n\n")


    f_practice.flush()
    f_answer.close()
    print("Successfully Generated!")

        

