/\*

# Service Auto Management - Frontend

## Descriere Proiect

Aceasta este partea de frontend a aplicației Service Auto Manager, dezvoltată ca parte a proiectului pentru Internship Info World 2025. Aplicația este construită folosind Angular și oferă o interfață pentru gestionarea unui service auto, inclusiv administrarea clienților, mașinilor, pieselor, programărilor și istoricului service.

## Tehnologii Utilizate

- Angular 15
- TypeScript
- Bootstrap 5
- SCSS
- Bootstrap Icons

## Funcționalități Implementate

1. **Administrare Clienți**

   - Adăugare, editare, activare/dezactivare și ștergere clienți
   - Vizualizare detalii client și mașinile asociate acestuia

2. **Administrare Mașini**

   - Adăugare, editare, activare/dezactivare și ștergere mașini
   - Vizualizare detalii mașină și asociere cu client
   - Calcul automat între cai putere și kW

3. **Administrare Piese**

   - Adăugare, editare, activare/dezactivare și ștergere piese
   - Gestionare stoc și vizualizare detalii piesă

4. **Programări Clienți**

   - Creare și gestionare programări
   - Verificare disponibilitate intervale orare
   - Vizualizare calendar programări
   - Adăugare programări pentru clienți și mașini specifice

5. **Istoric Service**
   - Înregistrare proces primire mașină
   - Înregistrare proces reparație mașină
   - Generare deviz cu piese și manoperă
   - Vizualizare istoric complet

## Structură Proiect

- `src/app/core`: Servicii, modele și interceptori utilizați în întreaga aplicație
- `src/app/shared`: Componente, directive și pipe-uri reutilizabile
- `src/app/features`: Module funcționale ale aplicației
  - `administrare-clienti`: Modulul pentru gestionarea clienților
  - `administrare-masini`: Modulul pentru gestionarea mașinilor
  - `administrare-piese`: Modulul pentru gestionarea pieselor
  - `programari`: Modulul pentru gestionarea programărilor
  - `istoric-service`: Modulul pentru gestionarea istoricului service
  - `dashboard`: Modulul pentru pagina principală cu statistici

## Instrucțiuni de Instalare și Rulare

1. Clonează repository-ul

```bash
git clone https://github.com/username/service-auto-manager-frontend.git
cd service-auto-manager-frontend
```

2. Instalează dependențele

```bash
npm install
```

3. Pornește aplicația

```bash
npm start
```

4. Deschide aplicația în browser la adresa `http://localhost:4200`

## Configurare Backend

Aplicația frontend este configurată să comunice cu un backend la adresa `http://localhost:3000/api`. Asigură-te că backend-ul este pornit și accesibil la această adresă înainte de a utiliza aplicația.
\*/
