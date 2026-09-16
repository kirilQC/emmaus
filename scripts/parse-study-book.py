# Parses the "Emmaus: Scripture-First Bible Study Knowledge Book" PDF into lib/learn/*.json.
# Usage: python3 scripts/parse-study-book.py path/to/book.pdf   (needs pdftotext from poppler)
import json, re, sys, subprocess, os

PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/emmaus-scripture-first-bible-study-book-v2.pdf')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'learn')
raw = subprocess.run(['pdftotext', PDF, '-'], capture_output=True, text=True, check=True).stdout
pages = raw.split('\f')
HEADER = 'EMMAUS / SCRIPTURE-FIRST RESEARCH BOOK · SECOND EDITION'
FOOTER = 'Read the passage first. Grade the claim. Show the caveat.'

def page_lines(a, b):
    out = []
    for p in range(a - 1, b):
        ls = [l.rstrip() for l in pages[p].split('\n')]
        ls = [l for l in ls if l.strip() != HEADER]
        # drop footer and trailing page number
        while ls and ls[-1].strip() == '': ls.pop()
        if ls and re.fullmatch(r'\d+', ls[-1].strip()): ls.pop()
        while ls and ls[-1].strip() == '': ls.pop()
        if ls and ls[-1].strip() == FOOTER: ls.pop()
        out.extend(ls); out.append('')
    return out

def tidy(s):
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r"(?<=\w)'(?=\w)", '’', s)
    return s

def blocks(lines):
    out, cur = [], []
    for l in lines:
        if l.strip() == '':
            if cur: out.append(cur); cur = []
        else: cur.append(l)
    if cur: out.append(cur)
    return out

# ---------------- entries ----------------
HEADERS = ['SCRIPTURE FOUNDATION','EXPLICIT IN THE TEXT','DEEPER INSIGHT','OFTEN UNNOTICED','OUTSIDE CONTEXT','VISUALIZATION','CAVEATS AND LIMITS','KEY QUESTIONS','SOURCE NOTES']
FIELD = {'SCRIPTURE FOUNDATION':'scripture','EXPLICIT IN THE TEXT':'explicit','DEEPER INSIGHT':'insight','OFTEN UNNOTICED':'unnoticed','OUTSIDE CONTEXT':'context','VISUALIZATION':'visual','CAVEATS AND LIMITS':'caveats','KEY QUESTIONS':'questions','SOURCE NOTES':'sources'}
L = page_lines(9, 273)
def next_nonblank(i):
    j = i + 1
    while j < len(L) and L[j].strip() == '': j += 1
    return j
