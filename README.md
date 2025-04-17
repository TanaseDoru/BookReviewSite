# BookReviewSite

BookReviewSite este o aplicație web concepută pentru recenziile de cărți, permițând utilizatorilor să adauge, să vizualizeze și să interacționeze cu recenziile literare. Proiectul beneficiază de o arhitectură full-stack, folosind stiva MERN.

## Cuprins
- [BookReviewSite](#bookreviewsite)
  - [Cuprins](#cuprins)
  - [Descriere Proiect](#descriere-proiect)
  - [Instalare](#instalare)
  - [Pornirea aplicatiei](#pornirea-aplicatiei)
    - [Dependinte](#dependinte)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Exemplu navigare pagini](#exemplu-navigare-pagini)
    - [Recomandare parcurgere site](#recomandare-parcurgere-site)
    - [Navigare utilizator neconectat](#navigare-utilizator-neconectat)
    - [Navigare utilizator simplu](#navigare-utilizator-simplu)
    - [Navigare utilizator autor](#navigare-utilizator-autor)
    - [Navigare utilizator admin](#navigare-utilizator-admin)
  - [Scurta descriere a paginilor](#scurta-descriere-a-paginilor)
  - [Functionalitati](#functionalitati)
  - [Sistem de fisiere](#sistem-de-fisiere)
    - [Frontend](#frontend-1)
    - [Backend](#backend-1)
  - [Tehnologii folosite](#tehnologii-folosite)
- [TO DO/Not working:](#to-donot-working)

## Descriere Proiect
Acest proiect oferă un site dedicat recenziilor de cărți unde:
- Utilizatorii pot vizualiza recenzii pentru diverse titluri.
- Autentificarea permite adăugarea, editarea și ștergerea recenziilor proprii.
- Interfața este proiectată pentru a fi prietenoasă, modernă și ușor de navigat.

## Instalare
1. **Clonare repository:**
   ```bash
   git clone https://github.com/TanaseDoru/BookReviewSite.git
   cd BookReviewSite
   ```
2. **Instalare dependinte pentru Backend**
  ```bash
  cd backend
  npm install
  ```
3. **Instalare dependinte pentru Frontend**
  ```bash
  cd ../frontend
  npm install
  ```
## Pornirea aplicatiei
### Dependinte
In primul rand trebuie creat un fisier .env in directorul `backend` unde se vor definii date precum
JWT_SECRET="o cheie anume" si MONGO_URI="mongodb://localhost:27017/review-books-master"

### Backend
- Din directorul `backend`, porniti serverul cu:
  ```bash
  npm start
  ```
  sau, alternativ:
  ```bash
  node index.js
  ```
  Backend-ul va rula la adresa `http://localhost:3000`
### Frontend
- Din directorul `frontend`, aplicatie se porneste folosind:
  ```bash
  npm run dev
  ```
Aplicatia se va lansa la adresa `http://localhost:5173`

## Exemplu navigare pagini
  ### Recomandare parcurgere site
  - Explorare functionalitati ca utilizator neconectat
  - Explorare functionalitati ca utilizator simplu, cont: doru@gmail.com parola: 1
  - Explorare functionalitati ca autor, cont: k@gmail.com, parola: 1234
  - Explorare functionalitati ca admin, cont: admin@gmail.com, parola: 1
  ### Navigare utilizator neconectat
  - Utilizatorul neconectat poate accesa carti pentru a putea vizualiza descrierea si recenziile cartilor acestea
  - Acesta poate accesa site-urile autorilor si poate vedea intrebarile puse de alti utilizatori
  - Daca utilizatorul neconectat acceseaza pagina de *My Books*, acesta va fi redirectionat pe pagina de logare. Acesta va fi redirectionat pe pagina de logare si daca incearca sa puna o recenzie pentru o carte

  ### Navigare utilizator simplu
  - Utilizatorul normal isi poate accesa profilul acestuia si poate face modificari la numele si prenumele acestuia, poza de profil, precum sa isi si schimbe parola
  - Cartile pot fi adaugate in "biblioteca" utilizatorului, marcandu-o pe aceasta ca fiind "Citit", "Vreau sa Citesc", "Citesc"
  - Acesta poate posta review-uri cartilor, un review fiind compus din maxim 500 de caractere, existand si optiunea pentru a marca un review ca *spoiler* pentru a atentiona ceilalti utilizatori ca acea recenzie poate contine spoilere  
  - Acesta mai poate pune o intrebare unui autor, daca acesta are cont valid. Intrebarea aceasta este vizibila tuturor celorlalti utilizatori si poate fi raspunsa de autor
  - Utilizatorul simplu poate face cerere de a deveni autor prin tab-ul *Extra* din setarile contului(dandu-se click pe poza utilizatorului din dreapta sus)
  - Conectarea se face din butonul de log In din dreapta sus
  
  ### Navigare utilizator autor
  - Utilizatorul autor poate face tot ce face utilizatorul simplu, iar in plus acesta poate adauga noi carti pe care ceilalti utilizatori sa le poata vedea si sa le puna o recenzie. Pentru a adauga o carte autorul trimite o cerere de adaugare de carte utilizatorului admin
  - Acesta poate modifica cartile existente si poate vedea ce statistici are legate de carti: numar carti publicate, media review-urilor
  - In plus, autorul are un tab de notificari prin care poate vedea intrebarile puse de alti utilizatori

  ### Navigare utilizator admin
  - Utilizatorul admin poate face orice face un utilizator simplu, dar are o pagina in plus de `Admin`
  - In aceasta pagina adminul poate vedea:
    - Statistici
    - Poate adauga carti
    - Poate modifica carti
    - Poate adauga un autor
    - Atribue Roluri
    - Dezactiveaza conturi
    - Pagina de Notificari 

## Scurta descriere a paginilor
- **Pagina principala(/)**: Pe aceasta pagina utilizatorul poate vedea cartile recomandate pentru acesta, daca este logat. Daca nu este logat la un cont, acesta va vedea o lista cu toate cartile disponibile. Recomandarea de carti se face pe baza cartilor pe care le-a citit/vrea sa le citeasca
- **Pagine de Browse(/browse)**: Pe aceasta pagina se pot observa toate cartile disponibile si se poate face filtrare dupa Nume/Autor/Gen/Numar pagini
- **My Books(/myBooks)**: Aceasta pagina este disponibila doar utilizatorilor conectati. Aici se gasesc cartile pe care utilziatorul le are in colectie(Citite, le citeste sau le-a citit). Tot aici utilizatorul poate face o recenzie rapida pentru o carte anume, precum si editarea unei recenzii existente/adaugarea unei recenzii noi. Cartile din colectie pot fi filtrate dupa Data adaugata, data citita, recenzie, titlu sau autor.
- **Pagina review carte(/editReview/:id)**: Aici se pot adauga sau modifica review-uri pentru o anumita carte. Se poate alege Rating, adauga recenzia (maxim 500 de litere), se poate marca drept spoiler si se pot alege date pentru inceput citire sau terminat citire.
- **Pagina Carte(/book/:id)**: Se apasa pe o carte din Browse/Home si se afiseaza pagina cartii respective, unde se vad detalii despre carte, se poate da review, se pot filtra dupa stele daca se da click pe bara orizontala de la numarul de stele. In pluse se poate da click pe Gen, utilizatorul fiind redirectat la tab-ul de browse cu filtru pe genul selectat 
- **Pagina profile(/profile)**: Pe pagina de profil, un utilizator isi poate schimba numele sau prenumele, adauga poza de profil, poate vizualiza email-ul si isi poate schimba parola. Mai exista si un tab de extra unde poate aplica sa fie autor
- **Contact(/contact)**: ***De IMPLEMENTAT!***
- **Author Dasboard(/authorDashboard)**: Pagina de author Dashboard poate fi accesata doar de utilizatori care au rol de autor si poate adauga o carte noua, modifica o carte, poate vizualiza statistici legate de cartile acestuia, si poate vedea notificarile primite, adica ce intrebari a primit de la alti utilizatori
- **Admin Dashboard(/admin)**: Utilizatorul cu rol de admin poate vizualiza statistici legate de carti/review-uri, poate adauga o carte, poate modifica carti, poate creea conturi, modifica rolurile conturilor deja existente sau sterge conturi si poate vedea cererile de autori de la utilizatori normali
- **Login Page(/login)**: pagina prin care utilizatorul poate intra in cont folosind mail-ul si parola, in plus acesta poate alege optiunea de "Am uitat parola" pentru a o schimba.
- **Register Page(/register)**: Pagina prin care utilizatorul isi poate creea un cont nou. Se face regex pentru fromat mail


## Functionalitati
- Inregistrare si autentificare utilizator
- Utilizatorii sunt conectati printr-un token se sesiune JWT
- Roluri existente pentru utilizatori: User normal, Autor, Admin
- Rolul de admin are drepturi de vizualizare a statisticilor, a sterge/modifica utilizatori si carti
- Prezentarea datelor sub forma tabelara
- Experienta UI/UX responsive 

## Sistem de fisiere
### Frontend
```
frontend/
│
├── node_modules/                 # Fisiere din suita NodeJS
├── public/                       # Resurse statice (imagini)
│   ├── image.png                 # Imagine logo de pe prima pagina
│   └── Logo.png                  # Logo site
│
├── src/                          # Sursa principală a fișierelor markup
│   ├── assets/                   # Imagini folosite in proiect
│   │   ├── blankProfile.png      # Utilizator fara poza de profil
│   │   ├── emptyStart.png        # Stea goala (Pentru recenzie)
│   │   └── fullStar.png          # Stea plina (Pentru recenzie)
│   │   
│   ├── components/               # Componente separate utilizate
│   │   ├── layout/               # Layout-uri
│   │   │   ├── MainLayout.jsx    # Layout principal
│   │   │   └── NavBar.jsx        # NavBar-ul site-ului
│   │   │   
│   │   ├── shared/               # Componente shared
│   │   │   └── Button.jsx        # Componenta buton 
│   │   │    
│   │   └── ui/
│   │       ├── FilterMenu.jsx    # Meniu pentru filtrarea cartilor
│   │       └── Paginate.jsx      # Meniu pentru paginare 
│   │     
│   ├── context/                  # Componente de context
│   │   └── AuthContext.jsx       # Componenta de context de autentificare
│   │   
│   ├── pages/                    # Paginile din proiect
│   │   ├── AdminPage.jsx         
│   │   ├── AuthorDashboard.jsx
│   │   ├── AuthorPage.jsx
│   │   ├── BookPage.jsx
│   │   ├── Browse.jsx
│   │   ├── EditReview.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyBooks.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   └── Contact.jsx
│   │
│   ├── routes/
│   │   └── router.jsx            # router pentru stabilirea cailor paginilor
│   ├── styles/
│   │   └── index.css             # Fisier de styles
│   └── utils/
│       ├── api.js                # Comunicare cu backend
│       └── imageUtils.js         # Functii pentru afisarea imaginilor corespunzator
│
│
└── *alte fisiere de configurare*
```
### Backend
```
backend/
|
├── node_modules/             # Fisiere instalate prin npm
├── config/                   # Setari globale
│   ├── db.js                 # Configurarea conexiunii la baza de date
│   └── errorConfig.js        # Configurarea erorilor si log-urilor
│
├── middleware/               # Middleware-uri personalizate
│   ├── auth.js               # Middleware pentru verificarea autentificarii
│   └── isAuthorOrAdmin.js    # Middleware pentru permisiuni de autor sau admin
│
├── models/                   # Modele pentru baza de date
│   ├── Book.js               # Model pentru carti
│   ├── Question.js           # Model pentru intrebari
│   ├── Review.js             # Model pentru recenzii
│   ├── User.js               # Model pentru utilizatori
│   └── UserBook.js           # Model pentru legatura intre utilizator si carti
│
├── routes/                   # Rute ale aplicatiei
│   ├── admin.js              # Rute pentru zona de administrare
│   ├── auth.js               # Rute pentru autentificare
│   ├── profile.js            # Rute pentru profilul utilizatorului
│   ├── questions.js          # Rute pentru intrebari
│   ├── reviews.js            # Rute pentru recenzii
│   └── userBooks.js          # Rute pentru actiuni cu cartile utilizatorului
│
├── utils/                    # Functii si constante ajutatoare
│   ├── constants.js          # Constante globale
│   └── helpers.js            # Functii de utilitate
|
├── .env                      # Variabile de mediu
├── .gitignore                # Fisiere si directoare de ignorat de Git
├── index.js                  # Punctul de intrare al aplicatiei
├── package.json
└── package-lock.json
```


## Tehnologii folosite

| **Categorie**       | **Tehnologie**             | **Descriere**                                      |
|---------------------|----------------------------|----------------------------------------------------|
| **Frontend**        | React                      | Bibliotecă JavaScript pentru construirea interfeței utilizatorului. |
|                     | React Router DOM           | Gestionarea rutelor și navigării în aplicația React. |
|                     | Tailwind CSS               | Framework CSS pentru stilizare rapidă și responsivă. |
|                     | @tanstack/react-query      | Gestionarea stării și a cererilor asincrone în React. |
|                     | React Paginate             | Componentă pentru paginarea datelor în interfața utilizatorului. |
|                     | LocalForage                | Stocare locală îmbunătățită pentru date offline.   |
|                     | Match Sorter               | Utilitar pentru sortarea și filtrarea datelor.     |
| **Backend**         | Express                    | Framework web pentru Node.js, folosit pentru gestionarea cererilor API. |
|                     | Mongoose                   | ODM (Object Data Modeling) pentru MongoDB, facilitând interacțiunea cu baza de date. |
|                     | MongoDB                    | Baza de date NoSQL pentru stocarea datelor aplicației. |
|                     | Nodemon                    | Utilitar pentru repornirea automată a serverului în timpul dezvoltării. |
| **Autentificare**   | Bcrypt / Bcryptjs          | Biblioteci pentru hasharea și verificarea parolelor. |
|                     | JSON Web Tokens (jsonwebtoken) | Sistem de autentificare securizat prin tokeni JWT. |
| **Alte Utilitare**  | CORS                       | Middleware pentru gestionarea cererilor cross-origin. |
|                     | Dotenv                     | Gestionarea variabilelor de mediu în aplicație.    |
|                     | Multer                     | Middleware pentru gestionarea încărcărilor de fișiere (ex: imagini). |

# TO DO/Not working:
- Fiind data doar partea de frontend nu am apucat sa implementez complet si functionalitatile de backend, asa ca unele aspecte legate de proiect nu merg asa cum as dori, aici sunt lucruri pe care trebuie sa le mai implementez
- Sistem de notificari pentru cereri de autor
- Poza de profil nu merge in totalitate sa fie upload din fisier
- Mecanica din spatele de Recomandari de carti nu este implementata, asa ca Home arata toate cartile disponibile
- Stergerea conturilor din tab-ul de admin pot provoca erori, astfel nu se recomanda