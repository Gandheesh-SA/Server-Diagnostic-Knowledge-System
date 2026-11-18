import React, { useEffect, useMemo, useState } from 'react'

const navGroups = [
  { label: 'Foundation', items: [['overview', 'Overview'], ['problem', 'Problem & motivation'], ['objectives', 'Objectives & questions'], ['literature', 'Literature survey']] },
  { label: 'Methodology', items: [['architecture', 'Architecture'], ['dataset', 'Dataset'], ['extraction', 'Knowledge extraction'], ['model', 'Classes & relationships'], ['ontology', 'Ontology'], ['graph', 'Knowledge graph']] },
  { label: 'Evaluation', items: [['results', 'Results overview'], ['oquare', 'OQuaRE'], ['hermit', 'HermiT'], ['shacl', 'RDF & SHACL'], ['competency', 'Competency questions']] },
  { label: 'Next steps', items: [['limitations', 'Limitations & future work'], ['resources', 'Resources']] },
]

const classes = [
  ['EventDefinition', 'A documented Dell event entry with its code, message, severity, and source.', 'BAT0009'],
  ['ReportedCondition', 'The situation described by the event message; it is separate from any suggested cause.', 'Storage battery is absent'],
  ['ComponentType', 'A reusable type of hardware or firmware component mentioned by a condition or instruction.', 'Fan, battery, DIMM'],
  ['TechnicalProperty', 'A measurable or technical aspect of a component.', 'Fan speed'],
  ['PossibleExplanation', 'A source-supported possibility for why a condition was reported.', 'Disconnection or thermal exception'],
  ['RecoveryProcedure', 'The complete documented response for an event.', 'BAT0009 response'],
  ['ProcedureInstruction', 'One ordered instruction inside a response.', 'Check the system logs'],
  ['OperationType', 'The kind of work an instruction requests.', 'Check, reconnect, collect'],
  ['TechnicalArtifactType', 'A type of information or file used or requested by an instruction.', 'System log, TSR'],
]

const relations = [
  ['describesCondition', 'EventDefinition → ReportedCondition', 'BAT0009 → storage battery is absent'],
  ['concernsComponentType', 'ReportedCondition → ComponentType', 'Fan-speed condition → fan'],
  ['concernsTechnicalProperty', 'ReportedCondition → TechnicalProperty', 'Fan-speed condition → speed'],
  ['hasPossibleExplanation', 'ReportedCondition → PossibleExplanation', 'Battery absent → disconnection possibility'],
  ['hasDocumentedResponse', 'EventDefinition → RecoveryProcedure', 'BAT0009 → complete recommended response'],
  ['containsInstruction', 'RecoveryProcedure → ProcedureInstruction', 'BAT0009 procedure → check installation'],
  ['appearsBefore', 'ProcedureInstruction → ProcedureInstruction', 'Verify installation → reconnect battery'],
  ['requestsOperationType', 'ProcedureInstruction → OperationType', 'Check logs → check'],
  ['targetsComponentType', 'ProcedureInstruction → ComponentType', 'Reconnect battery → battery'],
  ['usesArtifactType', 'ProcedureInstruction → TechnicalArtifactType', 'Check system logs → system log'],
  ['requestsArtifactType', 'ProcedureInstruction → TechnicalArtifactType', 'Collect TSR → Technical Support Report'],
  ['investigatesExplanation', 'ProcedureInstruction → PossibleExplanation', 'Check thermal logs → thermal possibility'],
  ['attemptsToCorrectExplanation', 'ProcedureInstruction → PossibleExplanation', 'Reconnect battery → disconnection possibility'],
  ['hasDocumentedPartType', 'ComponentType → ComponentType', 'Documented whole → component part'],
  ['similarEvent', 'RecoveryProcedure ↔ RecoveryProcedure', 'Matching full response text after whitespace normalization'],
]

const scores = [
  ['Functional adequacy', 4.04], ['Structural quality', 4.17], ['Maintainability', 4.18],
  ['Compatibility', 3.75], ['Transferability', 4.25], ['Operability', 3.83], ['Reliability', 3.13],
]