entries, warnings = [], []
i = 0
while i < len(L):
    m = re.match(r'^([FLSNAE]\d{3}) (.+)$', L[i])
    if not m:
        i += 1; continue
    # title may wrap until CATEGORY
    j = i + 1; title = [m.group(2)]
    while j < len(L) and L[j].strip() != 'CATEGORY':
        if L[j].strip(): title.append(L[j])
        j += 1
        if j - i > 4: break
    if j >= len(L) or L[j].strip() != 'CATEGORY':
        i += 1; continue
    e = {'id': m.group(1), 'title': tidy(' '.join(title))}
    # skip the four header words
    k = j
    for w in ['CATEGORY','DIFFICULTY','EVIDENCE','CONFIDENCE']:
        k = next_nonblank(k) if L[k].strip() != w else k
        assert L[k].strip() == w, (e['id'], w, L[k]); k += 1
    # four value blocks
    vals = []
    while len(vals) < 4:
        k = next_nonblank(k - 1) if L[k].strip() == '' else k
        b = []
        while L[k].strip():
            b.append(L[k]); k += 1
        vals.append(tidy(' '.join(b)))
    e['lane'], e['difficulty'], e['evidence'], e['confidence'] = vals
    k = next_nonblank(k - 1); assert L[k].strip() == 'CORE CONCEPT', (e['id'], L[k]); k += 1
    k = next_nonblank(k - 1); assert L[k].strip() == 'WHY IT MATTERS', (e['id'], L[k]); k += 1
    body = []
    while L[k].strip() != 'SCRIPTURE FOUNDATION':
        body.append(L[k]); k += 1
    bl = blocks(body)
    if len(bl) != 2: warnings.append(f"{e['id']}: {len(bl)} blocks for core/why")
    e['core'] = tidy(' '.join(bl[0])) if bl else ''
    e['why'] = tidy(' '.join(sum(bl[1:], []))) if len(bl) > 1 else ''
    # sections
    sec, cur = {}, None
    while k < len(L):
        s = L[k].strip()
        if s in HEADERS: cur = FIELD[s]; sec[cur] = []; k += 1; continue
        if s.startswith('INDEX TAGS'):
            tag = [s]; k += 1
            while k < len(L) and L[k].strip() and not re.match(r'^[FLSNAE]\d{3} ', L[k]):
                tag.append(L[k].strip()); k += 1
            e['_tags'] = ' '.join(tag); break
        if cur: sec[cur].append(L[k])
        k += 1
    # scripture
    refs = []
    for l in sec.get('scripture', []):
        if not l.strip(): continue
        if ' — ' in l:
            r, n = l.split(' — ', 1); refs.append({'ref': tidy(r), 'note': tidy(n)})
        elif refs: refs[-1]['note'] = tidy(refs[-1]['note'] + ' ' + l)
        else: warnings.append(f"{e['id']}: stray scripture line {l!r}")
    e['scripture'] = refs
    for f in ['explicit','insight','unnoticed','context','visual','caveats']:
        e[f] = tidy(' '.join(sec.get(f, [])))
        if not e[f]: warnings.append(f"{e['id']}: empty {f}")
    qs = []
    for l in sec.get('questions', []):
        if l.strip().startswith('•'): qs.append(tidy(l.strip()[1:]))
        elif l.strip() and qs: qs[-1] = tidy(qs[-1] + ' ' + l)
    e['questions'] = qs
    srcs = []
    for l in sec.get('sources', []):
        if not l.strip(): continue
        mm = re.match(r'^\s*([A-Z]-S\d+) (.+)$', l)
        if mm: srcs.append({'id': mm.group(1), 'text': tidy(mm.group(2))})
        elif srcs: srcs[-1]['text'] = tidy(srcs[-1]['text'] + ' ' + l)
    e['sources'] = srcs
    tags = {'doctrine': [], 'characters': [], 'places': []}
    t = e.pop('_tags', '')
    mm = re.match(r'INDEX TAGS Doctrine:(.*?)\| Characters:(.*?)\| Places:(.*)$', t)
    if mm:
        for key, val in zip(['doctrine','characters','places'], mm.groups()):
            tags[key] = [tidy(x) for x in val.split(',') if tidy(x)]
    else: warnings.append(f"{e['id']}: tags unparsed {t!r}")
    e['tags'] = tags
    entries.append(e); i = k
print('entries', len(entries)); assert len(entries) == 265, len(entries)
ids = [e['id'] for e in entries]; assert len(set(ids)) == 265
by_title = {re.sub(r'[^a-z0-9]', '', e['title'].lower()): e['id'] for e in entries}

# ---------------- top 25 ----------------
T = page_lines(274, 280)
path, cur = [], None
for l in T:
    s = l.strip()
    m = re.match(r'^(\d{2})\. (.+)$', s)
    if m: cur = {'n': int(m.group(1)), 'title': m.group(2), 'why': '', 'build': '', 'deps': '', 'guardrail': ''}; path.append(cur); fld = 'title'; continue
    if not cur or not s: continue
    for key, name in [('Why now:', 'why'), ('Build first:', 'build'), ('Dependencies:', 'deps'), ('Guardrail:', 'guardrail')]:
        if s.startswith(key): fld = name; s = s[len(key):].strip(); break
    cur[fld] = tidy(cur[fld] + ' ' + s)
assert len(path) == 25, len(path)
for p in path:
    key = re.sub(r'[^a-z0-9]', '', p['title'].lower())
    p['id'] = by_title.get(key)
    if not p['id']:
        cands = [k for k in by_title if k.startswith(key[:20])]
        if len(cands) == 1: p['id'] = by_title[cands[0]]
        else: warnings.append(f"path {p['n']} unmatched: {p['title']!r} {cands}")

# ---------------- expansion 26-35 ----------------
X = page_lines(281, 281)
expansion, cur = [], None
for l in X:
    s = l.strip()
    m = re.match(r'^(\d{2})\. (E\d{3}) (.+)$', s)
    if m: cur = {'n': int(m.group(1)), 'id': m.group(2), 'title': m.group(3), 'why': ''}; expansion.append(cur); continue
    if cur and s: cur['why'] = tidy(cur['why'] + ' ' + s)
    if cur and not s and cur['why']: cur = None
