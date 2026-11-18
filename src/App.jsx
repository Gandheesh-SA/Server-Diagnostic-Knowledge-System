import React, { useEffect, useMemo, useState } from 'react'

const navGroups = [
  { label: 'Thesis', items: [['overview', 'Overview'], ['problem', 'Problem & motivation'], ['objectives', 'Objectives & questions'], ['literature', 'Literature survey']] },
  { label: 'Methodology and implementation', items: [['architecture', 'Architecture'], ['dataset', 'Dataset'], ['extraction', 'Knowledge extraction'], ['model', 'Classes & relationships'], ['ontology', 'Ontology design'], ['graph', 'Knowledge graph'], ['implementation', 'Implementation details'], ['code', 'Code and project files']] },
  { label: 'Evaluation', items: [['results', 'Results overview'], ['oquare', 'OQuaRE'], ['hermit', 'HermiT'], ['shacl', 'RDF & SHACL'], ['competency', 'Competency questions']] },
  { label: 'Next steps', items: [['limitations', 'Limitations & future work'], ['resources', 'Resources']] },
]

const sectionList = navGroups.flatMap(group => group.items.map(([id, label]) => ({ id, label })))
const researchRepo = 'https://github.com/Gandheesh-SA/Knowledge-Engineering-and-Semantic-Computing'
const portalRepo = 'https://github.com/Gandheesh-SA/Server-Diagnostic-Knowledge-System'
const publicBase = import.meta.env.BASE_URL
const publicFile = path => `${publicBase}${path}`
const repoFiles = [
  { group: 'Dataset and extraction', files: [
    ['dell_test/DATASET/events.json', 'The Dell event catalogue used to populate the knowledge graph, with source message, severity, explanation, recommendation and page references.'],
    ['dell_test/DATASET/README.md', 'Dataset description, scope, field schema and notes on how the records are used.'],
    ['dell_test/Knowledge%20Extraction/Knowledge%20Extraction.py', 'Python extraction pipeline for reading the guide, selecting event entries and identifying candidate terms and action patterns.'],
    ['dell_test/Knowledge%20Extraction/Knowledge%20Extraction.docx', 'Readable report describing the knowledge and concept extraction work.'],
  ]},
  { group: 'Ontology and diagrams', files: [
    ['dell_test/ontology/build_ontology.py', 'RDFLib script that defines the ontology classes, subclass structure and properties.'],
    ['dell_test/ontology/ontology.ttl', 'Human-readable Turtle serialization of the ontology.'],
    ['dell_test/ontology/ontology.owl', 'RDF/XML serialization of the same ontology.'],
    ['dell_test/diagram/uml_diag.png', 'Complete UML class diagram with classes, properties and relationships.'],
    ['dell_test/diagram/classes_without_data_properties.png', 'UML overview focused on classes and relationships, without data-property detail.'],
    ['dell_test/diagram/subclasses.png', 'Diagram showing the subclass hierarchy.'],
    ['dell_test/diagram/diagram.png', 'Additional exported class-diagram image.'],
    ['dell_test/diagram/uml_diag.pdf', 'PDF export of the UML diagram for printing or sharing.'],
    ['dell_test/diagram/ontology_uml.html', 'Interactive HTML version of the UML diagram.'],
    ['dell_test/diagram/ontology_uml_with_m1_m2.html', 'Interactive diagram showing the external ontology layer mappings.'],
    ['dell_test/diagram/architecture_diagram.png', 'Architecture diagram for the research workflow.'],
  ]},
  { group: 'Knowledge graph', files: [
    ['dell_test/knowledge%20graph/build_kg.py', 'RDFLib builder that reads event data and ontology definitions, then creates event, condition, procedure, instruction and concept nodes.'],
    ['dell_test/knowledge%20graph/knowledge_graph.ttl', 'Turtle serialization of the populated graph.'],
    ['dell_test/knowledge%20graph/knowledge_graph.owl', 'RDF/XML serialization of the populated graph.'],
    ['dell_test/knowledge%20graph/shapes.ttl', 'SHACL shapes used to check structural requirements in the populated data.'],
  ]},
  { group: 'Evaluation', files: [
    ['dell_test/evaluation/competency%20questions/CQ01_events_and_conditions.rq', 'SPARQL query for event codes, severity and reported conditions.'],
    ['dell_test/evaluation/competency%20questions/CQ02_memory_events.rq', 'SPARQL query for events linked to the Memory component concept.'],
    ['dell_test/evaluation/competency%20questions/CQ03_explanation_coverage.rq', 'Nested query that calculates possible-explanation coverage by severity.'],
    ['dell_test/evaluation/competency%20questions/CQ04_documented_response.rq', 'SPARQL query retrieving each event’s full documented response.'],
    ['dell_test/evaluation/competency%20questions/CQ05_inspect_system_log.rq', 'Query that follows BAT0009 to the instruction using system logs.'],
    ['dell_test/evaluation/competency%20questions/CQ06_instruction_targets.rq', 'Query for instruction targets in BAT0009 and BAT0014.'],
    ['dell_test/evaluation/competency%20questions/CQ07_instruction_distribution.rq', 'Nested aggregation counting procedures by number of recorded instruction items.'],
    ['dell_test/evaluation/competency%20questions/CQ08_longest_procedures.rq', 'Nested query finding event procedures tied for the largest recorded item count.'],
    ['dell_test/evaluation/competency%20questions/CQ09_critical_share_by_component.rq', 'Aggregation of Critical events by linked component type.'],
    ['dell_test/evaluation/competency%20questions/CQ10_missing_explanation.rq', 'Additional query checking which events have no linked explanation; outside the nine questions reported in the thesis results.'],
    ['dell_test/evaluation/competency%20questions/CQ11_instruction_sequence.rq', 'Additional query inspecting instruction order; outside the nine questions reported in the thesis results.'],
    ['dell_test/evaluation/competency%20questions/CQ12_missing_threshold_fields.rq', 'Additional query checking structured threshold fields; outside the nine questions reported in the thesis results.'],
    ['dell_test/evaluation/run_cq.py', 'Command-line runner that loads the Turtle graph, executes a selected saved competency query and prints result rows.'],
    ['dell_test/evaluation/run_dell_cqs.py', 'Supplementary script that executes a broader set of competency checks and writes a JSON result report.'],
    ['dell_test/evaluation/oquare.xml', 'Machine-readable OQuaRE evaluation output.'],
    ['dell_test/evaluation/shacl_validation_report.ttl', 'SHACL validation report for the graph and the selected shapes.'],
    ['dell_test/evaluation/dell_cq_results_updated.json', 'Structured results from the full-graph run of the 12 saved competency queries.'],
    ['dell_test/evaluation/dell_cq_results.json', 'Earlier saved competency-query results.'],
    ['dell_test/ppt_test/run_queries.py', 'Runner for the five presentation queries.'],
    ['dell_test/ppt_test/README.md', 'Instructions for running the presentation query examples.'],
    ['dell_test/ppt_test/01_event_lookup.rq', 'Presentation query that looks up an event definition.'],
    ['dell_test/ppt_test/02_recommended_response.rq', 'Presentation query that retrieves the documented response.'],
    ['dell_test/ppt_test/03_ordered_instructions.rq', 'Presentation query that retrieves the ordered procedure instructions.'],
    ['dell_test/ppt_test/04_fan_speed_events.rq', 'Presentation query for events connected to fan-speed information.'],
    ['dell_test/ppt_test/05_explanation_evidence_chain.rq', 'Presentation query that follows an explanation and supporting graph links.'],
  ]},
  { group: 'Thesis and paper', files: [
    ['Server%20Diagnostic%20Knowledge%20System/README.md', 'Portal README with local setup and project navigation notes.'],
    ['dell_test/IEEE_Conference_Paper.tex', 'LaTeX source for the conference paper draft.'],
    ['dell_test/IEEE_Conference_Paper.pdf', 'Rendered conference paper draft.'],
    ['dell_test/Approach%20Document.pdf', 'Supporting write-up of the research approach.'],
  ]},
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

const schemaFields = [
  ['record_id', 'Unique identifier assigned to the dataset record.'],
  ['event_code', 'Original event or error code from the Dell guide.'],
  ['event_group', 'Event family or group stated in the guide.'],
  ['severity', 'Documented severity, such as Critical or Warning.'],
  ['category', 'Hardware or system category associated with the event.'],
  ['message', 'Original event message, including placeholders.'],
  ['arguments', 'Documented placeholder names and their meanings, where provided.'],
  ['explanation', 'Detailed description provided by the guide.'],
  ['recommended_action', 'Complete troubleshooting recommendation from the guide.'],
  ['notes', 'Additional notes, conditions or cautions.'],
  ['additional_fields', 'Other vendor-specific fields present in the entry.'],
  ['source_pages', 'PDF pages containing the event entry.'],
  ['source_text', 'Extracted source wording retained for checking.'],
]

const scores = [
  ['Functional adequacy', 4.04], ['Structural quality', 4.17], ['Maintainability', 4.18],
  ['Compatibility', 3.75], ['Transferability', 4.25], ['Operability', 3.83], ['Reliability', 3.13],
]

const cqs = [
  { id: 'CQ1', question: 'Which Critical and Warning events are recorded, and what condition does each report?', result: '6,152 event-condition rows: one reported condition for each event.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT ?code ?severity ?conditionText WHERE {\n  ?event d:eventCode ?code ; d:severity ?severity ;\n         d:describesCondition/d:description ?conditionText .\n  FILTER (STR(?severity) IN ("Critical", "Warning"))\n} ORDER BY ?code` },
  { id: 'CQ2', question: 'Which events identify Memory as an affected component?', result: '324 events are linked to the Memory component concept.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT DISTINCT ?code ?component WHERE {\n  ?event d:eventCode ?code ; d:describesCondition/d:concernsComponentType/d:name ?component .\n  FILTER (STR(?component) = "Memory")\n} ORDER BY ?code` },
  { id: 'CQ3', question: 'What proportion of each severity group has a linked possible explanation?', result: 'Critical: 299 of 2,476 (12.1%). Warning: 343 of 3,676 (9.3%).', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT ?severity (COUNT(?event) AS ?events)\n       (SUM(?covered) AS ?withExplanation)\n       (ROUND(1000 * SUM(?covered) / COUNT(?event)) / 10 AS ?percent)\nWHERE {\n  { SELECT ?event ?severity (IF(COUNT(?why) > 0, 1, 0) AS ?covered) WHERE {\n      ?event a d:EventDefinition ; d:severity ?severity .\n      OPTIONAL { ?event d:describesCondition/d:hasPossibleExplanation ?why }\n    } GROUP BY ?event ?severity }\n} GROUP BY ?severity ORDER BY ?severity` },
  { id: 'CQ4', question: 'What complete troubleshooting response does the guide recommend for each event?', result: '6,152 documented response texts are retrieved, one for each event.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT ?code ?response WHERE {\n  ?event d:eventCode ?code ; d:hasDocumentedResponse/d:procedureText ?response .\n} ORDER BY ?code` },
  { id: 'CQ5', question: 'For BAT0009, which instruction asks the engineer to inspect the system logs?', result: 'One match: step 3 asks the engineer to check system logs for thermal-related issues.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n\nSELECT ?code ?step ?instruction ?artifact WHERE {\n  VALUES ?code { "BAT0009"^^xsd:string }\n  ?event d:eventCode ?code ; d:hasDocumentedResponse/d:containsInstruction ?item .\n  ?item d:instructionOrder ?step ; d:instructionText ?instruction ; d:usesArtifactType/d:name ?artifact .\n  FILTER (STR(?artifact) = "System log")\n} ORDER BY ?step` },
  { id: 'CQ6', question: 'For BAT0009 and BAT0014, which component does each instruction target?', result: 'Six instruction rows are returned. Some rows have no target component recorded, so this question is a partial result.', status: 'Partial', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n\nSELECT ?code ?step ?instruction ?component WHERE {\n  VALUES ?code { "BAT0009"^^xsd:string "BAT0014"^^xsd:string }\n  ?event d:eventCode ?code ; d:hasDocumentedResponse/d:containsInstruction ?item .\n  ?item d:instructionOrder ?step ; d:instructionText ?instruction .\n  OPTIONAL { ?item d:targetsComponentType/d:name ?component }\n} ORDER BY ?code ?step ?component` },
  { id: 'CQ7', question: 'How many procedures contain each number of recorded instructions?', result: '1 item: 3,520 procedures; 2: 1,576; 3: 834; 4: 182; 5: 26; 6: 4; 7: 3; 8: 7. Total: 6,152 procedures and 10,133 items.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT ?instructions (COUNT(?procedure) AS ?procedures) WHERE {\n  { SELECT ?procedure (COUNT(DISTINCT ?item) AS ?instructions) WHERE {\n      ?procedure a d:RecoveryProcedure .\n      OPTIONAL { ?procedure d:containsInstruction ?item }\n    } GROUP BY ?procedure }\n} GROUP BY ?instructions ORDER BY ?instructions` },
  { id: 'CQ8', question: 'Which events have the largest number of recorded instructions?', result: 'Seven events tie at the maximum of eight: PCI1318, PCI1320, PCI1360, PCI1363, PCI3039, PCI3040 and SEKM088.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT ?code ?instructions WHERE {\n  { SELECT (MAX(?count) AS ?maximum) WHERE {\n      { SELECT ?event (COUNT(DISTINCT ?item) AS ?count) WHERE {\n          ?event d:eventCode ?eventCode ; d:hasDocumentedResponse/d:containsInstruction ?item .\n        } GROUP BY ?event }\n    } }\n  { SELECT ?code (COUNT(DISTINCT ?item) AS ?instructions) WHERE {\n      ?event d:eventCode ?code ; d:hasDocumentedResponse/d:containsInstruction ?item .\n    } GROUP BY ?code }\n  FILTER (?instructions = ?maximum)\n} ORDER BY ?code` },
  { id: 'CQ9', question: 'For each component type, what percentage of linked events is Critical?', result: '15 component-type summaries are returned, each with its linked-event count, Critical-event count and percentage. This is a catalogue share, not a real-world failure rate.', status: 'Pass', query: `PREFIX d: <https://example.org/dell-troubleshooting#>\n\nSELECT ?component (COUNT(?event) AS ?linkedEvents) (SUM(?flag) AS ?criticalEvents)\n       (ROUND(1000 * SUM(?flag) / COUNT(?event)) / 10 AS ?percent)\nWHERE {\n  { SELECT DISTINCT ?component ?event (IF(STR(?severity) = "Critical", 1, 0) AS ?flag) WHERE {\n      ?event d:severity ?severity ; d:describesCondition/d:concernsComponentType/d:name ?component .\n    } }\n} GROUP BY ?component ORDER BY DESC(?percent) ?component` },
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

function Section({ id, eyebrow, title, children, className = '', current = false }) {
  return <section className={`section ${className} ${current ? 'is-current' : ''}`} id={id} aria-hidden={!current}>
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
  const initialSection = sectionList.some(section => section.id === window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'overview'
  const [active, setActive] = useState(initialSection)
  const [classSearch, setClassSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  const filteredClasses = useMemo(() => classes.filter(([name, description]) => `${name} ${description}`.toLowerCase().includes(classSearch.toLowerCase())), [classSearch])
  const activeLabel = navGroups.flatMap(group => group.items).find(([id]) => id === active)?.[1] || 'Overview'

  const activeIndex = sectionList.findIndex(section => section.id === active)

  useEffect(() => {
    const onHistoryChange = () => {
      const next = window.location.hash.slice(1)
      if (sectionList.some(section => section.id === next)) {
        setActive(next)
        window.scrollTo({ top: 0 })
      }
    }
    window.addEventListener('popstate', onHistoryChange)
    return () => window.removeEventListener('popstate', onHistoryChange)
  }, [])

  useEffect(() => {
    const onArrow = event => {
      if (event.target instanceof HTMLElement && event.target.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowRight' && activeIndex < sectionList.length - 1) goTo(sectionList[activeIndex + 1].id)
      if (event.key === 'ArrowLeft' && activeIndex > 0) goTo(sectionList[activeIndex - 1].id)
    }
    window.addEventListener('keydown', onArrow)
    return () => window.removeEventListener('keydown', onArrow)
  }, [activeIndex])

  useEffect(() => {
    const close = event => { if (event.key === 'Escape') setModal(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const goTo = id => {
    setMobileMenu(false)
    setActive(id)
    history.pushState(null, '', `#${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <div className="breadcrumbs">THESIS <span>/</span> SERVER TROUBLESHOOTING <span>/</span> <strong>{activeLabel.toUpperCase()}</strong></div>
        <div className="section-count">{activeIndex + 1} / {sectionList.length}</div>
        <div className="top-actions"><a className="button button-outline top-download" href={portalRepo} target="_blank" rel="noreferrer"><Icon name="external" size={16} /> GitHub</a></div>
      </header>

      <main>
        <Section id="overview" eyebrow="01 / Overview" title="Making server troubleshooting knowledge queryable" className="overview-section" current={active === 'overview'}>
          <div className="hero-card">
          <div className="hero-copy"><h1>Server Diagnostic Knowledge System</h1><p>This project represents server event definitions and their documented troubleshooting information in an ontology and knowledge graph.</p><div className="hero-actions"><button className="button button-light" onClick={() => goTo('architecture')}>View methodology <Icon name="arrow" size={16} /></button></div></div>
          </div>
          <div className="stat-grid"><div className="stat-card"><strong>6,152</strong><span>event definitions</span><small>Critical and Warning</small></div><div className="stat-card"><strong>339,850</strong><span>RDF triples</span><small>populated graph</small></div><div className="stat-card"><strong>9</strong><span>core classes</span><small>formal ontology model</small></div><div className="stat-card"><strong>3.91<span>/5</span></strong><span>OQuaRE score</span><small>ontology quality</small></div></div>
          <div className="content-block"><div className="content-block-heading"><span>PROJECT AT A GLANCE</span><h3>What was built in this phase</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Part</th><th>What it contains</th><th>Why it matters</th></tr></thead><tbody><tr><td>Dataset</td><td>6,152 source-traceable Dell Critical and Warning event definitions</td><td>Provides documented material for modelling.</td></tr><tr><td>Ontology</td><td>Classes, subclasses, data properties and named relationships</td><td>Defines a consistent vocabulary for troubleshooting knowledge.</td></tr><tr><td>Knowledge graph</td><td>Event, condition, procedure, instruction and concept nodes</td><td>Makes their documented connections queryable.</td></tr><tr><td>Evaluation</td><td>OQuaRE, HermiT, SHACL, RDF statistics and SPARQL questions</td><td>Checks schema quality, logic, graph structure and query coverage.</td></tr></tbody></table></div></div>
          <div className="callout"><strong>Scope of this portal</strong><p>Phase 1 builds and checks the knowledge representation. It does not compare retrieval algorithms or claim that a documented action has repaired a live server.</p></div>
        </Section>

        <Section id="problem" eyebrow="02 / Foundation" title="The problem this work addresses" current={active === 'problem'}>
          <div className="two-col"><div className="prose-card"><h3>What happens today</h3><p>When a server hardware test fails, QA engineers inspect BIOS, BMC, and operating-system logs. They then search troubleshooting guides and past incidents. The process takes time and relies heavily on experience, especially when the same underlying issue appears through different messages.</p><p>A document search may locate a relevant page, but the engineer still has to identify the reported condition, separate it from a possible cause, and find the instruction that applies.</p></div><div className="insight-card"><span className="eyebrow">Research gap</span><h3>Connected meaning is missing from plain document search.</h3><p>Prior ICT and HPC ontologies organize events, assets, and operational data. This study focuses on the troubleshooting knowledge within server vendor event guides: what was reported, what may explain it, and what the guide asks the engineer to do.</p></div></div>
          <div className="three-points"><div><b>01</b><h4>One symptom, several possibilities</h4><p>A missing component may indicate a disconnection or another condition. The graph keeps possibilities distinct from confirmed faults.</p></div><div><b>02</b><h4>One response, several kinds of step</h4><p>Checking logs gathers evidence; reconnecting a component attempts correction. Their purposes should remain clear.</p></div><div><b>03</b><h4>One source, traceable evidence</h4><p>Event codes and source pages link the structured answer back to the vendor guide.</p></div></div>
          <div className="content-block"><div className="content-block-heading"><span>WHY A GRAPH</span><h3>Finding a page is only the first step</h3></div><p className="body-copy">A troubleshooting entry can contain a message, an explanation, a possible cause and several instructions. These pieces are often presented through headings and paragraphs rather than explicit database links. The reader has to reconstruct the connections. This project makes those connections explicit so a query can follow from the event to the relevant condition and documented response.</p><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Guide information</th><th>Engineer’s question</th><th>Graph representation</th></tr></thead><tbody><tr><td>Event code and message</td><td>Which event matches this message?</td><td>EventDefinition and ReportedCondition</td></tr><tr><td>Possible explanation</td><td>What possibilities does the guide describe?</td><td>PossibleExplanation linked to the condition</td></tr><tr><td>Recommended steps</td><td>What should I check or do, and in what order?</td><td>RecoveryProcedure with ProcedureInstruction nodes</td></tr><tr><td>Source page</td><td>Where did this information come from?</td><td>Source reference retained with the event</td></tr></tbody></table></div></div>
        </Section>

        <Section id="objectives" eyebrow="03 / Foundation" title="Objectives and research questions" current={active === 'objectives'}>
          <div className="two-col"><div className="list-panel"><div className="panel-title"><span className="number-icon">01</span><h3>Research objectives</h3></div><ol><li>Extract concepts and relationships from documented event messages and troubleshooting instructions.</li><li>Design an ontology that separates reported conditions, possible explanations, and the actions engineers are asked to take.</li><li>Populate and validate a graph while keeping instruction order and source references.</li><li>Use SPARQL to test whether the graph answers troubleshooting questions.</li></ol></div><div className="list-panel"><div className="panel-title"><span className="number-icon">02</span><h3>Research questions</h3></div><ol><li>Which concepts and relationships can be derived from the guide?</li><li>Can the ontology separate the report, possible explanation, and recommended response?</li><li>How much of the source information does the graph retain?</li><li>Can queries retrieve components, ordered instructions, and source passages for a given event?</li></ol></div></div>
          <div className="content-block"><div className="content-block-heading"><span>PHASE BOUNDARY</span><h3>What this phase does and does not test</h3></div><div className="two-col"><div className="prose-card"><h4>Included</h4><p>Dataset preparation, concept and relationship modelling, ontology construction, graph population, logical and structural validation, and SPARQL competency-question checks.</p></div><div className="prose-card"><h4>Planned for later work</h4><p>BM25, semantic and hybrid retrieval comparisons; a graph-grounded language-model system; and evaluation against reviewed diagnostic answers.</p></div></div></div>
        </Section>

        <Section id="literature" eyebrow="04 / Foundation" title="What earlier work contributes" current={active === 'literature'}>
          <p className="section-intro">The thesis reviews work on ontology engineering, ICT incident models, HPC operational data, and knowledge graph diagnosis. These studies inform the modelling and validation method; they do not establish the accuracy of future repair recommendations for this graph.</p>
          <div className="content-block"><div className="content-block-heading"><span>RELATED WORK REVIEWED IN THE THESIS</span><h3>Research themes and what we took from them</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Theme</th><th>Studies discussed</th><th>Contribution to this project</th></tr></thead><tbody><tr><td>Ontology engineering</td><td>METHONTOLOGY (Fernández-López et al., 1997)</td><td>Organises work from knowledge acquisition and conceptualisation through implementation and evaluation.</td></tr><tr><td>HPC and ICT knowledge</td><td>Unified ODA ontology; High-Level Ontology Network for ICT Infrastructures; NORIA-O</td><td>Informs representation of infrastructure, events and operations, and use of competency questions.</td></tr><tr><td>Failure diagnosis and maintenance</td><td>LogKG; FDD-ON; FOLIO-based anomaly analysis</td><td>Supports keeping symptoms, components, explanations and diagnostic actions distinct and connected.</td></tr><tr><td>Knowledge graphs and language models</td><td>AetherLog; OntoLogX; intelligent fault diagnosis for cyber-physical systems; Klein et al. root-cause analysis</td><td>Motivates source-grounded extraction and treating graph reasoning, retrieval and answer quality as separate evaluation questions.</td></tr></tbody></table></div></div><div className="literature-grid"><div className="lit-card"><span>SHARED FINDING</span><h3>Structure organises evidence</h3><p>Explicit links make it possible to query relationships that are difficult to recover from isolated text alone.</p></div><div className="lit-card"><span>CAUTION</span><h3>Quality depends on the knowledge</h3><p>Incomplete extraction or noisy graph content can limit diagnosis. A graph’s existence by itself does not establish correct recommendations.</p></div><div className="lit-card"><span>OUR PHASE</span><h3>Build and validate the representation</h3><p>This phase focuses on a server troubleshooting catalogue and checks whether the graph can answer defined questions.</p></div></div>
        </Section>

        <Section id="architecture" eyebrow="05 / Methodology" title="The research architecture" current={active === 'architecture'}>
          <p className="section-intro">The guide is converted to structured records, reviewed concepts, an OWL ontology, and a populated RDF graph. SPARQL queries retrieve the connected knowledge.</p>
          <Figure src={publicFile('assets/architecture.png')} alt="Research architecture diagram" caption="Architecture diagram from the Phase 1 research." onOpen={setModal} />
          <div className="step-strip">{['Troubleshooting guide', 'Knowledge & concepts', 'Ontology construction', 'KG population', 'SPARQL query'].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 4 && <Icon name="arrow" size={16} />}</div>)}</div>
          <div className="content-block"><div className="content-block-heading"><span>ARCHITECTURE BLOCKS</span><h3>What each block contributes</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Block</th><th>Role in the project</th><th>Output or contribution</th></tr></thead><tbody><tr><td>Troubleshooting Guide</td><td>Provides event definitions and vendor-authored response text.</td><td>Source evidence with event code and page reference.</td></tr><tr><td>Knowledge & Concepts</td><td>Identifies technical terms, action verbs, conditions and candidate links.</td><td>Reviewed concepts and relationship candidates.</td></tr><tr><td>Domain Expert</td><td>Checks whether a term and link fit the troubleshooting context and guide wording.</td><td>Mapping decisions grounded in the source.</td></tr><tr><td>External Ontologies</td><td>Offer reusable vocabulary when a concept has a suitable match.</td><td>Selected M1/M2 mappings, without forcing a match.</td></tr><tr><td>Ontology Construction</td><td>Defines classes, properties, hierarchy, domains, ranges and constraints.</td><td>OWL schema in Turtle and RDF/XML.</td></tr><tr><td>Knowledge Graph Construction</td><td>Creates event and supporting individuals from structured records.</td><td>RDF graph linked to evidence and procedures.</td></tr><tr><td>User Query to Knowledge Graph</td><td>Expresses a question as a SPARQL pattern over graph properties.</td><td>Selected connected records and values.</td></tr><tr><td>Output</td><td>Displays matching graph information for inspection.</td><td>Queryable answers drawn from the represented guide.</td></tr></tbody></table></div></div>
        </Section>

        <Section id="dataset" eyebrow="06 / Methodology" title="The Dell event dataset" current={active === 'dataset'}>
          <div className="dataset-top"><div><p className="section-intro">The dataset contains one JSON record per Critical or Warning event in the Dell PowerEdge Error and Event Messages Reference Guide. Each record retains the original message, recommended action, and PDF pages so the graph can be checked against the source.</p><div className="severity-bars"><div><span>Warning</span><div className="bar-track"><i style={{ width: '59.8%' }} /></div><strong>3,676</strong></div><div><span>Critical</span><div className="bar-track"><i style={{ width: '40.2%' }} /></div><strong>2,476</strong></div></div></div><div className="dataset-callout"><span>DATASET TOTAL</span><strong>6,152</strong><p>event definitions</p><small>Informational entries were outside this Phase 1 dataset.</small></div></div>
          <h3 className="subheading">Dataset fields</h3><div className="schema-table-wrap"><table className="schema-table"><thead><tr><th>Field</th><th>What it stores</th></tr></thead><tbody>{schemaFields.map(([field, description]) => <tr key={field}><td><code>{field}</code></td><td>{description}</td></tr>)}</tbody></table></div>
          <div className="content-block"><div className="content-block-heading"><span>DATASET DESIGN</span><h3>How entries were selected and preserved</h3></div><div className="three-points"><div><b>Selection</b><h4>Critical and Warning entries</h4><p>The dataset includes 2,476 Critical and 3,676 Warning entries. Informational entries were outside this phase.</p></div><div><b>One entry</b><h4>One documented event</h4><p>Each JSON object represents one catalogue definition, not one particular server incident.</p></div><div><b>Traceability</b><h4>Source wording stays available</h4><p>Messages, explanations, recommendations, page numbers and extracted text let the record be checked against the guide.</p></div></div><div className="sample-record"><div><span>EXAMPLE RECORD</span><strong>BAT0009</strong><small>Critical · storage battery entry</small></div><pre><code>{`message: “The storage battery is absent.”\nexplanation: disconnection or thermal exceptions may be involved\naction: verify installation; reconnect if installed; inspect logs`}</code></pre></div></div>
        </Section>

        <Section id="extraction" eyebrow="07 / Methodology" title="From words to concepts and relationships" current={active === 'extraction'}>
          <p className="section-intro">The source guide is converted into event records with page references. Message, explanation, and recommended response are kept separate, then analysed so the original text remains available as evidence for each candidate concept and link.</p>
          <div className="pipeline">{[['01', 'Extract & clean', 'PDF entries, fields, pages'], ['02', 'Segment text', 'Sentences and tokens'], ['03', 'Tag & normalize', 'Part of speech and lemmas'], ['04', 'Read relationships', 'Verb, object, and context'], ['05', 'Map to model', 'Classes, types, and links']].map(([number, title, detail]) => <div className="pipeline-step" key={number}><span>{number}</span><strong>{title}</strong><small>{detail}</small></div>)}</div>
          <div className="extraction-grid">
            <article><span>01 · Find candidate concepts</span><h3>Nouns and technical phrases</h3><p>Part-of-speech tagging highlights terms such as <b>battery</b>, <b>GPU</b>, <b>system logs</b>, and <b>SupportAssist collection</b>. These are candidates to classify as components, technical artifacts, or other concepts; a noun does not automatically become a new class.</p></article>
            <article><span>02 · Normalize word forms</span><h3>Lemmas group related verbs</h3><p>Lemmatisation groups forms such as <i>checking</i>, <i>checked</i>, and <i>check</i> under <b>check</b>. It helps compare how instructions are phrased while leaving the original sentence unchanged in the dataset.</p></article>
            <article><span>03 · Find action and target</span><h3>Dependency parsing</h3><p>The parser examines how an action connects to its object: <b>check → system logs</b>, or <b>reconnect → battery and cables</b>. The surrounding words and conditions are kept so the action is not detached from its purpose.</p></article>
          </div>
          <div className="example-strip"><div className="quote-label">HOW THE WORDING SUPPORTS A LINK · BAT0009</div><blockquote>“Check the system logs for thermal related issues.”</blockquote><div className="extraction-mapping"><div><small>VERB / ACTION</small><b>check</b><span>operation candidate</span></div><div><small>OBJECT</small><b>system logs</b><span>artifact candidate</span></div><div><small>PURPOSE</small><b>thermal-related issues</b><span>possible explanation being investigated</span></div></div><p className="extraction-caption">The verb and its object suggest what to inspect; the purpose phrase indicates why. The source wording is reviewed before the corresponding classes and relationships are asserted in the graph.</p></div>
          <div className="extraction-grid extraction-grid-two">
            <article><span>04 · Read the document structure</span><h3>Preserve procedure context</h3><p>Numbered steps, headings, order, and conditions such as <i>if installed</i> or <i>if the issue persists</i> help identify which instructions belong to a response and when they apply.</p></article>
            <article><span>05 · Map reviewed evidence</span><h3>Concepts become graph links</h3><p>Reviewed terms map to classes such as <code>ComponentType</code>, <code>TechnicalArtifactType</code>, <code>OperationType</code>, and <code>PossibleExplanation</code>. A documented response becomes a <code>RecoveryProcedure</code> with ordered <code>ProcedureInstruction</code> items.</p></article>
          </div>
          <div className="content-block"><div className="content-block-heading"><span>HOW TERMS ARE GROUPED</span><h3>From words in a record to reusable concepts</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Text evidence</th><th>Candidate knowledge</th><th>Possible model location</th></tr></thead><tbody><tr><td>Nouns and phrases such as battery, DIMM, GPU and fan</td><td>Hardware or firmware component</td><td>ComponentType and its relevant subclass</td></tr><tr><td>Terms such as absent, exceeds threshold, unidentifiable</td><td>State or issue described by the event</td><td>ReportedCondition and a suitable condition subclass</td></tr><tr><td>Verbs such as inspect, verify, collect, replace, reconnect</td><td>Work requested by a procedure step</td><td>ProcedureInstruction linked to an OperationType</td></tr><tr><td>Action objects such as system logs or support report</td><td>Evidence source or information artifact</td><td>TechnicalArtifactType</td></tr><tr><td>Purpose phrases such as “for thermal issues”</td><td>Possible explanation the instruction examines</td><td>PossibleExplanation, when source-supported</td></tr></tbody></table></div><p className="small-note">NLP identifies candidates; it does not prove that a link is correct. The source sentence and surrounding procedure are reviewed before a relationship is asserted.</p></div>
        </Section>

        <Section id="model" eyebrow="08 / Methodology" title="The UML model" current={active === 'model'}>
          <p className="section-intro">Nine core classes keep different kinds of troubleshooting knowledge separate. The diagram also includes subclasses for components, reported conditions, and operation types.</p>
          <div className="model-figures"><Figure src={publicFile('assets/uml.png')} alt="Complete UML class diagram" caption="Complete UML class diagram. Open for a larger view." onOpen={setModal} /><Figure src={publicFile('assets/subclasses.png')} alt="Ontology subclass diagram" caption="Subclass structure for components, conditions, and operations." onOpen={setModal} /></div>
          <div className="table-heading"><h3>Core classes</h3><div className="field-search"><Icon name="search" size={16} /><input type="search" placeholder="Filter classes" value={classSearch} onChange={e => setClassSearch(e.target.value)} aria-label="Filter core classes" /></div></div>
          <div className="class-grid">{filteredClasses.map(([name, description, example], index) => <article className="class-card" key={name}><span className="card-index">{String(index + 1).padStart(2, '0')}</span><h4>{name}</h4><p>{description}</p><small>EXAMPLE <b>{example}</b></small></article>)}</div>
          <div className="table-heading relation-heading"><h3>Object relationships</h3><span>15 named links in the model</span></div><div className="relation-table"><div className="relation-row table-head"><span>Property</span><span>Connects</span><span>Example</span></div>{relations.map(([name, connects, example]) => <div className="relation-row" key={name}><code>{name}</code><span>{connects}</span><span>{example}</span></div>)}</div>
          <div className="content-block"><div className="content-block-heading"><span>SUBCLASS HIERARCHY</span><h3>Specific kinds inherit from a broader class</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Parent class</th><th>Subclasses in the model</th><th>Purpose</th></tr></thead><tbody><tr><td>ComponentType</td><td>HardwareComponentType; FirmwareComponentType</td><td>Separates physical components from firmware-related components.</td></tr><tr><td>HardwareComponentType</td><td>Processing, Memory, Cooling, Storage, Power, Interconnect and Security component types</td><td>Groups hardware concepts by their role.</td></tr><tr><td>ReportedCondition</td><td>Availability, Threshold, Compatibility, Integrity and Error conditions</td><td>Groups the kind of condition an event describes.</td></tr><tr><td>OperationType</td><td>Diagnostic, Corrective and Management operation types</td><td>Distinguishes checks, attempted remedies and management work.</td></tr></tbody></table></div><p className="small-note">For example, a MemoryComponentType is also a HardwareComponentType and a ComponentType.</p></div>
        </Section>

        <Section id="ontology" eyebrow="09 / Methodology" title="A formal ontology for the domain" current={active === 'ontology'}>
          <div className="two-col"><div className="prose-card"><h3>The schema</h3><p>The UML model becomes OWL classes, data properties, and object properties. Domains, ranges, subclass relationships, and justified property characteristics make the intended meaning explicit. Python and RDFLib generate Turtle and RDF/XML versions.</p><p>The graph populates this schema with documented Dell entries. The ontology defines what a relation means; the graph states which event or instruction participates in it.</p></div><div className="layer-stack"><div><span>M2 · UPPER LAYER</span><strong>DUL</strong><small>General categories such as InformationObject, Description, Plan, and Concept</small></div><div><span>M1 · DOMAIN LAYER</span><strong>NORIA-O & SAREF</strong><small>Operation plans and technical properties where the mappings fit</small></div><div><span>PROJECT LAYER</span><strong>Server troubleshooting ontology</strong><small>Nine core classes and source-grounded relationships</small></div></div></div>
          <div className="content-block"><div className="content-block-heading"><span>CONSTRUCTION STEPS</span><h3>How the ontology is expressed</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Step</th><th>What is defined</th><th>Example</th></tr></thead><tbody><tr><td>1 · Set scope</td><td>Purpose and questions the model should support.</td><td>Represent event definitions and retrieve their documented responses.</td></tr><tr><td>2 · Define classes</td><td>Types of knowledge and their broader/narrower groupings.</td><td>EventDefinition, ReportedCondition, RecoveryProcedure and subclasses.</td></tr><tr><td>3 · Define properties</td><td>Literal-valued data properties and graph-linking object properties.</td><td>eventCode stores a code; describesCondition links an event to a condition.</td></tr><tr><td>4 · Add semantics</td><td>Labels, descriptions, domains, ranges and suitable restrictions.</td><td>Each property has an explicit meaning and expected connection.</td></tr><tr><td>5 · Serialize and check</td><td>Machine-readable files and logical evaluation.</td><td>Turtle and RDF/XML; HermiT checks the OWL model.</td></tr></tbody></table></div><p className="small-note">DUL provides the M2 upper-level framing. NORIA-O and SAREF supply M1 domain vocabulary only where the meanings fit. The project’s server troubleshooting concepts remain explicit in its own ontology.</p></div>
        </Section>

        <Section id="graph" eyebrow="10 / Methodology" title="Populating the knowledge graph" current={active === 'graph'}>
          <p className="section-intro">Each JSON record becomes an EventDefinition individual. The builder creates connected conditions, procedures, instructions, and reusable concepts when the source supports them. Source pages remain attached for traceability.</p>
          <div className="graph-demo"><div className="graph-demo-header"><span>WORKED GRAPH PATH</span><strong>BAT0009 · Dell PowerEdge</strong></div><div className="graph-chain"><div><small>EVENT DEFINITION</small><b>BAT0009 · Critical</b></div><i>describesCondition</i><div><small>REPORTED CONDITION</small><b>Storage battery is absent</b></div><i>hasPossibleExplanation</i><div><small>POSSIBLE EXPLANATION</small><b>Disconnection or thermal exception</b></div></div><div className="graph-chain second"><div><small>RECOVERY PROCEDURE</small><b>Documented response</b></div><i>containsInstruction</i><div><small>PROCEDURE INSTRUCTION</small><b>Check logs for thermal issues</b></div><i>usesArtifactType</i><div><small>ARTIFACT TYPE</small><b>System log</b></div></div><p>The path connects an event to its condition, source-described possibilities and procedure steps. It preserves the guide’s wording and does not treat a possible explanation as a confirmed root cause.</p></div>
          <div className="content-block"><div className="content-block-heading"><span>GRAPH BASICS</span><h3>Schema, individuals and triples</h3></div><div className="three-points"><div><b>Ontology class</b><h4>Defines a kind of thing</h4><p><code>EventDefinition</code> describes the type of resource used for one guide entry.</p></div><div><b>Graph individual</b><h4>Represents one entry</h4><p><code>BAT0009</code> is an individual of <code>EventDefinition</code>.</p></div><div><b>RDF triple</b><h4>States one connection</h4><p><code>BAT0009 describesCondition BatteryAbsent</code> is a subject–property–object statement.</p></div></div></div>
        </Section>

        <Section id="implementation" eyebrow="11 / Implementation" title="How the model was implemented" current={active === 'implementation'}>
          <p className="section-intro">The implementation turns the reviewed dataset and UML design into OWL definitions and RDF data. Python and RDFLib are used to construct the ontology and populate the graph.</p>
          <div className="implementation-grid">
            <article><span>01</span><h3>Load source records</h3><p>Each JSON event supplies the code, severity, message, explanation, recommendation and source reference used for graph population.</p></article>
            <article><span>02</span><h3>Create graph individuals</h3><p>Event records become EventDefinition individuals. Conditions and documented responses are represented separately and linked to the event.</p></article>
            <article><span>03</span><h3>Represent instructions</h3><p>Where the extraction provides instruction candidates, each is stored as a ProcedureInstruction with its source text and order. The complete response text remains available on the procedure.</p></article>
            <article><span>04</span><h3>Connect reusable concepts</h3><p>Component types, technical properties, possible explanations, operation types and artifacts are linked when supported by the documented wording.</p></article>
            <article><span>05</span><h3>Keep source evidence</h3><p>Source page references and supporting text are retained so a graph statement can be checked against the Dell guide.</p></article>
            <article><span>06</span><h3>Save and validate</h3><p>The ontology and graph are serialized as Turtle and RDF/XML. HermiT checks the ontology; SHACL checks graph data against the defined shapes; SPARQL runs the competency questions.</p></article>
          </div>
          <div className="implementation-note"><strong>Implementation coverage</strong><p>The graph contains 6,152 event definitions, 6,152 condition nodes, 6,152 procedures, 10,133 instruction items and 656 possible explanation nodes. These counts describe what was populated; they do not mean every detailed relationship is present for every event.</p></div>
          <div className="content-block"><div className="content-block-heading"><span>REPRODUCIBLE BUILD ORDER</span><h3>Inputs, processing and outputs</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Order</th><th>Input or action</th><th>Output</th></tr></thead><tbody><tr><td>1</td><td>Read the structured event JSON and its source references.</td><td>Source records ready for graph creation.</td></tr><tr><td>2</td><td>Load the OWL vocabulary and create event individuals.</td><td>EventDefinition nodes with data properties.</td></tr><tr><td>3</td><td>Create condition, procedure and instruction nodes from each record.</td><td>Connected event-response structure and ordered steps.</td></tr><tr><td>4</td><td>Map reviewed component, property, operation and artifact terms.</td><td>Reusable concepts linked to relevant records.</td></tr><tr><td>5</td><td>Serialize, validate and query the graph.</td><td>TTL/OWL graph, SHACL report and SPARQL result sets.</td></tr></tbody></table></div><p className="small-note">The repository file list links to the implementation materials. Graph construction uses the dataset and ontology; it does not use an LLM to invent facts.</p></div>
        </Section>

        <Section id="code" eyebrow="12 / Project files" title="Code and files in the repository" current={active === 'code'}>
          <p className="section-intro">This section is the file guide for the GitHub repository. Each entry links to its file and explains what it contributes to the project, so a reader can move from the dataset through construction and evaluation.</p>
          <div className="repo-files-heading"><div><span className="eyebrow">GITHUB REPOSITORY</span><h3>Files grouped by their role</h3></div><a href={researchRepo} target="_blank" rel="noreferrer">Open repository <Icon name="external" size={14} /></a></div>
          <p className="repo-files-intro">Open a group to see its files. The descriptions distinguish source data, scripts that build the artefacts, and the generated ontology, graph and evaluation outputs.</p>
          <div className="repo-folders">{repoFiles.map(folder => <details className="repo-folder" key={folder.group}><summary><strong>{folder.group}</strong><span>{folder.files.length} files</span></summary><div className="repo-file-list">{folder.files.map(([path, description]) => <div className="repo-file" key={path}><a href={`${researchRepo}/blob/main/${path}`} target="_blank" rel="noreferrer"><code>{path.split('/').pop().replaceAll('%20', ' ')}</code><Icon name="external" size={12} /></a><span><code className="repo-path">{path.replaceAll('%20', ' ')}</code> — {description}</span></div>)}</div></details>)}</div>
          <div className="run-query-note"><strong>Run a saved competency query locally</strong><code>python3 "dell_test/evaluation/run_cq.py" 1</code><span>Run from the repository root with Python and RDFLib installed. Change the final number to select a saved query.</span></div>
          <div className="content-block"><div className="content-block-heading"><span>HOW TO FOLLOW THE CODE</span><h3>Read the project in this order</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Start with</th><th>Then inspect</th><th>To see</th></tr></thead><tbody><tr><td>Dataset and README</td><td>Knowledge extraction materials</td><td>What source fields were retained and how text candidates were prepared.</td></tr><tr><td>Ontology builder and OWL/TTL</td><td>UML diagrams</td><td>How classes and relationships are defined and shown.</td></tr><tr><td>Knowledge graph builder</td><td>Generated KG files</td><td>How dataset records become graph individuals and links.</td></tr><tr><td>Evaluation queries and reports</td><td>Thesis</td><td>How graph structure and competency questions were checked and reported.</td></tr></tbody></table></div></div>
          <div className="code-next"><div><span className="eyebrow">CONTINUE</span><strong>Next: Results overview</strong></div><button className="button button-light" onClick={() => goTo('results')}>Next <Icon name="arrow" size={16} /></button></div>
        </Section>

        <Section id="results" eyebrow="13 / Evaluation" title="What Phase 1 evaluated" current={active === 'results'}>
          <div className="evaluation-grid"><div><span className="eval-icon"><Icon name="layers" /></span><h3>OQuaRE</h3><p>Quality characteristics of the ontology schema.</p><strong>3.91 / 5</strong></div><div><span className="eval-icon"><Icon name="check" /></span><h3>HermiT</h3><p>OWL 2 DL profile and logical consistency.</p><strong>Consistent</strong></div><div><span className="eval-icon"><Icon name="grid" /></span><h3>RDF & SHACL</h3><p>Graph size and checks against the defined shapes.</p><strong>339,850 triples</strong></div><div><span className="eval-icon"><Icon name="search" /></span><h3>SPARQL</h3><p>Nine thesis competency questions over the populated graph.</p><strong>8 pass · 1 partial</strong></div></div>
          <div className="results-summary"><h3>What the results show</h3><p>The ontology is logically consistent, the graph conforms to the SHACL constraints used, and SPARQL retrieves event conditions, complete responses, ordered instructions and selected component links. The queries also expose incomplete coverage: some instruction targets are missing, and the graph does not represent every troubleshooting detail as a structured link.</p><p>These checks evaluate the model and graph representation. They do not measure whether an action repairs a live server, and this phase does not compare retrieval methods or language-model answers.</p></div>
          <div className="content-block"><div className="content-block-heading"><span>READING THE EVIDENCE TOGETHER</span><h3>Each evaluation answers a different question</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Measure</th><th>Question it answers</th><th>Phase 1 result</th></tr></thead><tbody><tr><td>OQuaRE</td><td>How well-formed is the ontology schema?</td><td>Overall score: 3.91/5.</td></tr><tr><td>HermiT</td><td>Does the OWL ontology contain logical contradictions?</td><td>Consistent; zero unsatisfiable named classes.</td></tr><tr><td>RDF statistics</td><td>How much data and how many graph elements were created?</td><td>339,850 triples and 6,152 event definitions.</td></tr><tr><td>SHACL</td><td>Does the graph meet the structural rules in the shapes?</td><td>Conforms; zero reported violations for the defined shapes.</td></tr><tr><td>Competency questions</td><td>Can queries retrieve information needed by the research?</td><td>Queries return core event, condition, response and instruction information, and expose coverage gaps.</td></tr></tbody></table></div></div>
        </Section>

        <Section id="oquare" eyebrow="14 / Evaluation" title="OQuaRE ontology quality" current={active === 'oquare'}>
          <div className="two-col score-layout"><div className="score-panel"><div className="score-panel-head"><h3>Seven quality characteristics</h3><span>Score / 5</span></div>{scores.map(([label, value]) => <div className="score-row" key={label}><span>{label}</span><div className="score-track"><i style={{ width: `${value / 5 * 100}%` }} /></div><strong>{value.toFixed(2)}</strong></div>)}</div><div className="big-score"><span>OVERALL SCORE</span><strong>3.91<small>/5</small></strong><p>The ontology’s structure can represent the study’s troubleshooting concepts. This score evaluates the schema; it does not measure the success of real repairs.</p></div></div>
          <div className="results-summary"><h3>Interpretation</h3><p>Transferability is the highest characteristic at 4.25, followed by maintainability at 4.18 and structural quality at 4.17. Reliability is the lowest at 3.13. OQuaRE evaluates ontology structure and properties; the separate HermiT, SHACL and competency-question results provide other checks of the implemented model and graph.</p></div>
          <div className="content-block"><div className="content-block-heading"><span>WHAT EACH CHARACTERISTIC SAYS</span><h3>How to read the seven scores</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Characteristic</th><th>What it evaluates</th><th>Reading our score</th></tr></thead><tbody><tr><td>Functional adequacy · 4.04</td><td>Whether the model contains concepts and relations for its intended task.</td><td>The core troubleshooting concepts are represented; extra detail could extend coverage.</td></tr><tr><td>Structural quality · 4.17</td><td>How consistently classes, properties and hierarchy are organised.</td><td>The schema has a defined structure for graph population.</td></tr><tr><td>Maintainability · 4.18</td><td>How manageable the ontology is to update.</td><td>New events and related concepts can be added using the model.</td></tr><tr><td>Compatibility · 3.75</td><td>How well the ontology can work with other vocabularies and systems.</td><td>RDF/OWL provide a basis; additional alignment can be explored.</td></tr><tr><td>Transferability · 4.25</td><td>Potential reuse in related settings.</td><td>General concepts may transfer beyond this Dell set, subject to testing.</td></tr><tr><td>Operability · 3.83</td><td>Whether tools can load and work with the ontology.</td><td>The ontology can be used with the project’s RDF and OWL tools.</td></tr><tr><td>Reliability · 3.13</td><td>Model characteristics associated with dependable use.</td><td>This is a schema-level result, not a measured repair success rate.</td></tr></tbody></table></div><p className="small-note">OQuaRE evaluates the ontology file, not the populated KG. Interpret it alongside logical consistency, SHACL validation and query results.</p></div>
        </Section>

        <Section id="hermit" eyebrow="15 / Evaluation" title="HermiT logical consistency" current={active === 'hermit'}>
          <p className="section-intro">The ontology was checked with an OWL 2 DL reasoner. The tested schema had no profile violations, was logically consistent, and had no unsatisfiable named classes.</p><div className="validation-grid">{[['OWL 2 DL', 'Conforms'], ['Profile violations', '0'], ['Ontology consistency', 'True'], ['Unsatisfiable classes', '0'], ['Loaded axioms', '482'], ['Import declarations', '0']].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
          <div className="content-block"><div className="content-block-heading"><span>HOW TO INTERPRET THE CHECK</span><h3>What HermiT checked</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Measure</th><th>Plain meaning</th><th>What our result indicates</th></tr></thead><tbody><tr><td>OWL 2 DL conformance</td><td>Whether the ontology uses constructs allowed by the profile.</td><td>The ontology can be assessed under the selected profile.</td></tr><tr><td>Profile violations</td><td>Number of uses that break those profile rules.</td><td>Zero violations were reported.</td></tr><tr><td>Consistency</td><td>Whether the axioms can be true together without contradiction.</td><td>No logical conflict was detected.</td></tr><tr><td>Unsatisfiable named classes</td><td>Classes that could not have any possible member due to conflicting definitions.</td><td>Zero classes were identified as impossible.</td></tr><tr><td>Loaded axioms</td><td>Formal statements read during reasoning.</td><td>482 axioms were checked; this is not a count of graph records.</td></tr><tr><td>Import declarations</td><td>External ontologies declared as imports in this OWL file.</td><td>Zero declared imports; mentioning or mapping a vocabulary is not itself an import.</td></tr></tbody></table></div><div className="callout"><strong>What this result does not mean</strong><p>Consistency means the formal statements do not contradict one another. It does not prove every event was extracted correctly or that each recommendation works in practice.</p></div></div>
        </Section>

        <Section id="shacl" eyebrow="16 / Evaluation" title="RDF statistics and SHACL" current={active === 'shacl'}>
          <div className="two-col"><div className="prose-card"><h3>Graph population</h3><div className="mini-stats"><div><span>Total triples</span><b>339,850</b></div><div><span>Distinct subjects</span><b>46,355</b></div><div><span>Distinct predicates</span><b>41</b></div><div><span>Distinct objects</span><b>68,095</b></div><div><span>Event definitions</span><b>6,152</b></div><div><span>Reported conditions</span><b>6,152</b></div><div><span>Recovery procedures</span><b>6,152</b></div><div><span>Procedure instructions</span><b>10,133</b></div><div><span>Possible explanations</span><b>656</b></div></div></div><div className="insight-card shacl-card"><span className="eyebrow">SHACL RESULT</span><h3>Conforms = true</h3><p>The shapes checked required values, datatypes, cardinalities and target classes for event definitions, recovery procedures and procedure instructions. The validation report recorded zero violations against those constraints.</p><div className="note-line">This confirms structural compliance with the defined shapes; it does not prove that every domain relationship is complete or factually correct.</div></div></div>
          <div className="content-block"><div className="content-block-heading"><span>WHAT WAS VALIDATED</span><h3>SHACL checks structure, not domain truth</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Shape target</th><th>Structural checks</th><th>What a pass tells us</th></tr></thead><tbody><tr><td>EventDefinition</td><td>Required identifiers/codes, expected value types and selected cardinalities.</td><td>Event nodes meet the structural rules declared for this target.</td></tr><tr><td>RecoveryProcedure</td><td>Required response text and selected links/cardinalities.</td><td>Procedure nodes satisfy the constraints checked.</td></tr><tr><td>ProcedureInstruction</td><td>Instruction text, order value and valid relationship target types.</td><td>Represented instruction nodes satisfy the selected checks.</td></tr></tbody></table></div><p className="small-note">SHACL reports conformity with the supplied shapes. It does not independently verify that a source interpretation is complete or correct.</p></div>
        </Section>

        <Section id="competency" eyebrow="17 / Evaluation" title="Can the graph answer the questions?" current={active === 'competency'}>
          <p className="section-intro">The competency questions were derived from the knowledge types and links in the ontology: events, conditions, components, explanations, procedures, instructions, artifacts and sources. Each question below includes its SPARQL query and the result reported in the thesis. The queries are shown for reference; this page is not connected to a live graph database.</p>
          <div className="cq-summary"><div><strong>8</strong><span>queries returned the requested results</span></div><div><strong>1</strong><span>partial result because some targets are missing</span></div><div><strong>9</strong><span>questions reported in the thesis</span></div></div>
          <div className="cq-list">{cqs.map(cq => <details className="cq-detail" key={cq.id}><summary><span className="cq-id">{cq.id}</span><span className="cq-question">{cq.question}</span><span className={`cq-status ${cq.status === 'Pass' ? 'pass' : 'no-data'}`}>{cq.status}</span></summary><div className="cq-result"><b>Result</b><p>{cq.result}</p></div><div className="cq-query"><div><b>SPARQL query</b><span>Read-only query over the project graph</span></div><pre><code>{cq.query}</code></pre></div></details>)}</div>
          <div className="content-block"><div className="content-block-heading"><span>HOW TO READ THE RESULTS</span><h3>Coverage means the graph can answer the question</h3></div><p className="body-copy">A passing query shows that the graph contains and connects the fields needed for that question. A partial result points to missing links or values. For example, the graph may return instruction text while some instructions have no structured component target. Competency questions test whether the graph can answer its intended information needs; they do not determine whether an action fixes a live server.</p><div className="callout"><strong>Nine thesis questions and additional query files</strong><p>The thesis reports CQ1–CQ9. The repository also contains saved queries for additional checks. Those extra files are not part of the nine-question result summary in the thesis.</p></div></div>
        </Section>

        <Section id="limitations" eyebrow="18 / Next steps" title="What comes next" current={active === 'limitations'}>
          <div className="future-grid"><div><span>01</span><h3>Broaden the sources</h3><p>Test whether the model works with HPE, Cisco, and other troubleshooting documentation.</p></div><div><span>02</span><h3>Refine instruction links</h3><p>Review more instruction targets, possible explanations, nested steps, and conditional paths.</p></div><div><span>03</span><h3>Structure technical values</h3><p>Extract thresholds, units, comparison operators, and measured values from source text.</p></div><div><span>04</span><h3>Evaluate retrieval</h3><p>Compare BM25, semantic, hybrid, and graph-grounded methods in a later phase.</p></div></div>
          <div className="content-block"><div className="content-block-heading"><span>PHASE 1 LIMITATIONS</span><h3>Where the current representation stops</h3></div><div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Limitation</th><th>Current boundary</th><th>Possible next work</th></tr></thead><tbody><tr><td>Single-vendor source</td><td>The implemented catalogue is based on the Dell PowerEdge guide.</td><td>Apply the model to HPE, Cisco and other server documentation, then review shared terms.</td></tr><tr><td>Uneven detailed links</td><td>Instruction targets, operation types, artifacts and explanation links are not populated uniformly.</td><td>Improve extraction and source review of instruction-level relationships.</td></tr><tr><td>Nested and conditional instructions</td><td>Order is represented, but nested branches and full decision paths are limited.</td><td>Represent substeps, prerequisites and conditional paths explicitly.</td></tr><tr><td>Technical values in text</td><td>Some thresholds, units, voltages, temperatures and speeds remain in prose.</td><td>Structure values, units, comparison operators and threshold levels.</td></tr><tr><td>Evaluation scope</td><td>Phase 1 checks ontology quality, logic, graph structure and query capability.</td><td>Evaluate retrieval methods and graph-grounded answer generation in later work.</td></tr></tbody></table></div></div>
        </Section>

        <Section id="resources" eyebrow="19 / Resources" title="Explore the research materials" current={active === 'resources'}>
          <div className="resource-grid"><a href={publicFile('assets/uml.png')} target="_blank" rel="noreferrer"><span><strong>Open the UML diagram</strong><small>Classes, subclasses, and links</small></span><Icon name="external" size={16} /></a><a href={publicFile('assets/architecture.png')} target="_blank" rel="noreferrer"><span><strong>Open the architecture</strong><small>Research workflow diagram</small></span><Icon name="external" size={16} /></a></div>
        </Section>

      </main>
      <div className="section-navigation" aria-label="Section navigation">
        <button className="button button-outline" onClick={() => goTo(sectionList[activeIndex - 1].id)} disabled={activeIndex <= 0}><span aria-hidden="true">←</span> Previous</button>
        <div className="section-progress"><div><i style={{ width: `${((activeIndex + 1) / sectionList.length) * 100}%` }} /></div><span>Section {activeIndex + 1} of {sectionList.length} · {activeLabel}</span></div>
        <button className="button button-light" onClick={() => goTo(sectionList[activeIndex + 1].id)} disabled={activeIndex >= sectionList.length - 1}>Next <span aria-hidden="true">→</span></button>
      </div>
    </div>

    {modal && <div className="modal-backdrop" role="presentation" onClick={() => setModal(null)}><div className="modal-content" role="dialog" aria-modal="true" aria-label={modal.alt} onClick={e => e.stopPropagation()}><div className="modal-top"><strong>{modal.alt}</strong><button onClick={() => setModal(null)} aria-label="Close image"><Icon name="close" /></button></div><div className="modal-image"><img src={modal.src} alt={modal.alt} /></div></div></div>}
  </div>
}

export default App