const cqs = [
  ['CQ1', 'Which condition does each event report?', '6,152 events and conditions', 'Pass'],
  ['CQ2', 'Which events report a memory-related condition?', '324 events', 'Pass'],
  ['CQ3', 'Which documented possibilities explain a condition?', '642 events; 656 explanations', 'Pass'],
  ['CQ4', 'What complete response is documented for each event?', '6,152 events', 'Pass'],
  ['CQ5', 'Which instructions belong to procedures and in what order?', '10,133 instructions', 'Pass'],
  ['CQ6', 'Can the graph retrieve nested instruction paths?', 'No structured paths', 'No data'],
  ['CQ7', 'Which events have multiple instructions?', '2,632 events; maximum 8', 'Pass'],
  ['CQ8', 'Which components occur in the most events?', 'Memory: 324 events', 'Pass'],
  ['CQ9', 'Which artifacts are inspected by instructions?', '116 events', 'Pass'],
  ['CQ10', 'Which artifacts are collected by instructions?', '673 events', 'Pass'],
  ['CQ11', 'Can structured threshold values be retrieved?', 'No structured values', 'No data'],
  ['CQ12', 'Can each event be traced to a source and page?', '6,152 events', 'Pass'],
]

const queries = [
  {
    label: '01 · Event lookup', level: 'Simple', question: 'What does Dell say about BAT0009?',
    sql: `SELECT ?code ?severity ?message ?page WHERE {\n  ?event dell:eventCode "BAT0009"^^xsd:string ;\n         dell:eventCode ?code ;\n         dell:severity ?severity ;\n         dell:messageText ?message ;\n         dell:sourcePage ?page .\n}`,
    result: 'BAT0009 · Critical · The storage battery is absent. · p. 87',
  },
  {
    label: '02 · Recommended response', level: 'Simple', question: 'What response is documented for BAT0009?',
    sql: `SELECT ?response WHERE {\n  ?event dell:eventCode "BAT0009"^^xsd:string ;\n         dell:hasDocumentedResponse/dell:procedureText ?response .\n}`,
    result: 'Verify installation → reconnect battery and cables if installed → check thermal logs',
  },
  {
    label: '03 · Ordered steps', level: 'Medium', question: 'Which instructions belong to the response?',
    sql: `SELECT ?step ?instruction WHERE {\n  ?event dell:eventCode "BAT0009"^^xsd:string ;\n         dell:hasDocumentedResponse/dell:containsInstruction ?item .\n  ?item dell:instructionOrder ?step ;\n        dell:instructionText ?instruction .\n} ORDER BY ?step`,
    result: '3 ordered instructions returned',
  },
  {
    label: '04 · Related events', level: 'Medium', question: 'Which events concern a fan and fan speed?',
    sql: `SELECT DISTINCT ?code WHERE {\n  ?event dell:eventCode ?code ;\n         dell:describesCondition ?condition .\n  ?condition dell:concernsComponentType/dell:name "Fan" ;\n             dell:concernsTechnicalProperty/dell:name "Fan speed" .\n}`,
    result: '11 fan-speed events returned',
  },
  {
    label: '05 · Evidence chain', level: 'Hard', question: 'Which steps investigate or correct BAT0009 possibilities?',
    sql: `SELECT ?step ?relation ?explanation ?quote WHERE {\n  ?event dell:eventCode "BAT0009"^^xsd:string ;\n         dell:describesCondition/dell:hasPossibleExplanation ?cause ;\n         dell:hasDocumentedResponse/dell:containsInstruction ?item .\n  ?item dell:instructionOrder ?step ; ?relation ?cause .\n  VALUES ?relation { dell:investigatesExplanation\n                     dell:attemptsToCorrectExplanation }\n  ?cause dell:description ?explanation .\n  ?axiom a owl:Axiom ; owl:annotatedSource ?item ;\n         owl:annotatedProperty ?relation ;\n         owl:annotatedTarget ?cause ; dell:evidenceQuote ?quote .\n} ORDER BY ?step`,
    result: 'Step 2 addresses disconnection; step 3 investigates thermal exceptions',
  },
]

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    book: <><path d="M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 0V4Z" /><path d="M4 20V7a3 3 0 0 1 3-3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    external: <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M20 14v6H4V4h6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="M5 5 19 19M19 5 5 19" /></>,
    layers: <><rect x="3" y="3" width="18" height="6" rx="1" /><rect x="3" y="10" width="18" height="6" rx="1" /><rect x="3" y="17" width="18" height="4" rx="1" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>
}