assert len(expansion) == 10

# ---------------- rabbit holes ----------------
R = page_lines(284, 287)
questions, cur = [], None
for l in R:
    s = l.strip()
    m = re.match(r'^(R\d{2})\. (.+)$', s)
    if m: cur = {'id': m.group(1), 'q': m.group(2), 'body': '', 'posture': '', 'visual': ''}; questions.append(cur); continue
    if not cur or not s: continue
    if s.startswith('Evidence posture:'):
        mm = re.match(r'Evidence posture: (.*?) \| Suggested visual: (.*)$', s)
        if mm: cur['posture'], cur['visual'] = tidy(mm.group(1)), tidy(mm.group(2))
        else: warnings.append(f"{cur['id']} posture unparsed {s!r}")
        cur = None
    else: cur['body'] = tidy(cur['body'] + ' ' + s)
assert len(questions) == 50, len(questions)
for q in questions: q['new'] = int(q['id'][1:]) > 40

# ---------------- themes ----------------
def expand(ids):
    out = []
    for part in re.split(r',\s*', ids.strip()):
        m = re.match(r'^(E)(\d{3})-E(\d{3})$', part)
        if m: out.extend(f"E{n:03d}" for n in range(int(m.group(2)), int(m.group(3)) + 1))
        elif re.match(r'^[FLSNAE]\d{3}$', part): out.append(part)
    return out
TH = page_lines(288, 289)
themes = []
for b in blocks(TH):
    if any(l.startswith('Canonical span:') for l in b):
        ci = next(i for i, l in enumerate(b) if l.startswith('Canonical span:'))
        t = {'title': b[ci - 1].strip()}
        for l in b[ci:]:
            if l.startswith('Canonical span:'): t['span'] = tidy(l.split(':', 1)[1])
            elif l.startswith('Suggested experience:'): t['experience'] = tidy(l.split(':', 1)[1])
            elif l.startswith('New entries on this trail:'): t['entries'] = expand(l.split(':', 1)[1])
        themes.append(t)
assert len(themes) == 12, len(themes)

# ---------------- verification log ----------------
V = page_lines(292, 292)
verification = {'confirmed': [], 'corrected': [], 'flagged': []}
key = None
for l in V:
    s = l.strip()
    if s == 'Checked and confirmed': key = 'confirmed'; continue
    if s == 'Corrected in this edition': key = 'corrected'; continue
    if s == 'Deliberately flagged or downgraded': key = 'flagged'; continue
    if not key or not s: continue
    if s.startswith('•'): verification[key].append(tidy(s[1:]))
    elif verification[key]: verification[key][-1] = tidy(verification[key][-1] + ' ' + s)

# ---------------- resource and asset registry ----------------
RR = page_lines(290, 291)
GROUPS = ['Original-language and text tools', 'Teaching and thematic resources', 'Maps and visual assets, with licenses']
tools, g, audit = [], None, ''
bl = blocks(RR)
for b in bl:
    first = b[0].strip()
    if first in GROUPS: g = {'group': first, 'items': []}; tools.append(g); rest = b[1:]
    elif first.startswith('Reference works to consult'): g = None; rest = []
    elif first.startswith('What the audit shows.'): audit = tidy(' '.join(b)); rest = []
    elif g is not None: rest = b
    else: rest = []
    if g is not None and rest:
        for item in blocks(rest) if any(x.strip() == '' for x in rest) else [rest]:
            name = item[0].strip(); url = ''; desc = []
            for l in item[1:]:
                if l.strip().startswith('http'): url = l.strip()
                else: desc.append(l)
            g['items'].append({'name': tidy(name), 'desc': tidy(' '.join(desc)), 'url': url})
tools.append({'group': 'Reference works to consult before publishing a cultural claim', 'items': [
    {'name': 'Craig S. Keener, IVP Bible Background Commentary', 'desc': 'Verse-by-verse cultural notes with restraint; the first check for any “in Jesus’s day” claim.', 'url': ''},
    {'name': 'Kenneth Bailey and Amy-Jill Levine (read together)', 'desc': 'Bailey for Middle Eastern cultural readings, Levine for the Jewish scholarly corrective; using both prevents one-sided reconstructions.', 'url': ''},
    {'name': 'Michael Heiser, The Unseen Realm', 'desc': 'Stimulating on the divine council thread; treat as one debated framework (see A023, A042) rather than settled background.', 'url': ''},
    {'name': 'N. T. Wright, Jesus and the Victory of God; Paul and the Faithfulness of God', 'desc': 'Second Temple context for the Gospels and Paul at academic depth.', 'url': ''},
    {'name': 'Rachel Hachlili; L. Y. Rahmani', 'desc': 'Standard references on Jewish burial and ossuaries.', 'url': ''},
]})

