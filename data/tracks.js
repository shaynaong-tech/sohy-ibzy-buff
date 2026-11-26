/* Module list, in Red Book order. Units with no `lessons` show as "coming soon".
   Lesson content for a module is added by its own data file (e.g. data/accounting.js). */
window.IBZY_CONTENT = window.IBZY_CONTENT || {};
window.IBZY_TRACKS = [
  {id:'accounting', title:'Accounting', tag:'The language of business', pages:'pp. 12–43', primers:['accounting'], units:[
    {id:'acct-u1', title:'Financial Statements & Accrual Concepts', pages:'13–26'},
    {id:'acct-u2', title:'Financial Statement Analysis', pages:'27–34'},
    {id:'acct-u3', title:'Advanced Accounting', pages:'35–43'}]},
  {id:'valuation', title:'Valuation', tag:'EV, DCF and multiples', pages:'pp. 44–71', primers:['valuation'], units:[
    {id:'val-u1', title:'Corporate Finance Theory', pages:'45–53'},
    {id:'val-u2', title:'Intrinsic Valuation', pages:'54–64'},
    {id:'val-u3', title:'Relative Valuation', pages:'65–71'}]},
  {id:'mna', title:'Mergers & Acquisitions', tag:'Accretion, synergies and structure', pages:'pp. 72–89', primers:['mna'], units:[
    {id:'mna-u1', title:'M&A Concepts', pages:'73–80'},
    {id:'mna-u2', title:'Accretion/Dilution Modeling', pages:'81–89'}]},
  {id:'lbo', title:'Leveraged Buyouts', tag:'How PE makes money', pages:'pp. 90–110', primers:['lbo'], units:[
    {id:'lbo-u1', title:'Private Equity Investing', pages:'91–103'},
    {id:'lbo-u2', title:'LBO Modeling', pages:'104–110'}]},
  {id:'capmkts', title:'Capital Markets', tag:'Debt, equity and trading', pages:'pp. 111–164', primers:['levfin','ecm','markets','hedge','st'], units:[
    {id:'cm-u1', title:'Debt & Leveraged Finance', pages:'112–121'},
    {id:'cm-u2', title:'Equity Financing', pages:'122–132'},
    {id:'cm-u3', title:'General Market Knowledge', pages:'133–139'},
    {id:'cm-u4', title:'Hedge Fund Investing Strategies', pages:'140–154'},
    {id:'cm-u5', title:'Sales & Trading', pages:'155–164'}]},
  {id:'industry', title:'Industry Verticals', tag:'Why sectors are valued differently', pages:'pp. 165–259', primers:['industry','restructuring'], units:[
    {id:'ind-u1', title:'Technology, Media & Telecom (TMT)', pages:'167–181'},
    {id:'ind-u2', title:'Software as a Service (SaaS)', pages:'182–190'},
    {id:'ind-u3', title:'Financial Institutions (FIG)', pages:'191–203'},
    {id:'ind-u4', title:'Healthcare', pages:'204–216'},
    {id:'ind-u5', title:'Consumer Products & Retail', pages:'217–226'},
    {id:'ind-u6', title:'Financial Restructuring', pages:'227–240'},
    {id:'ind-u7', title:'Real Estate (REIT)', pages:'241–243'},
    {id:'ind-u8', title:'Real Estate Private Equity (REPE)', pages:'244–245'},
    {id:'ind-u9', title:'Industrials', pages:'246–256'},
    {id:'ind-u10', title:'Oil & Gas (O&G)', pages:'257–259'}]},
  {id:'behavioral', title:'Behavioral & Fit', tag:'The non-technical screen', pages:'pp. 260–285', primers:['behavioral'], units:[
    {id:'beh-u1', title:'Behavioral Interview Advice', pages:'261–266'},
    {id:'beh-u2', title:'Personal Background Questions', pages:'267–273'},
    {id:'beh-u3', title:'Firm Specific Questions', pages:'274–277'},
    {id:'beh-u4', title:'Past Experiences & Situational Questions', pages:'278–281'},
    {id:'beh-u5', title:'Elevator Test Questions', pages:'282–285'}]}
];
