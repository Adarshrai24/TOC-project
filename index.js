document.getElementById('setCount').addEventListener('click', () => {
  const count = parseInt(document.getElementById('symbolCount').value, 10);
  const form = document.getElementById('symbolsForm');
  form.innerHTML = '';
  if (isNaN(count) || count < 1 || count > 5) return;
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'symbol-row';
    row.innerHTML = `
      <label>Symbol #${i + 1}:<input type="text" name="sym" maxlength="1" required style="width:2em"></label>
      <label>Var:<input type="text" name="var" maxlength="1" required style="width:2em"></label>
      <label>Constraint:<input type="text" name="constraint" placeholder="optional" style="width:6em"></label>
    `.trim();
    form.appendChild(row);
  }
  document.getElementById('runProof').style.display = 'inline-block';
});

// Double-escape backslashes so innerHTML contains single backslashes for MathJax
function proofAB(X, Y, v) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^{${v}}\,${Y}^{${v}} \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(w = ${X}^p${Y}^p\), so \(|w| = 2p \ge p\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) leaves \(y\) in the \(${X}\)-block.</li>
  <li>Pump down \(k=0\):<br>
    \[xy^0z = ${X}^{p - |y|}${Y}^p\]<br>
    which is not in \(L\).</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

// Repeat similar changes for all other proof functions...
function proofABC(X, Y, Z, v) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^{${v}}\,${Y}^{${v}}\,${Z}^{${v}} \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(w = ${X}^p${Y}^p${Z}^p\), so \(|w| = 3p \ge p\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) leaves \(y\) in the \(${X}\)-block.</li>
  <li>Pump down \(k=0\):<br>
    \[xy^0z = ${X}^{p - |y|}${Y}^p${Z}^p\]<br>
    which is not in \(L\).</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofPrime(X) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^n \mid n \text{ is prime} \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick a prime \(q > p\) and let \(w = ${X}^q\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) leaves \(y\) in the \(${X}\)-block.</li>
  <li>Pump up \(k = p+1\):<br>
    \[|xy^{p+1}z| = q + p|y|\]<br>
    which is composite, so \(xy^{p+1}z \notin L\).</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofSquare(X) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^n \mid n \text{ is a perfect square} \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(w = ${X}^{p^2}\), so \(|w| \ge p\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) changes the exponent by \(|y|\), breaking squareness.</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofPower2(X) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^n \mid n \text{ is a power of two} \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(k\) with \(2^k \ge p\) and let \(w = ${X}^{2^k}\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) yields pumped lengths not powers of two.</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofIneq(X, Y) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^n${Y}^m \mid n > m \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(w = ${X}^{p+1}${Y}^p\), so \(n > m\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) places \(y\) in the \(${X}\)-block.</li>
  <li>Pump down \(k=0\):<br>
    \[xy^0z = ${X}^{p+1 - |y|}${Y}^p\]<br>
    which has \(n \le m\), so \(xy^0z \notin L\).</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofMul(X, Y, k) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^n${Y}^m \mid n = ${k}m \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(w = ${X}^{${k}*p}${Y}^p\), so \(n = k\,m\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) changes \(n\) without changing \(m\).</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofFib(X) {
  return String.raw`
<h2>Proof that \(L = \{ ${X}^n \mid n \text{ is Fibonacci} \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(m\) with \(F_m \ge p\), and let \(w = ${X}^{F_m}\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) changes the length by \(|y|\), which isn’t a Fibonacci number.</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofPalindrome(X) {
  return String.raw`
<h2>Proof that \(L = \{ w \mid w = w^R \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick palindrome \(w = ${X}^p Y ${X}^p\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) breaks symmetry when pumped.</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

function proofWW(X) {
  return String.raw`
<h2>Proof that \(L = \{ ww \mid w \in \{${X}\}^* \}\) is not regular</h2>
<ol>
  <li>Assume \(L\) is regular; let \(p\) be its pumping length.</li>
  <li>Pick \(w = ${X}^p${X}^p\).</li>
  <li>Any split \(w = xyz\) with \(|xy| \le p\), \(|y| > 0\) makes the two halves unequal when pumped.</li>
  <li>Contradiction. Hence \(L\) is not regular.</li>
</ol>`;
}

const pumpingTests = [
  { match: s => s.length === 2 && s[0].v === s[1].v && /^(?:>=|≥)/.test(s[0].constraint), proof: s => proofAB(s[0].sym, s[1].sym, s[0].v) },
  { match: s => s.length === 3 && s.every(x => x.v === s[0].v) && s.every(x => /^(?:>=|≥)/.test(x.constraint)), proof: s => proofABC(s[0].sym, s[1].sym, s[2].sym, s[0].v) },
  { match: s => s.length === 1 && /prime/i.test(s[0].constraint), proof: s => proofPrime(s[0].sym) },
  { match: s => s.length === 1 && /square/i.test(s[0].constraint), proof: s => proofSquare(s[0].sym) },
  { match: s => s.length === 1 && /power of two|power of 2/i.test(s[0].constraint), proof: s => proofPower2(s[0].sym) },
  { match: s => s.length === 2 && />/.test(s[0].constraint) && s[0].v !== s[1].v, proof: s => proofIneq(s[0].sym, s[1].sym) },
  { match: s => s.length === 2 && /=\s*\d+/.test(s[0].constraint), proof: s => proofMul(s[0].sym, s[1].sym, parseInt(s[0].constraint.match(/\d+/)[0], 10)) },
  { match: s => s.length === 1 && /fibonacci/i.test(s[0].constraint), proof: s => proofFib(s[0].sym) },
  { match: s => s.length === 1 && /palindrome/i.test(s[0].constraint), proof: s => proofPalindrome(s[0].sym) },
  { match: s => s.length === 1 && /ww|\bww\b/.test(s[0].constraint), proof: s => proofWW(s[0].sym) }
];

document.getElementById('runProof').addEventListener('click', () => {
  const specs = Array.from(document.querySelectorAll('.symbol-row')).map(r => ({
    sym: r.querySelector('[name=sym]').value.trim(),
    v: r.querySelector('[name=var]').value.trim(),
    constraint: r.querySelector('[name=constraint]').value.trim()
  }));
  let result = '<h2>Cannot decide regularity via pumping lemma.</h2>';
  for (const t of pumpingTests) {
    if (t.match(specs)) {
      result = t.proof(specs);
      break;
    }
  }
  const output = document.getElementById('output');
  output.innerHTML = result;
  MathJax.typesetPromise();
});
