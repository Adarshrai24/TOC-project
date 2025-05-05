document.getElementById('setCount').addEventListener('click', () => {
    const count = parseInt(document.getElementById('symbolCount').value, 10);
    const form = document.getElementById('symbolsForm');
    form.innerHTML = ''; 
  
    if (isNaN(count) || count < 1 || count > 5) {
      alert('Please enter a number between 1 and 5.');
      return;
    }
  
    for (let i = 0; i < count; i++) {
      const row = document.createElement('div');
      row.className = 'symbol-row';
      row.innerHTML = `
        <label>Symbol #${i+1}:
          <input type="text" name="sym" maxlength="1" required style="width:2em"/>
        </label>
        <label>Var:
          <input type="text" name="var" maxlength="1" required style="width:2em"/>
        </label>
        <label>Constraint (e.g. "≥ 1", "is prime"):
          <input type="text" name="constraint" placeholder="optional" style="width:6em"/>
        </label>
      `;
      form.appendChild(row);
    }
  
    document.getElementById('runProof').style.display = 'inline-block';
  });
  
  document.getElementById('runProof').addEventListener('click', () => {
    const form = document.getElementById('symbolsForm');
    const rows = form.querySelectorAll('.symbol-row');
    const specs = [];
    for (const row of rows) {
      const sym = row.querySelector('[name=sym]').value.trim();
      const v   = row.querySelector('[name=var]').value.trim();
      const c   = row.querySelector('[name=constraint]').value.trim();
      if (!sym || !v) {
        alert('Please fill symbol and variable for each row');
        return;
      }
      specs.push({ sym, v, constraint: c });
    }
  
    let html;
    if (specs.length === 2
        && specs[0].v === specs[1].v
        && /^\s*(≥|>=)\s*1\s*$/.test(specs[0].constraint || '')) {
      html = proofXY(specs[0].sym, specs[1].sym, specs[0].v);
  
    } else if (specs.length === 3
        && specs.every(s => s.v === specs[0].v)
        && /^\s*(≥|>=)\s*1\s*$/.test(specs[0].constraint || '')) {
      html = proofXYZ(
        specs[0].sym, specs[1].sym, specs[2].sym, specs[0].v
      );
  
    } else if (specs.length === 1
        && /\bprime\b/i.test(specs[0].constraint)) {
      html = proofPrime(specs[0].sym, specs[0].v);
  
    } else {
      html = `<h2>…Can’t Decide Regularity</h2>
              <p>We can’t say if the language is regular or not properly.</p>`;
    }
  
    document.getElementById('output').innerHTML = html;
    MathJax.typesetPromise();
  });
  
  
  function proofXY(X, Y, v) {
    return `
      <h2>Proof that \\(L=\\{${X}^${v} ${Y}^${v}\\}\\) is <em>not</em> regular</h2>
      <ol>
        <li>Assume regular. Let \\(p\\) be the pumping length.</li>
        <li>Take \\(w=${X}^p ${Y}^p\\), so \\(|w|=2p \\ge p\\).</li>
        <li>Split \\(w=xyz\\) with \\(|xy|\\le p, |y|>0\\), and \\(xy^kz\\in L\\) ∀\\(k\\).</li>
        <li>Since \\(|xy|\\le p\\), \\(y\\) lies in the \\(${X}\\) block: \\(y=${X}^k\\).</li>
        <li>Pump down (\\(k=0\\)):  
          \\[
            xy^0z = ${X}^{p-k} ${Y}^p,
          \\]
          fewer \\(${X}\\)'s ⇒ not in \\(L\\).</li>
        <li>Contradiction. Hence not regular. ✓</li>
      </ol>`;
  }
  
  function proofXYZ(X, Y, Z, v) {
    return `
      <h2>Proof that \\(L=\\{${X}^${v} ${Y}^${v} ${Z}^${v}\\}\\) is <em>not</em> regular</h2>
      <ol>
        <li>Assume regular with pumping length \\(p\\).</li>
        <li>Pick \\(w=${X}^p ${Y}^p ${Z}^p\\), so \\(|w|=3p\\ge p\\).</li>
        <li>Split \\(w=xyz\\) with \\(|xy|\\le p, |y|>0\\), so \\(y\\) is in the \\(${X}\\) block.</li>
        <li>Pump down:  
          \\[
            xy^0z = ${X}^{p-k} ${Y}^p ${Z}^p,
          \\]
          fewer \\(${X}\\)'s ⇒ not in \\(L\\).</li>
        <li>Contradiction. Hence not regular. ✓</li>
      </ol>`;
  }
  
  function proofPrime(X, v) {
    return `
      <h2>Proof that \\(L=\\{${X}^${v}\\mid ${v}\\text{ is prime}\\}\\) is <em>not</em> regular</h2>
      <ol>
        <li>Assume regular. Let \\(p\\) be the pumping length.</li>
        <li>Choose a prime \\(q>p\\), let \\(w=${X}^q\\).</li>
        <li>Split \\(w=xyz\\) with \\(|xy|\\le p, |y|>0\\), and \\(xy^kz\\in L\\) ∀k.</li>
        <li>Since \\(|xy|\\le p<q\\), \\(y={X}^t\\) for some \\(1\le t\le p\\).</li>
        <li>Pump up (k=p+1):  
          \\[
            |xy^{p+1}z|=q + p\,t,
          \\]
          composite ⇒ not prime ⇒ \\(xy^{p+1}z\\notin L\\).</li>
        <li>Contradiction. Hence not regular. ✓</li>
      </ol>`;
  }
  