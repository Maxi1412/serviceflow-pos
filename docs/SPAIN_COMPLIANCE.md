# Spain compliance research for commercial restaurant POS

**Research checkpoint:** 17 October 2026. Not tax/legal advice; before selling a POS in Spain, obtain appropriate Spanish fiscal, privacy and payment integration review. The demo is not legally capable of issuing receipts or settling payments.

## 1) Spanish fiscal software / VERI*FACTU

Official AEAT guidance (reviewed 17 October) still quotes adaptation deadlines of **1 January 2027** for Corporate Income Tax entities and **1 July 2027** for other covered taxpayers: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html

Hacienda publicly **announced a planned postponement to October 2028** on 5 October 2026. At the research checkpoint, this had **not yet been confirmed as enacted BOE legislation**; do not build a launch plan assuming a proposed postponement is already enforceable law. See 5 October news: https://www.europapress.es/economia/fiscal-00347/noticia-hacienda-pospone-octubre-2028-implantacion-verifactu-empresas-autonomos-20261005134014.html and legal-status explanation https://verifactu.co/calendario-verifactu/ . Recheck BOE and official AEAT guidance at each milestone.

The software should be architected to meet applicable requirements on integrity, traceability, non-alteration, cancellation/correction records, proper ticket invoice IDs, fiscal data formats, QR codes and software producer responsibility, as applicable. Fiscal records should NOT be mutable simply because an admin changes a restaurant menu.

## 2) Invoices and tickets

Royal Decree 1619/2012 Art. 4 explicitly allows a **factura simplificada** for qualifying restaurant/bar/cafe/hospitality transactions up to **€3,000 including VAT** (usual general threshold €400 for other transactions), subject to conditions and exceptions. Source: https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696 . Do not confuse an informal restaurant pro-forma bill with a legally issued fiscal invoice/receipt.

Supplier taxes, dine-in vs takeaway, alcohol, exemptions and billing details need a validated tax matrix based on applicable rules. Price configuration must support tax-inclusive display where required and item-level tax profiles; do not globally assume one IVA percentage for all menu items and use cases.

## 3) Mandatory B2B electronic invoices distinct from VERI*FACTU

Official Agencia Tributaria timetable: 6 October 2027 for qualifying larger businesses; 6 October 2028 for most other covered businesses, subject to stated threshold/conditions. Source: https://www3.agenciatributaria.gob.es/Sede/iva/factura-electronica/calendario-implantacion.html . This regime is not the same as fiscal SIF requirements, and qualifying simplified invoices have separate exceptions per RD 238/2026: https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295 .

## 4) Privacy, employee and customer data

Where restaurants collect customer contact information, reservations, loyalty profiles, employee shift records and device metadata, determine controller/processor obligations, privacy notices, lawful bases, data minimization, access rights, security, retention and DPAs under GDPR. Regulation: https://eur-lex.europa.eu/eli/reg/2016/679/2016-05-04/spa

No live multi-tenant data may be accessible from unauthenticated demo routes. Keep customer/payment data off client localStorage.

## 5) Payments and banking

Use regulated integrated payment providers or standalone terminal tender confirmations with audited reconciliation. Never store card numbers/CVV in our application. Independently confirm provider SDKs, supported country/hardware and compliance before committing integrations.

## Go-live gate

Before any pilot issues actual receipts: (1) review obligations with Spanish specialist, (2) implement applicable fiscal record standards and declaration of responsibility where required, (3) test legal receipts and corrections, (4) test fiscal outage/retry scenarios, (5) record documented acceptance. Until then: clearly label **DEMO — no real receipts/payments**.
