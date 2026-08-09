(function(){
  "use strict";

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var SKY = window.SKY;

  function webgl(){try{var c=document.createElement("canvas");return !!window.WebGLRenderingContext&&(!!c.getContext("webgl")||!!c.getContext("experimental-webgl"));}catch(e){return false;}}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return ((h>>>0)%100000)/100000;}
  function lerp(a,b,t){return THREE.MathUtils.lerp(a,b,t);}

  if(!SKY || typeof THREE==="undefined" || !webgl()){fallback();return;}

  try{init();}catch(e){console.error(e);fallback();}

  function fallback(){
    var f=document.getElementById("fallback");if(!f)return;
    document.getElementById("fb-title").textContent=SKY?SKY.COPY.fallbackTitle:"The sky is still here.";
    document.getElementById("fb-body").textContent=SKY?SKY.COPY.fallbackBody:"Your browser just couldn’t unfold it.";
    document.getElementById("fb-close").textContent=SKY?SKY.COPY.fallbackClose:"Even without it, this much is true:";
    if(SKY){
      var rows=document.getElementById("fb-constellations");
      Object.keys(SKY.CONSTELLATIONS).forEach(function(k){var c=SKY.CONSTELLATIONS[k],d=document.createElement("div");d.className="const";d.innerHTML="<b>"+c.label+"</b><span>"+c.subtitle+"</span>";rows.appendChild(d);});
      SKY.COPY.ending.forEach(function(x){var p=document.createElement("p");p.textContent=x;document.getElementById("fb-ending").appendChild(p);});
    }
    f.classList.add("show");
  }

  function init(){
    var wrap=document.getElementById("sky"), scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(52,1,.1,320);
    var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
    renderer.setClearColor(0x000000,1);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=0.66;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.domElement.style.touchAction="none";
    renderer.domElement.setAttribute("aria-hidden","true");
    wrap.appendChild(renderer.domElement);

    function resize(){
      var w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
      if(warpRT){warpRT.setSize(renderer.domElement.width,renderer.domElement.height);}
      if(warpMat){warpMat.uniforms.uAspect.value=w/h;}
    }
    addEventListener("resize",resize,{passive:true});resize();

    var tex=(function(){var s=64,c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=s;var g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.16,"rgba(255,255,255,.95)");g.addColorStop(.48,"rgba(255,255,255,.28)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,s,s);return new THREE.CanvasTexture(c);})();

    var spikeTex=(function(){
      var s=128,c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=s;var cx=s/2,cy=s/2;
      var g1=x.createLinearGradient(0,cy,s,cy);g1.addColorStop(0,"rgba(255,255,255,0)");g1.addColorStop(.5,"rgba(255,255,255,.95)");g1.addColorStop(1,"rgba(255,255,255,0)");
      x.strokeStyle=g1;x.lineWidth=3;x.beginPath();x.moveTo(0,cy);x.lineTo(s,cy);x.stroke();
      var g2=x.createLinearGradient(cx,0,cx,s);g2.addColorStop(0,"rgba(255,255,255,0)");g2.addColorStop(.5,"rgba(255,255,255,.95)");g2.addColorStop(1,"rgba(255,255,255,0)");
      x.strokeStyle=g2;x.beginPath();x.moveTo(cx,0);x.lineTo(cx,s);x.stroke();
      return new THREE.CanvasTexture(c);
    })();

    function nebulaTexture(hex){
      var s=256,c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=s;
      var col=new THREE.Color(hex),r=Math.round(col.r*255),g2=Math.round(col.g*255),b=Math.round(col.b*255);
      var g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      g.addColorStop(0,"rgba("+r+","+g2+","+b+",.5)");
      g.addColorStop(.42,"rgba("+r+","+g2+","+b+",.16)");
      g.addColorStop(1,"rgba("+r+","+g2+","+b+",0)");
      x.fillStyle=g;x.fillRect(0,0,s,s);
      return new THREE.CanvasTexture(c);
    }

    var BG=SKY.BACKGROUND||{};
    function skyTexture(){
      var w=2048,h=1024,c=document.createElement("canvas"),x=c.getContext("2d");c.width=w;c.height=h;
      x.fillStyle="#000000";x.fillRect(0,0,w,h);
      function blob(cx,cy,r,hex,alpha){
        var col=new THREE.Color(hex),rr=Math.round(col.r*255),gg=Math.round(col.g*255),bb=Math.round(col.b*255);
        var g=x.createRadialGradient(cx,cy,0,cx,cy,r);
        g.addColorStop(0,"rgba("+rr+","+gg+","+bb+","+alpha+")");
        g.addColorStop(1,"rgba("+rr+","+gg+","+bb+",0)");
        x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();
      }
      x.save();x.translate(w*0.5,h*0.42);x.rotate(-0.35);
      var mwTints=[BG.milkyWayTintA||"#5f7de0",BG.milkyWayTintB||"#8e5fc4",BG.milkyWayTintC||"#3fa6a0"];
      for(var i=-11;i<=11;i++){
        var bx=i*95, by=(hash("mw"+i)-0.5)*70;
        var hexc=mwTints[((i%3)+3)%3];
        var core=1-Math.min(1,Math.abs(i)/11);
        blob(bx,by,220+hash("mwr"+i)*90,hexc,(0.045+core*0.035)+hash("mwa"+i)*0.02);
      }
      for(var i2=-7;i2<=7;i2++){
        var bx2=i2*90, by2=(hash("mwc"+i2)-0.5)*30;
        blob(bx2,by2,110+hash("mwcr"+i2)*35,mwTints[((i2%3)+3)%3],0.03+hash("mwca"+i2)*0.02);
      }
      x.restore();
      (BG.nebulaPatches||[]).forEach(function(p){blob(p.x*w,p.y*h,p.size||140,p.color||"#7896ff",p.alpha===undefined?0.08:p.alpha);});
      var starN=BG.starDensity||1800;
      for(var s=0;s<starN;s++){
        var sx=hash("sx"+s)*w, sy=hash("sy"+s)*h, sr=hash("sr"+s)<0.92?0.55:1.3;
        var br=0.10+hash("sb"+s)*0.55;
        var temp=hash("st"+s);
        var rC=255,gC=255,bC=255;
        if(temp<0.12){rC=200;gC=215;bC=255;}
        else if(temp>0.90){rC=255;gC=222;bC=185;}
        x.fillStyle="rgba("+rC+","+gC+","+bC+","+br.toFixed(2)+")";
        x.beginPath();x.arc(sx,sy,sr,0,Math.PI*2);x.fill();
      }
      return new THREE.CanvasTexture(c);
    }
    var skyMesh=new THREE.Mesh(new THREE.SphereGeometry(200,28,18),new THREE.MeshBasicMaterial({map:skyTexture(),side:THREE.BackSide}));
    skyMesh.renderOrder=-10;scene.add(skyMesh);

    function planetTexture(hex){
      var s=128,c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=s;
      var col=new THREE.Color(hex),light=col.clone().lerp(new THREE.Color("#ffffff"),.35),dark=col.clone().lerp(new THREE.Color("#000000"),.55);
      var g=x.createRadialGradient(s*0.36,s*0.34,4,s*0.5,s*0.5,s*0.6);
      g.addColorStop(0,"#"+light.getHexString());g.addColorStop(.55,"#"+col.getHexString());g.addColorStop(1,"#"+dark.getHexString());
      x.fillStyle=g;x.beginPath();x.arc(s/2,s/2,s*0.46,0,Math.PI*2);x.fill();
      return new THREE.CanvasTexture(c);
    }
    (BG.planets||[]).forEach(function(p){
      var size=p.size||1.4,pos=p.position||[70,20,-50];
      var mesh=new THREE.Mesh(new THREE.SphereGeometry(size,20,20),new THREE.MeshBasicMaterial({map:planetTexture(p.color||"#a08868")}));
      mesh.position.set(pos[0],pos[1],pos[2]);scene.add(mesh);
      if(p.ring){
        var ring=new THREE.Mesh(new THREE.RingGeometry(size*1.5,size*2.3,48),new THREE.MeshBasicMaterial({color:new THREE.Color(p.color||"#a08868"),transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}));
        ring.rotation.x=Math.PI/2.4;ring.position.copy(mesh.position);scene.add(ring);
      }
      var rim=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:new THREE.Color(p.color||"#a08868").lerp(new THREE.Color("#ffffff"),.4),transparent:true,opacity:.30,depthWrite:false,blending:THREE.AdditiveBlending}));
      rim.position.copy(mesh.position);rim.scale.set(size*2.2,size*2.2,1);scene.add(rim);
      var glow=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:new THREE.Color(p.color||"#a08868"),transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));
      glow.position.copy(mesh.position);glow.scale.set(size*4.2,size*4.2,1);scene.add(glow);
    });
    if(BG.brightStar){
      var bs=BG.brightStar,bp=new THREE.Vector3(bs.position[0],bs.position[1],bs.position[2]),bsize=bs.size||1.6;
      [[bsize,1],[bsize*2.6,.4],[bsize*5.5,.16]].forEach(function(pair){
        var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:new THREE.Color(bs.color||"#fff2d0"),transparent:true,opacity:pair[1],depthWrite:false,blending:THREE.AdditiveBlending}));
        sp.position.copy(bp);sp.scale.set(pair[0],pair[0],1);scene.add(sp);
      });
    }

    (BG.nebulaClouds||[]).forEach(function(n){
      var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:nebulaTexture(n.color||"#7896ff"),transparent:true,opacity:n.alpha===undefined?0.09:n.alpha,depthWrite:false,blending:THREE.AdditiveBlending}));
      sp.position.set(n.position[0],n.position[1],n.position[2]);
      var sz=n.size||30;sp.scale.set(sz,sz*(n.stretch||1),1);
      scene.add(sp);
    });

    (BG.distantGalaxies||[]).forEach(function(gxy){
      var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:nebulaTexture(gxy.color||"#cfd8ff"),transparent:true,opacity:gxy.alpha===undefined?0.22:gxy.alpha,depthWrite:false,blending:THREE.AdditiveBlending,rotation:gxy.rotation||0}));
      sp.position.set(gxy.position[0],gxy.position[1],gxy.position[2]);
      var sz=gxy.size||2.2;sp.scale.set(sz,sz*(gxy.stretch||0.35),1);
      scene.add(sp);
    });

    function diskTexture(hot,cool,biasAngle){
      var s=512,c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=s;
      var cx=s/2,cy=s/2,hotC=new THREE.Color(hot),coolC=new THREE.Color(cool);
      var hr=Math.round(hotC.r*255),hg=Math.round(hotC.g*255),hb=Math.round(hotC.b*255);
      var cr=Math.round(coolC.r*255),cg=Math.round(coolC.g*255),cb=Math.round(coolC.b*255);
      var g=x.createRadialGradient(cx,cy,s*0.14,cx,cy,s*0.5);
      g.addColorStop(0,"rgba("+hr+","+hg+","+hb+",1)");
      g.addColorStop(.45,"rgba("+cr+","+cg+","+cb+",.85)");
      g.addColorStop(1,"rgba("+cr+","+cg+","+cb+",0)");
      x.fillStyle=g;x.fillRect(0,0,s,s);
      var bx=cx+Math.cos(biasAngle)*s*0.30, by=cy+Math.sin(biasAngle)*s*0.30;
      var g2=x.createRadialGradient(bx,by,0,bx,by,s*0.38);
      g2.addColorStop(0,"rgba(255,255,255,.55)");g2.addColorStop(1,"rgba(255,255,255,0)");
      x.globalCompositeOperation="lighter";x.fillStyle=g2;x.fillRect(0,0,s,s);
      x.globalCompositeOperation="source-over";
      var dx=cx-Math.cos(biasAngle)*s*0.30, dy=cy-Math.sin(biasAngle)*s*0.30;
      x.fillStyle="rgba(0,0,0,.32)";x.beginPath();x.arc(dx,dy,s*0.30,0,Math.PI*2);x.fill();
      x.globalCompositeOperation="lighter";
      for(var i=0;i<52;i++){
        var ang=hash("streak"+i)*Math.PI*2, rad=s*(0.15+hash("streakr"+i)*0.33);
        var sx=cx+Math.cos(ang)*rad, sy=cy+Math.sin(ang)*rad;
        var len=7+hash("streakl"+i)*26, curl=(hash("streakc"+i)-0.5)*0.7, aOff=ang+Math.PI/2+curl;
        var warm=hash("streakw"+i)>0.55;
        var col=warm?"255,236,214":"255,250,245";
        x.strokeStyle="rgba("+col+","+(0.07+hash("streaka"+i)*0.22).toFixed(2)+")";
        x.lineWidth=0.8+hash("streaklw"+i)*2.0;
        x.beginPath();x.moveTo(sx,sy);
        var midx=sx+Math.cos(aOff)*len*0.5, midy=sy+Math.sin(aOff)*len*0.5+curl*10;
        var ex=sx+Math.cos(aOff)*len, ey=sy+Math.sin(aOff)*len;
        x.quadraticCurveTo(midx,midy,ex,ey);
        x.stroke();
      }
      for(var k=0;k<10;k++){
        var kang=hash("clump"+k)*Math.PI*2, krad=s*(0.18+hash("clumpr"+k)*0.26);
        var kx=cx+Math.cos(kang)*krad, ky=cy+Math.sin(kang)*krad, kr=6+hash("clumps"+k)*10;
        var kg=x.createRadialGradient(kx,ky,0,kx,ky,kr);
        kg.addColorStop(0,"rgba(255,244,225,"+(0.18+hash("clumpa"+k)*0.18).toFixed(2)+")");
        kg.addColorStop(1,"rgba(255,244,225,0)");
        x.fillStyle=kg;x.beginPath();x.arc(kx,ky,kr,0,Math.PI*2);x.fill();
      }
      return new THREE.CanvasTexture(c);
    }
    function buildBlackHole(cfg){
      if(!cfg)return null;
      var pos=cfg.position||[46,30,-128], size=cfg.size||5.4, hot=cfg.hot||"#fff5da", cool=cfg.cool||"#c9622c", bias=cfg.bias===undefined?0.55:cfg.bias;
      var group=new THREE.Group();group.position.set(pos[0],pos[1],pos[2]);

      var horizon=new THREE.Mesh(new THREE.SphereGeometry(size,48,48),new THREE.MeshBasicMaterial({color:0x000000}));
      group.add(horizon);

      [[size*1.14,.9],[size*1.55,.5],[size*2.5,.2]].forEach(function(pair){
        var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:new THREE.Color(hot),transparent:true,opacity:pair[1],depthWrite:false,blending:THREE.AdditiveBlending}));
        sp.scale.set(pair[0],pair[0],1);group.add(sp);
      });

      var diskGeo=new THREE.RingGeometry(size*1.35,size*3.6,96,1);
      var diskMat=new THREE.MeshBasicMaterial({map:diskTexture(hot,cool,bias),transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.92});
      diskMat.map.wrapS=diskMat.map.wrapT=THREE.RepeatWrapping;
      var disk=new THREE.Mesh(diskGeo,diskMat);
      disk.rotation.x=cfg.tiltX!==undefined?cfg.tiltX:Math.PI/2.35;
      disk.rotation.z=cfg.tiltZ!==undefined?cfg.tiltZ:0.18;
      group.add(disk);

      var lensGeo=new THREE.RingGeometry(size*1.05,size*1.55,80,1);
      var lensMat=new THREE.MeshBasicMaterial({map:diskTexture(hot,cool,bias+Math.PI),transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.7});
      lensMat.map.wrapS=lensMat.map.wrapT=THREE.RepeatWrapping;
      var lens=new THREE.Mesh(lensGeo,lensMat);
      lens.rotation.x=disk.rotation.x+Math.PI/2.05;
      lens.rotation.z=disk.rotation.z;
      group.add(lens);

      var haze=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:new THREE.Color(cool),transparent:true,opacity:.09,depthWrite:false,blending:THREE.AdditiveBlending}));
      haze.scale.set(size*9,size*9,1);group.add(haze);

      scene.add(group);
      return {disk:disk,lens:lens};
    }
    var blackHole=buildBlackHole(BG.blackHole);

    var warpEnabled=!!blackHole&&!reduced, warpRT=null, warpScene=null, warpCamera=null, warpMat=null;
    if(warpEnabled){
      try{
        warpRT=new THREE.WebGLRenderTarget(renderer.domElement.width||innerWidth,renderer.domElement.height||innerHeight,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
        warpScene=new THREE.Scene();
        warpCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        warpMat=new THREE.ShaderMaterial({
          uniforms:{
            tDiffuse:{value:null},
            uCenter:{value:new THREE.Vector2(.5,.5)},
            uRadius:{value:.05},
            uAspect:{value:innerWidth/innerHeight},
            uVisible:{value:0}
          },
          vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}",
          fragmentShader:[
            "uniform sampler2D tDiffuse;",
            "uniform vec2 uCenter;",
            "uniform float uRadius;",
            "uniform float uAspect;",
            "uniform float uVisible;",
            "varying vec2 vUv;",
            "void main(){",
            "  if(uVisible<0.5){gl_FragColor=texture2D(tDiffuse,vUv);return;}",
            "  vec2 p=vUv-uCenter;",
            "  p.x*=uAspect;",
            "  float dist=length(p);",
            "  float horizon=uRadius;",
            "  vec2 dir=dist>0.00001?p/dist:vec2(0.0);",
            "  float warp=(horizon*horizon*2.4)/max(dist*dist,horizon*horizon*0.1);",
            "  warp=min(warp,horizon*10.0);",
            "  vec2 offset=dir*warp;",
            "  offset.x/=uAspect;",
            "  vec2 sUv=clamp(vUv-offset,vec2(.0015),vec2(.9985));",
            "  vec3 col=texture2D(tDiffuse,sUv).rgb;",
            "  if(dist<horizon*.9){",
            "    col=vec3(0.0);",
            "  }else if(dist<horizon*1.4){",
            "    float ring=smoothstep(horizon*1.4,horizon*.9,dist);",
            "    col+=vec3(1.0,.92,.78)*ring*.4;",
            "  }",
            "  gl_FragColor=vec4(col,1.0);",
            "}"
          ].join("\n")
        });
        warpScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),warpMat));
      }catch(err){console.warn("Gravitational lensing pass unavailable, continuing without it.",err);warpEnabled=false;warpRT=warpScene=warpCamera=warpMat=null;}
    }

    function centroid(stars){var ra=0,dec=0;stars.forEach(function(s){ra+=s.ra;dec+=s.dec});return{ra:ra/stars.length,dec:dec/stars.length};}
    function pos(star,center,anchor,scale){
      var rad=Math.PI/180, cr=center.dec*rad;
      var x=-(star.ra-center.ra)*15*Math.cos(cr), y=star.dec-center.dec;
      return [anchor[0]+x*scale,anchor[1]+y*scale,anchor[2]+(hash(star.id+"z")-.5)*.48];
    }

    var built={}, byId={};
    Object.keys(SKY.CONSTELLATIONS).forEach(function(key){
      var meta=SKY.CONSTELLATIONS[key], center=centroid(meta.stars);
      var stars=meta.stars.map(function(s){var p=pos(s,center,meta.anchor,meta.scale);var z={id:s.id,name:s.name,mag:s.mag,message:s.message,bridge:!!s.bridge,dateKey:!!s.dateKey,constellation:key,position:p};byId[s.id]=z;return z;});
      built[key]={meta:meta,stars:stars};
    });
    function segments(pairs){return pairs.map(function(pair){var a=byId[pair[0]],b=byId[pair[1]];return a&&b?[a.position,b.position]:null}).filter(Boolean);}

    function buildBoldSegments(pairs,colorHex,coreRadius,glowRadius){
      var coreMat=new THREE.MeshBasicMaterial({color:new THREE.Color(colorHex),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      var glowMat=new THREE.MeshBasicMaterial({color:new THREE.Color(colorHex),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      var up=new THREE.Vector3(0,1,0);
      pairs.forEach(function(seg){
        var a=new THREE.Vector3(seg[0][0],seg[0][1],seg[0][2]), b=new THREE.Vector3(seg[1][0],seg[1][1],seg[1][2]);
        var dir=new THREE.Vector3().subVectors(b,a), len=dir.length()||0.0001, mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
        var quat=new THREE.Quaternion().setFromUnitVectors(up,dir.clone().normalize());
        var core=new THREE.Mesh(new THREE.CylinderGeometry(coreRadius,coreRadius,len,5,1,true),coreMat);core.position.copy(mid);core.quaternion.copy(quat);scene.add(core);
        var glow=new THREE.Mesh(new THREE.CylinderGeometry(glowRadius,glowRadius,len,5,1,true),glowMat);glow.position.copy(mid);glow.quaternion.copy(quat);scene.add(glow);
      });
      return {core:coreMat,glow:glowMat};
    }

    var BG_BASE=0.30;
    var bgCount=innerWidth<600?340:480, bgPos=new Float32Array(bgCount*3), bgCol=new Float32Array(bgCount*3), ga=Math.PI*(3-Math.sqrt(5));
    for(var i=0;i<bgCount;i++){
      var t=i/Math.max(1,bgCount-1), y=1-t*2, rr=Math.sqrt(Math.max(0,1-y*y)), th=ga*i, r=48+hash("bg"+i)*36;
      bgPos[i*3]=Math.cos(th)*rr*r;bgPos[i*3+1]=y*r;bgPos[i*3+2]=Math.sin(th)*rr*r;
      var b=.20+hash("b"+i)*.62, ctint=hash("bt"+i);
      if(ctint<0.14){bgCol[i*3]=.62+b*.20;bgCol[i*3+1]=.70+b*.20;bgCol[i*3+2]=.96+b*.04;}
      else if(ctint>0.90){bgCol[i*3]=.96+b*.04;bgCol[i*3+1]=.80+b*.16;bgCol[i*3+2]=.62+b*.18;}
      else{var w=.78+b*.20;bgCol[i*3]=w;bgCol[i*3+1]=w;bgCol[i*3+2]=w+0.03;}
    }
    var bgGeo=new THREE.BufferGeometry();bgGeo.setAttribute("position",new THREE.BufferAttribute(bgPos,3));bgGeo.setAttribute("color",new THREE.BufferAttribute(bgCol,3));
    var bgMat=new THREE.PointsMaterial({size:.44,map:tex,transparent:true,opacity:BG_BASE,vertexColors:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
    var bgPoints=new THREE.Points(bgGeo,bgMat);scene.add(bgPoints);

    var dustCount=innerWidth<600?110:170, dustPos=new Float32Array(dustCount*3);
    for(var j=0;j<dustCount;j++){
      var yj=1-Math.random()*2, rj=Math.sqrt(Math.max(0,1-yj*yj)), thj=Math.random()*Math.PI*2, radj=150+Math.random()*95;
      dustPos[j*3]=Math.cos(thj)*rj*radj;dustPos[j*3+1]=yj*radj;dustPos[j*3+2]=Math.sin(thj)*rj*radj;
    }
    var dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute("position",new THREE.BufferAttribute(dustPos,3));
    var dustMat=new THREE.PointsMaterial({size:.30,map:tex,color:0x8fa3cf,transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
    scene.add(new THREE.Points(dustGeo,dustMat));

    var farCount=innerWidth<600?70:110, farPos=new Float32Array(farCount*3);
    for(var jf=0;jf<farCount;jf++){
      var yf=1-Math.random()*2, rf=Math.sqrt(Math.max(0,1-yf*yf)), thf=Math.random()*Math.PI*2, radf=190+Math.random()*130;
      farPos[jf*3]=Math.cos(thf)*rf*radf;farPos[jf*3+1]=yf*radf;farPos[jf*3+2]=Math.sin(thf)*rf*radf;
    }
    var farGeo=new THREE.BufferGeometry();farGeo.setAttribute("position",new THREE.BufferAttribute(farPos,3));
    var farMat=new THREE.PointsMaterial({size:.22,map:tex,color:0x7a8cc9,transparent:true,opacity:.09,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
    scene.add(new THREE.Points(farGeo,farMat));

    var objects={},hits=[],labels={
      aquarius:document.getElementById("label-aquarius"),
      libra:document.getElementById("label-libra"),
      taurus:document.getElementById("label-taurus")
    },anchorVec={};

    function starSize(m){return 1.02-clamp(m===undefined?3.8:m,0,5)*.11;}
    var spikeThreshold=SKY.SPIKE_MAG_THRESHOLD||2.0;
    Object.keys(built).forEach(function(key){
      var group=built[key],meta=group.meta,color=new THREE.Color(meta.starColor);

      var neb=new THREE.Sprite(new THREE.SpriteMaterial({map:nebulaTexture(meta.color),transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending}));
      neb.position.set(meta.anchor[0],meta.anchor[1],meta.anchor[2]-5);neb.scale.set(40,40,1);scene.add(neb);

      group.stars.forEach(function(s){
        var base=starSize(s.mag);
        var haloMat=new THREE.SpriteMaterial({map:tex,color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
        var halo=new THREE.Sprite(haloMat);halo.position.set(s.position[0],s.position[1],s.position[2]);halo.scale.set(0,0,1);scene.add(halo);
        var mat=new THREE.SpriteMaterial({map:tex,color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
        var sprite=new THREE.Sprite(mat);sprite.position.set(s.position[0],s.position[1],s.position[2]);sprite.scale.set(base,base,1);scene.add(sprite);
        var spike=null;
        if(s.mag!==undefined&&s.mag<spikeThreshold){
          var spikeMat=new THREE.SpriteMaterial({map:spikeTex,color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,rotation:hash(s.id+"r")*Math.PI});
          spike=new THREE.Sprite(spikeMat);spike.position.copy(sprite.position);spike.scale.set(base*7.2,base*7.2,1);scene.add(spike);
        }
        var hit=new THREE.Mesh(new THREE.SphereGeometry(Math.max(.28,base*.55),7,7),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.copy(sprite.position);hit.userData.starId=s.id;scene.add(hit);hits.push(hit);
        objects[s.id]={sprite:sprite,halo:halo,spike:spike,base:base,star:s,phase:hash(s.id)*Math.PI*2};
      });
      segments(meta.lines).forEach(function(){}); // (kept for shape clarity; geometry now built below)
      var bold=buildBoldSegments(segments(meta.lines),meta.color,0.015,0.048);
      group.lineMat=bold.core;group.glowMat=bold.glow;
      anchorVec[key]=new THREE.Vector3(meta.anchor[0],meta.anchor[1],meta.anchor[2]);
    });

    var bridgePos=[];segments(SKY.BRIDGE_LINES).forEach(function(seg){bridgePos.push(seg[0][0],seg[0][1],seg[0][2],seg[1][0],seg[1][1],seg[1][2]);});
    var bridgeGeo=new THREE.BufferGeometry();bridgeGeo.setAttribute("position",new THREE.Float32BufferAttribute(bridgePos,3));
    var bridgeMat=new THREE.LineBasicMaterial({color:new THREE.Color(SKY.CUSTOM_COLOR),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    var bridge=new THREE.LineSegments(bridgeGeo,bridgeMat);scene.add(bridge);

    var ours=document.getElementById("ours-label");
    var ourAnchor=new THREE.Vector3(0,-.2,0);


    var target=new THREE.Vector3(0,-1,0), desiredTarget=target.clone(),DEFAULT_R=31,minR=2.2,maxR=78,radius=maxR,theta=.55,phi=1.18;
    var introDone=false,zoomTweening=false,zoomTarget=DEFAULT_R;
    var vTheta=0,vPhi=0,drag=false,didDrag=false,start={x:0,y:0},last={x:0,y:0},pointers=new Map(),pinch0=0,radius0=0;
    function pd(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
    function updatePointer(e){pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});}
    renderer.domElement.addEventListener("pointerdown",function(e){renderer.domElement.setPointerCapture(e.pointerId);updatePointer(e);zoomTweening=false;if(pointers.size===1){drag=true;didDrag=false;start={x:e.clientX,y:e.clientY};last=start;vTheta=vPhi=0}else if(pointers.size===2){drag=false;var p=Array.from(pointers.values());pinch0=pd(p[0],p[1]);radius0=radius}});
    renderer.domElement.addEventListener("pointermove",function(e){if(!pointers.has(e.pointerId))return;updatePointer(e);if(pointers.size===2&&pinch0){var p=Array.from(pointers.values());radius=clamp(radius0*(pinch0/Math.max(1,pd(p[0],p[1]))),minR,maxR);e.preventDefault()}else if(pointers.size===1&&drag){var dx=e.clientX-last.x,dy=e.clientY-last.y;theta-=dx*.0032;phi=clamp(phi-dy*.0032,.34,Math.PI-.34);vTheta=-dx*.0032;vPhi=-dy*.0032;last={x:e.clientX,y:e.clientY};if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)didDrag=true;e.preventDefault()}} ,{passive:false});
    function end(e){pointers.delete(e.pointerId);if(pointers.size===0){if(drag&&!didDrag)tap(e.clientX,e.clientY);drag=false;pinch0=0}else if(pointers.size===1){var p=Array.from(pointers.values())[0];start={x:p.x,y:p.y};last=start;drag=true;didDrag=true;pinch0=0}}
    renderer.domElement.addEventListener("pointerup",end);renderer.domElement.addEventListener("pointercancel",end);
    renderer.domElement.addEventListener("wheel",function(e){e.preventDefault();zoomTweening=false;radius=clamp(radius+e.deltaY*.045,minR,maxR)},{passive:false});
    renderer.domElement.addEventListener("contextmenu",function(e){e.preventDefault()});


    var ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),selected=null,msg=document.getElementById("message"),sr=document.getElementById("sr-summary");
    function screen(v){var p=v.clone().project(camera);return{x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,behind:p.z>1};}
    function tap(x,y){
      ndc.x=x/innerWidth*2-1;ndc.y=-(y/innerHeight*2-1);ray.setFromCamera(ndc,camera);
      var h=ray.intersectObjects(hits);
      var hitObj=h.length?objects[h[0].object.userData.starId]:null;
      if(hitObj&&hitObj.sprite.material.opacity>0.05){select(h[0].object.userData.starId);}else{clear();}
    }
    function select(id){var o=objects[id];if(!o)return;selected=id;desiredTarget.copy(o.sprite.position);if(o.star.dateKey){show(SKY.COPY.taurusDate,o);setTimeout(function(){if(selected===id)show(SKY.COPY.taurusLine,o)},1100)}else if(o.star.message)show(o.star.message,o);sr.textContent=o.star.name+(o.star.message?". "+o.star.message:"");}
    function show(text,o){msg.innerHTML='<span class="tick"></span><span></span>';msg.querySelector("span:last-child").textContent=text;msg.classList.add("show");msg._o=o;}
    function clear(){selected=null;desiredTarget.set(0,-1,0);msg.classList.remove("show");}

    var ending=document.getElementById("ending"),endShown=false;
    SKY.COPY.ending.forEach(function(x){var p=document.createElement("p");p.textContent=x;ending.appendChild(p)});

    var FAR_START=64, FAR_END=maxR;
    var BRIDGE_DONE=58; // the custom constellation is fully formed by here

    function animate(){
      requestAnimationFrame(animate);
      var t=performance.now()*.001;
      if(!drag&&!pointers.size&&!reduced){theta+=vTheta+0.00006;phi=clamp(phi+vPhi,.34,Math.PI-.34);vTheta*=.90;vPhi*=.90;if(Math.abs(vTheta)<.00004)vTheta=0;if(Math.abs(vPhi)<.00004)vPhi=0;}
      if(zoomTweening){radius=lerp(radius,zoomTarget,.045);if(Math.abs(radius-zoomTarget)<.08){radius=zoomTarget;zoomTweening=false;}}
      if(blackHole&&!reduced){
        blackHole.disk.rotation.z+=0.00055;
        blackHole.lens.rotation.z-=0.00035;
        if(blackHole.disk.material.map){blackHole.disk.material.map.offset.x-=0.0022;}
        if(blackHole.lens.material.map){blackHole.lens.material.map.offset.x+=0.0015;}
        blackHole.disk.material.opacity=0.86+Math.sin(t*0.6)*0.06;
        blackHole.lens.material.opacity=0.64+Math.sin(t*0.6+1.1)*0.06;
      }
      target.lerp(desiredTarget,reduced?1:.045);
      var breathe=reduced?0:Math.sin(t*.055)*.35+Math.sin(t*.083+1.7)*.2, rCam=radius+breathe;
      camera.position.set(target.x+rCam*Math.sin(phi)*Math.sin(theta),target.y+rCam*Math.cos(phi),target.z+rCam*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);

      var dissolveT=smooth(FAR_START,FAR_END,radius), farFade=1-dissolveT;

      Object.keys(built).forEach(function(k){
        var d=camera.position.distanceTo(anchorVec[k]);
        var near=smooth(30,10,d);
        built[k].lineMat.opacity=lerp(built[k].lineMat.opacity,(.10+near*.40)*farFade,.09);
        built[k].glowMat.opacity=lerp(built[k].glowMat.opacity,(.03+near*.15)*farFade,.09);
        var a=screen(anchorVec[k].clone().add(new THREE.Vector3(0,2.9,0))),lab=labels[k];
        lab.style.left=a.x+"px";lab.style.top=a.y+"px";
        lab.style.opacity=String(clamp(near*0.95,0,1)*farFade*(a.behind?0:1));
      });

      var bridgeReveal=smooth(37,BRIDGE_DONE,radius); // 0 close, 1 once the custom shape has fully formed
      bridgeMat.opacity=lerp(bridgeMat.opacity,(.015+bridgeReveal*.78)*farFade,.075);
      var os=screen(ourAnchor.clone().add(new THREE.Vector3(0,1.8,0)));ours.style.left=os.x+"px";ours.style.top=os.y+"px";
      ours.style.opacity=String(clamp((bridgeReveal-.1)/.7,0,1)*farFade*(os.behind?0:.9));

      var wide=radius>58&&!zoomTweening;
      if(wide&&!endShown){endShown=true;ending.classList.add("show");}
      if(radius<50&&endShown){endShown=false;ending.classList.remove("show");}

      bgMat.opacity=lerp(bgMat.opacity,BG_BASE*(endShown?0.82:1),.05);

      Object.keys(objects).forEach(function(id){
        var o=objects[id],sel=id===selected,tw=reduced?1:.88+Math.sin(t*1.2+o.phase)*.12;
        var bridgeGlow=(o.star.bridge?bridgeReveal:0)*farFade;
        var dim=wide?(o.star.bridge?1:0.58):1;
        var scale=o.base*tw*(sel?1.65:1)*(1+bridgeGlow*.3);
        o.sprite.scale.lerp(new THREE.Vector3(scale,scale,1),.14);
        var targetOpacity=(sel?1:.88*dim)*farFade;
        o.sprite.material.opacity=lerp(o.sprite.material.opacity,targetOpacity,.08);
        if(o.spike){
          var sScale=o.base*7.2*(1+bridgeGlow*.25);
          o.spike.scale.lerp(new THREE.Vector3(sScale,sScale,1),.14);
          o.spike.material.opacity=lerp(o.spike.material.opacity,targetOpacity*.55,.08);
        }
        var hs=sel?o.base*4.2:0;o.halo.scale.lerp(new THREE.Vector3(hs,hs,1),.12);o.halo.material.opacity=lerp(o.halo.material.opacity,sel?.32:0,.1);
      });
      if(msg.classList.contains("show")&&msg._o){var s=screen(msg._o.sprite.position);msg.style.left=s.x+"px";msg.style.top=s.y+"px";msg.style.opacity=s.behind?0:1;}

      if(warpEnabled&&warpRT){
        try{
          var bhPos=blackHole.disk.parent.position;
          var bhSize=(BG.blackHole&&BG.blackHole.size)||6.4;
          var ndcC=bhPos.clone().project(camera);
          var ndcR=bhPos.clone().add(new THREE.Vector3(bhSize,0,0)).project(camera);
          var uCx=ndcC.x*.5+.5, uCy=1-(ndcC.y*.5+.5), uRx=ndcR.x*.5+.5;
          var rApparent=Math.abs(uRx-uCx)*(innerWidth/innerHeight);
          warpMat.uniforms.uCenter.value.set(uCx,uCy);
          warpMat.uniforms.uRadius.value=clamp(rApparent*1.85,.006,.5);
          warpMat.uniforms.uVisible.value=(ndcC.z>1||ndcC.z<-1)?0:1;
          renderer.setRenderTarget(warpRT);
          renderer.render(scene,camera);
          renderer.setRenderTarget(null);
          warpMat.uniforms.tDiffuse.value=warpRT.texture;
          renderer.render(warpScene,warpCamera);
        }catch(err){
          warpEnabled=false;
          renderer.setRenderTarget(null);
          renderer.render(scene,camera);
        }
      }else{
        renderer.render(scene,camera);
      }
    }
    animate();

    function spawnMeteor(){
      if(reduced){return;}
      if(!endShown){
        var r=64+Math.random()*28, th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
        var startV=new THREE.Vector3(Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)).multiplyScalar(r);
        var dir=new THREE.Vector3(-1,-.35+Math.random()*.3,Math.random()*.6-.3).normalize();
        var mgeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),dir.clone().multiplyScalar(-3.4)]);
        var mmat=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
        var line=new THREE.Line(mgeo,mmat);line.position.copy(startV);scene.add(line);
        var t0=performance.now(),dur=700+Math.random()*350;
        (function step(){
          var p=(performance.now()-t0)/dur;
          if(p>=1){scene.remove(line);mgeo.dispose();mmat.dispose();return;}
          line.position.copy(startV).addScaledVector(dir,p*32);
          mmat.opacity=Math.sin(Math.min(p,1)*Math.PI)*.75;
          requestAnimationFrame(step);
        })();
      }
      setTimeout(spawnMeteor,23000+Math.random()*27000);
    }
    setTimeout(spawnMeteor,11000+Math.random()*8000);

    var summary=["A private, explorable night sky."];Object.keys(SKY.CONSTELLATIONS).forEach(function(k){summary.push(SKY.CONSTELLATIONS[k].label+" represents "+SKY.CONSTELLATIONS[k].subtitle+".")});summary.push.apply(summary,SKY.COPY.ending);sr.textContent=summary.join(" ");

    var audioBtn=document.getElementById("audio"),song=document.getElementById("song"),songStarted=false;
    var TARGET_VOL=0.55,fadeRAF=null;
    song.loop=true;song.volume=0;

    function fadeVolume(vol,ms,cb){
      if(fadeRAF)cancelAnimationFrame(fadeRAF);
      var from=song.volume,t0=performance.now();
      (function step(){
        var p=clamp((performance.now()-t0)/ms,0,1);
        song.volume=from+(vol-from)*p;
        if(p<1){fadeRAF=requestAnimationFrame(step);}else{fadeRAF=null;if(cb)cb();}
      })();
    }

    function startSong(){
      if(songStarted)return;
      songStarted=true;
      song.volume=0;
      function onPlaying(){
        fadeVolume(TARGET_VOL,2600);
        audioBtn.classList.add("show");
        audioBtn.setAttribute("aria-pressed","true");
        audioBtn.setAttribute("aria-label","Pause song");
        audioBtn.textContent="♪";
      }
      var promise=song.play();
      if(promise&&typeof promise.then==="function"){
        promise.then(onPlaying).catch(function(err){
          console.warn("The local song could not start. Put song.mp3 in the same folder as index.html.",err);
          songStarted=false;
        });
      }else{
        onPlaying();
      }
    }
    var originalTap=tap;
    tap=function(x,y){
      startSong();
      if(!introDone){beginIntroZoom();}
      originalTap(x,y);
    };
    function beginIntroZoom(){
      introDone=true;
      zoomTweening=true;
      hint.classList.remove("show");
      setTimeout(function(){hint.textContent=SKY.COPY.hint;hint.classList.add("show")},1700);
      setTimeout(function(){hint.classList.remove("show")},4900);
    }

    audioBtn.addEventListener("click",function(){
      if(!songStarted){startSong();return;}
      if(song.paused){
        song.play().catch(function(){});
        fadeVolume(TARGET_VOL,700);
        audioBtn.setAttribute("aria-pressed","true");
        audioBtn.setAttribute("aria-label","Pause song");
        audioBtn.textContent="♪";
      }else{
        fadeVolume(0,450,function(){song.pause();});
        audioBtn.setAttribute("aria-pressed","false");
        audioBtn.setAttribute("aria-label","Play song");
        audioBtn.textContent="♩";
      }
    });

    var intro=document.getElementById("intro"),hint=document.getElementById("hint");
    wrap.classList.add("ready");intro.textContent=SKY.COPY.intro;
    hint.textContent=SKY.COPY.introHint||SKY.COPY.hint;
    setTimeout(function(){intro.classList.add("show")},260);
    setTimeout(function(){intro.classList.remove("show")},1500);
    setTimeout(function(){hint.classList.add("show")},2000);
  }
})();
