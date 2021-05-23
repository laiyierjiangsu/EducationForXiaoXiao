# coding=utf-8
import random
def Generage_simple():
    divisor = random.randint(2,9)
    divisor1 = random.randint(2,9)
    dividend = random.randint(1,9) + divisor*divisor1
    return "{} ÷ {}= ___余___".format(dividend,divisor)

def Generage_hard():
        divisor = random.randint(10,99)
        answer = random.randint(3000,9999)
        reminder = random.randint(2,9)
        dividend = divisor*answer + reminder
        formula = "{} ÷ {}= ___余___".format(dividend,divisor)
        formula_answer = "{} ÷ {}= {}余{}".format(dividend,divisor,answer,reminder)
        return formula, formula_answer

 
def Output_simple_divide_2_file():
    f = open("divide_simple.txt", mode="w+", encoding="utf-8")
    count = 500
    i =  0
    while i < count:
        i = i + 1
        f.write("{}       {}       {}\n\n".format(Generage_simple(),Generage_simple(),Generage_simple(),Generage_simple()))
        if i % 8 == 0:
            f.write("-----------------------------------------------------------------\n\n")
    f.flush()
    f.close()

def Output_simple_divide_2_file():
    f_practice = open("divide_hard.txt", mode="w+", encoding="utf-8")
    f_answer = open("divide_hard_answer.txt", mode="w+", encoding="utf-8")
    count = 500
    i =  0
    while i < count:
        i = i + 1
        f0,f0_ans = Generage_hard()
        f1,f1_ans = Generage_hard()
        f2,f2_ans = Generage_hard()
        f_practice.write("{}       {}       {}\n\n".format(f0,f1,f2))
        f_answer.write("{}       {}       {}\n\n".format(f0_ans,f1_ans,f2_ans))
        if i % 8 == 0:
            f_practice.write("-----------------------------------------------------------------\n\n")
            f_answer.write("-----------------------------------------------------------------\n\n")
    f_practice.flush()
    f_answer.close()
Output_simple_divide_2_file()