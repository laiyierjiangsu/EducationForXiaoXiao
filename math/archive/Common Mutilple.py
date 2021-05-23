# coding=utf-8
import random

def fun(num1, num2):  # 定义一个函数, 两个形参
    if num1 < num2:  # 判读两个整数的大小,目的为了将大的数作为除数,小的作为被除数
        num1, num2 = num2, num1  # 如果if条件满足,则进行值的交换

    vari1 = num1 * num2  # 计算出两个整数的乘积,方便后面计算最小公倍数
    vari2 = num1 % num2  # 对2个整数进行取余数

    while vari2 != 0:  # 判断余数是否为0, 如果不为0,则进入循环
        num1 = num2  # 重新进行赋值,进行下次计算
        num2 = vari2
        vari2 = num1 % num2  # 对重新赋值后的两个整数取余数
        
    # 直到 vari2 等于0,得到最到公约数就退出循环
    vari1 /= num2   # 得出最小公倍数
    return num2, vari1


f_practice = open("Common_mutiple.txt", mode="w+", encoding="utf-8")
f_answer = open("Common_mutiple_ans.txt", mode="w+", encoding="utf-8")
count = 100
i =  1
mutiple_arr = [1,2,3,4,5,6,7,8,9]
while i < count:
    divisor = mutiple_arr[random.randint(0,8)]
    one = mutiple_arr[random.randint(0,8)] * divisor
    two = mutiple_arr[random.randint(0,8)] * divisor
    if one == two:
        continue
    divisor,mutiple = fun(one, two)
    f_practice.write("{}. {}和{}的最小公倍数_______      ".format(i, one,two))
    f_answer.write("{}. {};  ".format(i,int(mutiple)))
    if i % 2 == 0:
        f_practice.write("\n")
    if i % 10 == 0:
        f_answer.write("\n")
    i = i + 1
f_practice.flush()
f_answer.close()
