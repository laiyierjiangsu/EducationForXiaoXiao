# Coding --- utf-8
import random
from  LinearEquation import *

g_num  = 1

class Equation_Printer:
    def __init__(self) -> None:
        self.equation_group = ""
        self.num = 0

# 每四个方程组一行，要四个一起统筹规划显示
def row_printer(fp,fa):
    meta_name = ["x","y"]
    equation_group_count = 4
    equation_printer_array = []
    line_practice_content = ["",""]
    for i in range(0,equation_group_count):
        global g_num
        meta_result = [0,1]
        meta_result[0] = random.randint(1,9)
        meta_result[1] = random.randint(1,9)
        equation_group = EquationGroup(len(meta_name),meta_name,meta_result)
        printer = Equation_Printer()
        printer.equation_group = equation_group
        printer.num =  g_num
        g_num = g_num+1
        equation_printer_array.append(printer)
      
        
    # 输出答案：
    for printer in equation_printer_array:
        ans_desc = "{}.{}".format(printer.num,  printer.equation_group.answer_desc())
        fa.write(ans_desc)
        fa.write("  ")

    # 按行生成打印的内容
    for i in range(0,len(meta_name)):
        gap = "   " if i == 0 else "   "
        line_practice_content[i] = ""
        sub_content = []
        for j in range(0,equation_group_count):
            if j != 0:
                line_practice_content[i]  = line_practice_content[i] + gap
            equation_printer = equation_printer_array[j]
            practice_desc = equation_printer.equation_group.equation_arr[i].equation_desc()
            # 第一行需要加上题的序号
            if i == 0:
                sigle_equation= "{}. {}".format(equation_printer.num,practice_desc)
                print(len(sigle_equation))
                sub_content.append(sigle_equation)
            else:
                sub_content.append("{} {}".format("",practice_desc))
        mat = "{:16}\t{:16}\t{:16}\t{:16}"
        line_practice_content[i] = mat.format(sub_content[0],sub_content[1],sub_content[2],sub_content[3])
         
    # 输出练习
    for line in line_practice_content:
        fp.write(line)
        fp.write("\n")

     
    


if __name__ == "__main__":

    f_practice = open("equation\\two_unknown_equation.txt", mode="w+", encoding="utf-8")
    f_answer = open("equation\\two_unknown_equation_answer.txt", mode="w+", encoding="utf-8")
    count = 30
    i =  0
    while i < count:
        row_printer(f_practice,f_answer)
        # 前面空两行写答案
        f_practice.write("\n\n")
        f_answer.write("\n")
        i = i + 1
    f_practice.flush()
    f_answer.close()
    print("Successfully Generated!")