# ---------------- source registry ----------------
SR = page_lines(318, 338)
CATS = ['Academic Biblical Scholarship','Ancient History','Archaeology','Atlases and Geography','Biblical Commentaries','Early Christian Sources','Early Jewish Sources','Ecumenical Statements','Historical Theology','Official Christian Statements','Online Academic Resources','Original Languages','Second Temple Judaism','Textual Criticism','Textual and Literary Studies','Translation and Language']
sources, cat, cur = [], None, None
def finish(cur):
    if not cur: return
    pre = [l for l in cur['_pre'] if l.strip()]
    url = ''
    for l in list(pre):
        if l.strip().startswith('http'): url = l.strip(); pre.remove(l)
    publisher = pre.pop().strip() if len(pre) > 1 else ''
    cur['title'] = tidy(' '.join(pre)); cur['publisher'] = tidy(publisher); cur['url'] = url
    del cur['_pre']; del cur['_field']
    for f in ['why', 'consulted', 'supports']: cur[f] = tidy(cur.get(f, ''))
def is_cat(idx):
    if SR[idx].strip() not in CATS: return False
    j = idx + 1
    while j < len(SR) and not SR[j].strip(): j += 1
    return j < len(SR) and re.match(r'^[A-Z]-S\d+ ', SR[j].strip()) is not None
for idx, l in enumerate(SR):
    s = l.strip()
    if is_cat(idx):
        finish(cur); cur = None; cat = s; continue
    m = re.match(r'^([A-Z]-S\d+) (.+)$', s)
    if m and cat:
        finish(cur); cur = {'id': m.group(1), 'category': cat, '_pre': [m.group(2)], '_field': None}; sources.append(cur); continue
    if not cur: continue
    if s.startswith('Why this source:'): cur['_field'] = 'why'; s = s[len('Why this source:'):]
    elif s.startswith('Consulted:'): cur['_field'] = 'consulted'; s = s[len('Consulted:'):]
    elif s.startswith('Supports:'): cur['_field'] = 'supports'; s = s[len('Supports:'):]
    if cur['_field']:
        if s: cur[cur['_field']] = cur.get(cur['_field'], '') + ' ' + s
    else: cur['_pre'].append(s)
finish(cur)
print('sources', len(sources)); assert len(sources) == 153, len(sources)
for s in sources:
    if not s['title'] or not s['why']: warnings.append(f"source {s['id']} incomplete: {s}")
src_ids = {s['id'] for s in sources}
missing = sorted({x['id'] for e in entries for x in e['sources']} - src_ids)
if missing: warnings.append(f"source notes without registry entry: {missing}")

os.makedirs(OUT, exist_ok=True)
json.dump(entries, open(f'{OUT}/studies.json', 'w'), ensure_ascii=False, indent=0)
lite = [{'id': e['id'], 'title': e['title'], 'lane': e['lane'], 'difficulty': e['difficulty'], 'evidence': e['evidence'], 'refs': [r['ref'] for r in e['scripture']], 'doctrine': e['tags']['doctrine']} for e in entries]
json.dump(lite, open(f'{OUT}/lite.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump({'path': path, 'expansion': expansion, 'questions': questions, 'themes': themes, 'verification': verification, 'tools': tools, 'audit': audit, 'sources': sources}, open(f'{OUT}/extras.json', 'w'), ensure_ascii=False, indent=0)
print('lanes', json.dumps({k: sum(1 for e in entries if e['lane'] == k) for k in dict.fromkeys(e['lane'] for e in entries)}, indent=0))
print('difficulty', sorted({e['difficulty'] for e in entries}))
print('evidence', sorted({e['evidence'] for e in entries}))
print('confidence', sorted({e['confidence'] for e in entries}))
print('with questions', sum(1 for e in entries if e['questions']), 'with sources', sum(1 for e in entries if e['sources']))
print('WARNINGS', len(warnings)); print('\n'.join(warnings))
