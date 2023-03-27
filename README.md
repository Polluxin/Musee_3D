# Musée 3D Aconit
Réalisation de vues 3D autour d'objets des salles du musée virtuel d'ACONIT.

## Etat d'avancement
    Le projet contient une première visite minimalise d'une simple salle créée dynamiquement.
    Les objets sont disposés sur de simples présentoirs.
    Dans le dossier /prototype/ se situe le fichier html du premier prototype créé par Sebastien
    Alaïwan.
    carnet_de_bords.md contient un historique des contributions au projet.

    A faire :
        - Ajouter un tableau du protagoniste de la salle
        - Revoir le modèle des présentoirs
        - Ajouter les descriptions des objets et de la salle
        - Ajouter la création de plusieurs salles et les disposer pour former un musée

## Comment lancer la visite
    Pour lancer la visite, il faut que le code se situe sur un serveur.
    Ainsi, il faut installer et lancer un serveur local dans le répertoire du projet cloné.
    Pour se faire :
        - Dans un terminal, taper "npm" pour vérifier si Node.js est installé
        - Si "command not found" le télécharger (https://nodejs.org/en/download/) et l'installer ou lancer la commande "sudo apt install -y nodejs"
        - Dans un terminal, taper "npm install live-server -g" pour installer le serveur
        - Se rendre à la racine du projet
        - Dans un terminal, taper "live-server ." pour lancer un serveur local dans ce répertoire. Cela va ouvrir une fenêtre dans le navigateur. Sinon se rendre à l'adresse qui s'affiche à l'écran.
        - Il suffit ensuite de cliquer sur le fichier "visit.html" dans le navigateur pour lancer la visite.
