import React, { useRef, useEffect, useState } from 'react';

const Rasengan = (props) => {
  const ref = useRef();
  const defaultProps = {
    count: 130,
    diameter: 80,
    color: "rgba(25, 25, 26, 0.1)"
  }
  const count = props.count ? props.count : defaultProps.count;
  const color = props.color ? props.color : defaultProps.color;
  const width = props.width ? props.width : defaultProps.diameter;
  const height = props.height ? props.height : defaultProps.diameter;
  const wi = width / 2, he = height / 2;
  let energyList = [], energy = null, r = null, a = null;
  for(let i=0; i < count; i++){
    let as = Math.random() * 0.8 - 0.4;
    if(i < 37){
      let r1 = Math.random() * 32;
      let r2 = Math.random() * 32;
      let a1 = Math.PI * 2 * Math.random();
      let a2 = Math.PI * 2 * Math.random();
      let x = wi + Math.cos(a1) * r1;
      let y = he + Math.sin(a2) * r2;
      energyList.push({
        cx: wi,
        cy: he,
        a1: a1,
        a2: a2,
        r1: r1,
        r2: r2,
        x: x,
        y: y,
        ox: x,
        oy: y,
        as1: as,
        as2: as
      });
    } else {
      let r = Math.random() * 40;
      let a = Math.PI * 2 * Math.random();
      let x = wi + Math.cos(a) * r;
      let y = he + Math.sin(a) * r;
      energyList.push({
        cx: wi,
        cy: he,
        a1: a,
        a2: a,
        r1: r,
        r2: r,
        x: x,
        y: y,
        ox: x,
        oy: y,
        as1: as,
        as2: as
      });
    }
  };
  function fillRoundedRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + (w /2), y);
    ctx.arcTo(x + w, y, x + w, y + (h / 2), r);
    ctx.arcTo(x + w, y + h, x + (w / 2), y + h, r);
    ctx.arcTo(x, y + h, x, y + (h / 2), r);
    ctx.arcTo(x, y, x + (w / 2), y, r);
    ctx.closePath();
    ctx.fill();
  }
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    requestAnimationFrame(function loop(){
      requestAnimationFrame(loop);
      ctx.globalCompositeOperation = 'source-over';
      fillRoundedRect(ctx, 0, 0, width, height, 8);
      ctx.globalCompositeOperation = 'lighter';
      for(let i=0; i < count; i++){
        energy = energyList[i];
        //
        energy.ox = energy.x;
        energy.oy = energy.y;
        energy.a1 += energy.as1;
        energy.a2 += energy.as2;
        energy.x = energy.cx + Math.cos(energy.a1) * energy.r1;
        energy.y = energy.cy + Math.sin(energy.a2) * energy.r2;
        //
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.strokeStyle = "#023E78";
        ctx.beginPath();
        ctx.moveTo(energy.ox, energy.oy);
        ctx.lineTo(energy.x, energy.y);
        ctx.stroke();
        ctx.lineWidth = Math.random();
        ctx.strokeStyle = "#111";
        ctx.beginPath();
        ctx.moveTo(energy.ox, energy.oy);
        ctx.lineTo(energy.x, energy.y);
        ctx.stroke();
      }
    });
  });

  return (
    <div align="center">
      <canvas ref={ref} width={width} height={height}/>
    </div>
  );
};

export default React.memo(Rasengan);
