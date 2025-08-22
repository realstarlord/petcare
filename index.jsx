import React, { useState, useEffect, useRef } from "react";

const foodData = [
  { emoji: "🍎", hunger: 10, dirt: 5 },
  { emoji: "🍕", hunger: 20, dirt: 10 },
  { emoji: "🥩", hunger: 25, dirt: 12 },
  { emoji: "🍌", hunger: 15, dirt: 6 },
  { emoji: "🥕", hunger: 8, dirt: 4 },
];

export default function PetCareGame() {
  const [pet, setPet] = useState({ hunger: 50, happiness: 50, energy: 50, cleanliness: 50, hp: 100 });
  const [coins, setCoins] = useState(10);
  const [busy, setBusy] = useState("");
  const [drops, setDrops] = useState([]);
  const [name, setName] = useState("My Pet");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [dead, setDead] = useState(false);

  const gameAreaRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        let newPet = {
          hunger: Math.max(0, prev.hunger - 1),
          happiness: Math.max(0, prev.happiness - 1),
          energy: Math.max(0, prev.energy - 1),
          cleanliness: Math.max(0, prev.cleanliness - 1),
          hp: prev.hp
        };
        ["hunger", "happiness", "energy", "cleanliness"].forEach(stat => {
          if(newPet[stat] === 0) newPet.hp = Math.max(0, newPet.hp - 1);
        });
        if(newPet.hp <= 0) setDead(true);
        return newPet;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if(!gameAreaRef.current) return;
      const areaWidth = gameAreaRef.current.offsetWidth;
      const size = Math.floor(Math.random()*40)+30;
      const isFood = Math.random()<0.4;
      let emoji = "🪙";
      let value = Math.ceil(size/10);
      let hunger=0,dirt=0;
      if(isFood){
        const food = foodData[Math.floor(Math.random()*foodData.length)];
        emoji = food.emoji;
        hunger = food.hunger;
        dirt = food.dirt;
        value=0;
      }
      const x = Math.random()*(areaWidth-size);
      const speed = isFood?(size/20)+1:(size/10)+1;
      setDrops(prev => [...prev,{id:Date.now()+Math.random(),x,y:0,size,value,emoji,isFood,hunger,dirt,speed}]);
    },4000);
    return ()=>clearInterval(interval);
  },[]);

  useEffect(()=>{
    let anim;
    const update = ()=>{
      setDrops(prev=>{
        const areaHeight = 400;
        return prev.map(d=>({...d,y:d.y+d.speed})).filter(d=>{
          if(d.y<areaHeight) return true;
          if(!d.isFood) setPet(p=>({...p,happiness:Math.max(0,p.happiness-2)}));
          return false;
        });
      });
      anim = requestAnimationFrame(update);
    };
    anim=requestAnimationFrame(update);
    return ()=>cancelAnimationFrame(anim);
  },[]);

  const handleCollect = (id, drop)=>{
    if(busy) return;
    if(drop.isFood){
      setPet(p=>({
        ...p,
        hunger: Math.min(100,p.hunger+drop.hunger),
        cleanliness: Math.max(0,p.cleanliness-drop.dirt)
      }));
    } else {
      setCoins(c=>c+drop.value);
      setPet(p=>({...p,energy:Math.max(0,p.energy-2)}));
    }
    setXp(x=>{
      const newXp=x+5;
      if(newXp>=100){
        setLevel(lvl=>lvl+1);
        setPet(p=>({...p,hp:p.hp+Math.floor(p.hp*0.2)}));
        return 0;
      }
      return newXp;
    });
    setDrops(prev=>prev.filter(d=>d.id!==id));
  };

  const handleAction = type=>{
    if(busy) return;
    let emoji="✨";
    if(type==="feed"){
      if(coins<5) return;
      setCoins(c=>c-5);
      setPet(prev=>({...prev,hunger:Math.min(100,prev.hunger+20)}));
      emoji="🍖";
    }
    if(type==="clean"){
      if(coins<3) return;
      setCoins(c=>c-3);
      setPet(prev=>({...prev,cleanliness:Math.min(100,prev.cleanliness+20)}));
      emoji="🧼";
    }
    if(type==="play"){
      setBusy("🎾");
      emoji="🎾";
      setTimeout(()=>{setPet(prev=>({...prev,happiness:Math.min(100,prev.happiness+20)}));setBusy("");},4000);
    }
    if(type==="sleep"){
      setBusy("🛏️");
      emoji="🛏️";
      setDrops([]);
      setTimeout(()=>{setPet(prev=>({...prev,energy:Math.min(100,prev.energy+20)}));setBusy("");},5000);
    }
  };

  const restartGame = ()=>{
    setPet({hunger:50,happiness:50,energy:50,cleanliness:50,hp:100});
    setCoins(10); setBusy(""); setDrops([]); setXp(0); setLevel(1); setDead(false);
  };

  return (
    <div style={{fontFamily:'sans-serif',userSelect:'none',textAlign:'center',padding:'20px'}}>
      {dead ? <div style={{position:'fixed',inset:0,backgroundColor:'black',color:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:999}}>
        <p style={{fontSize:'24px',marginBottom:'20px'}}>You didn’t care enough for your pet 💔</p>
        <button onClick={restartGame} style={{padding:'10px 20px',fontSize:'16px'}}>Start Over</button>
      </div> : <>
      <div>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} style={{fontSize:'24px',fontWeight:'bold',textAlign:'center'}} /> {busy}
      </div>
      <div>Coins: {coins} 🪙 | Level: {level}</div>
      <div style={{margin:'10px 0'}}>
        <button onClick={()=>handleAction("feed")} disabled={busy!==""}>Feed</button>
        <button onClick={()=>handleAction("play")} disabled={busy!==""}>Play</button>
        <button onClick={()=>handleAction("sleep")} disabled={busy!==""}>Sleep</button>
        <button onClick={()=>handleAction("clean")} disabled={busy!==""}>Clean</button>
      </div>
      <div>Hunger: {pet.hunger} | Happiness: {pet.happiness} | Energy: {pet.energy} | Cleanliness: {pet.cleanliness} | HP: {pet.hp}</div>
      <div style={{height:'20px',background:'#ccc',margin:'5px 0'}}>
        <div style={{width:`${xp}%`,height:'100%',background:'green'}}></div>
      </div>
      </>}
    </div>
  );
}
