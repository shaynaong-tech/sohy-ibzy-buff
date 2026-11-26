/* Merge each module's lesson content into IBZY_TRACKS and build the flat card bank
   used by Browse, Drill and search. Card ids stay stable so progress never breaks. */
(function(){
  const bank=[];
  window.IBZY_TRACKS.forEach(T=>{
    const content=(window.IBZY_CONTENT||{})[T.id]; if(!content) return;
    T.units.forEach(U=>{
      const src=(content.units||{})[U.id]; if(!src) return;
      U.lessons=src.map(L=>({id:L.id, title:L.title, pages:L.pages,
        cards:L.cards.map(c=>{ const card={id:c.id, topic:T.title, subtopic:U.title, lesson:L.id, type:'qa', difficulty:2,
          prompt:c.q, answer:c.a, page:c.p}; bank.push(card); return card; })}));
    });
  });
  window.IBZY_BANK=bank;
})();
