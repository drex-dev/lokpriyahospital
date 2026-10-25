/* 3D scenes built with Three.js (r128 UMD from cdnjs) */
(() => {
  if (typeof THREE === 'undefined') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    return r;
  }
  function fit(renderer, camera, canvas) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  /* ---------- HOME HERO: glossy medical cross + DNA helix + floating cells ---------- */
  const heroCanvas = document.getElementById('hero3d');
  if (heroCanvas) {
    const renderer = makeRenderer(heroCanvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
    camera.position.set(0, 0, 14);

    scene.add(new THREE.AmbientLight(0xffffff, .55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(5, 6, 8); scene.add(key);
    const rim = new THREE.PointLight(0x0aa59a, 2.2, 30); rim.position.set(-6, -2, 4); scene.add(rim);
    const warm = new THREE.PointLight(0xff5a5f, 1.4, 30); warm.position.set(6, -4, 2); scene.add(warm);

    const group = new THREE.Group(); scene.add(group);

    // Rounded medical cross (extruded)
    const s = 1, t = 3, r = .28, shape = new THREE.Shape();
    const pts = [[-s, t], [s, t], [s, s], [t, s], [t, -s], [s, -s], [s, -t], [-s, -t], [-s, -s], [-t, -s], [-t, s], [-s, s]];
    shape.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => shape.lineTo(p[0], p[1])); shape.closePath();
    const crossGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 8, curveSegments: 12 });
    crossGeo.center();
    const crossMat = new THREE.MeshPhysicalMaterial({ color: 0xff5a5f, roughness: .18, metalness: .05, clearcoat: 1, clearcoatRoughness: .08, emissive: 0x3a0a0c, emissiveIntensity: .25 });
    const cross = new THREE.Mesh(crossGeo, crossMat); cross.scale.setScalar(.62);
    const crossWrap = new THREE.Group(); crossWrap.add(cross); group.add(crossWrap);

    // Glass ring around the cross
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, .07, 24, 160), new THREE.MeshPhysicalMaterial({ color: 0x0aa59a, roughness: .2, metalness: .6, transparent: true, opacity: .8 }));
    ring.rotation.x = Math.PI / 2.4; crossWrap.add(ring);
    const ring2 = ring.clone(); ring2.scale.setScalar(1.18); ring2.rotation.set(Math.PI / 3, .6, 0); ring2.material = ring.material.clone(); ring2.material.color.set(0x0d2a4a); ring2.material.opacity = .45; crossWrap.add(ring2);

    // DNA helix
    const helix = new THREE.Group();
    const aMat = new THREE.MeshStandardMaterial({ color: 0x0aa59a, roughness: .3, metalness: .2 });
    const bMat = new THREE.MeshStandardMaterial({ color: 0x0d2a4a, roughness: .3, metalness: .2 });
    const rungMat = new THREE.MeshStandardMaterial({ color: 0xbfe9e5, roughness: .5 });
    const sphere = new THREE.SphereGeometry(.16, 20, 20);
    for (let i = 0; i < 34; i++) {
      const y = (i - 17) * .32, a = i * .42, R = 1.1;
      const p1 = new THREE.Vector3(Math.cos(a) * R, y, Math.sin(a) * R), p2 = p1.clone().multiply(new THREE.Vector3(-1, 1, -1));
      const m1 = new THREE.Mesh(sphere, aMat); m1.position.copy(p1); helix.add(m1);
      const m2 = new THREE.Mesh(sphere, bMat); m2.position.copy(p2); helix.add(m2);
      if (i % 2 === 0) {
        const len = p1.distanceTo(p2), rung = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, len, 8), rungMat);
        rung.position.copy(p1.clone().add(p2).multiplyScalar(.5)); rung.lookAt(p2); rung.rotateX(Math.PI / 2); helix.add(rung);
      }
    }
    helix.position.set(5.2, 0, -3); helix.rotation.z = .35; group.add(helix);

    // Floating cells
    const cells = [];
    const cellGeo = new THREE.IcosahedronGeometry(1, 3);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(cellGeo, new THREE.MeshPhysicalMaterial({ color: i % 3 ? 0x9fe8e1 : 0xffc2c4, roughness: .1, transmission: .6, transparent: true, opacity: .55, clearcoat: 1 }));
      const sc = .12 + Math.random() * .38; m.scale.setScalar(sc);
      m.position.set((Math.random() - .3) * 16, (Math.random() - .5) * 9, -Math.random() * 8);
      m.userData = { sp: .3 + Math.random() * .7, ph: Math.random() * 6.28, y: m.position.y };
      cells.push(m); group.add(m);
    }

    // Layout: push 3D to the right on wide screens
    const place = () => { const wide = innerWidth > 900; crossWrap.position.set(wide ? 3.6 : 0, wide ? .2 : 1.5, 0); helix.visible = wide; fit(renderer, camera, heroCanvas); };
    addEventListener('resize', place); place();

    let mx = 0, my = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

    const clock = new THREE.Clock();
    (function loop() {
      const t = clock.getElapsedTime();
      if (!reduce) {
        cross.rotation.y = t * .5; cross.rotation.x = Math.sin(t * .6) * .25;
        ring.rotation.z = t * .3; ring2.rotation.z = -t * .2;
        crossWrap.position.y += (Math.sin(t) * .004);
        helix.rotation.y = t * .6;
        cells.forEach(c => { c.position.y = c.userData.y + Math.sin(t * c.userData.sp + c.userData.ph) * .5; c.rotation.y = t * .2; });
      }
      group.rotation.y += ((mx * .35) - group.rotation.y) * .05;
      group.rotation.x += ((my * .2) - group.rotation.x) * .05;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- INNER PAGE HERO: rotating 3D globe of connected points ---------- */
  document.querySelectorAll('canvas.net3d').forEach(canvas => {
    const renderer = makeRenderer(canvas);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
    camera.position.z = 9;
    const N = 220, R = 3.6, pos = [], vecs = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - 2 * (i + .5) / N), th = Math.PI * (1 + Math.sqrt(5)) * i;
      const v = new THREE.Vector3(Math.cos(th) * Math.sin(phi), Math.sin(th) * Math.sin(phi), Math.cos(phi)).multiplyScalar(R);
      vecs.push(v); pos.push(v.x, v.y, v.z);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const points = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x7ff0e4, size: .08 }));
    const lp = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (vecs[i].distanceTo(vecs[j]) < .95) lp.push(vecs[i].x, vecs[i].y, vecs[i].z, vecs[j].x, vecs[j].y, vecs[j].z);
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x0aa59a, transparent: true, opacity: .35 }));
    const globe = new THREE.Group(); globe.add(points, lines); scene.add(globe);
    const resize = () => { fit(renderer, camera, canvas); globe.position.x = innerWidth > 800 ? 4.2 : 1.5; };
    addEventListener('resize', resize); resize();
    (function loop() { if (!reduce) { globe.rotation.y += .0025; globe.rotation.x = .3; } renderer.render(scene, camera); requestAnimationFrame(loop); })();
  });
})();
