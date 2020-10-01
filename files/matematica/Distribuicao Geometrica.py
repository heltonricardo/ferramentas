def distGeo(k, p):
   return p * (1-p)**(k-1) if p else 0


while (True):
   print('*** Calcular Distribuição Geométrica ***')
   p = float(input('P (probabilidade de sucessos [0~1]) .................: '))
   x = input("X (número de tentativas [X] ou [X¹ X²] (para intervalos) ..: ").split()

   if len(x) == 1:
      x1 = x2 = int(x[0])
   elif len(x) == 2:
      x1, x2 = sorted([int(y) for y in x])

   soma = 0
   for xi in range(x1, x2+1):
      soma += distGeo(xi, p)

   print(f'Resultado: {soma:.20f}')
   print()
