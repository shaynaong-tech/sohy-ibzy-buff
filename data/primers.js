/* Module primers + 10-question checks (written for IBZY). */
window.IBZY_PRIMERS = [
{
"id": "accounting",
"title": "Accounting & the Three Statements",
"tag": "The language of business",
"body": "<p><b>Why it matters.</b> Every valuation, model and credit decision starts here. The three statements are not three separate documents — they are one interlocking system, and interviewers test whether you understand the <i>links</i>, not the definitions.</p>\n <h4>The three statements</h4>\n <p>The <b>income statement</b> shows accrual profitability over a period: revenue down through COGS, operating expenses, D&A, interest and taxes to net income. The <b>balance sheet</b> is a snapshot at a point in time where Assets = Liabilities + Equity. The <b>cash flow statement</b> reconciles accrual net income to actual cash, in three sections: operating, investing and financing.</p>\n <h4>How they link</h4>\n <p>Net income flows from the IS to the top of the CFS and (less dividends) into retained earnings on the BS. The ending cash on the CFS becomes the cash line on the BS. Changes in working capital and non-cash items (D&A, stock comp) bridge net income to operating cash flow. This is why a single change — say depreciation up $10 — ripples through all three.</p>\n <h4>Accrual vs cash</h4>\n <p>Accrual accounting books revenue when <i>earned</i> and expenses when <i>incurred</i>, regardless of cash timing. That creates items like accounts receivable, deferred revenue and accrued expenses. The CFS exists precisely to translate this back into cash — which is why \"cash is king\" and the CFS is hardest to manipulate.</p>\n <h4>The classic walk-through</h4>\n <p>Depreciation +$10 at a 25% tax rate: net income falls $7.50; on the CFS you add back the full $10 of non-cash D&A so cash rises $2.50 (the tax shield); on the BS cash is +$2.50 and PP&E is −10 (assets −$7.50) while retained earnings fall $7.50. It balances. Master this pattern and the variants (accrued expense, inventory, deferred revenue, PP&E bought with debt, asset sales) follow.</p>\n <h4>Common traps</h4>\n <p>Non-cash charges (D&A, write-downs, stock comp) reduce net income but get added back on the CFS — you \"save taxes\" on them. Capex and inventory purchases never hit the IS directly. Deferred tax liabilities arise when tax depreciation outruns book depreciation early on.</p>",
"quiz": [
{
"q": "Depreciation rises $10 at a 25% tax rate. Net income changes by:",
"o": [
"−$10",
"−$7.50",
"−$2.50",
"$0"
],
"a": 1,
"e": "Pre-tax −$10, tax −$2.50, NI −$7.50."
},
{
"q": "In that same case, cash changes by:",
"o": [
"−$7.50",
"+$2.50",
"−$10",
"$0"
],
"a": 1,
"e": "Add back $10 non-cash D&A to −$7.50 NI → +$2.50 tax shield."
},
{
"q": "Which statement links to the balance sheet via retained earnings?",
"o": [
"Cash flow statement",
"Income statement",
"Neither",
"Both equally"
],
"a": 1,
"e": "Net income less dividends accrues to retained earnings."
},
{
"q": "Buying $50 of inventory with cash hits the income statement:",
"o": [
"Immediately as COGS",
"Not at all until sold",
"As revenue",
"As an expense"
],
"a": 1,
"e": "Inventory is capitalised; COGS is recognised only on sale."
},
{
"q": "A rise in accounts receivable is, on the CFS, a:",
"o": [
"Source of cash",
"Use of cash",
"Financing item",
"Non-event"
],
"a": 1,
"e": "Revenue booked but not collected reduces operating cash flow."
},
{
"q": "Accrual accounting recognises revenue when:",
"o": [
"Cash arrives",
"It is earned",
"The order is placed",
"The year ends"
],
"a": 1,
"e": "Revenue is booked as performance obligations are satisfied."
},
{
"q": "A deferred tax liability typically arises when:",
"o": [
"Book D&A > tax D&A",
"Tax (accelerated) D&A > book D&A early on",
"Cash taxes rise now",
"Dividends are paid"
],
"a": 1,
"e": "Lower cash taxes now reverse later, creating a DTL."
},
{
"q": "Stock-based compensation on the CFS is:",
"o": [
"A financing outflow",
"A non-cash add-back to CFO",
"Ignored",
"Revenue"
],
"a": 1,
"e": "SBC reduces NI but uses no cash, so it is added back."
},
{
"q": "The balance-sheet identity is:",
"o": [
"Assets = Liabilities − Equity",
"Assets = Liabilities + Equity",
"Equity = Assets + Liabilities",
"Assets = Revenue − Costs"
],
"a": 1,
"e": "Assets are funded by liabilities plus equity."
},
{
"q": "Why is the cash flow statement considered the most reliable?",
"o": [
"It is audited more",
"It reconciles accrual NI to real cash and is hard to game",
"It is shortest",
"It ignores taxes"
],
"a": 1,
"e": "It strips out accrual judgement to show actual cash movement."
}
]
},
{
"id": "valuation",
"title": "Valuation",
"tag": "EV, DCF and multiples",
"body": "<p><b>Why it matters.</b> Valuation is the core craft of banking and investing. The two recurring tests are (1) the difference between enterprise and equity value and (2) matching the right metric to the right value.</p>\n <h4>Enterprise vs equity value</h4>\n <p><b>Enterprise value</b> is the value of the whole operating business to <i>all</i> capital providers: EV = equity value + debt + preferred + minority interest − cash (i.e. + net debt). <b>Equity value</b> (market cap) is what common shareholders own. The matching rule: EV pairs with pre-interest, whole-firm metrics (EBITDA, EBIT, Revenue); equity value pairs with post-interest metrics (net income, EPS). EV/Net Income or P/EBITDA are meaningless mismatches.</p>\n <h4>The three approaches</h4>\n <p><b>DCF</b> (intrinsic): project unlevered free cash flow, discount at WACC, add a terminal value, get enterprise value. <b>Comparable companies</b> (relative): apply peers’ trading multiples — minority, standalone values. <b>Precedent transactions</b>: apply multiples paid in past M&A — these include a control premium and usually sit highest on the \"football field.\"</p>\n <h4>DCF mechanics</h4>\n <p>WACC = (E/V)×cost of equity + (D/V)×after-tax cost of debt. Cost of equity via CAPM = risk-free (10-yr Treasury) + beta × equity risk premium. Terminal value, often 60–80% of total value, is either a perpetuity-growth (g ≤ GDP) or an exit-multiple calculation. A higher WACC or lower growth lowers value.</p>\n <h4>P/E and the Gordon Growth link</h4>\n <p>A favourite conceptual question: justified leading P/E = (1−b)/(r−g), where b is the retention ratio, r the cost of equity and g = retention × ROE. This shows <i>why</i> high-growth, high-payout, low-risk firms command high P/Es — the multiple is just a compressed DCF.</p>\n <h4>Traps</h4>\n <p>Use after-tax cost of debt in WACC. Unlever and relever beta (Hamada) when capital structures differ. Private companies carry an illiquidity discount; control changes hands at a premium. Earning ROE above the cost of equity justifies a price above book.</p>",
"quiz": [
{
"q": "Enterprise value equals equity value plus:",
"o": [
"Cash − debt",
"Net debt (+ preferred + NCI)",
"Total assets",
"Goodwill"
],
"a": 1,
"e": "EV = equity value + debt + preferred + NCI − cash."
},
{
"q": "Which metric pairs correctly with EV?",
"o": [
"Net income",
"EPS",
"EBITDA",
"Dividends"
],
"a": 2,
"e": "EV is pre-interest, so it pairs with EBITDA/EBIT/Revenue."
},
{
"q": "Unlevered FCF is discounted at:",
"o": [
"Cost of equity",
"WACC",
"Cost of debt",
"Risk-free rate"
],
"a": 1,
"e": "Unlevered FCF → WACC → enterprise value."
},
{
"q": "Terminal value usually represents:",
"o": [
"A small share",
"60–80% of DCF value",
"Only year 1",
"Net debt"
],
"a": 1,
"e": "TV dominates DCF value, so its assumptions matter most."
},
{
"q": "Precedent transactions tend to be highest on the football field because they include:",
"o": [
"A liquidity discount",
"A control premium",
"Lower growth",
"Higher taxes"
],
"a": 1,
"e": "Acquirers pay ~20–40% control premiums."
},
{
"q": "Justified leading P/E from Gordon Growth is:",
"o": [
"(1−b)/(r−g)",
"b/(r+g)",
"(r−g)/(1−b)",
"g/r"
],
"a": 0,
"e": "Payout/(r−g) = (1−b)/(r−g)."
},
{
"q": "Cost of debt in WACC should be:",
"o": [
"The coupon",
"After-tax",
"The risk-free rate",
"Zero"
],
"a": 1,
"e": "Interest is tax-deductible: Rd×(1−T)."
},
{
"q": "Sustainable growth g equals:",
"o": [
"Payout × ROE",
"Retention × ROE",
"ROE − r",
"Dividend yield"
],
"a": 1,
"e": "g = b × ROE."
},
{
"q": "A private company versus an identical public one usually trades at a:",
"o": [
"Control premium",
"Illiquidity discount",
"Growth premium",
"Tax credit"
],
"a": 1,
"e": "Lack of marketability warrants a discount (DLOM)."
},
{
"q": "Higher WACC, all else equal:",
"o": [
"Raises value",
"Lowers value",
"No effect",
"Raises growth"
],
"a": 1,
"e": "A higher discount rate shrinks present value."
}
]
},
{
"id": "mna",
"title": "Mergers & Acquisitions",
"tag": "Accretion, synergies and structure",
"body": "<p><b>Why it matters.</b> M&A advisory is the heart of investment banking. The defining technical skill is the accretion/dilution analysis — does the deal raise or lower the acquirer’s EPS?</p>\n <h4>Accretion / dilution</h4>\n <p>The acquirer funds a deal with cash, debt, stock, or a mix. Combine the target’s net income (plus after-tax synergies, minus after-tax financing cost) and divide by the new share count. If pro forma EPS > standalone EPS, the deal is accretive. The classic shortcut: an all-stock deal is accretive when the acquirer’s P/E exceeds the target’s; cash/debt is accretive when its after-tax cost is below the target’s earnings yield.</p>\n <h4>Strategic vs financial buyers</h4>\n <p>Strategics can realise <b>synergies</b> with their existing operations and often pay higher premiums. Cost synergies (removing duplication) are more credible than revenue synergies (cross-selling). Financial buyers (PE) are bounded by return math, though add-ons can let them bid like strategics.</p>\n <h4>Purchase accounting</h4>\n <p>In a deal, you write the target’s assets to fair value, create intangibles and a deferred tax liability (book write-ups not recognised for tax), and the residual is <b>goodwill</b> = equity purchase price − fair value of net identifiable assets + new DTL. The DTL <i>increases</i> goodwill because it is a liability needing an offsetting asset.</p>\n <h4>Structure & tax</h4>\n <p>In a stock deal, the buyer takes carryover basis and goodwill is <i>not</i> tax-deductible. In an asset deal (or a 338(h)(10) election), the buyer gets a stepped-up basis and deductible goodwill over 15 years — but the seller may face a higher tax bill. Sellers usually prefer stock; buyers prefer assets.</p>\n <h4>The big caveat</h4>\n <p>EPS accretion is not value creation. A deal can lift EPS yet destroy value if the premium and synergy assumptions are wrong. Always separate the accounting answer from the economic one.</p>",
"quiz": [
{
"q": "An all-stock deal is accretive when:",
"o": [
"Acquirer P/E < target P/E",
"Acquirer P/E > target P/E",
"P/Es equal",
"Target has no debt"
],
"a": 1,
"e": "Higher acquirer P/E means buying cheaper earnings, lifting EPS."
},
{
"q": "Synergies in the model should be added:",
"o": [
"Pre-tax",
"After tax",
"At double",
"Never"
],
"a": 1,
"e": "They flow through the P&L and are taxed."
},
{
"q": "Goodwill created ≈:",
"o": [
"Purchase price",
"Equity price − FV of net identifiable assets (+ new DTL)",
"Target book equity",
"Cash paid"
],
"a": 1,
"e": "Goodwill is the residual after fair-value write-ups."
},
{
"q": "A new DTL in purchase accounting arises because asset write-ups are:",
"o": [
"Recognised for tax",
"Recognised for book but not tax",
"Cash items",
"Synergies"
],
"a": 1,
"e": "Book>tax depreciation later creates the DTL."
},
{
"q": "Cost synergies versus revenue synergies are generally:",
"o": [
"Less credible",
"More credible and faster",
"Tax-free",
"Recorded as goodwill"
],
"a": 1,
"e": "Cutting duplication is more controllable than winning new revenue."
},
{
"q": "In a stock purchase (no 338), acquired goodwill is:",
"o": [
"Tax-deductible",
"Not tax-deductible",
"Expensed at close",
"Amortised for book"
],
"a": 1,
"e": "Carryover basis means no tax deduction."
},
{
"q": "Sellers usually prefer a stock sale because it is:",
"o": [
"Double-taxed",
"Taxed once at capital-gains rates",
"Creates a DTL",
"Deductible"
],
"a": 1,
"e": "Stock sales are typically single-taxed for the seller."
},
{
"q": "Strategic buyers often pay more than financial buyers due to:",
"o": [
"Lower taxes",
"Synergies",
"No debt",
"Index inclusion"
],
"a": 1,
"e": "Synergies with existing operations justify a higher price."
},
{
"q": "Transaction (enterprise) value differs from offer (equity) value by:",
"o": [
"Synergies",
"Target net debt assumed",
"Goodwill",
"Fees"
],
"a": 1,
"e": "Add the target’s net debt to the equity offer."
},
{
"q": "EPS accretion:",
"o": [
"Always means value creation",
"Does not by itself equal value creation",
"Is illegal",
"Equals IRR"
],
"a": 1,
"e": "A deal can be accretive yet value-destructive if assumptions are wrong."
}
]
},
{
"id": "lbo",
"title": "Leveraged Buyouts",
"tag": "How PE makes money",
"body": "<p><b>Why it matters.</b> The LBO is the engine of private equity and the most-tested PE skill. A \"paper LBO\" — estimating returns with mental math — is a standard screen.</p>\n <h4>The structure</h4>\n <p>A sponsor buys a company using a small slice of equity and a large slice of debt. <b>Sources</b> (debt tranches + sponsor equity + rollover) must equal <b>uses</b> (purchase the equity, refinance existing debt, pay fees, fund cash to the balance sheet). Leverage amplifies equity returns and the interest is tax-deductible — at the cost of higher risk.</p>\n <h4>The capital structure</h4>\n <p>From senior to junior: revolver (working capital), Term Loan A (amortising, bank), Term Loan B (institutional, ~1% amortisation, often cov-lite), senior notes (bullet, incurrence covenants), subordinated/mezzanine (junior, higher yield, sometimes warrants), and PIK (interest accrues to principal). Key credit metrics: leverage = Debt/EBITDA; coverage = EBITDA/Interest.</p>\n <h4>Returns drivers</h4>\n <p>Three levers: <b>deleveraging</b> (free cash flow pays down debt, so equity grows), <b>EBITDA growth</b> (organic, margin, or add-ons), and <b>multiple expansion</b> (exit higher than entry — the least reliable). With a flat multiple, returns come from growth and debt paydown.</p>\n <h4>The math</h4>\n <p>Entry EV = EBITDA × entry multiple. Project FCF (≈ EBITDA − interest − taxes − capex − ΔNWC) sweeping debt. Exit equity = exit EBITDA × exit multiple − net debt. MOIC = exit equity / entry equity; IRR = MOIC^(1/years) − 1. Memorise: 2x/5y ≈ 15%, 3x/5y ≈ 25%.</p>\n <h4>The ideal target</h4>\n <p>Stable, predictable cash flows; strong market position; modest capex; an asset base to collateralise debt; and room for operational improvement or add-ons. Dividend recaps and bolt-ons are common value-creation tools.</p>",
"quiz": [
{
"q": "With entry multiple = exit multiple, returns come from:",
"o": [
"Dividends",
"EBITDA growth + deleveraging",
"Buybacks",
"Lower taxes only"
],
"a": 1,
"e": "A flat multiple leaves growth and debt paydown as the drivers."
},
{
"q": "2.0x MOIC over 5 years ≈:",
"o": [
"8%",
"15%",
"25%",
"40%"
],
"a": 1,
"e": "2^(1/5)−1 ≈ 15%."
},
{
"q": "PE uses leverage to:",
"o": [
"Cut tax to zero",
"Amplify equity returns and use the tax shield",
"Satisfy regulators",
"Lower EBITDA"
],
"a": 1,
"e": "Debt magnifies returns on a smaller cheque; interest is deductible."
},
{
"q": "Which is a USE of funds?",
"o": [
"Sponsor equity",
"New term loan",
"Purchasing the target’s equity",
"Rollover equity"
],
"a": 2,
"e": "Uses = what the cash buys; sources fund it."
},
{
"q": "A Term Loan B is typically:",
"o": [
"A revolver",
"Institutional, ~1% amortisation, often cov-lite",
"Subordinated PIK",
"Equity"
],
"a": 1,
"e": "TLB is the institutional, lightly amortising tranche."
},
{
"q": "Leverage ratio is:",
"o": [
"EBITDA/Interest",
"Debt/EBITDA",
"FCF/Debt",
"Equity/Assets"
],
"a": 1,
"e": "Debt/EBITDA measures turns of leverage."
},
{
"q": "A cash sweep:",
"o": [
"Pays dividends",
"Uses excess FCF to repay debt",
"Issues equity",
"Raises capex"
],
"a": 1,
"e": "Sweeps accelerate deleveraging."
},
{
"q": "Holding MOIC fixed, a shorter hold gives:",
"o": [
"Lower IRR",
"Higher IRR",
"Same IRR",
"Zero IRR"
],
"a": 1,
"e": "Same multiple faster compounds at a higher rate."
},
{
"q": "An ideal LBO candidate has:",
"o": [
"Volatile cash flows",
"Stable, predictable cash flows",
"No assets",
"Declining revenue"
],
"a": 1,
"e": "Predictable cash supports leverage and paydown."
},
{
"q": "Rollover equity is:",
"o": [
"A debt tranche",
"Existing owners reinvesting proceeds as equity",
"A dividend",
"A fee"
],
"a": 1,
"e": "Sellers roll a stake into NewCo, aligning incentives."
}
]
},
{
"id": "levfin",
"title": "Debt & Leveraged Finance",
"tag": "Funding the deal",
"body": "<p><b>Why it matters.</b> Leveraged finance arranges and underwrites the debt that funds LBOs, refinancings and dividend recaps, then syndicates it to credit investors. It sits between the sponsor and the credit markets.</p>\n <h4>The instruments</h4>\n <p><b>Leveraged loans</b> are senior secured, floating-rate (a base rate like SOFR plus a spread), and usually amortise lightly (TLB ~1%/yr). <b>High-yield bonds</b> are fixed-rate, longer-dated, bullet-repayment and carry incurrence covenants. Sponsors choose between them based on rate view, flexibility and maturity needs.</p>\n <h4>Covenants</h4>\n <p><b>Maintenance covenants</b> are tested periodically (e.g. quarterly leverage tests) regardless of borrower action; <b>incurrence covenants</b> only bite when the borrower does something (raises debt, pays a dividend, makes an acquisition). \"Covenant-lite\" loans drop maintenance tests and now dominate the leveraged-loan market.</p>\n <h4>Seniority and recovery</h4>\n <p>The capital structure runs senior secured → senior unsecured → subordinated → preferred → equity. Secured lenders have a claim on collateral and recover more in default. Credit metrics that gate capacity: Debt/EBITDA (leverage), EBITDA/Interest (coverage), and (EBITDA−capex)/(interest+principal) (fixed-charge coverage).</p>\n <h4>Bank vs private credit</h4>\n <p>Historically banks arranged broadly syndicated loans. Post-GFC regulation pushed banks to retrench, and <b>private-credit direct lenders</b> filled the gap — now funding the majority of mid-market LBO debt. Sponsors value private credit for speed, certainty of close and confidentiality, accepting a higher spread.</p>\n <h4>Mechanics</h4>\n <p>Original issue discount (OID) means lenders fund below par, so face debt raises less cash. Yields rise with credit risk; ratings below BBB−/Baa3 are high yield. Floating-rate loans protect lenders from rate moves; fixed-rate bonds protect borrowers.</p>",
"quiz": [
{
"q": "Leveraged loans are typically:",
"o": [
"Fixed-rate unsecured",
"Floating-rate senior secured",
"Equity-linked",
"Tax-exempt"
],
"a": 1,
"e": "Senior secured, floating-rate, lightly amortising."
},
{
"q": "High-yield bonds versus loans are usually:",
"o": [
"Floating and amortising",
"Fixed-rate, bullet, incurrence covenants",
"Senior secured",
"Investment grade"
],
"a": 1,
"e": "Fixed-rate, longer-dated, bullet repayment."
},
{
"q": "A maintenance covenant is tested:",
"o": [
"Only on borrower action",
"Periodically regardless of action",
"Never",
"At maturity"
],
"a": 1,
"e": "Maintenance = ongoing compliance; incurrence = on action."
},
{
"q": "\"Covenant-lite\" means the loan lacks:",
"o": [
"Collateral",
"Maintenance covenants",
"A coupon",
"A maturity"
],
"a": 1,
"e": "Cov-lite drops maintenance tests; now the market norm."
},
{
"q": "Investment grade begins at:",
"o": [
"BB+/Ba1",
"BBB−/Baa3",
"A−/A3",
"CCC"
],
"a": 1,
"e": "BBB−/Baa3 is the lowest IG notch."
},
{
"q": "Private credit grew mainly because:",
"o": [
"Banks expanded lending",
"Post-GFC regulation made banks retrench",
"Rates hit zero forever",
"Borrowing stopped"
],
"a": 1,
"e": "Direct lenders filled the gap banks left."
},
{
"q": "Secured debt recovers more in default because it has:",
"o": [
"A higher coupon",
"A claim on collateral",
"Tax priority",
"Shorter duration"
],
"a": 1,
"e": "Collateral gives first claim on specific assets."
},
{
"q": "OID (original issue discount) effectively:",
"o": [
"Raises cash above par",
"Means lenders fund below par, so less cash is raised",
"Is equity",
"Is tax-free"
],
"a": 1,
"e": "Below-par funding is a cost to the borrower."
},
{
"q": "Floating-rate debt protects:",
"o": [
"Borrowers from rate rises",
"Lenders from rate moves",
"No one",
"Equity holders"
],
"a": 1,
"e": "Coupons reset with the base rate, reducing lender rate risk."
},
{
"q": "Interest coverage is:",
"o": [
"Debt/EBITDA",
"EBITDA/Interest",
"Capex/EBITDA",
"Revenue/Interest"
],
"a": 1,
"e": "EBITDA over interest gauges debt-service ability."
}
]
},
{
"id": "restructuring",
"title": "Restructuring & Distressed",
"tag": "When the capital structure breaks",
"body": "<p><b>Why it matters.</b> Restructuring advisory (sell-side) and distressed/special-situations investing (buy-side) are two sides of the same table. The work turns on bankruptcy law, capital-structure priority and recovery analysis.</p>\n <h4>Chapter 11 vs Chapter 7</h4>\n <p><b>Chapter 11</b> is reorganisation: the company keeps operating as a debtor-in-possession, an automatic stay halts creditors, and it negotiates a plan of reorganisation. <b>Chapter 7</b> is liquidation: a trustee sells the assets and the business ceases. A good business with a bad balance sheet usually pursues Chapter 11.</p>\n <h4>The waterfall and absolute priority</h4>\n <p>Recoveries follow the <b>absolute priority rule</b>: super-priority/DIP → secured → priority unsecured (taxes, wages) → general unsecured → preferred → common equity. Senior classes must be made whole before junior classes receive anything.</p>\n <h4>The fulcrum security</h4>\n <p>The <b>fulcrum security</b> is the class where enterprise value \"runs out\" — the most junior tranche that still receives partial recovery. Because the shortfall is made up with equity in the reorganised company, the fulcrum is the class most likely to convert into the new equity. It is the prime target for <b>loan-to-own</b> investors who buy it cheaply to gain control.</p>\n <h4>Tools</h4>\n <p><b>DIP financing</b> has super-priority to entice lending to a bankrupt firm. A <b>debt-for-equity swap</b> de-levers by converting creditor claims to stock. A <b>363 sale</b> sells assets free and clear of liens, fast. A <b>liquidation analysis</b> sets the recovery floor — the \"best interests\" test requires creditors get at least their hypothetical Chapter 7 recovery.</p>\n <h4>The mindset</h4>\n <p>Distressed investors underwrite enterprise value, model the claims waterfall, and assess whether reorganisation or liquidation produces more — then position in the security most likely to capture that value.</p>",
"quiz": [
{
"q": "The fulcrum security is:",
"o": [
"The senior secured loan",
"The most junior class still recovering partially — likely converted to equity",
"Common equity",
"Payables"
],
"a": 1,
"e": "Value breaks here; holders usually get the new equity."
},
{
"q": "Chapter 11 is:",
"o": [
"Liquidation",
"Reorganisation as a going concern",
"For individuals only",
"A tax filing"
],
"a": 1,
"e": "Chapter 11 restructures while operating; Chapter 7 liquidates."
},
{
"q": "The absolute priority rule means:",
"o": [
"Equity first",
"Senior claims paid fully before junior claims",
"Equal sharing",
"Lenders last"
],
"a": 1,
"e": "Strict seniority governs recoveries."
},
{
"q": "DIP financing carries:",
"o": [
"Lowest priority",
"Super-priority over existing claims",
"No interest",
"Equity only"
],
"a": 1,
"e": "Super-priority entices lending to a bankrupt firm."
},
{
"q": "\"Loan-to-own\" is:",
"o": [
"A mortgage",
"Buying the fulcrum debt to convert it to equity control",
"An IPO",
"A recap"
],
"a": 1,
"e": "Investors gain control through the restructuring."
},
{
"q": "A debt-for-equity swap:",
"o": [
"Adds leverage",
"Converts creditor claims into equity, de-levering",
"Pays a coupon",
"Is illegal"
],
"a": 1,
"e": "It reduces debt and reallocates ownership."
},
{
"q": "A liquidation analysis sets:",
"o": [
"Going-concern value",
"The recovery floor / Chapter 7 benchmark",
"Share price",
"EBITDA"
],
"a": 1,
"e": "It anchors the \"best interests\" test."
},
{
"q": "A 363 sale lets assets be sold:",
"o": [
"With liabilities attached",
"Free and clear of most liens, quickly",
"Only after a plan",
"To insiders only"
],
"a": 1,
"e": "Section 363 enables a fast, clean sale."
},
{
"q": "Why might a sound business still restructure?",
"o": [
"Weak products",
"An over-levered balance sheet it cannot service",
"Excess cash",
"High margins"
],
"a": 1,
"e": "Fixing the capital structure restores viability."
},
{
"q": "Restructuring advisory is the sell-side counterpart to:",
"o": [
"Equity research",
"Distressed/special-situations investing",
"Asset management",
"Sales & trading"
],
"a": 1,
"e": "Advisors and distressed investors negotiate across the table."
}
]
},
{
"id": "ecm",
"title": "Equity Capital Markets",
"tag": "Raising equity",
"body": "<p><b>Why it matters.</b> ECM sits between issuers who need equity and the investors who buy it. It runs IPOs, follow-on offerings and convertibles, and advises on timing, structure and price.</p>\n <h4>Primary vs secondary</h4>\n <p>In a <b>primary</b> offering the company issues new shares and keeps the proceeds (dilutive to existing holders). In a <b>secondary</b> offering, existing holders sell their shares and the company gets nothing. An IPO can contain both.</p>\n <h4>The IPO process</h4>\n <p>Underwriters run due diligence, draft the prospectus, set a price range, then go on a <b>roadshow</b> to build a demand book (<b>bookbuilding</b>). The deal is priced the night before listing. A <b>greenshoe</b> (over-allotment) lets underwriters sell ~15% more shares to stabilise the aftermarket. A <b>lockup</b> (~180 days) restricts insider selling post-IPO. In a firm-commitment underwriting, the bank buys the issue and bears resale risk.</p>\n <h4>Other equity products</h4>\n <p><b>Follow-ons</b> raise more equity after listing. <b>Convertible bonds</b> are debt with an option to convert into shares — lower coupon in exchange for equity upside, useful for issuers wanting cheaper financing with less immediate dilution. <b>Rights issues</b> offer existing holders the chance to buy new shares pro rata.</p>\n <h4>Dilution</h4>\n <p>Issuing equity spreads earnings over more shares, lowering EPS unless the proceeds earn a high enough return. That trade-off — cheaper risk profile (no fixed charges) versus dilution — is the core ECM judgement, and it ties directly to the cost of equity.</p>\n <h4>Market windows</h4>\n <p>Equity issuance is highly sensitive to market conditions — volatility, valuations and investor appetite open and close \"windows,\" which is why timing advice is central to the role.</p>",
"quiz": [
{
"q": "A primary offering:",
"o": [
"Sells existing shares",
"Issues new shares; the company keeps proceeds",
"Avoids dilution",
"Pays a dividend"
],
"a": 1,
"e": "New shares raise capital for the company."
},
{
"q": "The greenshoe option lets underwriters:",
"o": [
"Cancel the deal",
"Sell ~15% extra shares to stabilise price",
"Lower the fee",
"Skip the roadshow"
],
"a": 1,
"e": "Over-allotment supports aftermarket stability."
},
{
"q": "An IPO lockup typically:",
"o": [
"Lasts 30 days",
"Restricts insider selling ~180 days",
"Applies to banks only",
"Is optional"
],
"a": 1,
"e": "Lockups prevent an immediate insider supply glut."
},
{
"q": "Bookbuilding refers to:",
"o": [
"Auditing",
"Gathering investor demand to set the price",
"Lending",
"Trading"
],
"a": 1,
"e": "The roadshow builds a demand book that informs pricing."
},
{
"q": "A convertible bond is:",
"o": [
"Pure equity",
"Debt plus an option to convert to equity",
"A government bond",
"A repo"
],
"a": 1,
"e": "Lower coupon traded for equity upside."
},
{
"q": "In a firm-commitment underwriting the bank:",
"o": [
"Acts best-efforts",
"Buys the issue and bears resale risk",
"Only advises",
"Lends to the firm"
],
"a": 1,
"e": "The underwriter takes the resale risk."
},
{
"q": "Issuing equity rather than debt:",
"o": [
"Raises leverage",
"Dilutes holders but lowers financial risk",
"Adds interest expense",
"Is tax-deductible"
],
"a": 1,
"e": "No fixed charges, but ownership/earnings are spread wider."
},
{
"q": "A secondary offering means:",
"o": [
"New shares for the company",
"Existing holders sell; company gets nothing",
"Always cheaper",
"No underwriter"
],
"a": 1,
"e": "Proceeds go to selling shareholders, not the company."
},
{
"q": "Equity issuance volumes are most sensitive to:",
"o": [
"Tax filing dates",
"Market conditions/volatility and valuations",
"Coupon rates",
"Inventory levels"
],
"a": 1,
"e": "Windows open and close with sentiment and valuations."
},
{
"q": "A follow-on offering is:",
"o": [
"The first sale of stock",
"An additional equity raise after the IPO",
"A bond",
"A buyback"
],
"a": 1,
"e": "It raises further equity post-listing."
}
]
},
{
"id": "st",
"title": "Sales & Trading",
"tag": "Markets and liquidity",
"body": "<p><b>Why it matters.</b> Sales & trading is the markets engine of a bank: it makes markets, executes institutional orders and provides liquidity. Unlike investing roles, it earns the <b>bid-ask spread</b> and commissions rather than investment returns.</p>\n <h4>Primary vs secondary markets</h4>\n <p>Capital is first raised in the <b>primary</b> market (issuance via ECM/DCM). Thereafter securities trade in the <b>secondary</b> market, where S&T provides the liquidity that lets investors enter and exit. Deep secondary markets lower issuers’ cost of capital.</p>\n <h4>Market making</h4>\n <p>A market maker quotes a price to buy (bid) and to sell (ask) and profits from the spread while bearing inventory risk. Tighter spreads mean more liquidity. Prime brokerage extends financing, custody and securities lending to hedge-fund clients.</p>\n <h4>Rates and the yield curve</h4>\n <p>The <b>yield curve</b> plots yield against maturity. It is normally upward-sloping. The <b>short end</b> is driven by central-bank policy; the <b>long end</b> by growth and inflation expectations. An <b>inverted</b> curve (short rates above long) has historically preceded recessions.</p>\n <h4>Bonds and rate risk</h4>\n <p>Bond prices move inversely to yields. <b>Duration</b> measures price sensitivity to rate changes — longer maturities and lower coupons have higher duration and thus larger price swings. Floating-rate instruments reset with a base rate, reducing rate risk.</p>\n <h4>The buy-side relationship</h4>\n <p>S&T serves hedge funds and asset managers with execution, liquidity and research access. The sell-side earns flow-based revenue; the buy-side earns investment returns — a symbiotic but distinct split.</p>",
"quiz": [
{
"q": "Sales & trading earns revenue primarily from:",
"o": [
"Investment returns",
"The bid-ask spread and commissions",
"Management fees",
"Carry"
],
"a": 1,
"e": "It is flow/spread-based, not return-based."
},
{
"q": "The secondary market is where:",
"o": [
"New shares are issued",
"Existing securities trade and liquidity is provided",
"Companies file 10-Ks",
"Loans originate"
],
"a": 1,
"e": "Primary = issuance; secondary = trading."
},
{
"q": "An inverted yield curve has historically:",
"o": [
"Signalled boom",
"Often preceded recessions",
"No meaning",
"Meant low inflation only"
],
"a": 1,
"e": "Inversions tend to lead downturns."
},
{
"q": "The short end of the curve is driven by:",
"o": [
"30-year inflation",
"Central-bank policy rates",
"Equity prices",
"Commodities"
],
"a": 1,
"e": "Front-end tracks policy expectations."
},
{
"q": "Bond prices and yields move:",
"o": [
"Together",
"Inversely",
"Independently",
"Only with ratings"
],
"a": 1,
"e": "Higher yields lower the present value of coupons."
},
{
"q": "Duration measures:",
"o": [
"Time to coupon",
"Price sensitivity to rate changes",
"Default risk",
"Tax status"
],
"a": 1,
"e": "Longer maturity/lower coupon = higher duration."
},
{
"q": "A market maker bears:",
"o": [
"No risk",
"Inventory risk while quoting bid/ask",
"Only credit risk",
"Tax risk"
],
"a": 1,
"e": "Holding inventory to provide liquidity is the core risk."
},
{
"q": "Prime brokerage primarily serves:",
"o": [
"Retail savers",
"Hedge funds (financing, custody, securities lending)",
"Auditors",
"Issuers"
],
"a": 1,
"e": "Prime brokers support hedge-fund trading operations."
},
{
"q": "When rates rise, long-duration bonds:",
"o": [
"Rise",
"Fall more than short-duration bonds",
"Are unaffected",
"Convert to equity"
],
"a": 1,
"e": "Higher duration means larger declines."
},
{
"q": "Deep secondary-market liquidity tends to:",
"o": [
"Raise issuers’ cost of capital",
"Lower issuers’ cost of capital",
"Have no effect",
"Stop issuance"
],
"a": 1,
"e": "Liquidity reduces the premium investors demand."
}
]
},
{
"id": "markets",
"title": "Markets & Macro",
"tag": "Reading the environment",
"body": "<p><b>Why it matters.</b> \"What’s happening in markets?\" is a near-universal interview opener. It tests whether you follow rates, equities and the macro forces that move asset prices.</p>\n <h4>The yield curve</h4>\n <p>The yield curve maps interest rates across maturities. A <b>normal</b> curve slopes upward (longer money costs more). <b>Inversion</b> — short rates above long — reflects expectations of future rate cuts/slowdown and has historically preceded recessions. The Fed steers the short end; inflation and growth expectations steer the long end.</p>\n <h4>What drives rates</h4>\n <p>Central banks set policy rates to balance inflation and employment. Higher expected inflation pushes long yields up; weaker growth pulls them down. Real yields, inflation expectations and term premium together determine nominal yields.</p>\n <h4>Risk and discount rates</h4>\n <p>Rates are the gravity of all valuation. Higher rates raise discount rates and pressure long-duration assets (growth stocks, long bonds, real estate) the most. The equity risk premium is the extra return investors demand over the risk-free rate.</p>\n <h4>Cycles</h4>\n <p>Economies move through expansion, slowdown, recession and recovery. Credit spreads widen in stress and tighten in calm; defaults are cyclical, spiking in recessions. Cyclical sectors (industrials, financials, energy) swing with the cycle; defensives (staples, utilities, healthcare) hold up better.</p>\n <h4>How to answer the opener</h4>\n <p>Pick one or two themes (e.g. the rate path, an equity index level, a notable spread or commodity move), state the level and the why, and connect it to a consequence for issuers or investors. Specificity and a cause-and-effect chain beat a list of headlines.</p>",
"quiz": [
{
"q": "A normal yield curve:",
"o": [
"Slopes downward",
"Slopes upward (longer maturities yield more)",
"Is flat by rule",
"Is inverted"
],
"a": 1,
"e": "Investors usually demand more yield for longer maturities."
},
{
"q": "An inverted yield curve often:",
"o": [
"Signals strong growth",
"Precedes recessions",
"Means high inflation only",
"Has no signal"
],
"a": 1,
"e": "It reflects expected slowdown/rate cuts."
},
{
"q": "The Fed most directly controls:",
"o": [
"30-year yields",
"Short-term policy rates",
"Equity prices",
"Commodity supply"
],
"a": 1,
"e": "Policy rates anchor the short end."
},
{
"q": "Higher interest rates tend to hurt which assets most?",
"o": [
"Short bonds",
"Long-duration assets (growth stocks, long bonds, real estate)",
"Cash",
"Floating-rate loans"
],
"a": 1,
"e": "Higher discount rates hit long-duration cash flows hardest."
},
{
"q": "The equity risk premium is:",
"o": [
"The risk-free rate",
"The extra return demanded over the risk-free rate",
"A tax",
"A coupon"
],
"a": 1,
"e": "It compensates investors for equity risk."
},
{
"q": "Credit spreads typically:",
"o": [
"Tighten in recessions",
"Widen in stress and tighten in calm",
"Stay fixed",
"Track dividends"
],
"a": 1,
"e": "Spreads reflect perceived default risk."
},
{
"q": "Default rates are:",
"o": [
"Constant",
"Cyclical — higher in recessions",
"Always zero",
"Tax-driven"
],
"a": 1,
"e": "Defaults spike in downturns."
},
{
"q": "Defensive sectors include:",
"o": [
"Industrials and energy",
"Staples, utilities and healthcare",
"Semiconductors",
"Airlines"
],
"a": 1,
"e": "Defensives hold up better through the cycle."
},
{
"q": "Long-end yields are most driven by:",
"o": [
"Today’s policy rate only",
"Growth and inflation expectations",
"Share buybacks",
"Dividend dates"
],
"a": 1,
"e": "The long end prices the macro outlook."
},
{
"q": "A strong answer to \"what’s happening in markets?\" should:",
"o": [
"List many headlines",
"Give a level, a cause, and a consequence",
"Avoid specifics",
"Quote one stock price"
],
"a": 1,
"e": "Specific cause-and-effect beats a headline list."
}
]
},
{
"id": "hedge",
"title": "Hedge Funds",
"tag": "Strategies and alpha",
"body": "<p><b>Why it matters.</b> Hedge funds are buy-side investors that trade public securities across the capital structure, aiming to generate <b>alpha</b> (returns above a benchmark). They typically charge a management fee plus performance fees on gains.</p>\n <h4>Core strategies</h4>\n <p><b>Long/short equity</b> buys undervalued names and shorts overvalued ones, aiming to profit on the spread while reducing market exposure. <b>Global macro</b> trades rates, currencies and indices on top-down views. <b>Event-driven</b> (incl. merger arbitrage) trades around catalysts like deals, spin-offs and restructurings. <b>Credit / distressed</b> trades across the debt stack. <b>Relative value / arbitrage</b> exploits pricing anomalies between related securities.</p>\n <h4>Long and short</h4>\n <p>A long position profits when a security rises. A <b>short</b> sells borrowed stock hoping to buy it back cheaper — profiting from declines but with theoretically unlimited downside. <b>Net</b> and <b>gross</b> exposure describe how directional and how leveraged a book is.</p>\n <h4>What they need from the sell-side</h4>\n <p>Hedge funds consume sell-side research, execute through trading desks, and rely on prime brokerage for financing and securities lending. They take and provide liquidity in secondary markets.</p>\n <h4>The skill</h4>\n <p>The job rewards a differentiated view: deep valuation, a clear catalyst and an understanding of why the market is mispricing a security. Risk management — position sizing, hedging, and managing net/gross exposure — is as important as idea generation.</p>\n <h4>Fees and alignment</h4>\n <p>Performance fees (carry above a hurdle/high-water mark) align managers with investors, but only true alpha — not market beta — justifies them. Distinguishing skill from market exposure is a central analytical theme.</p>",
"quiz": [
{
"q": "Hedge funds primarily aim to generate:",
"o": [
"Fees only",
"Alpha (returns above a benchmark)",
"Tax losses",
"Liquidity"
],
"a": 1,
"e": "The goal is excess risk-adjusted return."
},
{
"q": "A long/short equity fund:",
"o": [
"Only buys",
"Buys undervalued and shorts overvalued names",
"Only shorts",
"Holds cash"
],
"a": 1,
"e": "It profits on the long-short spread with reduced market exposure."
},
{
"q": "Shorting a stock profits when the price:",
"o": [
"Rises",
"Falls",
"Stays flat",
"Splits"
],
"a": 1,
"e": "You sell borrowed shares and buy back cheaper."
},
{
"q": "Merger arbitrage is a type of:",
"o": [
"Macro strategy",
"Event-driven strategy",
"Index fund",
"Bond ladder"
],
"a": 1,
"e": "It trades around the deal catalyst."
},
{
"q": "Global macro funds trade mainly on:",
"o": [
"Single-stock earnings",
"Top-down views on rates, FX and indices",
"Real estate deeds",
"Private loans"
],
"a": 1,
"e": "Macro is a top-down, cross-asset approach."
},
{
"q": "Gross exposure describes:",
"o": [
"Net direction only",
"Total long + short (leverage/activity)",
"Tax basis",
"Dividend yield"
],
"a": 1,
"e": "Gross = longs + shorts; net = longs − shorts."
},
{
"q": "Hedge funds rely on the sell-side for:",
"o": [
"Audits",
"Research, execution and prime brokerage",
"Tax filing",
"Issuance"
],
"a": 1,
"e": "Trading desks, research and financing support the book."
},
{
"q": "A short position’s theoretical downside is:",
"o": [
"Capped at cost",
"Unlimited (price can keep rising)",
"Zero",
"The dividend"
],
"a": 1,
"e": "Losses grow as the shorted price rises."
},
{
"q": "A performance fee is justified by:",
"o": [
"Market beta",
"True alpha above a hurdle/high-water mark",
"Gross exposure",
"Turnover"
],
"a": 1,
"e": "Only skill-based excess return warrants carry."
},
{
"q": "A strong hedge-fund thesis needs:",
"o": [
"A hot tip",
"A differentiated view, a catalyst and a mispricing reason",
"High turnover",
"Leverage alone"
],
"a": 1,
"e": "Edge comes from why the market is wrong and what will fix it."
}
]
},
{
"id": "industry",
"title": "Industry Verticals",
"tag": "Why sectors are valued differently",
"body": "<p><b>Why it matters.</b> Generic multiples break down across sectors. Each vertical has its own metrics and its own \"why this multiple\" logic — exactly what coverage interviews probe.</p>\n <h4>SaaS / Technology</h4>\n <p>Valued on revenue/ARR multiples because growth spend suppresses GAAP earnings. Watch net revenue retention (>100% = the base grows itself), the Rule of 40 (growth% + margin% ≥ 40), LTV/CAC (≥3:1), and gross margins (~70%+). Deferred revenue reflects prepaid subscriptions.</p>\n <h4>Financial Institutions (FIG)</h4>\n <p>Banks use P/B, P/TBV, ROE and ROTCE — <i>not</i> EV/EBITDA — because debt is their raw material. A bank trading above 1.0x P/TBV earns ROE above its cost of equity. Insurers use combined ratio and float.</p>\n <h4>Healthcare / Biotech</h4>\n <p>Pre-revenue biotech is valued with risk-adjusted NPV (rNPV) using clinical probabilities of success. Patent cliffs cut small-molecule revenue sharply at loss of exclusivity (biologics erode slower).</p>\n <h4>Real Estate / REITs</h4>\n <p>Valued on FFO/AFFO and NAV, not P/E, because GAAP property depreciation understates earnings. Cap rate = NOI/value; a lower cap rate implies a higher value. P/FFO is the REIT P/E.</p>\n <h4>Oil & Gas, Industrials, Consumer</h4>\n <p>E&P uses NAV, EV/EBITDAX and reserve/production multiples for a depleting asset. Industrials watch backlog, book-to-bill and operating leverage through the cycle. Consumer/retail track same-store sales, inventory turnover and unit economics.</p>",
"quiz": [
{
"q": "SaaS firms are valued on revenue multiples because:",
"o": [
"Huge dividends",
"They are often unprofitable on GAAP while growing",
"Revenue is non-cash",
"They have no costs"
],
"a": 1,
"e": "Growth spend suppresses earnings, so EV/Revenue is used."
},
{
"q": "Banks are valued on P/TBV and ROTCE rather than EV/EBITDA because:",
"o": [
"No earnings",
"Debt is their raw material",
"EBITDA is banned",
"No assets"
],
"a": 1,
"e": "Operating and financing are intertwined for banks."
},
{
"q": "REITs use FFO instead of P/E because net income is depressed by:",
"o": [
"Rent",
"Non-cash real-estate depreciation",
"Debt",
"Taxes"
],
"a": 1,
"e": "FFO adds back property depreciation."
},
{
"q": "Pre-revenue biotech is valued with:",
"o": [
"EV/EBITDA",
"Risk-adjusted NPV using probability of success",
"P/E",
"Dividend yield"
],
"a": 1,
"e": "rNPV weights pipeline cash flows by clinical PoS."
},
{
"q": "Net revenue retention above 100% means:",
"o": [
"Customers shrinking",
"The existing base grows revenue on its own",
"High churn",
"Negative margins"
],
"a": 1,
"e": "Expansion outweighs churn within the base."
},
{
"q": "A cap rate equals:",
"o": [
"NOI/value",
"value/NOI",
"FFO/price",
"debt/equity"
],
"a": 0,
"e": "Lower cap rate → higher value."
},
{
"q": "EBITDAX adds back to EBITDA:",
"o": [
"Interest",
"Exploration expense",
"Dividends",
"Taxes"
],
"a": 1,
"e": "It neutralises differing exploration accounting in E&P."
},
{
"q": "A book-to-bill above 1.0 in industrials means:",
"o": [
"Shrinking demand",
"Orders exceed revenue (backlog building)",
"Falling margins",
"Excess inventory"
],
"a": 1,
"e": "New orders outpace shipments."
},
{
"q": "Same-store sales exclude:",
"o": [
"Online sales",
"Newly opened/closed stores",
"Taxes",
"Marketing"
],
"a": 1,
"e": "Comps isolate organic growth."
},
{
"q": "The Rule of 40 for SaaS sums:",
"o": [
"Two margins",
"Growth% + profit margin% (≥40)",
"Churn + CAC",
"LTV + CAC"
],
"a": 1,
"e": "It balances growth against profitability."
}
]
},
{
"id": "behavioral",
"title": "Behavioral & Fit",
"tag": "The non-technical screen",
"body": "<p><b>Why it matters.</b> Strong technicals get you in the room; fit gets you the offer. Interviewers are deciding whether they want to work long hours next to you and whether your story is coherent and genuine.</p>\n <h4>The core questions</h4>\n <p>Expect \"walk me through your resume,\" \"why this firm / this group,\" \"why banking/PE,\" \"tell me about a time you led / failed / handled conflict,\" and \"what are your strengths and weaknesses.\" Each is a chance to show motivation, self-awareness and judgement.</p>\n <h4>Structure your answers</h4>\n <p>For behavioral stories, use <b>STAR</b>: Situation, Task, Action, Result. Keep it concise, quantify the result, and make your own contribution clear. For \"walk me through your resume,\" tell a forward-moving narrative: each step logically leads to wanting this role.</p>\n <h4>\"Why this firm\"</h4>\n <p>Be specific. Reference the firm’s deals, culture, sector strengths or people you’ve spoken to — not generic prestige. Genuine, researched reasons signal real interest and reduce flight-risk concerns.</p>\n <h4>Strengths, weaknesses and failure</h4>\n <p>Pick a real weakness with a credible improvement plan — not a humblebrag. For failure questions, own the mistake, show what you learned, and demonstrate growth. Maturity and accountability land better than a flawless façade.</p>\n <h4>Delivery</h4>\n <p>Be conversational, not robotic. Roll with curveballs, stay positive about past experiences and people, and keep answers tight — 60–90 seconds. Have 2–3 thoughtful questions ready; the interview is a two-way read.</p>",
"quiz": [
{
"q": "The recommended structure for behavioral stories is:",
"o": [
"PEEL",
"STAR (Situation, Task, Action, Result)",
"SWOT",
"DCF"
],
"a": 1,
"e": "STAR keeps stories concise and outcome-focused."
},
{
"q": "\"Walk me through your resume\" should be:",
"o": [
"A list of dates",
"A forward-moving narrative leading to this role",
"Only your GPA",
"A list of skills"
],
"a": 1,
"e": "Tell a coherent story toward the job."
},
{
"q": "A strong \"why this firm\" answer is:",
"o": [
"Generic prestige",
"Specific to deals, culture, people or sector",
"About pay",
"Memorised buzzwords"
],
"a": 1,
"e": "Specific, researched reasons signal genuine interest."
},
{
"q": "When discussing a weakness, you should:",
"o": [
"Give a humblebrag",
"Name a real one with an improvement plan",
"Deny having any",
"Blame others"
],
"a": 1,
"e": "Self-awareness plus a credible plan lands best."
},
{
"q": "For a failure question, the best approach is to:",
"o": [
"Avoid it",
"Own the mistake and show what you learned",
"Blame the team",
"Claim perfection"
],
"a": 1,
"e": "Accountability and growth matter more than a flawless record."
},
{
"q": "Behavioral answers should be roughly:",
"o": [
"10 seconds",
"60–90 seconds, concise",
"5 minutes",
"As long as possible"
],
"a": 1,
"e": "Tight, structured answers respect the interviewer."
},
{
"q": "You should speak about past employers/colleagues:",
"o": [
"Negatively",
"Positively/constructively",
"Not at all",
"Only about pay"
],
"a": 1,
"e": "Positivity signals maturity and team fit."
},
{
"q": "Good questions to ask the interviewer are:",
"o": [
"None",
"2–3 thoughtful, researched questions",
"Only about salary",
"Only about hours"
],
"a": 1,
"e": "Thoughtful questions show engagement; it is a two-way read."
},
{
"q": "Fit ultimately tests whether:",
"o": [
"You can do arithmetic",
"The team wants to work alongside you",
"You memorised the Red Book",
"You own a suit"
],
"a": 1,
"e": "Long hours make likability and reliability decisive."
},
{
"q": "The best delivery style is:",
"o": [
"Rehearsed and robotic",
"Conversational while still structured",
"Aggressive",
"Evasive"
],
"a": 1,
"e": "Be natural but organised; roll with curveballs."
}
]
}
];