function Section({ id, eyebrow, title, children, className = '' }) {
  return <section className={`section ${className}`} id={id}>
    <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
    {children}
  </section>
}

function Figure({ src, alt, caption, onOpen }) {
  return <figure className="figure-card">
    <button className="figure-button" onClick={() => onOpen({ src, alt })} aria-label={`Enlarge ${alt}`}>
      <img src={src} alt={alt} loading="lazy" />
      <span className="figure-zoom">Click to enlarge <Icon name="external" size={14} /></span>
    </button>
    <figcaption>{caption}</figcaption>
  </figure>
}

function App() {
  const [active, setActive] = useState('overview')
  const [classSearch, setClassSearch] = useState('')
  const [queryIndex, setQueryIndex] = useState(0)
  const [modal, setModal] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  const filteredClasses = useMemo(() => classes.filter(([name, description]) => `${name} ${description}`.toLowerCase().includes(classSearch.toLowerCase())), [classSearch])
  const activeLabel = navGroups.flatMap(group => group.items).find(([id]) => id === active)?.[1] || 'Overview'

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) setActive(visible[0].target.id)
    }, { rootMargin: '-18% 0px -65% 0px', threshold: [0, 0.25, 0.5] })
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const close = event => { if (event.key === 'Escape') setModal(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const goTo = id => {
    setMobileMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`} aria-label="Page navigation">
      <div className="brand" onClick={() => goTo('overview')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && goTo('overview')}>
        <span className="brand-mark"><span /><span /><span /><span /></span>
        <div><strong>SERVER<span> / </span>KG</strong><small>RESEARCH PORTAL</small></div>
      </div>
      <nav className="nav-groups">
        {navGroups.map(group => <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map(([id, label]) => <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => goTo(id)}><span className="nav-dot" />{label}</button>)}
        </div>)}
      </nav>
    </aside>

    {mobileMenu && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}

    <div className="page-wrap">
      <header className="topbar">
        <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open navigation"><Icon name="menu" /></button>
        <div className="breadcrumbs">RESEARCH <span>/</span> PHASE 1 <span>/</span> <strong>{activeLabel.toUpperCase()}</strong></div>
        <div className="top-actions"><a className="button button-outline top-download" href="/THESIS.pdf" target="_blank" rel="noreferrer"><Icon name="book" size={16} /> Read thesis</a><a className="button button-outline top-download" href="https://github.com/Gandheesh-SA/Knowledge-Engineering-and-Semantic-Computing" target="_blank" rel="noreferrer"><Icon name="external" size={16} /> GitHub</a></div>
      </header>

      <main>
        <Section id="overview" eyebrow="01 / Overview" title="Making server troubleshooting knowledge queryable" className="overview-section">
          <div className="hero-card">
            <div className="hero-copy"><span className="hero-tag">SERVER HARDWARE & FIRMWARE · PHASE 1</span><h1>From vendor guide<br />to connected knowledge.</h1><p>This study turns Dell PowerEdge Critical and Warning event definitions into an ontology and knowledge graph, so an engineer can follow the link from an event to its condition, possible explanation, and documented response.</p><div className="hero-actions"><button className="button button-light" onClick={() => goTo('architecture')}>Explore the methodology <Icon name="arrow" size={16} /></button><a className="button button-ghost" href="/THESIS.pdf" target="_blank" rel="noreferrer">Open full thesis <Icon name="external" size={16} /></a></div></div>
          </div>
          <div className="stat-grid"><div className="stat-card"><strong>6,152</strong><span>event definitions</span><small>Critical and Warning</small></div><div className="stat-card"><strong>339,850</strong><span>RDF triples</span><small>populated graph</small></div><div className="stat-card"><strong>9</strong><span>core classes</span><small>formal ontology model</small></div><div className="stat-card"><strong>3.91<span>/5</span></strong><span>OQuaRE score</span><small>ontology quality</small></div></div>
        </Section>

        <Section id="problem" eyebrow="02 / Foundation" title="The problem this work addresses">
          <div className="two-col"><div className="prose-card"><h3>What happens today</h3><p>When a server hardware test fails, QA engineers inspect BIOS, BMC, and operating-system logs. They then search troubleshooting guides and past incidents. The process takes time and relies heavily on experience, especially when the same underlying issue appears through different messages.</p><p>A document search may locate a relevant page, but the engineer still has to identify the reported condition, separate it from a possible cause, and find the instruction that applies.</p></div><div className="insight-card"><span className="eyebrow">Research gap</span><h3>Connected meaning is missing from plain document search.</h3><p>Prior ICT and HPC ontologies organize events, assets, and operational data. This study focuses on the troubleshooting knowledge within server vendor event guides: what was reported, what may explain it, and what the guide asks the engineer to do.</p></div></div>
          <div className="three-points"><div><b>01</b><h4>One symptom, several possibilities</h4><p>A missing component may indicate a disconnection or another condition. The graph keeps possibilities distinct from confirmed faults.</p></div><div><b>02</b><h4>One response, several kinds of step</h4><p>Checking logs gathers evidence; reconnecting a component attempts correction. Their purposes should remain clear.</p></div><div><b>03</b><h4>One source, traceable evidence</h4><p>Event codes and source pages link the structured answer back to the vendor guide.</p></div></div>
        </Section>

        <Section id="objectives" eyebrow="03 / Foundation" title="Objectives and research questions">
          <div className="two-col"><div className="list-panel"><div className="panel-title"><span className="number-icon">01</span><h3>Research objectives</h3></div><ol><li>Extract concepts and relationships from documented event messages and troubleshooting instructions.</li><li>Design an ontology that separates reported conditions, possible explanations, and the actions engineers are asked to take.</li><li>Populate and validate a graph while keeping instruction order and source references.</li><li>Use SPARQL to test whether the graph answers troubleshooting questions.</li></ol></div><div className="list-panel"><div className="panel-title"><span className="number-icon">02</span><h3>Research questions</h3></div><ol><li>Which concepts and relationships can be derived from the guide?</li><li>Can the ontology separate the report, possible explanation, and recommended response?</li><li>How much of the source information does the graph retain?</li><li>Can queries retrieve components, ordered instructions, and source passages for a given event?</li></ol></div></div>
        </Section>

        <Section id="literature" eyebrow="04 / Foundation" title="What earlier work contributes">
          <p className="section-intro">The thesis reviews work on ontology engineering, ICT incident models, HPC operational data, and knowledge graph diagnosis. These studies inform the modelling and validation method; they do not establish the accuracy of future repair recommendations for this graph.</p>
          <div className="literature-grid"><div className="lit-card"><span>METHOD</span><h3>METHONTOLOGY</h3><p>Provides a staged approach to knowledge acquisition, conceptualization, implementation, evaluation, and maintenance.</p></div><div className="lit-card"><span>DOMAIN</span><h3>NORIA-O & ICT infrastructure</h3><p>Show how events, assets, incident information, and competency questions can be represented in an ontology.</p></div><div className="lit-card"><span>DIAGNOSIS</span><h3>LogKG & AetherLog</h3><p>Show the value of connections between log information and diagnostic context for later retrieval and agent experiments.</p></div></div>
        </Section>

        <Section id="architecture" eyebrow="05 / Methodology" title="The research architecture">
          <p className="section-intro">The guide is converted to structured records, reviewed concepts, an OWL ontology, and a populated RDF graph. SPARQL queries retrieve the connected knowledge.</p>
          <Figure src="/assets/architecture.png" alt="Research architecture diagram" caption="Architecture diagram from the Phase 1 research." onOpen={setModal} />
          <div className="step-strip">{['Troubleshooting guide', 'Knowledge & concepts', 'Ontology construction', 'KG population', 'SPARQL query'].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 4 && <Icon name="arrow" size={16} />}</div>)}</div>
        </Section>

        <Section id="dataset" eyebrow="06 / Methodology" title="The Dell event dataset">
          <div className="dataset-top"><div><p className="section-intro">The dataset contains one JSON record per Critical or Warning event in the Dell PowerEdge Error and Event Messages Reference Guide. Each record retains the original message, recommended action, and PDF pages so the graph can be checked against the source.</p><div className="severity-bars"><div><span>Warning</span><div className="bar-track"><i style={{ width: '59.8%' }} /></div><strong>3,676</strong></div><div><span>Critical</span><div className="bar-track"><i style={{ width: '40.2%' }} /></div><strong>2,476</strong></div></div></div><div className="dataset-callout"><span>DATASET TOTAL</span><strong>6,152</strong><p>event definitions</p><small>Informational entries were outside this Phase 1 dataset.</small></div></div>
          <h3 className="subheading">Record schema</h3><div className="schema-grid">{[['Identity', 'record_id · event_code · event_group'], ['Classification', 'severity · category'], ['Vendor content', 'message · arguments · explanation'], ['Response', 'recommended_action · notes'], ['Traceability', 'source_pages · source_text'], ['Additional data', 'additional_fields']].map(([name, fields]) => <div className="schema-item" key={name}><strong>{name}</strong><code>{fields}</code></div>)}</div>
        </Section>

        <Section id="extraction" eyebrow="07 / Methodology" title="From words to concepts and relationships">
          <p className="section-intro">Text extraction retains the event code and page. The message, explanation, and response are processed separately. NLP proposes technical terms and verb-object patterns; source wording and review determine which concepts and links enter the model.</p>
          <div className="pipeline">{[['01', 'Extract & clean', 'PDF entries, fields, pages'], ['02', 'Segment text', 'Sentences and tokens'], ['03', 'Tag & normalize', 'Part of speech and lemmas'], ['04', 'Read relationships', 'Verb, object, and context'], ['05', 'Map to model', 'Classes, types, and links']].map(([number, title, detail]) => <div className="pipeline-step" key={number}><span>{number}</span><strong>{title}</strong><small>{detail}</small></div>)}</div>
          <div className="example-strip"><div className="quote-label">SOURCE PHRASE</div><blockquote>“Check the system logs for thermal related issues.”</blockquote><div className="token-pills"><span><b>check</b> · operation</span><span><b>system logs</b> · artifact</span><span><b>thermal issues</b> · possible explanation</span></div></div>
        </Section>

        <Section id="model" eyebrow="08 / Methodology" title="The UML model">
          <p className="section-intro">Nine core classes keep different kinds of troubleshooting knowledge separate. The diagram also includes subclasses for components, reported conditions, and operation types.</p>
          <div className="model-figures"><Figure src="/assets/uml.png" alt="Complete UML class diagram" caption="Complete UML class diagram. Open for a larger view." onOpen={setModal} /><Figure src="/assets/subclasses.png" alt="Ontology subclass diagram" caption="Subclass structure for components, conditions, and operations." onOpen={setModal} /></div>
          <div className="table-heading"><h3>Core classes</h3><div className="field-search"><Icon name="search" size={16} /><input type="search" placeholder="Filter classes" value={classSearch} onChange={e => setClassSearch(e.target.value)} aria-label="Filter core classes" /></div></div>
          <div className="class-grid">{filteredClasses.map(([name, description, example], index) => <article className="class-card" key={name}><span className="card-index">{String(index + 1).padStart(2, '0')}</span><h4>{name}</h4><p>{description}</p><small>EXAMPLE <b>{example}</b></small></article>)}</div>
          <div className="table-heading relation-heading"><h3>Object relationships</h3><span>15 named links in the model</span></div><div className="relation-table"><div className="relation-row table-head"><span>Property</span><span>Connects</span><span>Example</span></div>{relations.map(([name, connects, example]) => <div className="relation-row" key={name}><code>{name}</code><span>{connects}</span><span>{example}</span></div>)}</div>
        </Section>

        <Section id="ontology" eyebrow="09 / Methodology" title="A formal ontology for the domain">
          <div className="two-col"><div className="prose-card"><h3>The schema</h3><p>The UML model becomes OWL classes, data properties, and object properties. Domains, ranges, subclass relationships, and justified property characteristics make the intended meaning explicit. Python and RDFLib generate Turtle and RDF/XML versions.</p><p>The graph populates this schema with documented Dell entries. The ontology defines what a relation means; the graph states which event or instruction participates in it.</p></div><div className="layer-stack"><div><span>M2 · UPPER LAYER</span><strong>DUL</strong><small>General categories such as InformationObject, Description, Plan, and Concept</small></div><div><span>M1 · DOMAIN LAYER</span><strong>NORIA-O & SAREF</strong><small>Operation plans and technical properties where the mappings fit</small></div><div><span>PROJECT LAYER</span><strong>Server troubleshooting ontology</strong><small>Nine core classes and source-grounded relationships</small></div></div></div>
        </Section>

        <Section id="graph" eyebrow="10 / Methodology" title="Populating the knowledge graph">
          <p className="section-intro">Each JSON record becomes an EventDefinition individual. The builder creates connected conditions, procedures, instructions, and reusable concepts when the source supports them. Source pages remain attached for traceability.</p>
          <div className="graph-demo"><div className="graph-demo-header"><span>MEMORY EVENT PATH</span><strong>CTL45 · Dell PowerEdge</strong></div><div className="graph-chain"><div><small>EVENT</small><b>CTL45 · Warning</b></div><i>describesCondition</i><div><small>CONDITION</small><b>Single-bit ECC error on controller</b></div><i>hasDocumentedResponse</i><div><small>RESPONSE</small><b>Replace the DIMM to avoid data loss or corruption</b></div></div><div className="graph-chain second"><div><small>EXPLANATION</small><b>The DIMM is beginning to malfunction</b></div><i>documented for</i><div><small>COMPONENT</small><b>Dual In-line Memory Module (DIMM)</b></div><i>source page</i><div><small>REFERENCE</small><b>Page 856</b></div></div><p>The guide presents CTL45 as a single-bit ECC error and recommends replacing the DIMM.</p></div>
        </Section>

        <Section id="results" eyebrow="11 / Evaluation" title="What Phase 1 evaluated">
          <div className="evaluation-grid"><div><span className="eval-icon"><Icon name="layers" /></span><h3>OQuaRE</h3><p>Quality characteristics of the ontology schema.</p><strong>3.91 / 5</strong></div><div><span className="eval-icon"><Icon name="check" /></span><h3>HermiT</h3><p>OWL 2 DL profile and logical consistency.</p><strong>Consistent</strong></div><div><span className="eval-icon"><Icon name="grid" /></span><h3>RDF & SHACL</h3><p>Graph size and checks against the defined shapes.</p><strong>339,850 triples</strong></div><div><span className="eval-icon"><Icon name="search" /></span><h3>SPARQL</h3><p>Competency questions over the populated graph.</p><strong>12-query dry run</strong></div></div>
        </Section>

        <Section id="oquare" eyebrow="12 / Evaluation" title="OQuaRE ontology quality">
          <div className="two-col score-layout"><div className="score-panel"><div className="score-panel-head"><h3>Seven quality characteristics</h3><span>Score / 5</span></div>{scores.map(([label, value]) => <div className="score-row" key={label}><span>{label}</span><div className="score-track"><i style={{ width: `${value / 5 * 100}%` }} /></div><strong>{value.toFixed(2)}</strong></div>)}</div><div className="big-score"><span>OVERALL SCORE</span><strong>3.91<small>/5</small></strong><p>The ontology’s structure can represent the study’s troubleshooting concepts. This score evaluates the schema; it does not measure the success of real repairs.</p></div></div>
        </Section>

        <Section id="hermit" eyebrow="13 / Evaluation" title="HermiT logical consistency">
          <p className="section-intro">The ontology was checked with an OWL 2 DL reasoner. The tested schema had no profile violations, was logically consistent, and had no unsatisfiable named classes.</p><div className="validation-grid">{[['OWL 2 DL', 'Conforms'], ['Profile violations', '0'], ['Ontology consistency', 'True'], ['Unsatisfiable classes', '0'], ['Loaded axioms', '482'], ['Import declarations', '0']].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
        </Section>

        <Section id="shacl" eyebrow="14 / Evaluation" title="RDF statistics and SHACL">
          <div className="two-col"><div className="prose-card"><h3>Graph population</h3><div className="mini-stats"><div><span>Total triples</span><b>339,850</b></div><div><span>Event definitions</span><b>6,152</b></div><div><span>Reported conditions</span><b>6,152</b></div><div><span>Recovery procedures</span><b>6,152</b></div><div><span>Procedure instructions</span><b>10,133</b></div><div><span>Possible explanations</span><b>656</b></div></div></div><div className="insight-card shacl-card"><span className="eyebrow">SHACL RESULT</span><h3>Conforms = true</h3><p>The defined SHACL shapes checked required values, datatypes, cardinalities, and target classes for selected core records. The run reported zero violations within those constraints.</p><div className="note-line">The result applies to the shapes used in this phase; it is not a manual check of every extracted statement.</div></div></div>
        </Section>

        <Section id="competency" eyebrow="15 / Evaluation" title="Can the graph answer the questions?">
          <p className="section-intro">Competency questions turn the research needs into SPARQL tests. The current repository’s 12-query dry run covers event coverage, links, aggregation, source traceability, and known gaps. The thesis presents the core question groups.</p><div className="cq-summary"><div><strong>10</strong><span>returned graph answers</span></div><div><strong>2</strong><span>identified missing structured data</span></div><div><strong>12</strong><span>queries in the extended dry run</span></div></div><div className="cq-list">{cqs.map(([id, question, result, status]) => <div className="cq-row" key={id}><b>{id}</b><span>{question}</span><small>{result}</small><em className={status === 'Pass' ? 'pass' : 'no-data'}>{status}</em></div>)}</div>
          <div className="query-showcase"><div className="query-header"><div><span className="eyebrow">SPARQL SHOWCASE</span><h3>See the graph traversal</h3></div><span className="static-badge">Static examples · no live backend</span></div><div className="query-tabs">{queries.map((query, index) => <button key={query.label} className={queryIndex === index ? 'selected' : ''} onClick={() => setQueryIndex(index)}>{query.label}</button>)}</div><div className="query-body"><div><span className="level-pill">{queries[queryIndex].level}</span><h4>{queries[queryIndex].question}</h4><p><b>Result:</b> {queries[queryIndex].result}</p></div><pre><code>{queries[queryIndex].sql}</code></pre></div></div>
        </Section>

        <Section id="limitations" eyebrow="16 / Next steps" title="What comes next">
          <div className="future-grid"><div><span>01</span><h3>Broaden the sources</h3><p>Test whether the model works with HPE, Cisco, and other troubleshooting documentation.</p></div><div><span>02</span><h3>Refine instruction links</h3><p>Review more instruction targets, possible explanations, nested steps, and conditional paths.</p></div><div><span>03</span><h3>Structure technical values</h3><p>Extract thresholds, units, comparison operators, and measured values from source text.</p></div><div><span>04</span><h3>Evaluate retrieval</h3><p>Compare BM25, semantic, hybrid, and graph-grounded methods in a later phase.</p></div></div>
        </Section>

        <Section id="resources" eyebrow="17 / Resources" title="Explore the research materials">
          <div className="resource-grid"><a href="/THESIS.pdf" target="_blank" rel="noreferrer"><span><strong>Read the thesis</strong><small>Full Phase 1 report · PDF</small></span><Icon name="external" size={16} /></a><a href="/assets/uml.png" target="_blank" rel="noreferrer"><span><strong>Open the UML diagram</strong><small>Classes, subclasses, and links</small></span><Icon name="external" size={16} /></a><a href="/assets/architecture.png" target="_blank" rel="noreferrer"><span><strong>Open the architecture</strong><small>Research workflow diagram</small></span><Icon name="external" size={16} /></a></div>
        </Section>

      </main>
    </div>

    {modal && <div className="modal-backdrop" role="presentation" onClick={() => setModal(null)}><div className="modal-content" role="dialog" aria-modal="true" aria-label={modal.alt} onClick={e => e.stopPropagation()}><div className="modal-top"><strong>{modal.alt}</strong><button onClick={() => setModal(null)} aria-label="Close image"><Icon name="close" /></button></div><div className="modal-image"><img src={modal.src} alt={modal.alt} /></div></div></div>}
  </div>
}

export default App
