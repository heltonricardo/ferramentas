mes = {1: 'jan.', 2: 'fev.',  3: 'mar.',  4: 'abr.',  5: 'maio',  6: 'jun.',
       7: 'jul.',  8: 'ago.', 9: 'set.', 10: 'out.', 11: 'nov.', 12: 'dez.'}

print('REFERÊNCIA ABNT PARA LINKS')
print()
link = input('Link: ')
acesso = input('Acesso em (D/M/A) ...: ').split('/')
titulo = input('Título ..............: ')
public = input('Publicação (D/M/A) ..: ').split('/')

print()
print(f'{titulo}. [S. l.], {public[0]} {mes[int(public[1])]} {public[2]}. Disponível '
      + f'em: {link}. Acesso em: {acesso[0]} {mes[int(acesso[1])]} {acesso[2]}.')
input()
