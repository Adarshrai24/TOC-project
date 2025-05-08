const form = document.getElementById("addressForm");
const output = document.getElementById("output");
const modeSelect = document.getElementById("mode");

function clearForm() {
  form.innerHTML = '';
  output.innerHTML = '';
}

modeSelect.addEventListener("change", renderForm);
window.addEventListener("load", renderForm);

function renderForm() {
  clearForm();
  const mode = modeSelect.value;

  let html = `
    <label>Virtual Address:
      <input type="number" id="virtualAddress" required />
    </label>
  `;

  if (mode === "paging") {
    html += `
      <label>Page Size:
        <input type="number" id="pageSize" required />
      </label>
      <label>Page Table (comma-separated frame numbers):
        <input type="text" id="pageTable" required />
      </label>
    `;
  } else if (mode === "segmentation") {
    html += `
      <label>Segment Table (format: base:limit,base:limit,...):
        <input type="text" id="segmentTable" required />
      </label>
    `;
  } else if (mode === "seg_paging") {
    html += `
      <label>Page Size:
        <input type="number" id="pageSize" required />
      </label>
      <label>Segment Table (format: segBase:limit;pageTable):
        <textarea id="segmentPaging" placeholder="Example: 0:512;2,3,5|1000:256;6,7"></textarea>
      </label>
    `;
  } else if (mode === "multilevel") {
    html += `
      <label>Page Size:
        <input type="number" id="pageSize" required />
      </label>
      <label>Levels (comma-separated page bits, e.g. 2,3):
        <input type="text" id="levels" required />
      </label>
      <label>Nested Page Tables (e.g. [[1,2],[3,4,5],[6,7]]):
        <textarea id="multiTables" placeholder="JS-like arrays for nested tables"></textarea>
      </label>
    `;
  }

  html += `<button type="submit">Translate</button>`;
  form.innerHTML = html;

  form.onsubmit = handleSubmit;
}

function handleSubmit(e) {
  e.preventDefault();
  const mode = modeSelect.value;
  output.innerHTML = "";

  const vAddr = parseInt(document.getElementById("virtualAddress").value);

  if (mode === "paging") {
    const pageSize = parseInt(document.getElementById("pageSize").value);
    const pageTable = document.getElementById("pageTable").value.split(",").map(Number);
    const pageNum = Math.floor(vAddr / pageSize);
    const offset = vAddr % pageSize;
    const frame = pageTable[pageNum];
    if (frame === undefined || isNaN(frame)) {
      output.innerHTML = `Invalid Page Number (${pageNum}) or Unmapped Frame`;
      return;
    }
    const pAddr = frame * pageSize + offset;
    output.innerHTML = `
      Page Number: ${pageNum}<br>
      Offset: ${offset}<br>
      Frame: ${frame}<br>
      Physical Address: <b>${pAddr}</b>
    `;
  }

  else if (mode === "segmentation") {
    const segTable = document.getElementById("segmentTable").value.split(",").map(pair => {
      const [base, limit] = pair.split(":").map(Number);
      return { base, limit };
    });
    const segNum = Math.floor(vAddr / 1000);
    const offset = vAddr % 1000;
    const segment = segTable[segNum];
    if (!segment || offset >= segment.limit) {
      output.innerHTML = `Segmentation Fault or Limit Exceeded`;
      return;
    }
    const pAddr = segment.base + offset;
    output.innerHTML = `
      Segment: ${segNum}<br>
      Offset: ${offset}<br>
      Base: ${segment.base}, Limit: ${segment.limit}<br>
      Physical Address: <b>${pAddr}</b>
    `;
  }

  else if (mode === "seg_paging") {
    const pageSize = parseInt(document.getElementById("pageSize").value);
    const rawInput = document.getElementById("segmentPaging").value;
    const segments = rawInput.split("|").map(s => {
      const [meta, pages] = s.split(";");
      const [base, limit] = meta.split(":").map(Number);
      const pageTable = pages.split(",").map(Number);
      return { base, limit, pageTable };
    });

    const segNum = Math.floor(vAddr / 10000);
    const innerAddr = vAddr % 10000;
    const pageNum = Math.floor(innerAddr / pageSize);
    const offset = innerAddr % pageSize;
    const seg = segments[segNum];

    if (!seg || pageNum >= seg.pageTable.length || offset >= seg.limit) {
      output.innerHTML = `Invalid Segment or Page`;
      return;
    }

    const frame = seg.pageTable[pageNum];
    const pAddr = frame * pageSize + offset;

    output.innerHTML = `
      Segment: ${segNum}, Base: ${seg.base}, Limit: ${seg.limit}<br>
      Page Number: ${pageNum}, Offset: ${offset}<br>
      Frame: ${frame}<br>
      Physical Address: <b>${pAddr}</b>
    `;
  }

  else if (mode === "multilevel") {
    const pageSize = parseInt(document.getElementById("pageSize").value);
    const levelBits = document.getElementById("levels").value.split(",").map(Number);
    const allTables = JSON.parse(document.getElementById("multiTables").value);

    const bin = vAddr.toString(2).padStart(32, "0");
    let offsetBits = Math.log2(pageSize);
    let pageBits = levelBits.reduce((a, b) => a + b, 0);
    let bits = bin.slice(32 - pageBits - offsetBits, 32 - offsetBits);
    let offset = parseInt(bin.slice(32 - offsetBits), 2);

    let indexes = [];
    let cursor = 0;
    for (let bitsCount of levelBits) {
      indexes.push(parseInt(bits.slice(cursor, cursor + bitsCount), 2));
      cursor += bitsCount;
    }

    let current = allTables;
    for (let idx of indexes) {
      if (!Array.isArray(current) || idx >= current.length) {
        output.innerHTML = `Invalid page index ${idx} in multi-level table`;
        return;
      }
      current = current[idx];
    }

    const frame = current;
    const pAddr = frame * pageSize + offset;
    output.innerHTML = `
      Page Indexes: ${indexes.join(" → ")}<br>
      Frame: ${frame}<br>
      Offset: ${offset}<br>
      Physical Address: <b>${pAddr}</b>
    `;
  }
}
