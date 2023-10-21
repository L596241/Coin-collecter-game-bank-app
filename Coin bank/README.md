## Stacc-Challenge: Et Web-Basert Spare-Spill
Dette prosjektet er en del av Stacc Challenge og har som mål å oppmuntre bankkunder til å spare penger på en morsom måte. Ved hjelp av Python og Phaser for JavaScript, presenterer prosjektet et enkelt, men avhengighetsskapende spill som omgjør poengsummen din til ekte sparing!

## Konsept
Spillere deltar i et spill for å samle virtuelle mynter, potter og regnbuer. I stedet for å bruke penger på et lotteri, tjener de en poengsum. Denne poengsummen blir så beløpet som overføres fra deres brukskonto til en sparekonto. Det er en vinn-vinn situasjon: kundene har det gøy og sparer penger samtidig.

## Teknologier Brukt
- Python
- JavaScript med Phaser
- HTML, CSS
- Flask for back-end
- SQLite3 for databasen

## Hvordan Kjøre Applikasjonen

1. Sørg for at du har installert Python 3.10. +
2. Klon repositoriet til din lokale maskin.
3. Installer nødvendige pakker:
   ```bash
   pip install Flask
   ```
4. Naviger til prosjektets mappe og kjør:
   ```bash
   python app.py
   ```
5. Åpne nettleseren din og gå til `http://localhost:5000/`.
6. Deretter må du opprette en bruker for å logge inn.
Hver ny bruker vil få opprettet to bankkontoer i sql: Hovedkonto og Sparekonto.
10 000 NOK (kr) legges automatisk til for hver ny registrert bruker. Kult, ikke sant?
Når du spiller spillet, vil du ha muligheten til å overføre beløpet som tilsvarer poengsummen i spillet, til sparekontoen din. Pengene vil bli trukket fra hovedkontoen. Fordi du allerede har fått 10 000, så nå bør du begynne å spille og spare noen av disse pengene ;)

## Spilleregler
- Målsum: 200
- Styring: Piltaster
- Samle:
  - Mynter for 1 poeng
  - Potter for 5 poeng
  - Regnbuer gir 7 ekstra sekunder
- Din endelige poengsum er beløpet du har samlet når tiden går ut.
- Du kan deretter velge om du vil overføre dette beløpet til din sparekonto eller avbryte.

## Begrensninger og Preferanser
- Det er en forhåndsdefinert daglig sparegrense (f.eks., 500 kr).
- Brukere kan justere denne grensen etter eget ønske (mellom 0 og 5000 kr).
  
## Fremtidige Forbedringer
Spillet er strukturert for å tillate enkel integrasjon med en "bank" via back-end, noe som muliggjør sanntidsoverføringer av in-game valuta (poengsum) til brukerens faktiske sparekonto. Denne interaksjonen er tilrettelagt gjennom JSON-forespørsler og sikret med Flasks robuste funksjoner.

## Takk
Dette prosjektet ble laget forbindelse med Stacc Challenge, med mål om å vise kreativitet og innovasjon i finansteknologiske løsninger. Kos deg med spillet og god sparing!
