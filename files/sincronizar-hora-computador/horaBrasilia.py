import os, requests
from platform import system as plsy
from bs4 import BeautifulSoup as bs

if plsy() == 'Windows': p = 'time '
elif plsy() == 'Linux': p = 'timedatectl set-time '

page = requests.get("https://relogioonline.com.br/horario/bras%C3%ADlia/")
hora = bs(page.content, 'html.parser').find(id = "lbl-time").get_text()

p += hora
os.system(p)
