from math import exp, factorial as fat

def poisson(lamb, k):
   return exp(-lamb) * lamb**k / fat(k)


while (True):
   print('*** Calcular Distribuição de Poisson ***')
   lb = float(input('Lambda (taxa média de evento ocorrer no intervalo) .....: '))
   x = input("X (número de eventos [X] ou [X¹ X²] (para intervalos) ..: ").split()

   if len(x) == 1:
      x1 = x2 = int(x[0])
   elif len(x) == 2:
      x1, x2 = sorted([int(y) for y in x])

   soma = 0
   for xi in range(x1, x2+1):
      soma += poisson(lb, xi)

   print(f'Resultado: {soma:.20f}')   
   print()
