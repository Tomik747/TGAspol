# Zisky – nastavení online databáze (Supabase, zdarma)

Zisky ukládají zakázky do databáze Supabase. Díky tomu jsou stejná data
v programu „Servisní štítky“ na každém počítači i na mobilu (přes GitHub Pages).

## 1. Založení projektu

1. Otevřete https://supabase.com a zaregistrujte se („Start your project“).
   Můžete použít přihlášení přes GitHub.
2. Klikněte na **New project**:
   - **Name:** `zisky`
   - **Database Password:** vymyslete silné heslo a uložte si ho
     (aplikace ho nepotřebuje, ale hodí se pro správu).
   - **Region:** `Central EU (Frankfurt)`
   - Tarif **Free**.
3. Počkejte asi 2 minuty, než se projekt připraví.

## 2. Vytvoření tabulky

1. V levém menu otevřete **SQL Editor** → **New query**.
2. Vložte celý obsah souboru `schema.sql` (ze složky `zisky`) a klikněte na **Run**.
3. Mělo by se objevit „Success. No rows returned“.

## 3. Zákaz registrace cizích lidí (důležité)

1. **Authentication** → **Sign In / Providers** (nebo **Settings**).
2. Vypněte **Allow new users to sign up**. Uložte.

Bez tohoto kroku by si mohl kdokoli s odkazem na aplikaci založit účet a vidět vaše čísla.

## 4. Váš přihlašovací účet

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Zadejte svůj e-mail a heslo, zaškrtněte **Auto Confirm User** a potvrďte.
3. Stejně můžete přidat účty dalším lidem z firmy. Všichni přihlášení vidí
   stejné zakázky.

## 5. Hodnoty pro aplikaci

1. **Project Settings** (ozubené kolo) → **Data API** / **API Keys**.
2. Zkopírujte:
   - **Project URL**, např. `https://abcdefghijkl.supabase.co`
   - **anon public** klíč (dlouhý, začíná `eyJ…`), případně **publishable** klíč (`sb_publishable_…`)
3. Pošlete je Claudovi, nebo je vložte do souboru `zisky\config.js`.
   **Nikdy nepoužívejte klíč `service_role` ani `secret`** – ten patří jen do správy Supabase.

## Dobré vědět

- Bezplatný projekt se po **7 dnech bez použití uspí**. Data zůstanou, stačí se
  přihlásit na supabase.com a kliknout na **Restore project**.
- Zálohu dat si kdykoli stáhnete v aplikaci tlačítkem **Záloha**.
