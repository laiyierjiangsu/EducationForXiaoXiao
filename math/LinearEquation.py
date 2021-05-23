#--Coding--utf-8
import random
import numpy
'参数信息'
class Meta(object):
    def __init__(self,index):
      # 是Eqution当中的第几个元
      self.index = index
      # 名字， x or a
      self.name = ""
      # 系数
      self.coefficient = 0
      # 符号:0 为 + ， 非0 为 -
      self.sign = 0 
      # 值
      self.relult = 0
   
    def meta_desc(self):
        # 如果是第一个参数，其为正，可以省略
        if self.sign ==  0:
            self.sign_desc = "+"
            if self.index == 0 :
                self.sign_desc = ""
        else:
            self.sign_desc = "-"
        # 系数
        str_coefficient = "" if self.coefficient == 1 else str(self.coefficient)
        return "{}{}{}".format(self.sign_desc,str_coefficient,self.name)

   
 


# 子方程式，一个方程组有多个子方程式
class Equation(object):
    def __init__(self,index,meta_name,meta_result):
        # 子方程式是其中的第几个
        self.index = index
        # 参数的名字
        self.meta_name = meta_name
        # 参数列表
        self.meta = []
        # 方程式结果
        self.result = 0
        
        for i in range(0,len(meta_name)):
            temp_meta = Meta(i)
            # 随机生成系数和符号
            temp_meta.sign = random.randint(0,1)
            temp_meta.coefficient = random.randint(1,5)
            temp_meta.name = meta_name[i]
            temp_meta.result = meta_result[i]
            # 缓存对象
            self.meta.append(temp_meta)
            # 累积结果
            meta_value = temp_meta.coefficient * temp_meta.result
            meta_value = meta_value if temp_meta.sign == 0  else (- meta_value)
            self.result = self.result + meta_value
            
        

        print(self.equation_desc())
    
    def equation_desc(self):
        equation_desc = ""
        for i in range(0,len(self.meta)):
            equation_desc = equation_desc + self.meta[i].meta_desc()
        equation_desc = "{}={}".format(equation_desc, self.result)
        return equation_desc




class EquationGroup(object):
    def __init__(self,meta_count,meta_name,meta_result):
        # 参数的个数
        self.meta_count = meta_count
        # 参数的名字数组： 比如 x, y, z 或者 a, b ,c
        self.equation_meta_name = meta_name
        # 方程组的解
        self.meta_result = meta_result
        print("----------------------------------------")
        for i in range(0,meta_count):
            print("{} = {}".format(self.equation_meta_name[i],self.meta_result[i]))
        print("\n")
        # 方程组列表
        self.equation_arr = []
        # 矩阵
        coefficient_arr = numpy.zeros((2,2),dtype="int") 

        while True:
            self.equation_arr.clear()
            # 生成方程组
            for i in range(0,meta_count):
                self.equation_arr.append(Equation(i,self.equation_meta_name,self.meta_result))
            # 判断方程组是否有效
            for i in range(0,meta_count):
               for j in range(0,len(self.equation_arr[i].meta)):
                   coefficient_arr[i,j] = self.equation_arr[i].meta[j].coefficient if self.equation_arr[i].meta[j].sign == 0 else (- self.equation_arr[i].meta[j].coefficient)
            # 判断矩阵是否有逆
            if numpy.linalg.det(coefficient_arr) != 0:
                break
      
    def answer_desc(self):
        answer = ""
        for i in range(0,self.meta_count):
            answer = answer +"{}={} ".format(self.equation_meta_name[i],self.meta_result[i])
        return answer

        

        

