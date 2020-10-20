from datetime import datetime
import os

file = input("\n Arraste o arquivo para essa janela ou insira o nome: ")

s1 = datetime.now().strftime("%H:%M:%S.%f")
os.system(f'python {file}<in.txt>out.txt')
s2 = datetime.now().strftime("%H:%M:%S.%f")

FMT = '%H:%M:%S.%f'
tdelta = datetime.strptime(s2, FMT) - datetime.strptime(s1, FMT)

print("\n Tempo de execucao:", tdelta)
input("\n Pressione <Enter> para sair... ")
