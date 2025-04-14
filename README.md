# BookReviewSite

BookReviewSite este o aplicație web concepută pentru recenziile de cărți, permițând utilizatorilor să adauge, să vizualizeze și să interacționeze cu recenziile literare. Proiectul beneficiază de o arhitectură full-stack, folosind stiva MERN.

## Cuprins
- [BookReviewSite](#bookreviewsite)
  - [Cuprins](#cuprins)
  - [Descriere Proiect](#descriere-proiect)
  - [Instalare](#instalare)
  - [Pornirea aplicatiei](#pornirea-aplicatiei)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Modul de functionare](#modul-de-functionare)
  - [Navigarea pe Site](#navigarea-pe-site)
  - [Functionalitati](#functionalitati)
  - [Tehnologii folosite](#tehnologii-folosite)

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

## Modul de functionare
 // TO DO

## Navigarea pe Site
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

