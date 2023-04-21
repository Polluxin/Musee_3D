# Musée 3D Aconit
    Réalisation de vues 3D autour d'objets des salles du musée virtuel d'ACONIT : https://musee-virtuel-aconit.000webhostapp.com/
    Ce lien envoie directement vers une première visite du musée en construction. Cette première salle est générée
    dynamiquement en fonction d'images et de la description de la salle Steve Wozniak (https://db.aconit.org/dbgalerie/galerie.php?fgal=galerie0&nsal=710).
    Ce projet utilise la bibliothèque Javascript Three.js (https://threejs.org).

## Structure du projet
    Le projet est consituté d'un fichier visit.html et src/main.css affichant le musée 3D en utilisant la librairie Javascript lib/museum.js.
    Dans data se situe les objets des salles, ainsi que les textures utilisées.
    Le fichier slides_explication contient les slides de présentation et peut-être utile pour comprendre le projet.

## Comment lancer la visite ?
### En local
    Il faut lancer un serveur local pour pouvoir exécuter le javascript.
    Tout d'abord, il faut cloner le projet git dans un répertoire de son choix.
    Puis :
        - Dans un terminal, taper "npm" pour vérifier si Node.js est installé
        - Si "command not found" le télécharger (https://nodejs.org/en/download/) et l'installer ou lancer la commande "sudo apt install -y nodejs"
        - Dans un terminal, taper "npm install live-server -g" pour installer le serveur
        - Se rendre à la racine du projet
        - Dans un terminal, taper "live-server ." pour lancer un serveur local dans ce répertoire. Cela va ouvrir une fenêtre dans le navigateur. Sinon se rendre à l'adresse qui s'affiche à l'écran.
        - Il suffit ensuite de cliquer sur le fichier "visit.html" dans le navigateur pour lancer la visite.
### Sur un serveur
    Il suffit d'ajouter les fichiers du projet sur le serveur. 
    
    **Attention ! Il est possible de devoir renommer le fichier visit.html en index.html**
