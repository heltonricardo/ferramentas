from math import factorial as fat

def comb(x, y):
   return int(fat(x) / (fat(y) * fat(x - y)))

def distBin(n, k, p):
   return comb(n, k) * p**k * (1-p)**(n-k)


while (True):
   print('*** Calcular Distribuição Binomial ***')
   n = int(input('N (número de tentativas) .....: '))
   p = float(input('P (prob. de sucessos [0~1]) ..: '))
   x = input("X (número de sucessos [X] ou [X¹ X²] (para intervalos): ").split()

   if len(x) == 1:
      x1 = x2 = int(x[0])
   elif len(x) == 2:
      x1, x2 = sorted([int(y) for y in x])

   soma = 0
   for xi in range(x1, x2+1):
      soma += distBin(n, xi, p)

   print(f'Resultado: {soma:.20f}')
   print()
