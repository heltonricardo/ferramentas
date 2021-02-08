import pandas as pd

while True:
   e = input('Title: ').upper().strip()
   b = 80 - int(input('Indentation: '))
   t = len(e) + 6
   i = int((b - t) / 2)
   if b % 2 and not len(e) % 2: i += 1
   f = b - t - i
   msg = f'/*{i*"*"} {e} {f*"*"}*/'
   df = pd.DataFrame([msg])
   df.to_clipboard(index = False, header = False)
   print(' > Copied to the clipboard!\n')
